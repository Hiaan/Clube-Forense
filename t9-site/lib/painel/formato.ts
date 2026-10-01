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

export function dataHora(valor: string | Date, idioma: Idioma) {
  return new Date(valor).toLocaleString(locale(idioma), { timeZone: FUSO, dateStyle: "short", timeStyle: "short" });
}

/** Divisão que devolve null em vez de Infinity/NaN. */
export const razao = (a: number, b: number) => (b > 0 ? a / b : null);
