// O que se sabe do concurso da PC-TO para médico legista, num lugar só.
//
// BANCA DEFINIDA, EDITAL AINDA NÃO. A Cebraspe foi contratada (extrato no
// Diário Oficial do Tocantins, noticiado em 16/11/2026); o edital é o passo
// seguinte. Subsídio, etapas e cidades de prova vêm da nossa curadoria e do
// cronograma divulgado pela Secretaria de Segurança Pública. Quando o edital
// sair, é aqui que se atualiza — e a página ganha a data da prova.
//
// Número de vagas fica fora, como no Acre, a pedido do Clube.

export const DADOS_TO = {
  orgao: "Polícia Civil do Tocantins",
  sigla: "PC-TO",
  banca: "Cebraspe",
  bancaDefinidaEm: "16/11/2026",
  /** Subsídio inicial do perito oficial (carreira do médico legista no TO). */
  subsidio: 15763.91,
  ultimoConcurso: "2014 (Fundação Aroeira)",
  cidadesPrimeiraEtapa: "Palmas, Araguaína e Gurupi",
  etapas: [
    "Prova de conhecimentos (objetiva e discursiva)",
    "Avaliação psicológica",
    "Avaliação médica",
    "Avaliação física",
    "Investigação social",
    "Curso de formação",
  ],
  /** Checkout do preparatório do Tocantins na Appmax, com o cupom BLACK. */
  checkout:
    "https://clubeforense.carrinho.app/one-checkout/ocmsb/39358224?coupon=BLACK",
} as const;
