import "server-only";
import { createHash } from "node:crypto";
import { consulta } from "./db";
import { lerCsv } from "./csv";

// Importa leads exportados da Meta (Central de leads / formulários, em CSV) para a aba Leads.
// Serve quando a Meta não libera os contatos para o painel (Página numa BM restrita, por
// exemplo): alguém com acesso à Página baixa o CSV e a equipe importa aqui.

const sem = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/** Colunas que não vão para as respostas (dados de controle da própria Meta). */
const CONTROLE = new Set(["fonte", "source", "canal", "channel", "estagio", "stage", "proprietario", "owner", "rotulos", "labels", "id", "lead id", "is organic", "organico", "plataforma", "platform"]);

const COLUNAS = {
  criado: ["criado em", "created", "created time", "created_time", "data"],
  nome: ["nome", "name", "full name", "full_name", "nome completo"],
  email: ["email", "e-mail"],
  telefone: ["telefone", "phone", "phone number", "phone_number", "numero de telefone"],
  whatsapp: ["numero do whatsapp", "whatsapp number", "whatsapp"],
  formulario: ["formulario", "form", "form name", "nome do formulario"],
  campanha: ["campanha", "campaign", "campaign name", "nome da campanha"],
};

/** "10/13/2026 6:46am" (Central de leads) ou ISO → data em horário de Brasília. */
function lerCriadoEm(valor: string) {
  const v = valor.trim();
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (m) {
    let hora = Number(m[4]) % 12;
    if (m[6]?.toLowerCase() === "pm") hora += 12;
    if (!m[6]) hora = Number(m[4]);
    const iso = `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}T${String(hora).padStart(2, "0")}:${m[5]}:00-03:00`;
    return new Date(iso);
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Telefone com código de país trocado no formulário (ex.: +49 83 99324-4218, alguém que escolheu
 * Alemanha): se o resto tem cara de celular brasileiro (DDD + 9 + 8 dígitos), sugere o +55.
 */
function corrigirTelefone(bruto: string) {
  const d = bruto.replace(/\D/g, "");
  if (!d) return { numero: null as string | null, nota: null as string | null };
  if (d.startsWith("55")) return { numero: `+${d}`, nota: null };
  const resto = d.slice(2);
  if (d.length === 13 && /^[1-9][1-9]9\d{8}$/.test(resto)) {
    return { numero: `+55${resto}`, nota: `Telefone veio como ${bruto.trim()} no formulário; provavelmente é do Brasil.` };
  }
  return { numero: bruto.trim().startsWith("+") ? bruto.trim() : `+${d}`, nota: null };
}

export type LeadImportado = { id: number; nome: string | null };

/** Grava os leads do CSV (sem repetir os já importados). Devolve os que entraram agora. */
export async function importarLeadsCsv(empresaId: number, texto: string) {
  const linhas = lerCsv(texto);
  if (linhas.length < 2) throw new Error("O arquivo não tem leads.");
  const cabecalho = linhas[0].map(sem);
  const indice = (nomes: string[]) => cabecalho.findIndex((c) => nomes.includes(c));
  const col = Object.fromEntries(Object.entries(COLUNAS).map(([k, nomes]) => [k, indice(nomes)])) as Record<keyof typeof COLUNAS, number>;
  if (col.nome < 0 && col.email < 0 && col.telefone < 0) throw new Error("Não reconheci as colunas (preciso de Nome, Email ou Telefone).");
  const usadas = new Set(Object.values(col).filter((i) => i >= 0));

  const inseridos: LeadImportado[] = [];
  let repetidos = 0;
  for (const linha of linhas.slice(1)) {
    const valor = (i: number) => (i >= 0 ? (linha[i] ?? "").trim() : "");
    const nome = valor(col.nome) || null;
    const email = valor(col.email) || null;
    const tel = corrigirTelefone(valor(col.whatsapp) || valor(col.telefone));
    const criado = lerCriadoEm(valor(col.criado));
    const formulario = valor(col.formulario) || null;
    const respostas: Record<string, string> = {};
    linha.forEach((v, i) => {
      const titulo = linhas[0][i]?.trim();
      if (!usadas.has(i) && v.trim() && titulo && !CONTROLE.has(sem(titulo))) respostas[titulo] = v.trim();
    });
    // Sem coluna de campanha, o nome do formulário já vai como campanha: não repete nas respostas.
    if (formulario && valor(col.campanha)) respostas["Formulário"] = formulario;
    if (tel.nota) respostas["Observação"] = tel.nota;
    // Chave para não importar o mesmo lead duas vezes (o CSV não traz o id do lead).
    const chave = `csv:${createHash("sha1").update(`${email ?? ""}|${valor(col.telefone)}|${valor(col.criado)}`).digest("hex").slice(0, 20)}`;
    const linhaNova = await consulta<{ id: number }>(
      // whatsapp_avisado_em já preenchido: a rotina de 5 min não manda estes sozinha; quem importa decide se envia.
      `insert into leads (empresa_id, meta_lead_id, nome, email, whatsapp, origem, campanha, etapa, recebido_em, dados, whatsapp_avisado_em)
       values ($1, $2, $3, $4, $5, 'Formulário Meta (CSV)', $6, 'novo', $7, $8, now())
       on conflict (empresa_id, meta_lead_id) where meta_lead_id is not null do nothing
       returning id`,
      [empresaId, chave, nome?.slice(0, 120) ?? null, email?.slice(0, 160) ?? null, tel.numero?.slice(0, 40) ?? null, (valor(col.campanha) || formulario)?.slice(0, 200) ?? null, criado.toISOString(), JSON.stringify({ respostas })],
    );
    if (linhaNova[0]) inseridos.push({ id: linhaNova[0].id, nome });
    else repetidos++;
  }
  return { inseridos, repetidos };
}
