// O que muda numa página de preparatório de UM concurso (/preparatorio-ac,
// /preparatorio-to…), em relação ao preparatório geral.
//
// A página é a mesma (PaginaPreparatorio); cada estado entra com um objeto
// destes, montado no próprio diretório (preparatorio-xx/concurso.tsx). Assim
// um estado novo é um arquivo de dados e uma seção, e não uma terceira cópia
// da página com `if` para cada UF.

import type { ReactNode } from "react";

import type { Materia } from "../black/plataforma/aulas";

export interface ConcursoPreparatorio {
  /** Caminho da página, sem barra ("preparatorio-ac"). */
  slug: string;
  /** "PC-AC". */
  sigla: string;
  /** "Polícia Civil do Acre". */
  orgao: string;
  /** Nome do cargo no título da capa ("Perito Médico-Legista"). */
  cargo: string;
  /** Checkout próprio do preparatório deste concurso, já com cupom. */
  checkout: string;
  /** Selo da capa ("Edital PC-AC publicado"). */
  selo: string;
  /** Texto da faixa amarela que corre entre as seções. */
  faixa: string;
  /** Os itens da capa. */
  itensCapa: string[];
  /** Contagem regressiva até a prova, quando já há data. */
  prova?: { inicio: string };
  /** A seção que, no geral, lista os editais: aqui é a ficha deste concurso. */
  ficha: { nota: string; titulo: string; texto: string; conteudo: ReactNode; botao: string };
  /** A seção preta do meio. */
  urgencia: { titulo: ReactNode; texto: string };
  paraQuem: string[];
  oferta: { subtitulo: string; primeiroItem: string; quadro: string };
  /** Capas próprias das matérias, na aba de aulas. */
  materias?: Materia[];
  /** Para os dados estruturados e o nome do produto nos eventos. */
  schema: { nome: string; descricao: string; assuntos: string[] };
  produto: string;
}
