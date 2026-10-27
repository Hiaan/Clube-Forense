// Quem é aluno de quê, e qual cupom cada um recebe na Black dos alunos.
//
// O FLUXO: a pessoa abre /alunoclube, digita o CPF, e a página inteira abre já
// com a oferta DELA — o preço desta lista e o checkout com o cupom.
//
// A REGRA: o CPF digitado na página é procurado nas vendas PAGAS da Eduzz que
// o site já espelha (tabela `vendas`). Se ele comprou um dos produtos abaixo,
// recebe o cupom daquela linha. Quem comprou mais de um produto da lista
// recebe o cupom da PRIMEIRA linha em que se encaixa — então a ordem aqui é a
// ordem de prioridade: ponha em cima o cupom que deve vencer.
//
// `produtos` são os códigos de produto da Eduzz. Eles aparecem no painel, em
// /admin/alunoclube, junto com quantos compradores de cada um têm o CPF
// registrado.

export interface RegraCupom {
  /** Nome para o painel e para a mensagem ao aluno ("aluno do Preparatório"). */
  rotulo: string;
  /** Códigos de produto da Eduzz que dão direito a este cupom. */
  produtos: number[];
  /** O código do cupom na Eduzz. */
  cupom: string;
  /**
   * O valor à vista que a oferta mostra para quem cai nesta regra — tem de
   * ser o mesmo que o cupom dá no checkout. Nunca abaixo de PRECO_ALUNO_A_PARTIR.
   */
  preco: number;
}

/**
 * PREENCHER: a lista de produtos e cupons ainda não foi passada pelo Clube.
 * Enquanto estiver vazia, a página mostra que a validação está em
 * configuração, em vez de dizer a um aluno de verdade que ele não é aluno.
 */
export const REGRAS_CUPOM: RegraCupom[] = [];

/** O checkout da Black (o mesmo da página pública); o cupom vai no fim. */
export const CHECKOUT_ALUNO = "https://chk.eduzz.com/G96RYB5QW1";

/** "A partir de": o menor valor que um aluno pode pagar. */
export const PRECO_ALUNO_A_PARTIR = 2497;

/** A regra de um cupom, para montar a oferta de quem já foi validado. */
export function regraDoCupom(cupom: string): RegraCupom | null {
  return REGRAS_CUPOM.find((r) => r.cupom === cupom) ?? null;
}

export function linkComCupom(cupom: string): string {
  return `${CHECKOUT_ALUNO}?cupom=${encodeURIComponent(cupom)}`;
}

/** O cookie com o passe do aluno validado. */
export const COOKIE_ALUNO = "cf_aluno";

/**
 * O que a Black dos alunos NÃO inclui, para o aviso da página.
 * CONFERIR os nomes exatos dos produtos com o Clube.
 */
export const NAO_INCLUI = ["as mentorias", "os intensivões"];
