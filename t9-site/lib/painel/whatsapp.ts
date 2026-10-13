import "server-only";
import { timingSafeEqual } from "node:crypto";
import { consulta, umaLinha } from "./db";

// Avisos pelo WhatsApp da T9. Quem envia é a ponte (whatsapp-ponte/ na raiz do repositório),
// um processo sempre ligado no PC da T9, conectado ao número da T9 pelo QR Code.
// O painel só pede "manda este texto para este número"; a ponte cuida do resto.
//
// O endereço da ponte vem do túnel da Cloudflare e muda a cada reinício: a própria ponte o
// informa (POST /api/painel/whatsapp/ponte) e ele fica na tabela "ajustes". WHATSAPP_PONTE_URL
// só vale quando a ponte nunca informou um endereço (ponte num servidor com endereço fixo).

export type EstadoDaPonte = {
  /** "fora" = a ponte não respondeu; "sem-config" = faltam as variáveis na Vercel. */
  fase: "sem-config" | "fora" | "iniciando" | "conectando" | "qr" | "conectado" | "parada";
  qr: string;
  numero: string;
  nome: string;
  desde: string;
  erro: string;
};

export const ponteConfigurada = () => Boolean(process.env.WHATSAPP_PONTE_SEGREDO);

const CHAVE_ENDERECO = "whatsapp_ponte_url";

/** O segredo que a ponte manda nos avisos para o painel (o mesmo que o painel manda para ela). */
export function chamadaDaPonte(request: Request) {
  const segredo = process.env.WHATSAPP_PONTE_SEGREDO ?? "";
  const enviado = Buffer.from((request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, ""));
  const certo = Buffer.from(segredo);
  return segredo.length >= 32 && enviado.length === certo.length && timingSafeEqual(enviado, certo);
}

export async function guardarEnderecoDaPonte(url: string) {
  await consulta(
    `insert into ajustes (chave, valor, atualizado_em) values ($1, $2, now())
     on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`,
    [CHAVE_ENDERECO, url],
  );
}

async function enderecoDaPonte() {
  const salvo = await umaLinha<{ valor: string }>("select valor from ajustes where chave = $1", [CHAVE_ENDERECO]);
  return (salvo?.valor || process.env.WHATSAPP_PONTE_URL || "").replace(/\/$/, "");
}

async function chamarPonte<T>(caminho: string, corpo?: unknown, espera = 30_000): Promise<T> {
  const base = await enderecoDaPonte();
  if (!base) throw new Error("a ponte ainda não informou o endereço (ela está ligada?)");
  const r = await fetch(`${base}${caminho}`, {
    method: corpo === undefined ? "GET" : "POST",
    headers: { authorization: `Bearer ${process.env.WHATSAPP_PONTE_SEGREDO}`, ...(corpo === undefined ? {} : { "content-type": "application/json" }) },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
    signal: AbortSignal.timeout(espera),
    cache: "no-store",
  });
  const json = (await r.json().catch(() => ({}))) as T & { erro?: string };
  if (!r.ok) throw new Error(json.erro || `a ponte respondeu ${r.status}`);
  return json;
}

export async function estadoDaPonte(): Promise<EstadoDaPonte> {
  const vazio = { qr: "", numero: "", nome: "", desde: "", erro: "" };
  if (!ponteConfigurada()) return { fase: "sem-config", ...vazio };
  try {
    return await chamarPonte<EstadoDaPonte>("/estado", undefined, 6000);
  } catch (erro) {
    return { fase: "fora", ...vazio, erro: erro instanceof Error ? erro.message : String(erro) };
  }
}

export const reconectarPonte = () => chamarPonte("/reconectar", {});
export const desconectarPonte = () => chamarPonte("/sair", {});

export async function enviarWhatsapp(numero: string, texto: string) {
  if (!ponteConfigurada()) throw new Error("A ponte do WhatsApp não está configurada.");
  return chamarPonte<{ ok: boolean; id: string; para: string }>("/enviar", { numero, texto }, 60_000);
}

/** "83 99999-9999, +55 (11) 98888-7777" → ["5583999999999", "5511988887777"]. */
export function numerosDe(texto: string | null | undefined) {
  const lista = (texto ?? "")
    .split(/[,;\n]+/)
    .map((n) => n.replace(/\D/g, ""))
    .filter((n) => n.length >= 10 && n.length <= 15)
    .map((n) => (n.length <= 11 ? `55${n}` : n));
  return [...new Set(lista)];
}

/** Número para exibir: 5583999999999 → (83) 99999-9999. */
export function numeroLegivel(n: string) {
  const d = n.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `+${n}`;
}

type LeadParaAviso = { id: number; nome: string | null; email: string | null; whatsapp: string | null; campanha: string | null; dados: { respostas?: Record<string, string> } | null };

