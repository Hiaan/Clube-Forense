// Avaliação e classificação de menções para o cargo-alvo: o MÉDICO-LEGISTA.
//
// A estrutura tem duas camadas, com papéis diferentes:
//
//   1. AVALIAÇÃO (avaliarMencao) — decide se a menção entra no monitor e se
//      ela cita o cargo DIRETAMENTE (legista/medicina legal/IML) ou apenas o
//      guarda-chuva de carreira (polícia científica, perícia oficial etc.).
//
//   2. CLASSIFICAÇÃO (classificarNivel) — define o estágio do funil. Regra de
//      ouro: SÓ menção que cita o cargo diretamente pode definir estágio.
//      Menção guarda-chuva vira no máximo "noticia" (contexto), porque um
//      concurso de polícia científica pode ser só de outros cargos — o estágio
//      verdadeiro de cada estado vem da curadoria (baseline.ts).
//
//      Além disso, sinais de concurso ENCERRADO (resultado final, homologação,
//      nomeação, posse) e de seleção TEMPORÁRIA (PSS) nunca definem estágio:
//      são notícias do passado ou de vínculo precário, não funil de edital.

import {
  CARGO_DE_APOIO,
  normalizarCargo,
  SINAL_MEDICINA,
  TERMOS_CARGO_DIRETO,
  TERMOS_CARGO_UNIFICADO,
} from "./nomenclaturas";
import type { Nivel } from "./tipos";

// ---------------------------------------------------------------------------
// Avaliação: a menção entra? Cita o cargo diretamente?
// ---------------------------------------------------------------------------

/** Termos que indicam que a menção é sobre concurso/seleção. */
const TERMOS_CONCURSO = [
  "concurso",
  "certame",
  "edital",
  "selecao",
  "processo seletivo",
  "vaga",
  "vagas",
  "inscricao",
  "inscricoes",
  "cadastro reserva",
  "aprovados",
];

// Os termos do cargo-alvo vivem em nomenclaturas.ts, montados a partir do nome
// OFICIAL do cargo no último concurso de cada estado — porque o nome muda por
// UF ("Médico Legista" em SP, "Perito Legista" no RJ, "Perito Oficial
// Médico-Legal" na PB, "Perito Oficial Criminal" no PR e em SC).
const IML_REGEX = /\biml\b/;

/**
 * Perito médico do INSS/previdenciário é OUTRO cargo (avalia benefício, não faz
 * necropsia). Sem sinal do cargo-alvo, a menção sai.
 */
const TERMOS_PERICIA_PREVIDENCIARIA = [
  "perito medico federal",
  "perito medico previdenciario",
  "pericia medica federal",
  "inss",
];

/**
 * Guarda-chuva de carreira que PODE englobar o médico-legista no mesmo edital.
 * Sozinho, mantém a menção como contexto, mas não define estágio.
 */
const TERMOS_CARREIRA = [
  "policia cientifica",
  "policia tecnico-cientifica",
  "policia tecnico cientifica",
  "policia tecnica cientifica",
  "pericia oficial",
  "pericia forense",
  "instituto geral de pericias",
];

/**
 * Outros cargos da área: se a menção guarda-chuva é explicitamente sobre eles
 * e NÃO cita o legista, é descartada (concurso que não envolve o cargo-alvo).
 */
const TERMOS_OUTROS_CARGOS = [
  "auxiliar de pericia",
  "auxiliar de necropsia",
  "auxiliar de laboratorio",
  "auxiliar tecnico",
  "papiloscopista",
  "agente de necrotomia",
  "delegado",
  "investigador",
  "escrivao",
];

/**
 * Eventos que também têm "inscrições abertas" mas não são concurso público
 * (ex.: "Corrida da Polícia Científica"). Descartados, salvo se o texto também
 * disser "concurso" explicitamente.
 */
const TERMOS_EVENTO = ["corrida", "caminhada", "maratona", "campeonato", "torneio"];

