import "server-only";
import { createHmac } from "node:crypto";
import { consulta, transacao } from "./db";
import { hoje, somarDias } from "./dados";
import type { Empresa } from "./auth";
import { vendasPorAnuncio } from "./eduzz";
import { distancia, emParalelo, hashVisual } from "./semelhanca";

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
type EmpresaMeta = Pick<Empresa, "id" | "tipo" | "meta_conta" | "vendas_fonte">;

export async function sincronizarEmpresa(empresa: EmpresaMeta, dias = 30) {
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
    // Vendas vindas de outra fonte (Eduzz): a Meta entra só com o investimento, para não contar em dobro.
    if (empresa.vendas_fonte) for (const d of dados) Object.assign(d, { conversoes: 0, receita: 0 });

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

    const { criativos, insights } = await sincronizarAnuncios(empresa, periodo, inicio, fim);
    const leadsFormulario = await importarLeadsDeFormulario(empresa, insights, inicio);
    await consulta("update empresas set meta_sincronizado_em = now(), meta_erro = null where id = $1", [empresa.id]);
    return { linhas: dados.length, anuncios: criativos, leadsFormulario, inicio, fim };
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    await consulta("update empresas set meta_erro = $2 where id = $1", [empresa.id, mensagem.slice(0, 500)]);
    throw erro;
  }
}

// ---------- Criativos agrupados por arte ----------

type AnuncioMeta = {
  id: string;
  name?: string;
  created_time?: string;
  effective_status?: string;
  campaign?: { id?: string; name?: string };
  creative?: {
    id?: string;
    image_hash?: string;
    video_id?: string;
    effective_object_story_id?: string;
    image_url?: string;
    thumbnail_url?: string;
    object_type?: string;
  };
};

export type CampanhaDoCriativo = { nome: string; gasto: number; resultados: number; ativa: boolean };

/**
 * A mesma arte costuma rodar em vários anúncios (um por campanha ou conjunto). Ela é
 * reconhecida pelo vídeo, pelo hash da imagem ou pela publicação usada no anúncio.
 */
export function chaveDaArte(a: Pick<AnuncioMeta, "id" | "creative">) {
  const c = a.creative;
  if (c?.video_id) return `video:${c.video_id}`;
  if (c?.image_hash) return `imagem:${c.image_hash}`;
  if (c?.effective_object_story_id) return `post:${c.effective_object_story_id}`;
  if (c?.id) return `criativo:${c.id}`;
  return `anuncio:${a.id}`;
}

