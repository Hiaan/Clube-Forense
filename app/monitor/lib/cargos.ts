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

import { normalizar } from "./estados";
import type { Nivel } from "./tipos";

// ---------------------------------------------------------------------------
// Avaliação: a menção entra? Cita o cargo diretamente?
// ---------------------------------------------------------------------------

/** Termos que indicam que a menção é sobre concurso/seleção. */
const TERMOS_CONCURSO = [
  "concurso",
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

/**
 * Termos do cargo-alvo (médico-legista), já normalizados. "legista" cobre
 * "médico legista", "perito médico-legista" e "odontolegista".
 */
const TERMOS_LEGISTA = ["legista", "medicina legal", "medico legal", "medica legal"];
const IML_REGEX = /\biml\b/;

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

export interface AvaliacaoMencao {
  /** True se a menção deve entrar no monitor. */
  manter: boolean;
  /** True se cita o cargo diretamente (legista/medicina legal/IML). */
  cargoDireto: boolean;
}

/** Avalia se a menção entra no monitor e como (direta ou guarda-chuva). */
export function avaliarMencao(texto: string): AvaliacaoMencao {
  const t = normalizar(texto);

  const temConcurso = TERMOS_CONCURSO.some((termo) => t.includes(termo));
  if (!temConcurso) return { manter: false, cargoDireto: false };

  if (!t.includes("concurso") && TERMOS_EVENTO.some((termo) => t.includes(termo))) {
    return { manter: false, cargoDireto: false }; // evento esportivo/social do órgão
  }

  const cargoDireto = TERMOS_LEGISTA.some((termo) => t.includes(termo)) || IML_REGEX.test(t);
  if (cargoDireto) return { manter: true, cargoDireto: true };

  const carreira = TERMOS_CARREIRA.some((termo) => t.includes(termo));
  if (!carreira) return { manter: false, cargoDireto: false };

  // Guarda-chuva explicitamente sobre outro cargo (sem citar legista): fora.
  if (TERMOS_OUTROS_CARGOS.some((termo) => t.includes(termo))) {
    return { manter: false, cargoDireto: false };
  }
  // Guarda-chuva restrito a níveis que excluem o legista (cargo de nível
  // superior): fora, a menos que o texto também fale de nível superior.
  if (/nivel (medio|fundamental)/.test(t) && !t.includes("superior")) {
    return { manter: false, cargoDireto: false };
  }

  return { manter: true, cargoDireto: false };
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
 * Classifica o estágio do funil de uma menção.
 *
 * Só menção com o cargo citado DIRETAMENTE pode definir estágio; guarda-chuva
 * fica em "noticia" (contexto). Concurso encerrado e seleção temporária também
 * ficam em "noticia", independentemente do cargo.
 */
export function classificarNivel(texto: string, cargoDireto: boolean): Nivel {
  if (!cargoDireto) return "noticia";

  const t = normalizar(texto);
  if (SINAIS_CONCLUIDO.test(t)) return "noticia";
  if (SINAIS_TEMPORARIO.test(t)) return "noticia";

  for (const { nivel, regex } of PADROES) {
    if (regex.test(t)) return nivel;
  }
  return "noticia";
}
