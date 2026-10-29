import { CONFIG_IDIOMA, type Idioma } from "@/lib/i18n";

export const MOEDAS = ["BRL", "USD", "EUR", "ARS"] as const;
export const FUSO = "America/Sao_Paulo";

const locale = (idioma: Idioma) => CONFIG_IDIOMA[idioma].locale;

export function dinheiro(valor: number | null | undefined, moeda: string, idioma: Idioma, compacto = false) {
  if (valor == null || !Number.isFinite(valor)) return "—";
  return new Intl.NumberFormat(locale(idioma), {
    style: "currency",
    currency: moeda,
    maximumFractionDigits: compacto && Math.abs(valor) >= 1000 ? 0 : 2,
    notation: compacto && Math.abs(valor) >= 100_000 ? "compact" : "standard",
  }).format(valor);
}

export function numero(valor: number | null | undefined, idioma: Idioma, casas = 0) {
  if (valor == null || !Number.isFinite(valor)) return "—";
  return new Intl.NumberFormat(locale(idioma), { maximumFractionDigits: casas, minimumFractionDigits: casas }).format(valor);
}

export function porcentagem(valor: number | null | undefined, idioma: Idioma, casas = 2) {
  if (valor == null || !Number.isFinite(valor)) return "—";
  return new Intl.NumberFormat(locale(idioma), { style: "percent", maximumFractionDigits: casas, minimumFractionDigits: casas }).format(valor);
}

/** "2026-10-01" → "01/10" (ou "10/01" em inglês). */
export function diaCurto(iso: string, idioma: Idioma) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString(locale(idioma), { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

export function dataLonga(iso: string, idioma: Idioma) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString(locale(idioma), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function dataHora(valor: string | Date, idioma: Idioma, fuso: string = FUSO) {
  return new Date(valor).toLocaleString(locale(idioma), { timeZone: fuso, dateStyle: "short", timeStyle: "short" });
}

/** Divisão que devolve null em vez de Infinity/NaN. */
export const razao = (a: number, b: number) => (b > 0 ? a / b : null);

// ---------- Horário dos leads: sempre no horário da Flórida ----------
// Formulários com "melhor horário" chegam da Meta com o fuso que ela escolhe — UTC
// ("2026-10-28T16:00:00+0000") ou o da conta de anúncio ("Oct 30, 2026 at 13:40 pm GMT-5").
// A T9 liga da Flórida: o aviso e o painel convertem para lá, com o horário de verão certo.

export const FUSO_FLORIDA = "America/New_York";

const MESES: Record<string, number> = {
  jan: 1, ene: 1, feb: 2, fev: 2, mar: 3, apr: 4, abr: 4, may: 5, mai: 5, jun: 6, jul: 7,
  aug: 8, ago: 8, sep: 9, set: 9, sept: 9, oct: 10, out: 10, nov: 11, dec: 12, dez: 12, dic: 12,
};

/** Lê data, hora e fuso de uma resposta. Sem fuso escrito, não dá para saber o instante: devolve null. */
export function lerHorarioComFuso(valor: string): number | null {
  const v = valor.trim().toLowerCase();
  if (v.length > 80) return null;

  // Fuso: Z, UTC, GMT, opcionalmente com deslocamento (GMT-5, UTC+01:00, -04:00, +0000).
  const f = v.match(/(?:\b(?:utc|gmt)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?|\b(?:utc|gmt)\b|(?<=\d)z\b|(?<=\d(?::\d{2}){1,2}(?:\.\d+)?\s?)([+-])(\d{2}):?(\d{2}))/);
  if (!f) return null;
  const sinal = f[1] ?? f[4];
  const horasFuso = Number(f[2] ?? f[5] ?? 0);
  const minFuso = Number(f[3] ?? f[6] ?? 0);
  const deslocamento = (sinal === "-" ? -1 : 1) * (horasFuso * 60 + minFuso);
  const semFuso = v.slice(0, f.index) + " " + v.slice(f.index! + f[0].length);

  // Data: 2026-10-30 | 30/10/2026 | Oct 30, 2026 | 30 de outubro de 2026 | 30 Oct 2026
  let ano: number, mes: number, dia: number;
  const iso = semFuso.match(/(\d{4})-(\d{2})-(\d{2})/);
  const barra = semFuso.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  const mesDia = semFuso.match(/\b([a-zç]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/);
  const diaMes = semFuso.match(/\b(\d{1,2})\s+(?:de\s+)?([a-zç]{3,})\.?\s+(?:de\s+)?(\d{4})/);
  const nomeMes = (n: string) => MESES[n.slice(0, 4)] ?? MESES[n.slice(0, 3)];
  if (iso) [ano, mes, dia] = [+iso[1], +iso[2], +iso[3]];
  else if (barra) [ano, mes, dia] = [+barra[3], +barra[2], +barra[1]];
  else if (mesDia && nomeMes(mesDia[1])) [ano, mes, dia] = [+mesDia[3], nomeMes(mesDia[1]), +mesDia[2]];
  else if (diaMes && nomeMes(diaMes[2])) [ano, mes, dia] = [+diaMes[3], nomeMes(diaMes[2]), +diaMes[1]];
  else return null;

  // Hora: 13:40, 1:40 pm, 13:40 pm (a Meta às vezes escreve assim: vale o 13).
  const h = semFuso.match(/(?:^|[^\d])(\d{1,2})[:h](\d{2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/);
  if (!h) return null;
  let hora = Number(h[1]);
  const ampm = h[4]?.replace(/\./g, "");
  if (ampm === "pm" && hora < 12) hora += 12;
  if (ampm === "am" && hora === 12) hora = 0;
  if (hora > 23 || +h[2] > 59 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;

  const instante = Date.UTC(ano, mes - 1, dia, hora, +h[2], +(h[3] ?? 0)) - deslocamento * 60_000;
  return Number.isFinite(instante) ? instante : null;
}

/**
 * Resposta de formulário que é um horário com fuso → o mesmo instante no horário da Flórida
 * ("sex., 30/10/2026 às 14:40 (horário da Flórida)"). Outros textos voltam como vieram.
 */
export function respostaNaFlorida(valor: string) {
  const instante = lerHorarioComFuso(valor);
  if (instante == null) return valor;
  const d = new Date(instante);
  const data = d.toLocaleDateString("pt-BR", { timeZone: FUSO_FLORIDA, weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("pt-BR", { timeZone: FUSO_FLORIDA, hour: "2-digit", minute: "2-digit" });
  return `${data} às ${hora} (horário da Flórida)`;
}
