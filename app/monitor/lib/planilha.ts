// Leitura da curadoria a partir da planilha do Google (aba "Monitor").
//
// A planilha é publicada como CSV (Arquivo → Compartilhar → Publicar na web),
// o que dispensa autenticação: é só um GET. O endereço fica embutido logo
// abaixo (ver CSV_PADRAO) e pode ser trocado sem mexer no código pela variável
// CURADORIA_CSV_URL, que tem precedência.
//
// PRINCÍPIO: esta fonte pode falhar, e falhar é normal (cota, rede, alguém
// despublicou). Toda falha é reportada com motivo e o chamador cai para o piso
// embutido em baseline.ts. O mapa nunca fica órfão.
//
// PRINCÍPIO 2: cabeçalho errado NÃO é lido "do jeito que der". As colunas são
// casadas por NOME (você pode reordenar à vontade), e se faltar uma obrigatória
// a planilha inteira é recusada — melhor cair no piso conhecido do que exibir
// dado silenciosamente errado.

import { parseCSV } from "./csv";
import { NIVEL_PESO, type Nivel } from "./tipos";

/** Colunas sem as quais a planilha não é utilizável. */
const OBRIGATORIAS = ["uf", "etapa", "andamento", "confianca", "fonte_url", "verificado_em"];

/** Colunas opcionais: ausentes viram null e geram aviso, não erro. */
const OPCIONAIS = [
  "tem_previsao", "previsao", "vagas_imediatas", "vagas_cr", "salario_inicial",
  "carga_horaria", "especialidades", "banca", "inscricoes_ate", "data_prova",
  "ultimo_edital", "ultima_prova", "banca_anterior", "validade_certame_anterior",
  "travado", "observacao",
];

const ETAPAS_VALIDAS = new Set<string>(Object.keys(NIVEL_PESO));
const CONFIANCAS = new Set(["alta", "media", "baixa"]);

export interface LinhaCuradoria {
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
  fonteUrl: string;
  verificadoEm: string | null;
  /** Quando true, notícia nenhuma pode alterar o estágio deste estado. */
  travado: boolean;
  observacao: string | null;
}

export type ResultadoPlanilha =
  | { ok: true; linhas: LinhaCuradoria[]; avisos: string[] }
  | { ok: false; motivo: string };

// ---------------------------------------------------------------------------
// Conversores tolerantes ao que o Google exporta
// ---------------------------------------------------------------------------

/** "28/07/2026" ou "2026-07-28" -> ISO. Devolve null se não for data. */
function paraISO(bruto: string): string | null {
  const t = bruto.trim();
  if (!t) return null;

  const br = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, d, m, a] = br;
    const dt = new Date(Date.UTC(+a, +m - 1, +d));
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
  }

  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const [, a, m, d] = iso;
    const dt = new Date(Date.UTC(+a, +m - 1, +d));
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
  }

  return null;
}

/**
 * Número tolerante a locale: "14675.58", "14675,58" e "14.675,58" dão o mesmo
 * resultado. A planilha pode ser exportada em pt-BR ou en-US dependendo da
 * configuração da conta, e o valor não pode depender disso.
 */