/** Anúncios com investimento no período viram cartões na aba Criativos, um por arte. */
async function sincronizarAnuncios(empresa: EmpresaMeta, periodo: string, inicio: string, fim: string) {
  const insights = (
    await todasPaginas<LinhaInsight & { campaign_id?: string }>(`${empresa.meta_conta}/insights`, {
      level: "ad",
      time_range: periodo,
      fields: `ad_id,ad_name,campaign_id,campaign_name,${CAMPOS}`,
      limit: 500,
    })
  ).filter((a) => a.ad_id && Number(a.spend ?? 0) > 0);
  if (!insights.length) return { criativos: 0, insights };

  // Detalhes de cada anúncio: arte, situação e campanha. O parâmetro "ids" foi
  // descontinuado na v26, então a busca é pela lista de anúncios filtrada pelos ids.
  const detalhes = new Map<string, AnuncioMeta>();
  for (let i = 0; i < insights.length; i += 50) {
    const ids = insights.slice(i, i + 50).map((a) => a.ad_id!);
    try {
      const lista = await todasPaginas<AnuncioMeta>(`${empresa.meta_conta}/ads`, {
        fields:
          "id,name,created_time,effective_status,campaign{id,name}," +
          "creative.thumbnail_width(600).thumbnail_height(600){id,image_hash,video_id,effective_object_story_id,image_url,thumbnail_url,object_type}",
        filtering: JSON.stringify([{ field: "id", operator: "IN", value: ids }]),
        limit: 100,
      });
      for (const a of lista) detalhes.set(a.id, a);
    } catch (erro) {
      console.warn("[painel] Meta: não consegui buscar os detalhes dos anúncios", erro);
    }
  }

  const ecommerce = empresa.tipo === "ecommerce";
  // Com vendas na Eduzz, a venda de cada anúncio vem da UTM utm_content (id ou nome do anúncio).
  const vendasEduzz = empresa.vendas_fonte === "eduzz" ? await vendasPorAnuncio(empresa.id, inicio, fim) : null;
  type Grupo = {
    chave: string;
    titulo: string;
    maiorGasto: number;
    formato: string;
    imagem: string | null;
    gasto: number;
    impressoes: number;
    cliques: number;
    resultados: number;
    inicio: string | null;
    anuncios: Set<string>;
    campanhas: Map<string, CampanhaDoCriativo>;
    /** Chaves de arte que formam este cartão (mais de uma quando vídeos iguais foram enviados de novo). */
    chaves: Set<string>;
    videoId: string | null;
    duracao: number | null;
  };
  const grupos = new Map<string, Grupo>();
  for (const a of insights) {
    const d = detalhes.get(a.ad_id!) ?? { id: a.ad_id! };
    const chave = chaveDaArte(d);
    const gasto = Number(a.spend ?? 0);
    const resultados = vendasEduzz
      ? (vendasEduzz.get(a.ad_id!)?.vendas ?? vendasEduzz.get(a.ad_name ?? "")?.vendas ?? 0)
      : ecommerce
        ? comprasDe(a.actions)
        : leadsDe(a.actions);
    const g = grupos.get(chave) ?? {
      chave,
      titulo: "",
      maiorGasto: -1,
      formato: d.creative?.object_type === "VIDEO" || d.creative?.video_id ? "video" : "imagem",
      imagem: null,
      gasto: 0,
      impressoes: 0,
      cliques: 0,
      resultados: 0,
      inicio: null,
      anuncios: new Set<string>(),
      campanhas: new Map<string, CampanhaDoCriativo>(),
      chaves: new Set([chave]),
      videoId: d.creative?.video_id ?? null,
      duracao: null,
    };
    // O nome e a imagem do cartão vêm do anúncio que mais gastou.
    if (gasto > g.maiorGasto) {
      g.maiorGasto = gasto;
      g.titulo = (a.ad_name ?? d.name ?? "Anúncio").slice(0, 150);
      g.imagem = d.creative?.image_url ?? d.creative?.thumbnail_url ?? g.imagem;
    }
    g.gasto += gasto;
    g.impressoes += Number(a.impressions ?? 0);
    g.cliques += Number(a.inline_link_clicks ?? a.clicks ?? 0);
    g.resultados += resultados;
    const criado = d.created_time?.slice(0, 10) ?? null;
    if (criado && (!g.inicio || criado < g.inicio)) g.inicio = criado;
    g.anuncios.add(a.ad_id!);

    const idCampanha = a.campaign_id ?? d.campaign?.id ?? a.campaign_name ?? "?";
    const c = g.campanhas.get(idCampanha) ?? { nome: (a.campaign_name ?? d.campaign?.name ?? "Campanha").slice(0, 200), gasto: 0, resultados: 0, ativa: false };
    c.gasto = Math.round((c.gasto + gasto) * 100) / 100;
    c.resultados += resultados;
    c.ativa ||= d.effective_status === "ACTIVE";
    g.campanhas.set(idCampanha, c);
    grupos.set(chave, g);
  }

  const lista = (await juntarVideosIguais([...grupos.values()])).sort((a, b) => b.gasto - a.gasto).slice(0, 60);
  await transacao(async (q) => {
    // Cartões antigos (um por anúncio) passam a situação e o aprendizado para o cartão da arte.
    const antigos = await q<{ meta_ad_id: string; status: string; nota: string | null }>(
      "select meta_ad_id, status, nota from criativos where empresa_id = $1 and meta_ad_id is not null and meta_chave is null",
      [empresa.id],
    );
    const porAnuncio = new Map(antigos.map((r) => [r.meta_ad_id, r]));
    // Cartões de arte que agora fazem parte de um cartão maior (vídeos iguais reenviados) também passam o que tinham.
    const atuais = await q<{ meta_chave: string; status: string; nota: string | null }>(
      "select meta_chave, status, nota from criativos where empresa_id = $1 and meta_chave is not null",
      [empresa.id],
    );
    const porChave = new Map(atuais.map((r) => [r.meta_chave, r]));
    const herdado = (g: Grupo) => {
      const rs = [
        ...[...g.anuncios].map((id) => porAnuncio.get(id)),
        ...[...g.chaves].map((ch) => porChave.get(ch)),
      ].filter((r): r is NonNullable<typeof r> => Boolean(r));
      const status = rs.some((r) => r.status === "validado") ? "validado" : rs.some((r) => r.status === "reprovado") ? "reprovado" : "teste";
      const notas = [...new Set(rs.map((r) => r.nota).filter(Boolean))].join(" / ");
      return { status, nota: notas || null };
    };
    const linhas = lista.map((g) => ({ ...g, ...herdado(g) }));
    if (antigos.length) await q("delete from criativos where empresa_id = $1 and meta_ad_id is not null and meta_chave is null", [empresa.id]);
    const absorvidas = linhas.flatMap((l) => [...l.chaves].filter((ch) => ch !== l.chave));
    if (absorvidas.length) await q("delete from criativos where empresa_id = $1 and meta_chave = any($2::text[])", [empresa.id, absorvidas]);

    await q(
      `insert into criativos (empresa_id, meta_chave, titulo, status, nota, formato, plataforma, imagem, gasto, resultados, ctr, inicio,
                              meta_campanhas, meta_anuncios, meta_duracao)
       select $1, ch, t, st, n, f, $2, im, g, r, c, ini, camp, na, du
         from unnest($3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::text[], $9::numeric[], $10::int[], $11::numeric[],
                     $12::date[], $13::jsonb[], $14::int[], $15::numeric[])
              as x(ch, t, st, n, f, im, g, r, c, ini, camp, na, du)
       on conflict (empresa_id, meta_chave) where meta_chave is not null do update set
         titulo = excluded.titulo, formato = excluded.formato, imagem = coalesce(excluded.imagem, criativos.imagem),
         gasto = excluded.gasto, resultados = excluded.resultados, ctr = excluded.ctr,
         status = excluded.status, nota = excluded.nota,
         inicio = coalesce(least(criativos.inicio, excluded.inicio), criativos.inicio, excluded.inicio),
         meta_campanhas = excluded.meta_campanhas, meta_anuncios = excluded.meta_anuncios, meta_duracao = excluded.meta_duracao,
         atualizado_em = now()`,
      [
        empresa.id,
        PLATAFORMA_META,
        linhas.map((l) => l.chave),
        linhas.map((l) => l.titulo),
        linhas.map((l) => l.status),
        linhas.map((l) => l.nota),
        linhas.map((l) => l.formato),
        linhas.map((l) => l.imagem),
        linhas.map((l) => Math.round(l.gasto * 100) / 100),
        linhas.map((l) => l.resultados),
        linhas.map((l) => (l.impressoes > 0 ? Math.round((l.cliques / l.impressoes) * 10000) / 100 : null)),
        linhas.map((l) => l.inicio),
        linhas.map((l) => JSON.stringify([...l.campanhas.values()].sort((a, b) => b.gasto - a.gasto))),
        linhas.map((l) => l.anuncios.size),
        linhas.map((l) => l.duracao),
      ],
    );
  });
  return { criativos: lista.length, insights };

  /**
   * O mesmo vídeo enviado de novo à Meta ganha outro id. Dois cartões de vídeo viram um só
   * quando a duração bate (diferença de até 0,15 s) e a capa é visualmente igual.
   */
  async function juntarVideosIguais(todos: Grupo[]) {
    const videos = todos.filter((g) => g.formato === "video" && g.videoId);
    if (videos.length < 2) return todos;

    const [duracoes, hashes] = await Promise.all([
      emParalelo(videos, 6, async (g) => {
        try {
          const v = await graph<{ length?: number }>(g.videoId!, { fields: "length" });
          return typeof v.length === "number" ? v.length : null;
        } catch {
          return null;
        }
      }),
      emParalelo(videos, 6, (g) => (g.imagem ? hashVisual(g.imagem) : Promise.resolve(null))),
    ]);
    videos.forEach((g, i) => (g.duracao = duracoes[i] != null ? Math.round(duracoes[i]! * 100) / 100 : null));

    // União de grupos parecidos (union-find).
    const pai = videos.map((_, i) => i);
    const raiz = (i: number): number => (pai[i] === i ? i : (pai[i] = raiz(pai[i])));
    for (let i = 0; i < videos.length; i++) {
      for (let j = i + 1; j < videos.length; j++) {
        const hi = hashes[i];
        const hj = hashes[j];
        if (hi == null || hj == null) continue;
        const di = videos[i].duracao;
        const dj = videos[j].duracao;
        const mesmaDuracao = di != null && dj != null && Math.abs(di - dj) <= 0.15;
        const d = distancia(hi, hj);
        // Com a duração igual, a capa pode variar um pouco; sem duração, só capas praticamente idênticas.
        if ((mesmaDuracao && d <= 10) || (di == null || dj == null ? d <= 4 : false)) pai[raiz(i)] = raiz(j);
      }
    }

    const juntos = new Map<number, Grupo[]>();
    videos.forEach((g, i) => juntos.set(raiz(i), [...(juntos.get(raiz(i)) ?? []), g]));
    const resultado = todos.filter((g) => !(g.formato === "video" && g.videoId));
    for (const membros of juntos.values()) resultado.push(membros.length === 1 ? membros[0] : unir(membros));
    return resultado;
  }

  function unir(membros: Grupo[]): Grupo {
    const principal = [...membros].sort((a, b) => b.maiorGasto - a.maiorGasto)[0];
    const chaves = new Set(membros.flatMap((m) => [...m.chaves]));
    const campanhas = new Map<string, CampanhaDoCriativo>();
    for (const m of membros) {
      for (const [id, c] of m.campanhas) {
        const atual = campanhas.get(id);
        campanhas.set(
          id,
          atual
            ? { ...atual, gasto: Math.round((atual.gasto + c.gasto) * 100) / 100, resultados: atual.resultados + c.resultados, ativa: atual.ativa || c.ativa }
            : { ...c },
        );
      }
    }
    return {
      ...principal,
      // Chave estável: a menor entre as que formam o cartão, para ele não "pular" entre sincronizações.
      chave: [...chaves].sort()[0],
      chaves,
      gasto: membros.reduce((a, m) => a + m.gasto, 0),
      impressoes: membros.reduce((a, m) => a + m.impressoes, 0),
      cliques: membros.reduce((a, m) => a + m.cliques, 0),
      resultados: membros.reduce((a, m) => a + m.resultados, 0),
      inicio: membros.map((m) => m.inicio).filter((x): x is string => Boolean(x)).sort()[0] ?? null,
      anuncios: new Set(membros.flatMap((m) => [...m.anuncios])),
      campanhas,
      duracao: principal.duracao ?? membros.find((m) => m.duracao != null)?.duracao ?? null,
    };
  }
}

