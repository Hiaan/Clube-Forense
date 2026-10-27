// A oferta da Black Forense, num lugar só.
//
// TUDO QUE MUDA DE CAMPANHA PARA CAMPANHA MORA AQUI: preço, lote, data, link de
// checkout, número de aprovados. A página inteira lê deste arquivo, então
// corrigir um valor é mexer em uma linha — e não caçar o número em oito
// seções, que é como página de vendas vai ao ar com preço errado.
//
// FUSO: as datas estão em horário de Brasília (-03:00), escritas por extenso no
// próprio texto. Sem o fuso explícito, o navegador de quem acessa interpreta
// pelo relógio dele e o lote vira em hora diferente para cada pessoa.

/** Um lote da oferta: quanto custa e até quando. */
export interface Lote {
  nome: string;
  /** Preço à vista, em reais. */
  avista: number;
  /** Parcelas no cartão. */
  parcelas: number;
  /** Valor de cada parcela, em reais. */
  valorParcela: number;
  /** Quando este lote fecha (ISO com fuso de Brasília). */
  fecha: string;
  /** Link de checkout DESTE lote. */
  checkout: string;
}

/**
 * ATENÇÃO — CONFERIR ANTES DE DIVULGAR:
 *
 *   1. Os preços do 2º e do 3º lote são proposta minha, não valor que o Clube
 *      me passou. O que foi definido é o 1º lote: R$ 6.947.
 *   2. Os três lotes usam o link de checkout da Black 2026 que o Clube passou
 *      (chk.eduzz.com/G96RYB5QW1, cupom BLACK). Se cada lote tiver link ou
 *      cupom próprio, trocar aqui, um por lote.
 *   3. As datas assumem novembro de 2026 (campanha de Black Friday), no
 *      padrão "até o dia 10, do 10 ao 20, do 20 ao 30" que você descreveu.
 */
export const LOTES: Lote[] = [
  {
    nome: "1º lote",
    avista: 6947,
    parcelas: 12,
    valorParcela: 718.5,
    fecha: "2026-11-10T23:59:59-03:00",
    checkout: "https://chk.eduzz.com/G96RYB5QW1?cupom=BLACK",
  },
  {
    nome: "2º lote",
    avista: 7447,
    parcelas: 12,
    valorParcela: 770.21,
    fecha: "2026-11-20T23:59:59-03:00",
    checkout: "https://chk.eduzz.com/G96RYB5QW1?cupom=BLACK",
  },
  {
    nome: "3º lote",
    avista: 7947,
    parcelas: 12,
    valorParcela: 821.93,
    fecha: "2026-11-30T23:59:59-03:00",
    checkout: "https://chk.eduzz.com/G96RYB5QW1?cupom=BLACK",
  },
];

/**
 * Quanto custa UM preparatório avulso, por edital.
 *
 * É o número que dá sentido ao preço da Black: a pessoa compara o que pagaria
 * para estudar para um único concurso com o que paga aqui por todos. Veio da
 * própria oferta avulsa do Clube.
 */
export const PRECO_POR_EDITAL = 4997;

/**
 * Os editais que a Black vende, um por um, com o nome que o Clube usa.
 *
 * LISTA FIXA, E NÃO MAIS A DO MONITOR — e a troca veio de um erro concreto. A
 * faixa era montada ao vivo a partir do monitor: todo estado numa etapa
 * avançada e não travado entrava. Foi assim que São Paulo apareceu na página,
 * anunciado como "comissão formada", sem ter comissão nenhuma, enquanto o
 * Tocantins, que está na oferta, não aparecia. O monitor serve para dizer em
 * que pé cada concurso está; o que a página de vendas PROMETE é decisão do
 * Clube, e promessa não pode mudar sozinha quando um robô reclassifica um
 * estado de madrugada.
 *
 * O monitor continua dando a linha de situação de cada cartão (banca, data de
 * prova, etapa) — informação que muda e que ele acompanha melhor do que
 * qualquer pessoa. A lista de quem entra é esta aqui.
 *
 * `sigla` é o nome curto do órgão que realiza o concurso, como o Clube
 * apresenta: PC para Polícia Civil, PCI para a Polícia Científica do Espírito
 * Santo, PO para a Perícia Oficial do Maranhão. O brasão de cada um está em
 * public/black/orgaos/<UF>.webp.
 */
export const EDITAIS_DA_BLACK: {
  uf: string;
  sigla: string;
  orgao: string;
  /**
   * Banca já confirmada pelo Clube, para quando a novidade chegou antes de a
   * ficha do estado ser atualizada no painel. Só vale enquanto o monitor não
   * souber a banca: assim que a ficha tiver banca (e depois data de prova), a
   * linha do monitor volta a mandar e este campo vira sobra inofensiva.
   */
  banca?: string;
}[] = [
  { uf: "MA", sigla: "PO-MA", orgao: "Perícia Oficial do Maranhão" },
  { uf: "RJ", sigla: "PCERJ", orgao: "Polícia Civil do Rio de Janeiro" },
  { uf: "DF", sigla: "PCDF", orgao: "Polícia Civil do Distrito Federal" },
  { uf: "ES", sigla: "PCI-ES", orgao: "Polícia Científica do Espírito Santo" },
  { uf: "PA", sigla: "PC-PA", orgao: "Polícia Civil do Pará" },
  { uf: "TO", sigla: "PC-TO", orgao: "Polícia Civil do Tocantins" },
  { uf: "AC", sigla: "PC-AC", orgao: "Polícia Civil do Acre", banca: "Idecan" },
  { uf: "MG", sigla: "PC-MG", orgao: "Polícia Civil de Minas Gerais" },
  { uf: "AM", sigla: "PC-AM", orgao: "Polícia Civil do Amazonas" },
  { uf: "PE", sigla: "PCI-PE", orgao: "Polícia Científica de Pernambuco" },
  {
    uf: "MT",
    sigla: "POLITEC-MT",
    orgao: "Perícia Oficial e Identificação Técnica de Mato Grosso",
  },
];

/** WhatsApp da equipe, para dúvida antes da compra. */
export const WHATSAPP =
  "https://wa.me/558594160607?text=Tenho%20uma%20d%C3%BAvida%20sobre%20a%20Black%20Forense";

/** Onde o aluno já matriculado entra. */
export const PLATAFORMA = "https://app.clubeforense.com.br";

/** O banco de questões, que tem endereço próprio. */
export const QUESTOES = "https://questoes.clubeforense.com.br";

/**
 * Qual lote está valendo agora, e quanto falta para ele virar.
 *
 * Devolve `null` quando a campanha acabou — e a página inteira muda de cara
 * nesse caso, em vez de continuar oferecendo um preço que não vale mais. É o
 * erro clássico de página de lote: o contador zera e o botão continua lá.
 */
export function loteAtual(agora: Date = new Date()): {
  lote: Lote;
  indice: number;
  proximo: Lote | null;
} | null {
  const t = agora.getTime();
  for (let i = 0; i < LOTES.length; i++) {
    if (t <= new Date(LOTES[i].fecha).getTime()) {
      return { lote: LOTES[i], indice: i, proximo: LOTES[i + 1] ?? null };
    }
  }
  return null;
}

/** "R$ 6.947" — sem centavos, que é como preço cheio se escreve. */
export function reais(valor: number): string {
  return `R$ ${Math.round(valor).toLocaleString("pt-BR")}`;
}

/** "R$ 718,50" — com centavos, que é como parcela se escreve. */
export function reaisComCentavos(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
