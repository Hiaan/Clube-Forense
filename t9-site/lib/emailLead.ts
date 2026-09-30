import { dataPorExtenso, soDigitos } from "./agenda";

const DESTINO = process.env.NEXT_PUBLIC_LEAD_EMAIL ?? "";

type DadosLead = {
  etapa: string;
  nome: string;
  email: string;
  whatsapp: string;
  faturamento?: string;
  data?: string;
  horario?: string;
};

/**
 * Manda o lead por e-mail via FormSubmit (formsubmit.co), direto do navegador.
 * Precisa ser do navegador: o FormSubmit recusa (403) chamadas vindas de servidores.
 * No primeiro envio, o FormSubmit manda um e-mail de ativação para o destino.
 * Falhas aqui não travam o agendamento: o lead também fica nos logs do servidor.
 */
export function enviarLeadPorEmail(d: DadosLead) {
  if (!DESTINO) return;
  const agendou = d.etapa === "agendamento" && d.data && d.horario;
  const whatsapp = d.whatsapp.trim().startsWith("+") ? soDigitos(d.whatsapp) : `55${soDigitos(d.whatsapp)}`;
  fetch(`https://formsubmit.co/ajax/${DESTINO}`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: agendou ? `Reunião agendada: ${d.nome}` : `Novo lead (ainda sem horário): ${d.nome}`,
      _template: "table",
      _captcha: "false",
      _replyto: d.email,
      Situação: agendou ? "Agendou a consultoria" : "Preencheu os dados; ainda não escolheu horário",
      Reunião: agendou ? `${dataPorExtenso(d.data!)}, às ${d.horario} (horário de Brasília)` : "—",
      Nome: d.nome,
      "E-mail": d.email,
      WhatsApp: `${d.whatsapp} (https://wa.me/${whatsapp})`,
      Faturamento: d.faturamento || "Não informado",
      Origem: window.location.href,
    }),
  }).catch(() => {});
}
