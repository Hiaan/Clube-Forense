// O gasto com anúncios do lado de cá: gravação e leitura para o painel.
//
// É a outra metade do ROI. O faturamento sozinho não diz se a operação está
// ganhando dinheiro; só ao lado do custo é que "R$ 40 mil em agosto" vira uma
// informação.
//
// Como nos outros repositórios desta pasta, nada aqui lança.

import { bancoConfigurado, garantirEsquema, sql } from "./db";
import type { GastoDiario } from "./metaAdsApi";

/** Recorte de período. Datas em AAAA-MM-DD, as duas pontas incluídas. */
export interface FiltroAds {
  de?: string | null;
  ate?: string | null;
  plataforma?: string;
}

/** Como o relatório agrupa o tempo. */
export type Granularidade = "dia" | "semana" | "mes";

/** Tradução para o `date_trunc` do Postgres. Fechada num mapa: o valor vem da URL. */
const TRUNC: Record<Granularidade, string> = {
  dia: "day",
  semana: "week",
  mes: "month",
};

/** O `date_trunc` correspondente, para o lado das vendas cortar o tempo igual. */
export function truncDe(g: Granularidade): string {
  return TRUNC[g];
}

export function granularidadeValida(v: string | undefined): Granularidade {
  return v === "semana" || v === "mes" ? v : "dia";
}

function recorte(f: FiltroAds, comecaEm = 1): { where: string; params: unknown[] } {
  const partes = ["g.plataforma = $" + comecaEm];
  const params: unknown[] = [f.plataforma ?? "meta"];

  if (f.de) {
    params.push(f.de);
    partes.push(`g.dia >= $${comecaEm + params.length - 1}::date`);
  }
  if (f.ate) {
    params.push(f.ate);
    partes.push(`g.dia <= $${comecaEm + params.length - 1}::date`);
  }

  return { where: `where ${partes.join(" and ")}`, params };
}

/**
 * Grava os gastos, sobrescrevendo o que já houver para o mesmo dia e campanha.
 *
 * Aqui o upsert sobrescreve tudo, sem o `coalesce` que protege as vendas: o
 * Meta reescreve os números dos dias recentes conforme atribui conversões, e o
 * valor novo é sempre o mais correto. Preservar o antigo seria guardar uma
 * versão provisória para sempre.
 */
export async function salvarGastos(
  gastos: GastoDiario[],
  plataforma = "meta",
): Promise<number | null> {
  if (!bancoConfigurado()) return null;
  if (gastos.length === 0) return 0;

  try {
    await garantirEsquema();
    const s = sql();

    for (const g of gastos) {
      await s.query(
        `insert into gastos_ads
           (dia, plataforma, campanha_id, campanha, gasto, impressoes, cliques, atualizado_em)
         values ($1,$2,$3,$4,$5,$6,$7, now())
         on conflict (dia, plataforma, campanha_id) do update set
           campanha      = coalesce(excluded.campanha, gastos_ads.campanha),
           gasto         = excluded.gasto,
           impressoes    = excluded.impressoes,
           cliques       = excluded.cliques,
           atualizado_em = now()`,
        [g.dia, plataforma, g.campanhaId, g.campanha, g.gasto, g.impressoes, g.cliques],
      );
    }

    return gastos.length;
  } catch (e) {
    console.error("Falha ao salvar gastos de anúncios:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface ResumoGastos {
  gasto: number;
  impressoes: number;
  cliques: number;
  /** Custo por clique. Zero quando não houve clique. */
  cpc: number;
  /** Quando o espelho foi atualizado, para a tela dizer se o custo está fresco. */
  atualizadoEm: string | null;
}

/** Totais do período. */
export async function resumoGastos(filtro: FiltroAds = {}): Promise<ResumoGastos | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const { where, params } = recorte(filtro);
    const linhas = (await sql().query(
      `select coalesce(sum(g.gasto), 0)      as gasto,
              coalesce(sum(g.impressoes), 0) as impressoes,
              coalesce(sum(g.cliques), 0)    as cliques,
              max(g.atualizado_em)           as atualizado_em
         from gastos_ads g ${where}`,
      params,
    )) as Record<string, unknown>[];

    const t = linhas[0] ?? {};
    const cliques = Number(t.cliques ?? 0);
    const gasto = Number(t.gasto ?? 0);

    return {
      gasto,
      impressoes: Number(t.impressoes ?? 0),
      cliques,
      cpc: cliques > 0 ? gasto / cliques : 0,
      atualizadoEm: t.atualizado_em ? new Date(String(t.atualizado_em)).toISOString() : null,
    };
  } catch (e) {
    console.error("Falha ao resumir gastos:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface PeriodoGasto {
  /** Primeiro dia do período, em AAAA-MM-DD. */
  inicio: string;
  gasto: number;
  cliques: number;
}

/**
 * Gasto agrupado por dia, semana ou mês.
 *
 * A chave é o primeiro dia do período, e não um rótulo tipo "semana 32": é o
 * que permite casar esta série com a de faturamento sem as duas precisarem
 * concordar sobre como se escreve uma semana.
 *
 * A semana começa na segunda, que é o padrão do `date_trunc` do Postgres — o
 * mesmo usado do lado das vendas, para as duas metades do ROI cortarem o tempo
 * no mesmo lugar.
 */
export async function gastosPorPeriodo(
  granularidade: Granularidade = "dia",
  filtro: FiltroAds = {},
): Promise<PeriodoGasto[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const { where, params } = recorte(filtro);
    const linhas = (await sql().query(
      `select to_char(date_trunc('${TRUNC[granularidade]}', g.dia), 'YYYY-MM-DD') as inicio,
              coalesce(sum(g.gasto), 0) as gasto,
              coalesce(sum(g.cliques), 0) as cliques
         from gastos_ads g ${where}
        group by 1 order by 1`,
      params,
    )) as Record<string, unknown>[];

    return linhas.map((l) => ({
      inicio: String(l.inicio),
      gasto: Number(l.gasto),
      cliques: Number(l.cliques),
    }));
  } catch (e) {
    console.error("Falha ao agrupar gastos:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface CampanhaGasto {
  campanhaId: string;
  campanha: string;
  gasto: number;
  cliques: number;
  cpc: number;
}

/** Quanto cada campanha consumiu no período, da mais cara para a mais barata. */
export async function gastosPorCampanha(filtro: FiltroAds = {}): Promise<CampanhaGasto[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const { where, params } = recorte(filtro);
    const linhas = (await sql().query(
      `select g.campanha_id as id,
              coalesce(min(g.campanha), g.campanha_id) as nome,
              coalesce(sum(g.gasto), 0) as gasto,
              coalesce(sum(g.cliques), 0) as cliques
         from gastos_ads g ${where}
        group by g.campanha_id
        order by gasto desc`,
      params,
    )) as Record<string, unknown>[];

    return linhas.map((l) => {
      const gasto = Number(l.gasto);
      const cliques = Number(l.cliques);
      return {
        campanhaId: String(l.id),
        campanha: String(l.nome),
        gasto,
        cliques,
        cpc: cliques > 0 ? gasto / cliques : 0,
      };
    });
  } catch (e) {
    console.error("Falha ao agrupar gastos por campanha:", e instanceof Error ? e.message : e);
    return null;
  }
}
