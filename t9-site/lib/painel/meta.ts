import "server-only";
import { createHmac } from "node:crypto";
import { consulta, transacao } from "./db";
import { hoje, somarDias } from "./dados";
import type { Empresa } from "./auth";

// Integração com a Marketing API da Meta (Gerenciador de Anúncios).
// Usa o token de um "usuário do sistema" do Business Manager da T9 (META_ACCESS_TOKEN),
// com permissão ads_read nas contas de anúncio dos clientes.

// Apps novos só podem usar a versão mais recente da API (chamadas antigas são promovidas).
const VERSAO = process.env.META_API_VERSION ?? "v26.0";
const BASE = (process.env.META_GRAPH_URL ?? "https://graph.facebook.com").replace(/\/$/, "");
export const PLATAFORMA_META = "Meta Ads";

export const metaConfigurado = () => Boolean(process.env.META_ACCESS_TOKEN);

/** Aceita "act_123", "123" ou um link do Gerenciador (…?act=123…) e devolve "act_123". */
export function normalizarConta(valor: string) {
  const v = valor.trim();
  const numero = v.match(/act[_=](\d{3,})/)?.[1] ?? v.match(/^(\d{3,})$/)?.[1];
  return numero ? `act_${numero}` : null;
}

type ErroGraph = { error?: { message?: string; code?: number; error_subcode?: number } };