/** Como a menção se relaciona com o cargo-alvo. */
export type TipoMencao =
  /** Nomeia o cargo do legista (em qualquer das nomenclaturas do país). */
  | "direto"
  /** Cargo que engloba medicina como área (PR, SC, MS, MT, PF) + sinal médico. */
  | "unificado"
  /** Só o guarda-chuva de carreira: contexto, não define estágio. */
  | "carreira"
  /** Fora do monitor. */
  | "fora";

export interface AvaliacaoMencao {
  /** True se a menção deve entrar no monitor. */
  manter: boolean;
  /** True se a menção pode DEFINIR estágio do funil (direto ou unificado). */
  cargoDireto: boolean;
  tipo: TipoMencao;
}

const FORA: AvaliacaoMencao = { manter: false, cargoDireto: false, tipo: "fora" };

/** Avalia se a menção entra no monitor e como (direta, unificada ou contexto). */
export function avaliarMencao(texto: string): AvaliacaoMencao {
  const t = normalizarCargo(texto);

  const temConcurso = TERMOS_CONCURSO.some((termo) => t.includes(termo));
  if (!temConcurso) return FORA;

  if (!t.includes("concurso") && TERMOS_EVENTO.some((termo) => t.includes(termo))) {
    return FORA; // evento esportivo/social do órgão
  }

  // Apaga os nomes de cargos de APOIO antes de procurar o cargo-alvo: sem isso
  // "auxiliar de perícia médico-legal" casa com o termo "medico legal" e um
  // concurso só de apoio (caso da Polícia Científica SP/2026) entraria como se
  // fosse de legista.
  const alvo = t.replace(CARGO_DE_APOIO, " ");

  // 1) Cargo nomeado diretamente, em qualquer nomenclatura estadual.
  if (TERMOS_CARGO_DIRETO.some((termo) => alvo.includes(termo)) || IML_REGEX.test(alvo)) {
    return { manter: true, cargoDireto: true, tipo: "direto" };
  }

  // Sem o cargo-alvo, perícia médica previdenciária é outro concurso.
  if (TERMOS_PERICIA_PREVIDENCIARIA.some((termo) => t.includes(termo))) return FORA;

  const unificado = TERMOS_CARGO_UNIFICADO.some((termo) => t.includes(termo));
  const carreira = TERMOS_CARREIRA.some((termo) => t.includes(termo));
  if (!unificado && !carreira) return FORA;

  // 2) Guarda-chuva COM sinal de medicina: no PR, SC, MS, MT e na PF o legista
  //    entra exatamente assim ("Perito Oficial Criminal — área Medicina"), então
  //    aqui a menção pode definir estágio.
  if (unificado && SINAL_MEDICINA.test(alvo)) {
    return { manter: true, cargoDireto: true, tipo: "unificado" };
  }

  // 3) Guarda-chuva sem sinal de medicina: só contexto — e fora se for
  //    explicitamente sobre outro cargo ou restrito a nível médio/fundamental.
  if (TERMOS_OUTROS_CARGOS.some((termo) => t.includes(termo))) return FORA;
  if (/nivel (medio|fundamental)/.test(t) && !t.includes("superior")) return FORA;

  return { manter: true, cargoDireto: false, tipo: "carreira" };
}

// ---------------------------------------------------------------------------
// Classificação: estágio do funil
// ---------------------------------------------------------------------------

/**
 * Sinais de concurso ENCERRADO/em fase final — é notícia do passado, não
 * oportunidade em andamento. Nunca define estágio do funil.
 */
const SINAIS_CONCLUIDO =
  /resultado (final|definitivo)|homolog(ou|ad|acao)|nomeac(ao|oes)|convocacao d[eo]s? aprovad|posse d[eo]s? aprovad|classificacao final|gabarito (oficial|definitivo)|inscric(oes|ao) encerrad/;

/** Sinais de seleção temporária (PSS): não é o concurso efetivo do funil. */
const SINAIS_TEMPORARIO =
  /\bpss\b|processo seletivo simplificado|contratacao temporaria|contrato temporario|temporari[oa]s\b/;

