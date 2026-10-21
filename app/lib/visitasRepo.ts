// Leituras do blog e cliques de saída.
//
// O QUE ISTO CONTA, E O QUE NÃO CONTA. Conta acesso de navegador com
// JavaScript rodando — ou seja, gente. Robô de buscador não executa script e
// por isso não entra na conta, o que é exatamente o que se quer de um número
// chamado "quantas pessoas leram": o Googlebot passa várias vezes por dia em
// cada post e inflaria tudo.
//
// NÃO É MÉTRICA DE PRECISÃO, e é bom saber disso antes de olhar. Quem bloqueia
// script não é contado; quem abre o mesmo post em dois dias conta duas vezes;
// quem recarrega na mesma aba não conta de novo (o guarda é por aba). Serve
// para comparar post com post e semana com semana, que é a pergunta de quem
// escreve — não para faturar anúncio.
//
// NUNCA LANÇA. Falha de banco some em silêncio: perder uma contagem é
// irrelevante, e derrubar a página de um leitor por causa de uma estatística
// seria a troca mais burra possível.

import { bancoConfigurado, garantirEsquema, sql } from "./db";

/** Leitura de um post, da capa do blog, ou clique de saída para o curso. */
export type TipoVisita = "post" | "blog" | "saida";

export async function registrarVisita(tipo: TipoVisita, slug: string): Promise<void> {
  if (!bancoConfigurado()) return;
  try {
    await garantirEsquema();
    await sql().query(
      `insert into visitas (dia, tipo, slug, total)
       values (current_date, $1, $2, 1)
       on conflict (dia, tipo, slug) do update set total = visitas.total + 1`,
      [tipo, slug.slice(0, 200)],
    );
  } catch (e) {
    console.error("Falha ao registrar visita:", e instanceof Error ? e.message : e);
  }
}

export interface ResumoVisitas {
  /** Leituras de post nos últimos 7 e 30 dias, e no total. */
  posts7: number;
  posts30: number;
  postsTotal: number;
  /** Aberturas da capa do blog nos últimos 30 dias. */
  blog30: number;
  /** Cliques de saída para o preparatório nos últimos 30 dias. */
  saidas30: number;
  /** Os mais lidos de sempre, com o total de cada um. */
  maisLidos: { slug: string; total: number }[];
}

const VAZIO: ResumoVisitas = {
  posts7: 0,
  posts30: 0,
  postsTotal: 0,
  blog30: 0,
  saidas30: 0,
  maisLidos: [],
};

export async function lerResumoVisitas(): Promise<ResumoVisitas> {
  if (!bancoConfigurado()) return VAZIO;
  try {
    await garantirEsquema();

    const [totais] = (await sql().query(
      `select
         coalesce(sum(total) filter (where tipo = 'post' and dia >= current_date - 6), 0)::int  as posts7,
         coalesce(sum(total) filter (where tipo = 'post' and dia >= current_date - 29), 0)::int as posts30,
         coalesce(sum(total) filter (where tipo = 'post'), 0)::int                              as posts_total,
         coalesce(sum(total) filter (where tipo = 'blog' and dia >= current_date - 29), 0)::int as blog30,
         coalesce(sum(total) filter (where tipo = 'saida' and dia >= current_date - 29), 0)::int as saidas30
       from visitas`,
    )) as Record<string, unknown>[];

    const maisLidos = (await sql().query(
      `select slug, sum(total)::int as total
         from visitas
        where tipo = 'post' and slug <> ''
        group by slug
        order by total desc
        limit 10`,
    )) as Record<string, unknown>[];

    return {
      posts7: Number(totais?.posts7 ?? 0),
      posts30: Number(totais?.posts30 ?? 0),
      postsTotal: Number(totais?.posts_total ?? 0),
      blog30: Number(totais?.blog30 ?? 0),
      saidas30: Number(totais?.saidas30 ?? 0),
      maisLidos: maisLidos.map((l) => ({
        slug: String(l.slug),
        total: Number(l.total ?? 0),
      })),
    };
  } catch (e) {
    console.error("Falha ao ler as visitas:", e instanceof Error ? e.message : e);
    return VAZIO;
  }
}

/** Total de leituras por slug, para a lista de posts do painel. */
export async function lerVisitasPorSlug(): Promise<Map<string, number>> {
  const mapa = new Map<string, number>();
  if (!bancoConfigurado()) return mapa;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select slug, sum(total)::int as total
         from visitas where tipo = 'post' and slug <> '' group by slug`,
    )) as Record<string, unknown>[];
    for (const l of linhas) mapa.set(String(l.slug), Number(l.total ?? 0));
  } catch (e) {
    console.error("Falha ao ler visitas por post:", e instanceof Error ? e.message : e);
  }
  return mapa;
}
