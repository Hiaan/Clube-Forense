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

// ---------- Fuso horário do cliente ----------
// Clientes nos EUA recebem leads com horário agendado; a Meta entrega esse horário em UTC
// ("2026-10-28T16:00:00+0000"). O aviso e o painel mostram no fuso do cliente.

export const FUSOS = [
  { id: "America/Sao_Paulo", rotulo: "Brasília" },
  { id: "America/Manaus", rotulo: "Manaus" },
  { id: "America/New_York", rotulo: "Flórida / Leste dos EUA" },
  { id: "America/Chicago", rotulo: "Centro dos EUA" },
  { id: "America/Denver", rotulo: "Montanhas dos EUA" },
  { id: "America/Los_Angeles", rotulo: "Pacífico dos EUA" },
  { id: "America/Argentina/Buenos_Aires", rotulo: "Buenos Aires" },
  { id: "Europe/Lisbon", rotulo: "Lisboa" },
] as const;

const FUSO_DO_PAIS: Record<string, string> = { BR: "America/Sao_Paulo", US: "America/New_York", AR: "America/Argentina/Buenos_Aires", PT: "Europe/Lisbon" };

/** Fuso do cliente: o escolhido no cadastro ou, se vazio, o principal do país. */
export function fusoDe(e: { fuso?: string | null; pais?: string | null }) {
  if (e.fuso && FUSOS.some((f) => f.id === e.fuso)) return e.fuso;
  return FUSO_DO_PAIS[(e.pais ?? "BR").toUpperCase()] ?? FUSO;
}

export const rotuloDoFuso = (fuso: string) => FUSOS.find((f) => f.id === fuso)?.rotulo ?? fuso;

// Data e hora com fuso explícito: "2026-10-28T16:00:00+0000", "2026-10-28 16:00 UTC", "...Z", "...-04:00".
const DATA_HORA_COM_FUSO = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?\s*(Z|UTC|GMT|[+-]\d{2}:?\d{2})$/i;

/**
 * Resposta de formulário que é um horário com fuso → o mesmo instante no fuso do cliente,
 * por extenso ("qua., 28/10/2026, 12:00 (Flórida / Leste dos EUA)"). Outros textos voltam como vieram.
 */
export function respostaNoFuso(valor: string, fuso: string, idioma: Idioma = "pt") {
  const m = valor.trim().match(DATA_HORA_COM_FUSO);
  if (!m) {
    // Outros formatos com UTC/GMT escrito ("Oct 28, 2026 4:00 PM UTC"), se o JavaScript souber ler.
    const t = /\b(UTC|GMT)\b/i.test(valor) && /\d{1,2}:\d{2}/.test(valor) ? Date.parse(valor) : NaN;
    return Number.isFinite(t) ? formatarNoFuso(t, fuso, idioma) : valor;
  }
  const [, a, mes, d, h, min, s, z] = m;
  let offsetMin = 0;
  if (!/^(Z|UTC|GMT)$/i.test(z)) {
    const sinal = z.startsWith("-") ? -1 : 1;
    const dig = z.slice(1).replace(":", "");
    offsetMin = sinal * (Number(dig.slice(0, 2)) * 60 + Number(dig.slice(2, 4)));
  }
  const instante = Date.UTC(+a, +mes - 1, +d, +h, +min, +(s ?? 0)) - offsetMin * 60_000;
  return Number.isFinite(instante) ? formatarNoFuso(instante, fuso, idioma) : valor;
}

function formatarNoFuso(instante: number, fuso: string, idioma: Idioma) {
  const texto = new Date(instante).toLocaleString(locale(idioma), {
    timeZone: fuso,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${texto} (${rotuloDoFuso(fuso)})`;
}
