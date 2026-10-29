import { createHash, randomUUID } from "node:crypto";
import { after } from "next/server";
import { EMAIL_VALIDO, soDigitos, whatsAppValido } from "@/lib/agenda";
import { limparRespostas } from "@/lib/diagnostico/perguntas";
import { diagnosticar, NOMES_AREA, respostasEmTexto, type Area, type Diagnostico } from "@/lib/diagnostico/regras";
import { iaConfigurada, personalizar } from "@/lib/diagnostico/ia";
import { bancoConfigurado, consulta, umaLinha } from "@/lib/painel/db";
import { iniciarDiagnosticoNoPainel, salvarDiagnosticoNoPainel } from "@/lib/painel/leadsSite";
import { enviarWhatsapp, numeroLegivel, numerosDe } from "@/lib/painel/whatsapp";

// Diagnóstico gratuito do site, em dois envios:
//   1. etapa "inicio": o contato, antes das perguntas. Já vira lead da T9 (mesmo que a
//      pessoa desista no meio) e devolve uma referência.
//   2. final: as respostas + a referência. Monta o diagnóstico (regras + texto da IA),
//      completa o mesmo lead e avisa a equipe no WhatsApp.
export const maxDuration = 60;

/** Diagnósticos por aparelho (IP) em 24 horas. */
const POR_IP_DIA = 5;
/** Contatos iniciados por aparelho em 24 horas (quem volta e recomeça). */
const INICIOS_POR_IP_DIA = 10;
/** Teto diário de textos escritos pela IA: protege os créditos de um ataque. */
const IA_POR_DIA = 300;

const texto = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMOJI: Record<Diagnostico["temperatura"], string> = { quente: "🔥 Quente", morno: "🌤️ Morno", frio: "❄️ Frio" };

