// Leitura e gravação da curadoria no banco.
//
// Substitui a planilha do Google como fonte da verdade. A planilha continua
// existindo para a importação inicial (uma vez, pelo painel), mas o site não a
// consulta mais em tempo de execução.
//
// Toda leitura devolve `null` em caso de falha, nunca lança: quem chama cai
// para a curadoria embutida em baseline.ts e o mapa nunca fica órfão. Foi essa
// regra que manteve o site de pé nas semanas em que a planilha oscilou.

import { bancoConfigurado, garantirEsquema, sql } from "./db";
import type { Nivel } from "../monitor/lib/tipos";

export interface EstadoCuradoria {
  uf: string;
  etapa: Nivel;
  andamento: string;
  previsao: string | null;
  vagasImediatas: number | null;
  vagasCr: number | null;
  salarioInicial: number | null;
  cargaHoraria: number | null;
  especialidades: string | null;
  banca: string | null;
  inscricoesAte: string | null;
  dataProva: string | null;
  ultimoEdital: string | null;
  ultimaProva: string | null;
  bancaAnterior: string | null;
  validadeCertameAnterior: string | null;
  confianca: "alta" | "media" | "baixa";
  fonteUrl: string | null;
  verificadoEm: string | null;
  travado: boolean;
  observacao: string | null;
  /** Notícia principal escolhida no painel; substitui a que o robô destacaria. */
  noticiaTitulo: string | null;
  noticiaResumo: string | null;
  noticiaFonte: string | null;
  noticiaLink: string | null;
  /** Imagem do estado, mostrada no site no lugar da sigla. */
  imagemUrl: string | null;
  /** Cabeçalho do plano de carreira; as classes ficam em plano_classes. */
  planoOrgao: string | null;
  planoAno: number | null;
  planoFonte: string | null;
  /** Quantos IMLs o estado tem ao todo; as cidades ficam na tabela imls. */
  imlsTotal: number | null;
  /** Texto livre sobre a distribuição das unidades, escrito no painel. */
  imlsTexto: string | null;
  /** De onde saiu a distribuição dos IMLs, por extenso. */
  imlsFonte: string | null;
  /** Link do edital — o publicado quando há, o anterior enquanto não sai. */
  editalUrl: string | null;
  /**
   * Nota de corte mostrada no card do estado. Só aparece com `notaCorteVisivel`
   * marcado: um número desses sem contexto vira boato, e `notaCorteRotulo` é o
   * contexto ("Ampla concorrência, concurso de 2019").
   */
  notaCorte: number | null;
  notaCorteRotulo: string | null;
  notaCorteVisivel: boolean;
  /** Teto da carreira. O piso é `salarioInicial`. */
  salarioFinal: number | null;
  /** Teste de aptidão física. `null` é "não conferimos", e não "não tem". */
  taf: boolean | null;
  /** O que caiu para médico-legista, em texto livre. */
  materias: string | null;
  /** True quando a ficha descreve o concurso anterior, e não o atual. */
  infoAnterior: boolean;
  atualizadoEm: string | null;
}

/** Converte a linha crua do Postgres para o formato da aplicação. */
function daLinha(l: Record<string, unknown>): EstadoCuradoria {
  const texto = (v: unknown): string | null => (v == null ? null : String(v));
  const numero = (v: unknown): number | null =>
    v == null || v === "" ? null : Number(v);
  // `date` volta como Date ou string dependendo do driver; ISO normaliza os dois.
  const data = (v: unknown): string | null => {
    if (v == null) return null;
    const d = v instanceof Date ? v : new Date(String(v));
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  };

  return {
    uf: String(l.uf),
    etapa: String(l.etapa) as Nivel,
    andamento: String(l.andamento ?? ""),
    previsao: texto(l.previsao),
    vagasImediatas: numero(l.vagas_imediatas),
    vagasCr: numero(l.vagas_cr),
    salarioInicial: numero(l.salario_inicial),
    cargaHoraria: numero(l.carga_horaria),
    especialidades: texto(l.especialidades),
    banca: texto(l.banca),
    inscricoesAte: data(l.inscricoes_ate),
    dataProva: data(l.data_prova),
    ultimoEdital: data(l.ultimo_edital),
    ultimaProva: data(l.ultima_prova),
    bancaAnterior: texto(l.banca_anterior),
    validadeCertameAnterior: data(l.validade_certame_anterior),
    confianca: (String(l.confianca ?? "media") as "alta" | "media" | "baixa"),
    fonteUrl: texto(l.fonte_url),
    verificadoEm: data(l.verificado_em),
    travado: Boolean(l.travado),
    observacao: texto(l.observacao),
    noticiaTitulo: texto(l.noticia_titulo),
    noticiaResumo: texto(l.noticia_resumo),
    noticiaFonte: texto(l.noticia_fonte),
    noticiaLink: texto(l.noticia_link),
    imagemUrl: texto(l.imagem_url),
    planoOrgao: texto(l.plano_orgao),
    planoAno: l.plano_ano == null ? null : Number(l.plano_ano),
    planoFonte: texto(l.plano_fonte),
    imlsTotal: l.imls_total == null ? null : Number(l.imls_total),
    imlsTexto: texto(l.imls_texto),
    imlsFonte: texto(l.imls_fonte),
    editalUrl: texto(l.edital_url),
    notaCorte: numero(l.nota_corte),
    notaCorteRotulo: texto(l.nota_corte_rotulo),
    notaCorteVisivel: Boolean(l.nota_corte_visivel),
    salarioFinal: numero(l.salario_final),
    // Três estados: o banco devolve null quando ninguém informou.
    taf: l.taf == null ? null : Boolean(l.taf),
    materias: texto(l.materias),
    infoAnterior: Boolean(l.info_anterior),
    atualizadoEm: l.atualizado_em ? new Date(String(l.atualizado_em)).toISOString() : null,
  };
}

