// Construção das URLs de busca nas fontes externas.
//
// Fonte principal: Google Notícias (RSS), que agrega portais de notícias e,
// indiretamente, repercussão de diários oficiais. É uma fonte pública, estável
// e sem necessidade de autenticação — ideal para o MVP.

import { ESTADOS } from "./estados";

const GOOGLE_NEWS = "https://news.google.com/rss/search";
const PARAMS_BR = "hl=pt-BR&gl=BR&ceid=BR:pt-419";

/** Núcleo da consulta: os três cargos-alvo. */
const CARGOS_QUERY =
  '("perito médico legista" OR "médico legista" OR "perito criminal médico legista")';

export interface Consulta {
  uf: string; // "BR" para a consulta nacional
  url: string;
}

/** Monta a lista de consultas: uma nacional + uma por estado. */
export function montarConsultas(): Consulta[] {
  const consultas: Consulta[] = [];

  const nacional = `concurso ${CARGOS_QUERY}`;
  consultas.push({
    uf: "BR",
    url: `${GOOGLE_NEWS}?q=${encodeURIComponent(nacional)}&${PARAMS_BR}`,
  });

  for (const estado of ESTADOS) {
    const q = `concurso ${CARGOS_QUERY} ${estado.nome}`;
    consultas.push({
      uf: estado.uf,
      url: `${GOOGLE_NEWS}?q=${encodeURIComponent(q)}&${PARAMS_BR}`,
    });
  }

  return consultas;
}