/** Campos do formulário que já aparecem no topo da mensagem. */
const JA_MOSTRADOS = /^(full_name|nome_completo|nome|name|first_name|primeiro_nome|last_name|sobrenome|email|e-mail|work_email|phone_number|telefone|whatsapp|celular|phone)$/;

const rotulo = (campo: string) => {
  const t = campo.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export function mensagemDoLead(empresa: string, lead: LeadParaAviso) {
  const linhas = [`🔔 *Novo lead* — ${empresa}`, ""];
  if (lead.nome) linhas.push(`*Nome:* ${lead.nome}`);
  const telefone = lead.whatsapp ? numerosDe(lead.whatsapp)[0] : undefined;
  if (lead.whatsapp) linhas.push(`*WhatsApp:* ${telefone ? numeroLegivel(telefone) : lead.whatsapp}`);
  if (lead.email) linhas.push(`*E-mail:* ${lead.email}`);
  if (lead.campanha) linhas.push(`*Campanha:* ${lead.campanha}`);
  const extras = Object.entries(lead.dados?.respostas ?? {}).filter(([campo, valor]) => valor?.trim() && !JA_MOSTRADOS.test(campo));
  if (extras.length) {
    linhas.push("");
    for (const [campo, valor] of extras.slice(0, 12)) {
      const r = rotulo(campo);
      linhas.push(`*${/[?:]$/.test(r) ? r : `${r}:`}* ${valor.slice(0, 300)}`);
    }
  }
  if (telefone) linhas.push("", `Chame agora: https://wa.me/${telefone}`);
  linhas.push("", "_Aviso automático do painel T9_");
  return linhas.join("\n");
}

/**
 * Manda para o WhatsApp do cliente os leads de formulário que ainda não foram avisados.
 * Só os das últimas 48 horas: um lead antigo que só agora apareceu não vira aviso atrasado.
 * Lead que não saiu para nenhum número fica para a próxima tentativa (dentro das 48 horas).
 */
export async function avisarLeadsNovos(empresaId: number) {
  if (!ponteConfigurada()) return { enviados: 0 };
  const empresa = await umaLinha<{ nome: string; whatsapp_leads: string | null }>("select nome, whatsapp_leads from empresas where id = $1", [empresaId]);
  const numeros = numerosDe(empresa?.whatsapp_leads);
  if (!empresa || !numeros.length) return { enviados: 0 };

  // Reserva os leads antes de enviar (o webhook e a sincronização podem rodar juntos): cada um sai uma vez só.
  const leads = await consulta<LeadParaAviso>(
    `update leads set whatsapp_avisado_em = now()
      where id in (
        select id from leads
         where empresa_id = $1 and meta_lead_id is not null and whatsapp_avisado_em is null
           and recebido_em > now() - interval '48 hours'
         order by recebido_em limit 30
         for update skip locked)
      returning id, nome, email, whatsapp, campanha, dados`,
    [empresaId],
  );
  let enviados = 0;
  let foraDoAr = false;
  for (const lead of leads) {
    let algum = false;
    if (!foraDoAr) {
      const texto = mensagemDoLead(empresa.nome, lead);
      for (const numero of numeros) {
        try {
          await enviarWhatsapp(numero, texto);
          algum = true;
          await consulta("insert into whatsapp_envios (empresa_id, lead_id, numero, ok) values ($1, $2, $3, true)", [empresaId, lead.id, numero]);
        } catch (erro) {
          const mensagem = erro instanceof Error ? erro.message : String(erro);
          await consulta("insert into whatsapp_envios (empresa_id, lead_id, numero, ok, erro) values ($1, $2, $3, false, $4)", [empresaId, lead.id, numero, mensagem.slice(0, 300)]);
          // Ponte fora do ar ou desconectada: nada mais vai sair agora.
          if (/não está conectado|fetch failed|aborted|timeout|ponte respondeu 5/i.test(mensagem)) {
            foraDoAr = true;
            break;
          }
        }
      }
    }
    if (algum) enviados++;
    // Não saiu para ninguém: devolve o lead para a próxima tentativa.
    else await consulta("update leads set whatsapp_avisado_em = null where id = $1", [lead.id]);
  }
  return { enviados };
}

export type EnvioRecente = { empresa: string | null; numero: string; ok: boolean; erro: string | null; criado_em: string; lead: string | null };

export function enviosRecentes(limite = 20) {
  return consulta<EnvioRecente>(
    `select e.nome as empresa, w.numero, w.ok, w.erro, w.criado_em, l.nome as lead
       from whatsapp_envios w left join empresas e on e.id = w.empresa_id left join leads l on l.id = w.lead_id
      order by w.criado_em desc limit $1`,
    [limite],
  );
}
