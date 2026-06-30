// Filtro e classificação de menções para os cargos-alvo:
//   - Perito Médico-Legista
//   - Médico Legista
//   - Perito Criminal Médico-Legista
//
// O discriminador essencial é o termo "legista" (médico-legista). Cargos como
// "perito criminal" genérico (não-médico) são descartados.

import { normalizar } from "./estados";
import type { Nivel } from "./tipos";

/** Termos que indicam que a menção é sobre concurso/seleção. */
const TERMOS_CONCURSO = [
  "concurso",
  "edital",
  "selecao",
  "seleção",
  "processo seletivo",
  "vaga",
  "vagas",
  "inscricao",
  "inscrição",
  "inscricoes",
  "inscrições",
];

/**
 * Verifica se o texto é sobre concurso PARA o cargo de médico-legista.
 * Exige a presença de "legista" e de algum termo ligado a concurso.
 */
export function ehCargoAlvo(texto: string): boolean {
  const t = normalizar(texto);
  const temLegista = t.includes("legista");
  if (!temLegista) return false;
  const temConcurso = TERMOS_CONCURSO.some((termo) => t.includes(normalizar(termo)));
  return temConcurso;
}

// Padrões de classificação, do nível mais avançado ao mais incipiente.
// A ordem importa: o primeiro que casar define o nível.
const PADROES: { nivel: Exclude<Nivel, "sem">; regex: RegExp }[] = [
  {
    nivel: "edital",
    regex:
      /edital (publicad|abert|lancad|divulgad|retificad)|publicou (o )?edital|sai(u)? (o )?edital|inscric(oes|ao) (abert|prorrogad)|provas? marcad/,
  },
  {
    nivel: "banca",
    regex:
      /autorizad|banca (definid|escolhid|contratad|organizador)|comissao organizadora|aprov(ou|ad)[ao]? (a )?realizac|nomeou (a )?comissao|sancion|homologou (a )?solicitac|contrato com (a )?banca/,
  },
  {
    nivel: "previsto",
    regex:
      /previst|deve (sair|ter|abrir|haver)|pode (ter|sair|haver)|estuda|em estudo|solicit|pedido de|planeja|aguard|em tramitac|projeto de lei|expectativa/,
  },
];

/** Classifica o nível de andamento a partir do texto de uma menção. */
export function classificarNivel(texto: string): Nivel {
  const t = normalizar(texto);
  for (const { nivel, regex } of PADROES) {
    if (regex.test(t)) return nivel;
  }
  // Casou com o cargo-alvo mas sem sinal de estágio específico.
  return "noticia";
}
