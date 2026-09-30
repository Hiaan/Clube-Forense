import { EMAIL_VALIDO, FAIXAS_FATURAMENTO, dataPorExtenso, horarioValido, soDigitos, whatsAppValido } from "@/lib/agenda";

type Corpo = {
  etapa?: unknown;
  nome?: unknown;
  email?: unknown;
  whatsapp?: unknown;
  faturamento?: unknown;
  data?: unknown;
  horario?: unknown;
  site?: unknown; // armadilha para robôs: campo invisível que pessoas não preenchem
  origem?: unknown;
};

const texto = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Recebe o lead (etapa "lead", logo depois dos dados) e o agendamento
 * (etapa "agendamento", com data e horário) e repassa para LEAD_WEBHOOK_URL.
 */
export async function POST(request: Request) {
  let corpo: Corpo;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "Requisição inválida." }, { status: 400 });
  }

  // Robô preencheu o campo escondido: responde ok e descarta.
  if (texto(corpo.site)) return Response.json({ ok: true });

  const etapa = corpo.etapa === "agendamento" ? "agendamento" : "lead";
  const nome = texto(corpo.nome, 120);
  const email = texto(corpo.email, 160).toLowerCase();
  const whatsapp = texto(corpo.whatsapp, 30);
  const faturamento = FAIXAS_FATURAMENTO.includes(texto(corpo.faturamento)) ? texto(corpo.faturamento) : "";
  const data = texto(corpo.data, 10);
  const horario = texto(corpo.horario, 5);

  const erros: string[] = [];
  if (nome.length < 2) erros.push("nome");
  if (!EMAIL_VALIDO.test(email)) erros.push("email");
  if (!whatsAppValido(whatsapp)) erros.push("whatsapp");
  if (etapa === "agendamento" && !horarioValido(data, horario)) erros.push("horario");
  if (erros.length) {
    return Response.json({ ok: false, erro: "Confira os campos destacados.", campos: erros }, { status: 422 });
  }

  const lead = {
    etapa,
    nome,
    email,
    // Formato internacional, pronto para links wa.me (números do Brasil ganham o 55).
    whatsapp: whatsapp.startsWith("+") ? soDigitos(whatsapp) : `55${soDigitos(whatsapp)}`,
    whatsappFormatado: whatsapp,
    faturamento: faturamento || null,
    reuniao:
      etapa === "agendamento"
        ? { data, horario, fuso: "America/Sao_Paulo", descricao: `${dataPorExtenso(data)}, às ${horario} (horário de Brasília)` }
        : null,
    origem: texto(corpo.origem, 300) || null,
    recebidoEm: new Date().toISOString(),
  };

  const envios: Promise<void>[] = [];
  if (process.env.LEAD_EMAIL) envios.push(enviarPorEmail(process.env.LEAD_EMAIL, lead));
  if (process.env.LEAD_WEBHOOK_URL) envios.push(enviarPorWebhook(process.env.LEAD_WEBHOOK_URL, lead));

  if (!envios.length) {
    console.warn("[agendamento] Nenhum destino configurado (LEAD_EMAIL ou LEAD_WEBHOOK_URL). Lead recebido:", JSON.stringify(lead));
    return Response.json({ ok: true, entregue: false });
  }

  const resultados = await Promise.allSettled(envios);
  const falhas = resultados.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  falhas.forEach((f) => console.error("[agendamento] Falha ao entregar o lead:", f.reason, JSON.stringify(lead)));

  // Basta um destino receber para o lead não se perder.
  if (falhas.length === resultados.length) {
    return Response.json({ ok: false, erro: "Não conseguimos registrar agora. Tente de novo em instantes." }, { status: 502 });
  }
  return Response.json({ ok: true, entregue: true });
}

type Lead = {
  etapa: string;
  nome: string;
  email: string;
  whatsapp: string;
  whatsappFormatado: string;
  faturamento: string | null;
  reuniao: { descricao: string } | null;
  origem: string | null;
};

async function enviarPorWebhook(url: string, lead: Lead) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(10_000),
  });
  if (!resposta.ok) throw new Error(`webhook respondeu ${resposta.status}`);
}

/**
 * E-mail via FormSubmit (formsubmit.co): sem conta nem chave. No primeiro envio,
 * o FormSubmit manda para o endereço um link de ativação que precisa ser clicado uma vez.
 */
async function enviarPorEmail(destino: string, lead: Lead) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://t9-ads-company.vercel.app";
  const agendou = lead.etapa === "agendamento";
  const resposta = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(destino)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Origin: site, Referer: `${site}/` },
    body: JSON.stringify({
      _subject: agendou ? `Reunião agendada: ${lead.nome}` : `Novo lead (ainda sem horário): ${lead.nome}`,
      _template: "table",
      _captcha: "false",
      _replyto: lead.email,
      Situação: agendou ? "Agendou a consultoria" : "Preencheu os dados; ainda não escolheu horário",
      Reunião: lead.reuniao?.descricao ?? "—",
      Nome: lead.nome,
      "E-mail": lead.email,
      WhatsApp: `${lead.whatsappFormatado} (https://wa.me/${lead.whatsapp})`,
      Faturamento: lead.faturamento ?? "Não informado",
      Origem: lead.origem ?? "—",
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const json = (await resposta.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
  if (!resposta.ok || String(json.success) !== "true") {
    throw new Error(`FormSubmit: ${json.message ?? resposta.status}`);
  }
}
