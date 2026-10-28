// Quem é aluno de quê, e qual cupom cada um recebe na Black dos alunos.
//
// O FLUXO: a pessoa abre /alunoclube, digita o CPF, e a página inteira abre já
// com a oferta DELA — o preço desta lista e o checkout com o cupom.
//
// A REGRA: o CPF digitado na página é procurado nas vendas PAGAS da Eduzz que
// o site já espelha (tabela `vendas`). Se ele comprou um dos produtos abaixo,
// recebe o cupom daquela linha. Quem comprou mais de um produto da lista
// recebe o de MENOR preço (o maior cashback) — a ordem aqui não importa.
//
// `produtos` são os códigos de produto da Eduzz. Eles aparecem no painel, em
// /admin/alunoclube, junto com quantos compradores de cada um têm o CPF
// registrado.

export interface RegraCupom {
  /** Nome para o painel e para a mensagem ao aluno ("aluno do Preparatório"). */
  rotulo: string;
  /** Códigos de produto da Eduzz que dão direito a este cupom. */
  produtos: number[];
  /**
   * Nomes de produto que também dão direito (para a base subida por planilha,
   * que pode vir sem código). Basta o nome da compra CONTER um destes trechos;
   * maiúsculas e acentos não importam.
   */
  nomes?: string[];
  /** O código do cupom na Eduzz. */
  cupom: string;
  /**
   * O valor à vista que a oferta mostra para quem cai nesta regra — tem de
   * ser o mesmo que o cupom dá no checkout. Nunca abaixo de PRECO_ALUNO_A_PARTIR.
   */
  preco: number;
}

/**
 * As três faixas definidas pelo Clube em 27/10/2026 (cupons e valores passados
 * pelo Clube com os links de checkout de cada faixa), a partir do CSV de vendas
 * da Eduzz (histórico de 11/2023 a 10/2026).
 *
 * A comparação é primeiro pelo código do produto na Eduzz — o que não muda —
 * e, de reserva, por trechos do nome, para produto novo que ainda não esteja
 * nos códigos. Quem cai em mais de uma faixa fica com a de menor preço.
 *
 * `cupom` vazio = cupom ainda não informado: enquanto estiver assim a página
 * diz que a validação está em configuração, em vez de mandar o aluno a um
 * checkout sem desconto.
 */
export const REGRAS_CUPOM: RegraCupom[] = [
  {
    rotulo: "aluno do Clube",
    preco: 2497,
    cupom: "EXCLUSIVOALUNO",
    // Pacotes de todos os editais, Black 2026, todos os preparatórios (pré e
    // pós-edital de cada estado, Pré-edital Geral / Pacote Especialista,
    // pacotes e combos de editais), todas as mentorias e a Promoção de Black
    // Antecipada.
    produtos: [
      2893650, 2325387, 2546192, 2981633, 2882791, 2427875, 2450939, 2546071,
      2711550, 3016915, 2546066, 2561671, 2934849, 2383206, 2392083, 2685826,
      2546069, 2733060, 2887550, 2383204, 2823273, 2736123, 2685817, 2543596,
      2612052, 2554536, 2193083, 2208880, 2269115, 2271262, 2271348, 2271325,
      2272019, 2284489, 2288783, 2289729, 2316753, 2368281, 2377897, 2384582,
      2368289, 2390402, 2390404, 2482214, 2485588, 2485925, 2486654, 2486123,
      2870298, 2939238, 2941392, 2673863, 3056976,
    ],
    nomes: [
      "mentoria",
      "pre-edital",
      "pre edital",
      "pos-edital",
      "pos edital",
      "edital",
      "todos os editais",
      "black",
      "preparatorio",
      "pacote especialista",
      "combo",
    ],
  },
  {
    rotulo: "aluno do Clube",
    preco: 3447,
    cupom: "EXCLUSIVOALUN0",
    // Pacote Analista e Pacote Básico, intensivões de questões, aulões e os
    // 9 eBooks de resumo.
    produtos: [
      2324450, 2325432, 2420183, 2941858, 2909442, 2554521, 2925780, 2585969,
      2587617, 2402787, 2588647, 2630749, 2153444, 2182992, 2280799,
    ],
    nomes: [
      "pacote analista",
      "pacote basico",
      "intensivao",
      "aulao",
      "9 ebooks",
    ],
  },
  {
    rotulo: "aluno do Clube",
    preco: 3947,
    cupom: "EXLUSIV0ALUNO",
    // Produtos abaixo de R$ 500: 7 eBooks, Toxicologia Forense, Curso de
    // Criminalística e o Resumo de Traumatologia + Tanatologia.
    produtos: [2165832, 2370557, 2370472, 2153429],
    nomes: [
      "toxicologia",
      "criminalistica",
      "7 ebooks",
      "resumo completo de traumatologia",
    ],
  },
];

/** O checkout da Black (o mesmo da página pública); o cupom vai no fim. */
export const CHECKOUT_ALUNO = "https://chk.eduzz.com/G96RYB5QW1";

/** "A partir de": o menor valor que um aluno pode pagar. */
export const PRECO_ALUNO_A_PARTIR = 2497;

/** A regra de um cupom, para montar a oferta de quem já foi validado. */
export function regraDoCupom(cupom: string): RegraCupom | null {
  const achada = REGRAS_CUPOM.find((r) => r.cupom === cupom) ?? null;
  // Com faixa única, todo passe válido — inclusive os emitidos antes, com
  // cupom de outra faixa — monta a oferta da faixa única.
  if (achada && FAIXA_UNICA && cupom !== FAIXA_UNICA) {
    return REGRAS_CUPOM.find((r) => r.cupom === FAIXA_UNICA) ?? achada;
  }
  return achada;
}

/**
 * 2º LOTE DOS ALUNOS (28/10/2026): o 1º lote, com as três faixas de cashback,
 * acabou. Todo aluno validado, de qualquer faixa, fica com o cupom abaixo — o
 * de maior valor. A conferência do CPF continua: a página segue exclusiva
 * para alunos. Para voltar às faixas, ponha `null`.
 */
export const FAIXA_UNICA: string | null = "EXLUSIV0ALUNO";

/** O que aparece no selo do card de preço enquanto vale a faixa única. */
export const LOTE_ALUNO = "2º lote · o 1º lote já encerrou";

export function linkComCupom(cupom: string): string {
  return `${CHECKOUT_ALUNO}?cupom=${encodeURIComponent(cupom)}`;
}

/** O cookie com o passe do aluno validado. */
export const COOKIE_ALUNO = "cf_aluno";

/** Texto sem acento e em minúsculas, para comparar nomes de produto. */
export function normalizarNome(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * A regra deste aluno: entre todas em que alguma compra dele se encaixa, a de
 * MENOR preço — o maior cashback. Quem tem eBook e preparatório fica com o do
 * preparatório; quem tem cinco preparatórios conta um só.
 */
export function regraPara(ids: number[], nomes: string[]): RegraCupom | null {
  const ns = nomes.map(normalizarNome);
  const cabem = REGRAS_CUPOM.filter(
    (r) =>
      r.produtos.some((p) => ids.includes(p)) ||
      (r.nomes ?? []).some((trecho) =>
        ns.some((n) => n.includes(normalizarNome(trecho))),
      ),
  );
  if (cabem.length === 0) return null;
  if (FAIXA_UNICA) return regraDoCupom(FAIXA_UNICA);
  return cabem.reduce<RegraCupom | null>(
    (melhor, r) => (!melhor || r.preco < melhor.preco ? r : melhor),
    null,
  );
}
