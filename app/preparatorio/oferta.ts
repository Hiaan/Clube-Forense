// A oferta do preparatório avulso, num lugar só.
//
// DUAS VERSÕES DA MESMA PÁGINA. Até segunda, o preço cheio; a partir de terça,
// 27/10, a promoção de Black, com o cheio riscado ao lado. A troca é pela
// data, no servidor, sem ninguém precisar publicar nada no dia — a página lê
// `versaoDaOferta()` a cada acesso.
//
// FUSO: as datas estão em horário de Brasília (-03:00), escrito no próprio
// texto, para a virada acontecer na mesma hora para todo mundo.

/** Preço cheio, à vista. */
export const PRECO_CHEIO = 4997;

/** Preço da promoção de Black, à vista. */
export const PRECO_BLACK = 3447;

/** Quando a promoção de Black entra no ar. */
export const INICIO_BLACK = "2026-10-27T00:00:00-03:00";

/**
 * Quando a promoção acaba. `null` = segue até alguém mudar aqui.
 * O fim não foi definido ainda; quando for, basta escrever a data.
 */
export const FIM_BLACK: string | null = null;

export const PARCELAS = 12;

/**
 * Valor da parcela em 12x.
 *
 * ATENÇÃO — CONFERIR NO CHECKOUT: é a mesma taxa que a Eduzz aplicou nas
 * ofertas anteriores do Clube (R$ 3.947 → 12x R$ 408,21; R$ 6.947 → 12x
 * R$ 718,50), aplicada aos preços novos. O valor exato é o que o checkout
 * mostrar; se for outro, é trocar aqui.
 */
export const PARCELA: Record<"cheio" | "black", number> = {
  cheio: 516.81,
  black: 356.51,
};

/**
 * Checkout de cada versão.
 *
 * ATENÇÃO: os dois apontam para o link do botão de compra do site antigo, que
 * cobra o preço ANTIGO. Cada preço precisa do seu link (ou cupom) na Eduzz.
 */
export const CHECKOUT: Record<"cheio" | "black", string> = {
  cheio: "https://sun.eduzz.com/2325387",
  black: "https://sun.eduzz.com/2325387",
};

export type Versao = "cheio" | "black";

/**
 * Qual versão está valendo.
 *
 * `previa` deixa ver a outra versão antes da hora (ou depois dela), pelo
 * endereço: /preparatorio?versao=black ou ?versao=cheio.
 */
export function versaoDaOferta(
  agora: Date = new Date(),
  previa?: string,
): Versao {
  if (previa === "black" || previa === "cheio") return previa;
  const t = agora.getTime();
  const comecou = t >= new Date(INICIO_BLACK).getTime();
  const acabou = FIM_BLACK !== null && t > new Date(FIM_BLACK).getTime();
  return comecou && !acabou ? "black" : "cheio";
}
