import { createHash, timingSafeEqual } from "node:crypto";

/** Confere a chave de acesso da página de leads (LEADS_CHAVE) sem vazar tempo de comparação. */
export function chaveValida(chave: string | undefined | null) {
  const esperada = process.env.LEADS_CHAVE;
  if (!esperada || !chave) return false;
  const a = createHash("sha256").update(chave).digest();
  const b = createHash("sha256").update(esperada).digest();
  return timingSafeEqual(a, b);
}
