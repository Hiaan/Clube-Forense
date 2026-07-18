// Construção das URLs de busca nas fontes externas.
//
// Fonte-base: Google Notícias (RSS), que agrega portais de notícia e,
// indiretamente, repercussão de diários oficiais. É pública, estável e sem
// necessidade de autenticação.
//
// Três grupos de consulta:
//   1. Nacional ampla — pega qualquer matéria da área no país.
//   2. Uma por estado — aumenta o recall regional (a UF final NUNCA vem da
//      consulta; é sempre inferida do texto pelo coletor).
//   3. Uma por portal (operador `site:`) — consulta explicitamente veículos de
//      concursos e grandes portais, sem depender do ranqueamento do Google.
//
// Recência: todas as consultas usam `after:AAAA-MM-DD` (2 anos atrás). O
// operador `when:` do Google News só é confiável para horas/dias/meses, por
// isso usamos a data explícita. O coletor ainda aplica um corte duro por data
// como garantia (ver coletor.ts).

import { BANCAS_DOMINIOS } from "./bancas";
import { ESTADOS } from "./estados";

const GOOGLE_NEWS = "https://news.google.com/rss/search";
const PARAMS_BR = "hl=pt-BR&gl=BR&ceid=BR:pt-419";

/**
 * Núcleo da consulta: o cargo-alvo (médico-legista) + carreiras que englobam o
 * cargo no mesmo edital (polícia científica, perícia oficial etc.). O filtro
 * fino fica no coletor (ver cargos.ts); aqui só ampliamos o material recebido.
 */
const CARGOS_QUERY =
  '("médico legista" OR "perito médico legista" OR "polícia científica" OR "polícia técnico-científica" OR "perícia oficial" OR "medicina legal" OR "instituto de criminalística")';

/**
 * Portais consultados diretamente via `site:`. Veículos de concursos (onde
 * editais/autorizações saem primeiro) e grandes portais de notícia.
 */
const PORTAIS = [
  "pciconcursos.com.br",
  "folhadirigida.com.br",
  "jcconcursos.com.br",
  "grancursosonline.com.br",
  "qconcursos.com",
  "concursosnobrasil.com.br",
  "direcaoconcursos.com.br",
  "g1.globo.com",
  "uol.com.br",
  "cnnbrasil.com.br",
  "metropoles.com",
];

/** Data-limite (2 anos atrás) no formato AAAA-MM-DD exigido pelo operador after:. */
function dataLimite(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d.toISOString().slice(0, 10);
}

function urlBusca(query: string): string {
  return `${GOOGLE_NEWS}?q=${encodeURIComponent(query)}&${PARAMS_BR}`;
}

/** Monta a lista de URLs de busca: nacional + uma por estado + uma por portal. */
export function montarConsultas(): string[] {
  const apos = `after:${dataLimite()}`;
  const urls: string[] = [];

  // 1) Busca nacional ampla.
  urls.push(urlBusca(`concurso ${CARGOS_QUERY} ${apos}`));

  // 2) Uma busca por estado (recall regional).
  for (const estado of ESTADOS) {
    urls.push(urlBusca(`concurso ${CARGOS_QUERY} ${estado.nome} ${apos}`));
  }

  // 3) Busca direta em cada portal de notícia/concurso.
  for (const site of PORTAIS) {
    urls.push(urlBusca(`concurso ${CARGOS_QUERY} site:${site} ${apos}`));
  }

  // 4) Busca direta no site oficial de cada banca (onde os editais saem).
  for (const dominio of BANCAS_DOMINIOS) {
    urls.push(urlBusca(`concurso ${CARGOS_QUERY} site:${dominio} ${apos}`));
  }

  return urls;
}