// ---------- Contatos dos formulários de leads (Lead Ads) ----------

type CampoLead = { name: string; values?: string[] };
type LeadMeta = { id: string; created_time: string; field_data?: CampoLead[]; campaign_name?: string; ad_name?: string; form_id?: string };

/** Lê nome, e-mail e telefone das respostas do formulário (os nomes dos campos variam por formulário e idioma). */
export function contatoDoLead(campos: CampoLead[] = []) {
  const mapa = Object.fromEntries(campos.map((c) => [c.name.toLowerCase(), (c.values ?? []).join(", ")]));
  const achar = (...nomes: string[]) => nomes.map((n) => mapa[n]).find((v) => v && v.trim()) ?? null;
  const nome = achar("full_name", "nome_completo", "nome", "name") ?? ([achar("first_name", "primeiro_nome"), achar("last_name", "sobrenome")].filter(Boolean).join(" ") || null);
  return {
    nome,
    email: achar("email", "e-mail", "work_email"),
    telefone: achar("phone_number", "telefone", "whatsapp", "celular", "phone"),
    campos: mapa,
  };
}

/**
 * Importa quem preencheu os formulários da Meta para a aba Leads.
 * Precisa da permissão leads_retrieval no token e da Página atribuída ao usuário do sistema.
 */