export async function POST(request: Request) {
  if (!bancoConfigurado()) return Response.json({ ok: false, erro: "Indisponível no momento." }, { status: 503 });
  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "Requisição inválida." }, { status: 400 });
  }

  const nome = texto(corpo.nome, 120);
  const email = texto(corpo.email, 160).toLowerCase();
  const whatsappDigitado = texto(corpo.whatsapp, 30);
  const campos: string[] = [];
  if (nome.length < 2) campos.push("nome");
  if (!EMAIL_VALIDO.test(email)) campos.push("email");
  if (!whatsAppValido(whatsappDigitado)) campos.push("whatsapp");
  const whatsapp = whatsappDigitado.startsWith("+") ? soDigitos(whatsappDigitado) : `55${soDigitos(whatsappDigitado)}`;
  const origem = texto(corpo.origem, 300) || null;
  const inicio = corpo.etapa === "inicio";
  const { respostas, faltando } = limparRespostas(corpo.respostas);
  if (campos.length || (!inicio && faltando.length)) {
    return Response.json({ ok: false, erro: "Confira os campos destacados.", campos, faltando }, { status: 422 });
  }

  // Limite por aparelho. O IP vai com hash: o banco não guarda o endereço de ninguém.
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "sem-ip";
  const ipHash = createHash("sha256").update(`t9-diagnostico:${ip}`).digest("hex").slice(0, 32);
  const recentes = await umaLinha<{ porIp: number; iniciosPorIp: number; ia: number }>(
    `select count(*) filter (where ip_hash = $1 and etapa = 'completo')::int as "porIp",
            count(*) filter (where ip_hash = $1)::int as "iniciosPorIp",
            count(*) filter (where ia)::int as ia
       from diagnosticos where criado_em > now() - interval '1 day'`,
    [ipHash],
  );

  if (inicio) {
    if ((recentes?.iniciosPorIp ?? 0) >= INICIOS_POR_IP_DIA + POR_IP_DIA) {
      return Response.json({ ok: false, erro: "Você já começou vários diagnósticos hoje. Tente de novo amanhã ou fale com a gente pelo WhatsApp." }, { status: 429 });
    }
    const ref = randomUUID();
    if (texto(corpo.site)) return Response.json({ ok: true, ref }); // robô: finge que deu certo
    try {
      const { leadId } = await iniciarDiagnosticoNoPainel({ nome, email, whatsapp, origem });
      await consulta("insert into diagnosticos (ip_hash, lead_id, respostas, resultado, etapa, ref) values ($1, $2, '{}', '{}', 'inicio', $3)", [ipHash, leadId, ref]);
    } catch (erro) {
      // Sem gravar, a pessoa segue: o envio final cria o lead.
      console.error("[diagnostico] falha ao gravar o início:", erro, JSON.stringify({ nome, email, whatsapp }));
    }
    return Response.json({ ok: true, ref });
  }

  if ((recentes?.porIp ?? 0) >= POR_IP_DIA) {
    return Response.json({ ok: false, erro: "Você já fez vários diagnósticos hoje. Tente de novo amanhã ou fale com a gente pelo WhatsApp." }, { status: 429 });
  }

  // Robô preencheu o campo escondido: devolve um diagnóstico (para não ensinar o robô) e não grava nada.
  const rascunho = diagnosticar(respostas);
  if (texto(corpo.site)) return Response.json({ ok: true, diagnostico: publico(rascunho) });

  const legiveis = respostasEmTexto(respostas);
  const podeIa = iaConfigurada() && (recentes?.ia ?? 0) < IA_POR_DIA;
  const texto_ia = podeIa ? await personalizar(legiveis, rascunho) : null;
  const diagnostico: Diagnostico = texto_ia
    ? {
        ...rascunho,
        resumo: texto_ia.resumo,
        comoAT9Ajuda: texto_ia.comoAT9Ajuda,
        prioridades: rascunho.prioridades.map((p, i) => {
          const ia = texto_ia.prioridades[i];
          // Benefícios da IA só se vierem num tamanho razoável; senão ficam os das regras.
          const beneficios = ia.beneficios.length >= 2 && ia.beneficios.length <= 4 ? ia.beneficios : p.beneficios;
          return { ...p, titulo: ia.titulo, texto: ia.texto, beneficios };
        }),
        personalizado: true,
      }
    : rascunho;

  const resumoEquipe = {
    Temperatura: `${EMOJI[diagnostico.temperatura]} (${diagnostico.motivoTemperatura})`,
    "Nota geral": `${diagnostico.notaGeral}/100`,
    ...legiveis,
  };

  try {
    // O lead criado no início (pela referência devolvida naquele envio) é completado aqui.
    const ref = texto(corpo.ref, 40);
    const iniciado = ref
      ? await umaLinha<{ id: number; lead_id: number | null }>("select id, lead_id from diagnosticos where ref = $1 and etapa = 'inicio'", [ref])
      : null;
    const { leadId, empresaId } = await salvarDiagnosticoNoPainel({
      leadId: iniciado?.lead_id ?? null,
      nome,
      email,
      whatsapp,
      origem,
      respostas: resumoEquipe,
      diagnostico,
    });
    const valores = [ipHash, leadId, JSON.stringify(respostas), JSON.stringify(diagnostico), diagnostico.personalizado];
    if (iniciado) {
      await consulta(
        "update diagnosticos set ip_hash = $1, lead_id = $2, respostas = $3::jsonb, resultado = $4::jsonb, ia = $5, etapa = 'completo', criado_em = now() where id = $6",
        [...valores, iniciado.id],
      );
    } else {
      await consulta("insert into diagnosticos (ip_hash, lead_id, respostas, resultado, ia) values ($1, $2, $3::jsonb, $4::jsonb, $5)", valores);
    }
    // O aviso para a equipe sai depois da resposta: a pessoa não espera pelo WhatsApp.
    after(() => avisarEquipe(empresaId, leadId, { nome, email, whatsapp, diagnostico, legiveis }));
  } catch (erro) {
    // Sem gravar, a pessoa ainda recebe o diagnóstico; o lead fica nos logs.
    console.error("[diagnostico] falha ao gravar:", erro, JSON.stringify({ nome, email, whatsapp, respostas }));
  }

  return Response.json({ ok: true, diagnostico: publico(diagnostico) });
}