function paraNumero(bruto: string): number | null {
  const t = bruto.trim().replace(/[R$\s]/g, "");
  if (!t) return null;

  let normalizado = t;
  if (t.includes(",") && t.includes(".")) {
    // O separador decimal é o que aparece por último.
    normalizado = t.lastIndexOf(",") > t.lastIndexOf(".")
      ? t.replace(/\./g, "").replace(",", ".")
      : t.replace(/,/g, "");
  } else if (t.includes(",")) {
    normalizado = t.replace(",", ".");
  }

  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

function paraBooleano(bruto: string): boolean {
  return ["sim", "true", "verdadeiro", "x", "1"].includes(bruto.trim().toLowerCase());
}

function limpo(bruto: string | undefined): string {
  return (bruto ?? "").trim();
}

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

/**
 * Endereço da planilha publicada, embutido como padrão.
 *
 * Normalmente uma URL dessas viveria só em variável de ambiente. Aqui ela fica
 * no código de propósito: a variável se perdeu três vezes entre dois projetos
 * da Vercel, e cada perda derrubava a leitura da planilha em silêncio. Como a
 * aba é publicada na web (Arquivo → Compartilhar → Publicar na web), este
 * endereço já é público por natureza — não há segredo sendo exposto.
 *
 * CURADORIA_CSV_URL, quando definida, tem precedência. É o caminho para trocar
 * de planilha sem mexer no código.
 */
const CSV_PADRAO =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRgKBKFNphOKDb5oWOaV1x68XN5dxBK2MYfd8iD6OPt73PiFsAp4h4HTDW5wCILvDiLjisw_Y_mrjqc/pub?gid=98953382&single=true&output=csv";

/** Endereço em uso e de onde ele veio, para o diagnóstico saber dizer. */
export function origemDaUrl(): { url: string; origem: "variavel" | "padrao" } {
  const daVariavel = process.env.CURADORIA_CSV_URL;
  return daVariavel
    ? { url: daVariavel, origem: "variavel" }
    : { url: CSV_PADRAO, origem: "padrao" };
}

/**
 * Converte o CSV bruto em linhas de curadoria. Separado de `lerPlanilha` para
 * poder ser testado sem rede.
 */
export function interpretarCSV(texto: string): ResultadoPlanilha {
  const linhas = parseCSV(texto);
  if (linhas.length < 2) {
    return { ok: false, motivo: "planilha vazia ou sem linhas de dados" };
  }

  // Casamento por NOME: a ordem das colunas pode mudar sem quebrar nada.
  const cabecalho = linhas[0].map((c) => c.trim().toLowerCase());
  const idx = new Map<string, number>();
  cabecalho.forEach((nome, i) => {
    if (!idx.has(nome)) idx.set(nome, i);
  });

  const faltando = OBRIGATORIAS.filter((c) => !idx.has(c));
  if (faltando.length > 0) {
    return {
      ok: false,
      motivo: `colunas obrigatórias ausentes: ${faltando.join(", ")}. Encontradas: ${cabecalho.join(", ")}`,
    };
  }

  const avisos: string[] = [];
  const ausentesOpcionais = OPCIONAIS.filter((c) => !idx.has(c));
  if (ausentesOpcionais.length > 0) {
    avisos.push(`colunas opcionais ausentes: ${ausentesOpcionais.join(", ")}`);
  }

  const campo = (linha: string[], nome: string): string => {
    const i = idx.get(nome);
    return i === undefined ? "" : limpo(linha[i]);
  };

  const resultado: LinhaCuradoria[] = [];
  const vistos = new Set<string>();

  for (let n = 1; n < linhas.length; n++) {
    const linha = linhas[n];
    const uf = campo(linha, "uf").toUpperCase();
    if (!uf) continue; // linha em branco no meio da planilha

    if (vistos.has(uf)) {
      avisos.push(`linha ${n + 1}: ${uf} duplicado, mantida a primeira ocorrência`);
      continue;
    }

    const etapaBruta = campo(linha, "etapa").toLowerCase();
    if (etapaBruta && !ETAPAS_VALIDAS.has(etapaBruta)) {
      avisos.push(`linha ${n + 1} (${uf}): etapa "${etapaBruta}" desconhecida, tratada como "sem"`);
    }
    const etapa = (ETAPAS_VALIDAS.has(etapaBruta) ? etapaBruta : "sem") as Nivel;

    const confiancaBruta = campo(linha, "confianca").toLowerCase();
    const confianca = (CONFIANCAS.has(confiancaBruta) ? confiancaBruta : "media") as
      | "alta" | "media" | "baixa";

    vistos.add(uf);
    resultado.push({
      uf,
      etapa,
      andamento: campo(linha, "andamento"),
      previsao: campo(linha, "previsao") || null,
      vagasImediatas: paraNumero(campo(linha, "vagas_imediatas")),
      vagasCr: paraNumero(campo(linha, "vagas_cr")),
      salarioInicial: paraNumero(campo(linha, "salario_inicial")),
      cargaHoraria: paraNumero(campo(linha, "carga_horaria")),
      especialidades: campo(linha, "especialidades") || null,
      banca: campo(linha, "banca") || null,
      inscricoesAte: paraISO(campo(linha, "inscricoes_ate")),
      dataProva: paraISO(campo(linha, "data_prova")),
      ultimoEdital: paraISO(campo(linha, "ultimo_edital")),
      ultimaProva: paraISO(campo(linha, "ultima_prova")),
      bancaAnterior: campo(linha, "banca_anterior") || null,
      validadeCertameAnterior: paraISO(campo(linha, "validade_certame_anterior")),
      confianca,
      fonteUrl: campo(linha, "fonte_url"),
      verificadoEm: paraISO(campo(linha, "verificado_em")),
      travado: paraBooleano(campo(linha, "travado")),
      observacao: campo(linha, "observacao") || null,
    });
  }

  if (resultado.length === 0) {
    return { ok: false, motivo: "nenhuma linha com UF preenchida" };
  }

  return { ok: true, linhas: resultado, avisos };
}

/** Busca a planilha publicada e a interpreta. Nunca lança — devolve o motivo. */
export async function lerPlanilha(): Promise<ResultadoPlanilha> {
  const { url } = origemDaUrl();

  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), 10_000);
  try {
    const resp = await fetch(url, {
      signal: controlador.signal,
      next: { revalidate: 300 }, // 5 min: edição na planilha aparece rápido
    });
    if (!resp.ok) {
      return { ok: false, motivo: `planilha respondeu HTTP ${resp.status}` };
    }

    const texto = await resp.text();
    // Se a planilha for despublicada, o Google devolve HTML de erro com 200.
    if (texto.trimStart().startsWith("<")) {
      return { ok: false, motivo: "resposta em HTML — a planilha provavelmente foi despublicada" };
    }

    return interpretarCSV(texto);
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.message : String(erro);
    return { ok: false, motivo: `falha ao buscar a planilha: ${motivo}` };
  } finally {
    clearTimeout(timer);
  }
}