async function graph<T>(caminho: string, parametros: Record<string, string | number> = {}): Promise<T> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN não configurado.");
  const url = new URL(caminho.startsWith("http") ? caminho : `${BASE}/${VERSAO}/${caminho.replace(/^\//, "")}`);
  if (!caminho.startsWith("http")) {
    for (const [k, v] of Object.entries(parametros)) url.searchParams.set(k, String(v));
    url.searchParams.set("access_token", token);
    // Prova do segredo do app: impede o uso do token por quem não tem o segredo.
    if (process.env.META_APP_SECRET) {
      url.searchParams.set("appsecret_proof", createHmac("sha256", process.env.META_APP_SECRET).update(token).digest("hex"));
    }
  }
  const resposta = await fetch(url, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
  const corpo = (await resposta.json().catch(() => ({}))) as T & ErroGraph;
  if (!resposta.ok || corpo.error) {
    const e = corpo.error;
    throw new Error(`Meta: ${e?.message ?? `HTTP ${resposta.status}`}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return corpo;
}

/** Percorre a paginação ("paging.next") até o fim. */
async function todasPaginas<T>(caminho: string, parametros: Record<string, string | number>, limite = 50) {
  const itens: T[] = [];
  let pagina = await graph<{ data: T[]; paging?: { next?: string } }>(caminho, parametros);
  itens.push(...pagina.data);
  for (let i = 1; pagina.paging?.next && i < limite; i++) {
    pagina = await graph(pagina.paging.next);
    itens.push(...pagina.data);
  }
  return itens;
}

// ---------- Contas de anúncio ----------

export type ContaAnuncio = { id: string; nome: string; moeda: string; ativa: boolean };

let cacheContas: { quando: number; contas: ContaAnuncio[] } | null = null;

/** Contas de anúncio que o usuário do sistema enxerga (cache de 10 minutos). */
export async function listarContasDeAnuncio(): Promise<ContaAnuncio[]> {
  if (cacheContas && Date.now() - cacheContas.quando < 600_000) return cacheContas.contas;
  const brutas = await todasPaginas<{ id: string; name: string; currency: string; account_status: number }>("me/adaccounts", {
    fields: "name,currency,account_status",
    limit: 200,
  });
  const contas = brutas
    .map((c) => ({ id: c.id, nome: c.name, moeda: c.currency, ativa: c.account_status === 1 }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  cacheContas = { quando: Date.now(), contas };
  return contas;
}

// ---------- Conversão das ações da Meta ----------

type Acao = { action_type: string; value: string };
type LinhaInsight = {
  date_start: string;
  campaign_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
  inline_link_clicks?: string;
  actions?: Acao[];
  action_values?: Acao[];
};

const valorDe = (lista: Acao[] | undefined, tipo: string) => {
  const a = lista?.find((x) => x.action_type === tipo);
  return a ? Number(a.value) || 0 : null;
};
const primeiro = (lista: Acao[] | undefined, tipos: string[]) => {
  for (const t of tipos) {
    const v = valorDe(lista, t);
    if (v != null) return v;
  }
  return 0;
};

/**
 * Leads = cadastros (formulário da Meta ou pixel) + conversas iniciadas por mensagem
 * (WhatsApp, Direct, Messenger), que é como a maioria das campanhas de leads roda no Brasil.
 */
export function leadsDe(acoes: Acao[] | undefined) {
  const cadastros = valorDe(acoes, "lead") ?? (valorDe(acoes, "onsite_conversion.lead_grouped") ?? 0) + (valorDe(acoes, "offsite_conversion.fb_pixel_lead") ?? 0);
  const conversas = valorDe(acoes, "onsite_conversion.messaging_conversation_started_7d") ?? 0;
  return Math.round(cadastros + conversas);
}

const TIPOS_COMPRA = ["omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase"];
export const comprasDe = (acoes: Acao[] | undefined) => Math.round(primeiro(acoes, TIPOS_COMPRA));
export const receitaDe = (valores: Acao[] | undefined) => primeiro(valores, TIPOS_COMPRA);

// ---------- Sincronização ----------

const CAMPOS = "spend,impressions,clicks,inline_link_clicks,actions,action_values";

/** Puxa as métricas por dia e campanha e os anúncios com investimento no período. */
export async function sincronizarEmpresa(empresa: Pick<Empresa, "id" | "tipo" | "meta_conta">, dias = 30) {
  if (!empresa.meta_conta) throw new Error("Conta de anúncio da Meta não vinculada.");
  const fim = hoje();
  const inicio = somarDias(fim, -(dias - 1));
  const periodo = JSON.stringify({ since: inicio, until: fim });

  try {
    const linhas = await todasPaginas<LinhaInsight>(`${empresa.meta_conta}/insights`, {
      level: "campaign",
      time_increment: 1,
      time_range: periodo,
      fields: `campaign_name,${CAMPOS}`,
      limit: 500,
    });

    // Junta linhas iguais (mesmo dia e nome de campanha) antes de gravar.
    const porChave = new Map<string, { data: string; campanha: string; gasto: number; impressoes: number; cliques: number; leads: number; conversoes: number; receita: number }>();
    for (const l of linhas) {
      const campanha = (l.campaign_name ?? "").slice(0, 200);
      const chave = `${l.date_start}|${campanha}`;
      const atual = porChave.get(chave) ?? { data: l.date_start, campanha, gasto: 0, impressoes: 0, cliques: 0, leads: 0, conversoes: 0, receita: 0 };
      atual.gasto += Number(l.spend ?? 0);
      atual.impressoes += Number(l.impressions ?? 0);
      atual.cliques += Number(l.inline_link_clicks ?? l.clicks ?? 0);
      atual.leads += leadsDe(l.actions);
      atual.conversoes += comprasDe(l.actions);
      atual.receita += receitaDe(l.action_values);
      porChave.set(chave, atual);
    }
    const dados = [...porChave.values()];

    await transacao(async (q) => {
      // Substitui o período inteiro: campanhas renomeadas ou apagadas não deixam sobras.
      await q("delete from metricas where empresa_id = $1 and origem = 'meta' and data between $2 and $3", [empresa.id, inicio, fim]);
      if (dados.length) {
        await q(
          `insert into metricas (empresa_id, data, plataforma, campanha, gasto, impressoes, cliques, leads, conversoes, receita, origem)
           select $1, d, $2, c, g, i, cl, le, co, r, 'meta'
             from unnest($3::date[], $4::text[], $5::numeric[], $6::bigint[], $7::bigint[], $8::int[], $9::int[], $10::numeric[])
                  as x(d, c, g, i, cl, le, co, r)
           on conflict (empresa_id, data, plataforma, campanha) do update set
             gasto = excluded.gasto, impressoes = excluded.impressoes, cliques = excluded.cliques, leads = excluded.leads,
             conversoes = excluded.conversoes, receita = excluded.receita, origem = 'meta'`,
          [
            empresa.id,
            PLATAFORMA_META,
            dados.map((d) => d.data),
            dados.map((d) => d.campanha),
            dados.map((d) => Math.round(d.gasto * 100) / 100),
            dados.map((d) => d.impressoes),
            dados.map((d) => d.cliques),
            dados.map((d) => d.leads),
            dados.map((d) => d.conversoes),
            dados.map((d) => Math.round(d.receita * 100) / 100),
          ],
        );
      }
    });

    const anuncios = await sincronizarAnuncios(empresa, periodo);
    await consulta("update empresas set meta_sincronizado_em = now(), meta_erro = null where id = $1", [empresa.id]);
    return { linhas: dados.length, anuncios, inicio, fim };
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    await consulta("update empresas set meta_erro = $2 where id = $1", [empresa.id, mensagem.slice(0, 500)]);
    throw erro;
  }
}

/** Anúncios com investimento no período viram cartões na aba Criativos (situação e aprendizado continuam com a equipe). */
async function sincronizarAnuncios(empresa: Pick<Empresa, "id" | "tipo" | "meta_conta">, periodo: string) {
  const anuncios = (
    await todasPaginas<LinhaInsight>(`${empresa.meta_conta}/insights`, {
      level: "ad",
      time_range: periodo,
      fields: `ad_id,ad_name,${CAMPOS}`,
      limit: 500,
    })
  )
    .filter((a) => a.ad_id && Number(a.spend ?? 0) > 0)
    .sort((a, b) => Number(b.spend) - Number(a.spend))
    .slice(0, 60);
  if (!anuncios.length) return 0;

  // Imagem e formato de cada anúncio, pela lista de anúncios da conta filtrada pelos ids
  // (o parâmetro "ids" foi descontinuado na v26). Se falhar, os cartões entram sem imagem.
  const detalhes = new Map<string, { imagem: string | null; formato: string; criado: string | null }>();
  type Anuncio = { id: string; created_time?: string; creative?: { image_url?: string; thumbnail_url?: string; object_type?: string } };
  for (let i = 0; i < anuncios.length; i += 50) {
    const ids = anuncios.slice(i, i + 50).map((a) => a.ad_id!);
    try {
      const lista = await todasPaginas<Anuncio>(`${empresa.meta_conta}/ads`, {
        fields: "id,created_time,creative.thumbnail_width(600).thumbnail_height(600){image_url,thumbnail_url,object_type}",
        filtering: JSON.stringify([{ field: "id", operator: "IN", value: ids }]),
        limit: 100,
      });
      for (const a of lista) {
        detalhes.set(a.id, {
          imagem: a.creative?.image_url ?? a.creative?.thumbnail_url ?? null,
          formato: a.creative?.object_type === "VIDEO" ? "video" : "imagem",
          criado: a.created_time?.slice(0, 10) ?? null,
        });
      }
    } catch (erro) {
      console.warn("[painel] Meta: não consegui buscar as imagens dos anúncios", erro);
    }
  }

  const ecommerce = empresa.tipo === "ecommerce";
  const linhas = anuncios.map((a) => {
    const d = detalhes.get(a.ad_id!);
    const impressoes = Number(a.impressions ?? 0);
    const cliques = Number(a.inline_link_clicks ?? a.clicks ?? 0);
    return {
      id: a.ad_id!,
      titulo: (a.ad_name ?? "Anúncio").slice(0, 150),
      formato: d?.formato ?? "imagem",
      imagem: d?.imagem ?? null,
      gasto: Math.round(Number(a.spend ?? 0) * 100) / 100,
      resultados: ecommerce ? comprasDe(a.actions) : leadsDe(a.actions),
      ctr: impressoes > 0 ? Math.round((cliques / impressoes) * 10000) / 100 : null,
      inicio: d?.criado ?? null,
    };
  });

  await consulta(
    `insert into criativos (empresa_id, meta_ad_id, titulo, status, formato, plataforma, imagem, gasto, resultados, ctr, inicio)
     select $1, id, t, 'teste', f, $2, im, g, r, c, ini
       from unnest($3::text[], $4::text[], $5::text[], $6::text[], $7::numeric[], $8::int[], $9::numeric[], $10::date[])
            as x(id, t, f, im, g, r, c, ini)
     on conflict (empresa_id, meta_ad_id) where meta_ad_id is not null do update set
       titulo = excluded.titulo, formato = excluded.formato, imagem = coalesce(excluded.imagem, criativos.imagem),
       gasto = excluded.gasto, resultados = excluded.resultados, ctr = excluded.ctr,
       inicio = coalesce(criativos.inicio, excluded.inicio), atualizado_em = now()`,
    [
      empresa.id,
      PLATAFORMA_META,
      linhas.map((l) => l.id),
      linhas.map((l) => l.titulo),
      linhas.map((l) => l.formato),
      linhas.map((l) => l.imagem),
      linhas.map((l) => l.gasto),
      linhas.map((l) => l.resultados),
      linhas.map((l) => l.ctr),
      linhas.map((l) => l.inicio),
    ],
  );
  return linhas.length;
}

/** Sincroniza todos os clientes com conta vinculada (usado pelo Cron diário). */
export async function sincronizarTodas() {
  const empresas = await consulta<Pick<Empresa, "id" | "tipo" | "meta_conta"> & { nome: string }>(
    "select id, nome, tipo, meta_conta from empresas where meta_conta is not null",
  );
  const resultado: { empresa: string; ok: boolean; detalhe: string }[] = [];
  for (const e of empresas) {
    try {
      const r = await sincronizarEmpresa(e);
      resultado.push({ empresa: e.nome, ok: true, detalhe: `${r.linhas} linhas, ${r.anuncios} anúncios` });
    } catch (erro) {
      resultado.push({ empresa: e.nome, ok: false, detalhe: erro instanceof Error ? erro.message : String(erro) });
    }
  }
  return resultado;
}

/** Totais por tipo de ação de uma conta nos últimos 30 dias (para conferir como a Meta reporta leads e compras). */
export async function acoesDaConta(conta: string) {
  const linhas = await graph<{ data: { actions?: Acao[] }[] }>(`${conta}/insights`, { fields: "actions", date_preset: "last_30d", level: "account" });
  return Object.fromEntries((linhas.data[0]?.actions ?? []).map((a) => [a.action_type, Number(a.value)]));
}

/** Confere o token: quem é o usuário do sistema, permissões concedidas e contas visíveis. */
export async function diagnosticoMeta() {
  const eu = await graph<{ id: string; name: string }>("me", { fields: "id,name" });
  const permissoes = await graph<{ data: { permission: string; status: string }[] }>("me/permissions").catch(() => ({ data: [] }));
  cacheContas = null;
  const contas = await listarContasDeAnuncio();
  return {
    usuario: eu.name,
    permissoes: permissoes.data.filter((p) => p.status === "granted").map((p) => p.permission),
    appsecretProof: Boolean(process.env.META_APP_SECRET),
    contas: contas.map((c) => ({ id: c.id, nome: c.nome, moeda: c.moeda, ativa: c.ativa })),
  };
}