/** Ordem dos campos no insert/update — uma lista só, para não desalinhar. */
const COLUNAS = [
  "uf", "etapa", "andamento", "previsao", "vagas_imediatas", "vagas_cr",
  "salario_inicial", "carga_horaria", "especialidades", "banca",
  "inscricoes_ate", "data_prova", "ultimo_edital", "ultima_prova",
  "banca_anterior", "validade_certame_anterior", "confianca", "fonte_url",
  "verificado_em", "travado", "observacao",
  "noticia_titulo", "noticia_resumo", "noticia_fonte", "noticia_link",
  "imagem_url", "plano_orgao", "plano_ano", "plano_fonte", "imls_total",
  "imls_texto", "imls_fonte", "edital_url",
  "nota_corte", "nota_corte_rotulo", "nota_corte_visivel",
  "salario_final", "taf", "materias", "info_anterior",
] as const;

function paraValores(e: EstadoCuradoria): unknown[] {
  // Datas vazias precisam virar null, não string vazia: o Postgres recusaria.
  const d = (v: string | null) => (v && v.trim() ? v : null);
  return [
    e.uf.toUpperCase(), e.etapa, e.andamento, e.previsao, e.vagasImediatas,
    e.vagasCr, e.salarioInicial, e.cargaHoraria, e.especialidades, e.banca,
    d(e.inscricoesAte), d(e.dataProva), d(e.ultimoEdital), d(e.ultimaProva),
    e.bancaAnterior, d(e.validadeCertameAnterior), e.confianca, e.fonteUrl,
    d(e.verificadoEm), e.travado, e.observacao,
    e.noticiaTitulo, e.noticiaResumo, e.noticiaFonte, e.noticiaLink,
    e.imagemUrl, e.planoOrgao, e.planoAno, e.planoFonte, e.imlsTotal,
    e.imlsTexto, e.imlsFonte, e.editalUrl,
    e.notaCorte, e.notaCorteRotulo, e.notaCorteVisivel,
    e.salarioFinal, e.taf, e.materias, e.infoAnterior,
  ];
}

/** Campos da notícia principal — escolha editorial, não vêm de fonte externa. */
const COLUNAS_NOTICIA = new Set([
  "noticia_titulo", "noticia_resumo", "noticia_fonte", "noticia_link",
  // A imagem e o plano de carreira também são escolhas feitas aqui, e a
  // planilha não os conhece.
  "imagem_url", "plano_orgao", "plano_ano", "plano_fonte", "imls_total",
  "imls_texto", "imls_fonte", "edital_url",
  "nota_corte", "nota_corte_rotulo", "nota_corte_visivel",
  "salario_final", "taf", "materias", "info_anterior",
]);

/**
 * SQL do upsert. Fora da função para poder ser testado sem o driver.
 *
 * `preservarNoticia` existe para a importação da planilha: ela reenvia todas as
 * colunas, e sem essa proteção reimportar apagaria a notícia principal que foi
 * escolhida no painel — a planilha não tem esses campos, então mandaria null.
 * Numa linha nova eles entram normalmente (vazios); numa linha existente, ficam
 * como estavam.
 */
export function sqlUpsert(preservarNoticia = false): string {
  const campos = COLUNAS.join(", ");
  const marcadores = COLUNAS.map((_, i) => `$${i + 1}`).join(", ");
  const atualiza = COLUNAS.filter(
    (c) => c !== "uf" && !(preservarNoticia && COLUNAS_NOTICIA.has(c)),
  )
    .map((c) => `${c} = excluded.${c}`)
    .join(", ");
  return `insert into estados (${campos}) values (${marcadores})
          on conflict (uf) do update set ${atualiza}, atualizado_em = now()`;
}

/** Todos os estados gravados. `null` quando o banco não respondeu. */
export async function lerEstados(): Promise<EstadoCuradoria[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = await sql().query("select * from estados order by uf");
    return (linhas as Record<string, unknown>[]).map(daLinha);
  } catch (e) {
    console.error("Falha ao ler estados do banco:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Um estado. `null` se não existir ou se o banco falhar. */
export async function lerEstado(uf: string): Promise<EstadoCuradoria | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query("select * from estados where uf = $1", [
      uf.toUpperCase(),
    ])) as Record<string, unknown>[];
    return linhas[0] ? daLinha(linhas[0]) : null;
  } catch (e) {
    console.error("Falha ao ler estado do banco:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Grava (cria ou atualiza) um estado. Lança em caso de erro — o painel mostra. */
export async function salvarEstado(e: EstadoCuradoria): Promise<void> {
  await garantirEsquema();
  await sql().query(sqlUpsert(), paraValores(e));
}

/**
 * Grava vários de uma vez. Usado pela importação da planilha, por isso preserva
 * a notícia principal já escolhida em cada estado.
 */
export async function salvarVarios(estados: EstadoCuradoria[]): Promise<number> {
  await garantirEsquema();
  const s = sql();
  const comando = sqlUpsert(true);
  let gravados = 0;
  for (const e of estados) {
    await s.query(comando, paraValores(e));
    gravados++;
  }
  return gravados;
}
