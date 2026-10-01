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

  // Formulário comum (FormData), não JSON: assim o navegador não precisa de
  // "preflight" de CORS, que falhava em silêncio (sobretudo junto com keepalive).
  const campos = new FormData();
  const adicionar = (chave: string, valor: string) => campos.append(chave, valor);
  adicionar("_subject", agendou ? `Reunião agendada: ${d.nome}` : `Novo lead (ainda sem horário): ${d.nome}`);
  adicionar("_template", "table");
  adicionar("_captcha", "false");
  adicionar("_replyto", d.email);
  adicionar("Situação", agendou ? "Agendou a consultoria" : "Preencheu os dados; ainda não escolheu horário");
  adicionar("Reunião", agendou ? `${dataPorExtenso(d.data!)}, às ${d.horario} (horário de Brasília)` : "—");
  adicionar("Nome", d.nome);
  adicionar("E-mail", d.email);
  adicionar("WhatsApp", `${d.whatsapp} (https://wa.me/${whatsapp})`);
  adicionar("Faturamento", d.faturamento || "Não informado");
  adicionar("Origem", window.location.href);

  fetch(`https://formsubmit.co/ajax/${DESTINO}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: campos,
  })
    .then(async (r) => ({ status: r.status, resposta: (await r.text()).slice(0, 500) }))
    .catch((erro: unknown) => ({ status: 0, resposta: String(erro) }))
    .then((resultado) => {
      // Registra no servidor o que o FormSubmit respondeu, para diagnóstico nos logs.
      navigator.sendBeacon?.("/api/diagnostico-email", JSON.stringify({ etapa: d.etapa, ...resultado }));
    });
}
