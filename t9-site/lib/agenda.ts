// Regras do agendador. Tudo em horário de Brasília (UTC−3, sem horário de verão).

export const FUSO = "America/Sao_Paulo";
export const OFFSET_BRASILIA_HORAS = 3;

/** Quantos dias úteis aparecem para escolha, a partir de amanhã. */
export const DIAS_UTEIS_OFERECIDOS = 10;

/** Horários oferecidos em cada dia útil. */
export const HORARIOS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

/** Duração da reunião, em minutos (usada no convite da agenda). */
export const DURACAO_MINUTOS = 45;

export const FAIXAS_FATURAMENTO = [
  "Até R$ 40 mil/mês",
  "De R$ 40 mil a R$ 100 mil/mês",
  "De R$ 100 mil a R$ 300 mil/mês",
  "De R$ 300 mil a R$ 1 milhão/mês",
  "Acima de R$ 1 milhão/mês",
];

export type Dia = { iso: string; semana: string; dia: string; mes: string };

/** Data de hoje em Brasília, no formato AAAA-MM-DD, independente do fuso do visitante. */
export function hojeEmBrasilia(agora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(agora);
}

function partes(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return { a, m, d };
}

function paraUTC(iso: string) {
  const { a, m, d } = partes(iso);
  return new Date(Date.UTC(a, m - 1, d));
}

function paraIso(data: Date) {
  return data.toISOString().slice(0, 10);
}

const curto = (texto: string) => {
  const limpo = texto.replace(/\./g, "").trim();
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
};

export function proximosDiasUteis(agora = new Date(), quantidade = DIAS_UTEIS_OFERECIDOS, locale = "pt-BR"): Dia[] {
  const semanaFmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const mesFmt = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const dias: Dia[] = [];
  const cursor = paraUTC(hojeEmBrasilia(agora));
  while (dias.length < quantidade) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const semana = cursor.getUTCDay();
    if (semana === 0 || semana === 6) continue;
    dias.push({
      iso: paraIso(cursor),
      semana: curto(semanaFmt.format(cursor)),
      dia: String(cursor.getUTCDate()).padStart(2, "0"),
      mes: mesFmt.format(cursor).replace(/\./g, ""),
    });
  }
  return dias;
}

/** Ex.: "quinta-feira, 1 de outubro" / "Thursday, October 1" / "jueves, 1 de octubre". */
export function dataPorExtenso(iso: string, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    paraUTC(iso),
  );
}

/** Valida se a data e o horário pedidos estão entre os oferecidos agora. */
export function horarioValido(iso: string, horario: string, agora = new Date()) {
  if (!HORARIOS.includes(horario)) return false;
  // Uma folga de 1 dia cobre quem abriu a página perto da meia-noite.
  const permitidos = proximosDiasUteis(new Date(agora.getTime() - 86_400_000), DIAS_UTEIS_OFERECIDOS + 1);
  return permitidos.some((d) => d.iso === iso);
}

/** Início e fim em UTC no formato do Google Agenda (AAAAMMDDTHHMMSSZ). */
export function intervaloUTC(iso: string, horario: string) {
  const { a, m, d } = partes(iso);
  const [h, min] = horario.split(":").map(Number);
  const inicio = new Date(Date.UTC(a, m - 1, d, h + OFFSET_BRASILIA_HORAS, min));
  const fim = new Date(inicio.getTime() + DURACAO_MINUTOS * 60_000);
  const fmt = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return { inicio: fmt(inicio), fim: fmt(fim), inicioISO: inicio.toISOString() };
}

export function soDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

/**
 * Máscara (11) 91234-5678 enquanto a pessoa digita. Número estrangeiro
 * começa com "+" e fica só com os dígitos (ex.: +351912345678).
 */
export function mascararWhatsApp(valor: string, internacional = false) {
  // Em inglês e espanhol o número é tratado como internacional desde o primeiro dígito.
  if (internacional && soDigitos(valor)) return `+${soDigitos(valor).slice(0, 15)}`;
  if (valor.trim().startsWith("+")) return `+${soDigitos(valor).slice(0, 15)}`;
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function whatsAppValido(valor: string) {
  const d = soDigitos(valor);
  return valor.trim().startsWith("+") ? d.length >= 8 && d.length <= 15 : d.length === 10 || d.length === 11;
}

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