async function importarLeadsDeFormulario(empresa: Pick<Empresa, "id" | "meta_conta">, insights: (LinhaInsight & { campaign_id?: string })[], inicio: string) {
  const comFormulario = insights.filter((a) => (valorDe(a.actions, "onsite_conversion.lead_grouped") ?? 0) > 0);
  if (!comFormulario.length) {
    await consulta("update empresas set meta_leads_aviso = null where id = $1", [empresa.id]);
    return 0;
  }
  const desde = Math.floor(Date.parse(`${inicio}T00:00:00-03:00`) / 1000);
  const leads: LeadMeta[] = [];
  try {
    for (const a of comFormulario) {
      leads.push(
        ...(await todasPaginas<LeadMeta>(`${a.ad_id}/leads`, {
          fields: "id,created_time,field_data,campaign_name,ad_name,form_id",
          filtering: JSON.stringify([{ field: "time_created", operator: "GREATER_THAN", value: desde }]),
          limit: 100,
        })),
      );
    }
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    const aviso = /permission|permiss|leads_retrieval|\(#(10|200|190|283)\)/i.test(mensagem)
      ? "Os leads de formulário entram na contagem, mas para trazer nome e contato falta a permissão leads_retrieval no token e a Página do cliente atribuída ao usuário do sistema."
      : `Não consegui importar os contatos dos formulários: ${mensagem}`;
    await consulta("update empresas set meta_leads_aviso = $2 where id = $1", [empresa.id, aviso.slice(0, 500)]);
    return 0;
  }

  const linhas = leads.map((l) => {
    const c = contatoDoLead(l.field_data);
    return { ...c, id: l.id, quando: l.created_time, campanha: l.campaign_name ?? null, dados: { formulario: l.form_id, anuncio: l.ad_name, respostas: c.campos } };
  });
  if (linhas.length) {
    await consulta(
      `insert into leads (empresa_id, meta_lead_id, nome, email, whatsapp, origem, campanha, etapa, recebido_em, dados)
       select $1, id, n, e, w, 'Formulário Meta', c, 'novo', q, d
         from unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::timestamptz[], $8::jsonb[]) as x(id, n, e, w, c, q, d)
       on conflict (empresa_id, meta_lead_id) where meta_lead_id is not null do nothing`,
      [
        empresa.id,
        linhas.map((l) => l.id),
        linhas.map((l) => l.nome?.slice(0, 120) ?? null),
        linhas.map((l) => l.email?.slice(0, 160) ?? null),
        linhas.map((l) => l.telefone?.slice(0, 40) ?? null),
        linhas.map((l) => l.campanha?.slice(0, 200) ?? null),
        linhas.map((l) => l.quando),
        linhas.map((l) => JSON.stringify(l.dados)),
      ],
    );
  }
  await consulta("update empresas set meta_leads_aviso = null where id = $1", [empresa.id]);
  return linhas.length;
}

/** Sincroniza todos os clientes com conta vinculada (usado pelo Cron diário). */
export async function sincronizarTodas() {
  const empresas = await consulta<EmpresaMeta & { nome: string }>(
    "select id, nome, tipo, meta_conta, vendas_fonte from empresas where meta_conta is not null",
  );
  const resultado: { empresa: string; ok: boolean; detalhe: string }[] = [];
  for (const e of empresas) {
    try {
      const r = await sincronizarEmpresa(e);
      resultado.push({ empresa: e.nome, ok: true, detalhe: `${r.linhas} linhas, ${r.anuncios} criativos, ${r.leadsFormulario} leads de formulário` });
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