/** O que a página mostra: sem a temperatura nem o motivo, que são da equipe. */
function publico(d: Diagnostico): Omit<Diagnostico, "temperatura" | "motivoTemperatura"> {
  const copia: Partial<Diagnostico> = { ...d };
  delete copia.temperatura;
  delete copia.motivoTemperatura;
  return copia as Omit<Diagnostico, "temperatura" | "motivoTemperatura">;
}

async function avisarEquipe(
  empresaId: number,
  leadId: number,
  d: { nome: string; email: string; whatsapp: string; diagnostico: Diagnostico; legiveis: Record<string, string> },
) {
  const empresa = await umaLinha<{ whatsapp_leads: string | null }>("select whatsapp_leads from empresas where id = $1", [empresaId]);
  const numeros = numerosDe(empresa?.whatsapp_leads);
  if (!numeros.length) return;
  const r = d.legiveis;
  const pega = (inicio: string) => Object.entries(r).find(([k]) => k.startsWith(inicio))?.[1];
  const notas = (Object.keys(d.diagnostico.notas) as Area[]).map((a) => `${NOMES_AREA[a]}: ${d.diagnostico.notas[a]}`).join(" · ");
  const linhas = [
    `🧭 *Novo diagnóstico* — ${EMOJI[d.diagnostico.temperatura]}`,
    `_${d.diagnostico.motivoTemperatura}_`,
    "",
    `*Nome:* ${d.nome}`,
    `*WhatsApp:* ${numeroLegivel(d.whatsapp)}`,
    `*E-mail:* ${d.email}`,
    `*Empresa:* ${pega("Qual o nome") ?? "—"} · ${pega("Em qual área") ?? ""}${pega("Qual é a área") ? ` (${pega("Qual é a área")})` : ""}`,
    `*Cidade:* ${pega("Em qual cidade") ?? "—"}`,
    `*Faturamento:* ${pega("Quanto a empresa fatura") ?? "—"}`,
    `*Anuncia:* ${pega("Hoje você faz anúncios") ?? "—"}${pega("Quanto você investe") ? ` · ${pega("Quanto você investe")}` : ""}${pega("Quem faz") ? ` · ${pega("Quem faz")}` : ""}`,
    ...(pega("O que não está bom") ? [`*Problemas:* ${pega("O que não está bom")}`] : []),
    `*Vídeos:* ${pega("Você usa vídeos") ?? "—"}${pega("Seus vídeos e anúncios") ? ` · falam mais sobre ${pega("Seus vídeos e anúncios")!.toLowerCase()}` : ""}`,
    `*Quer começar:* ${pega("Se fizer sentido") ?? "—"}`,
    "",
    `*Nota geral:* ${d.diagnostico.notaGeral}/100 (${notas})`,
    `*Prioridades:* ${d.diagnostico.prioridades.map((p) => p.titulo).join(" | ")}`,
    "",
    `Chame agora: https://wa.me/${d.whatsapp}`,
    "",
    "_Respostas completas na aba Leads da T9, no painel._",
  ];
  const mensagem = linhas.join("\n");
  for (const numero of numeros) {
    try {
      await enviarWhatsapp(numero, mensagem);
      await consulta("insert into whatsapp_envios (empresa_id, lead_id, numero, ok) values ($1, $2, $3, true)", [empresaId, leadId, numero]);
    } catch (erro) {
      const motivo = erro instanceof Error ? erro.message : String(erro);
      await consulta("insert into whatsapp_envios (empresa_id, lead_id, numero, ok, erro) values ($1, $2, $3, false, $4)", [empresaId, leadId, numero, motivo.slice(0, 300)]);
    }
  }
}