// Padrões do FUNIL DO EDITAL, do estágio mais avançado ao mais incipiente.
// A ordem importa: o primeiro que casar define o estágio.
const PADROES: { nivel: Exclude<Nivel, "sem" | "noticia">; regex: RegExp }[] = [
  {
    // 6. Edital Publicado — regras/cronograma divulgados, inscrições correndo.
    nivel: "edital",
    regex:
      /edital (publicad|abert|lancad|divulgad|retificad|esta nas ruas)|publicou (o )?edital|sai(u)? (o )?edital|inscric(oes|ao) (abert|prorrogad)|provas? (marcad|agendad)|cronograma (divulgad|publicad)/,
  },
  {
    // 5. Banca Definida — banca contratada; edital pode sair a qualquer momento.
    nivel: "banca",
    regex:
      /banca (definid|escolhid|contratad|confirmad|homologad|sera (a|o))|(definiu|escolheu|contratou|anunciou|confirmou) (a |o )?(nova )?banca|contrato (assinado )?com (a )?banca|(cebraspe|cespe|fgv|cesgranrio|vunesp|aocp|idecan|consulplan|ibfc|selecon|fundatec|iades|quadrix) (e|foi|sera) (a )?(banca|organizadora)|banca organizadora (definid|contratad|escolhid|confirmad)/,
  },
  {
    // 4. Comissão Formada — projeto básico, contratação/definição da banca.
    nivel: "comissao",
    regex:
      /comissao( organizadora| especial)? (formad|designad|instituid|nomead|criad|constituid|do concurso)|(formou|designou|instituiu|nomeou|criou|constituiu) (a )?comissao|projeto basico|banca em (definicao|analise|disputa|licitacao)|bancas em analise|(escolha|contratacao|definicao|licitacao) da banca|processo de (escolha|contratacao) da banca/,
  },
  {
    // 3. Concurso Autorizado — governo autorizou oficialmente.
    nivel: "autorizado",
    regex:
      /autorizad|autorizou|autorizacao (do concurso|publicad|assinad|oficial)|governo autoriza|governador[a]? (autoriza|sanciona|assinou)|sancion|aprovou (a )?realizacao|homologou (a )?solicitacao/,
  },
  {
    // 2. Concurso Solicitado — pedido enviado; sinal orçamentário conta.
    nivel: "solicitado",
    regex:
      /solicitad|solicitou|pedido de (autorizacao|concurso|novo concurso)|encaminhou (o )?(pedido|oficio|solicitacao)|aguarda (autorizacao|aprovacao|aval)|(previsto|consta|contemplad[oa]|incluid[oa]) n[ao] (loa|ploa|pldo|lei orcamentaria|orcamento)|reserva de recursos/,
  },
  {
    // 1. Edital em Estudo — intenção declarada, viabilidade, expectativa.
    nivel: "estudo",
    regex:
      /em estudo|estuda|estudos? de viabilidade|deve (sair|ter|abrir|haver|ser publicad)|pode (ter|sair|haver)|planeja|expectativa|anunciou (a )?(necessidade|intencao|realizacao)|em tramitac|projeto de lei|previst[oa]/,
  },
];

/**
 * True quando a menção anuncia o FECHAMENTO de um certame (resultado final,
 * homologação, nomeação, posse). O consolidador usa isso para encerrar o ciclo:
 * sem esse sinal, o estado ficava exibindo "Edital publicado" durante os 2 anos
 * da janela mesmo com o concurso já concluído.
 */
export function mencaoConclusiva(texto: string): boolean {
  return SINAIS_CONCLUIDO.test(normalizarCargo(texto));
}

/**
 * Classifica o estágio do funil de uma menção.
 *
 * Só menção com o cargo citado DIRETAMENTE pode definir estágio; guarda-chuva
 * fica em "noticia" (contexto). Concurso encerrado e seleção temporária também
 * ficam em "noticia", independentemente do cargo.
 */
export function classificarNivel(texto: string, cargoDireto: boolean): Nivel {
  if (!cargoDireto) return "noticia";

  const t = normalizarCargo(texto);
  if (SINAIS_CONCLUIDO.test(t)) return "noticia";
  if (SINAIS_TEMPORARIO.test(t)) return "noticia";

  for (const { nivel, regex } of PADROES) {
    if (regex.test(t)) return nivel;
  }
  return "noticia";
}
