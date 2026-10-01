import { armazenamentoConfigurado, salvarLead, type LeadSalvo } from "@/lib/leads";
import { EMAIL_VALIDO, FAIXAS_FATURAMENTO, dataPorExtenso, horarioValido, soDigitos, whatsAppValido } from "@/lib/agenda";

type Corpo = {
  etapa?: unknown;
  nome?: unknown;
  email?: unknown;
  whatsapp?: unknown;
  faturamento?: unknown;
  data?: unknown;
  horario?: unknown;
  idioma?: unknown;
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

  const lead: LeadSalvo = {
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
    idioma: ["pt", "en", "es"].includes(texto(corpo.idioma, 2)) ? texto(corpo.idioma, 2) : "pt",
    recebidoEm: new Date().toISOString(),
  };

  // Cópia nos logs da Vercel, sempre. Os logs duram pouco (cerca de 1 hora no
  // plano gratuito); o registro que fica é o do Blob, logo abaixo.
  // O e-mail sai do navegador do visitante (ver lib/emailLead.ts).
  console.info("[agendamento] Lead recebido:", JSON.stringify(lead));

  const envios: Promise<void>[] = [];
  if (armazenamentoConfigurado()) envios.push(salvarLead(lead));
  if (process.env.LEAD_WEBHOOK_URL) envios.push(enviarPorWebhook(process.env.LEAD_WEBHOOK_URL, lead));
  if (!envios.length) return Response.json({ ok: true });

  const resultados = await Promise.allSettled(envios);
  const falhas = resultados.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  falhas.forEach((f) => console.error("[agendamento] Falha ao guardar o lead:", f.reason, JSON.stringify(lead)));

  // Basta um destino receber para o lead não se perder.
  if (falhas.length === resultados.length) {
    return Response.json({ ok: false, erro: "Não conseguimos registrar agora. Tente de novo em instantes." }, { status: 502 });
  }
  return Response.json({ ok: true });
}


async function enviarPorWebhook(url: string, lead: LeadSalvo) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(10_000),
  });
  if (!resposta.ok) throw new Error(`webhook respondeu ${resposta.status}`);
}
