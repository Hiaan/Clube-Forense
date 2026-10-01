// Cases exibidos na seção "Cases". Para adicionar um cliente, inclua um item aqui.
// Logo opcional: coloque o arquivo em public/cases/ (de preferência PNG/SVG
// transparente e claro, pois o fundo é escuro) e informe o caminho em `logo`.
// Sem itens, a seção não aparece no site.

export type Case = {
  cliente: string;
  segmento: string;
  /** Ex.: "/cases/minha-marca.svg" */
  logo?: string;
  /** Um ou dois números de destaque. */
  destaques: { valor: string; legenda: string }[];
  /** Uma ou duas frases: o desafio e o que foi feito. */
  resumo: string;
};

export const CASES: Case[] = [];
