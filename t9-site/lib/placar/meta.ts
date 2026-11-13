import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { CAMPOS, comprasDe, graph, leadsDe, receitaDe, todasPaginas, type LinhaInsight } from "@/lib/painel/meta";
import { hoje, somarDias } from "@/lib/painel/dados";
import { q, uma, type Agencia, type Cliente } from "./banco";
import { cifrar, decifrar, endereco } from "./conta";

// Cada agência conecta a própria conta do Facebook ("Entrar com o Facebook", permissão ads_read).
// O token de longa duração (cerca de 60 dias) fica cifrado no banco; perto de vencer, o app pede
// para conectar de novo. O token da T9 nunca é usado aqui: uma agência só vê as contas dela.

const VERSAO = process.env.META_API_VERSION ?? "v26.0";
const PERMISSOES = "ads_read";

let idDoApp: string | null = process.env.META_APP_ID ?? null;
async function appId() {
  idDoApp ??= (await graph<{ id: string }>("app", { fields: "id" })).id;
  return idDoApp;
}

export const urlDeRetorno = () => `${new URL(endereco()).origin}/api/placar/meta`;

const assinar = (texto: string) => createHmac("sha256", `${process.env.PLACAR_CHAVE || process.env.META_APP_SECRET}:placar-estado`).update(texto).digest("base64url");

/** "estado" do OAuth: agência + hora, assinado (evita que alguém conecte a conta dele na agência de outro). */
export function estadoDoLogin(agenciaId: number) {
  const base = `${agenciaId}.${Date.now()}`;
  return `${base}.${assinar(base)}`;
}

export function conferirEstado(estado: string) {
  const [id, quando, assinatura] = estado.split(".");
  const certo = Buffer.from(assinar(`${id}.${quando}`));
  const recebido = Buffer.from(assinatura ?? "");
  if (certo.length !== recebido.length || !timingSafeEqual(certo, recebido)) return null;
  if (Date.now() - Number(quando) > 30 * 60_000) return null;
  return Number(id);
}

export async function linkDeLogin(agenciaId: number) {
  const u = new URL(`https://www.facebook.com/${VERSAO}/dialog/oauth`);
  u.searchParams.set("client_id", await appId());
  u.searchParams.set("redirect_uri", urlDeRetorno());
  u.searchParams.set("state", estadoDoLogin(agenciaId));
  // "Login do Facebook para Empresas" usa uma configuração criada no app (META_LOGIN_CONFIG_ID);
  // sem ela, vale o login comum com a lista de permissões.
  if (process.env.META_LOGIN_CONFIG_ID) u.searchParams.set("config_id", process.env.META_LOGIN_CONFIG_ID);
  else u.searchParams.set("scope", PERMISSOES);
  u.searchParams.set("response_type", "code");
  return u.toString();
}

async function tokenDoOAuth(parametros: Record<string, string>) {
  const u = new URL(`https://graph.facebook.com/${VERSAO}/oauth/access_token`);
  for (const [k, v] of Object.entries(parametros)) u.searchParams.set(k, v);
  const r = await fetch(u, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
  const corpo = (await r.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: { message?: string } };
  if (!r.ok || !corpo.access_token) throw new Error(`Meta: ${corpo.error?.message ?? `HTTP ${r.status}`}`);
  return corpo;
}

/** Troca o código do login por um token de longa duração e guarda (cifrado) na agência. */
export async function conectarMeta(agenciaId: number, codigo: string) {
  const segredo = process.env.META_APP_SECRET;
  if (!segredo) throw new Error("META_APP_SECRET não configurado.");
  const id = await appId();
  const curto = await tokenDoOAuth({ client_id: id, client_secret: segredo, redirect_uri: urlDeRetorno(), code: codigo });
  const longo = await tokenDoOAuth({ grant_type: "fb_exchange_token", client_id: id, client_secret: segredo, fb_exchange_token: curto.access_token! });
  const eu = await graph<{ name?: string }>("me", { fields: "name" }, { token: longo.access_token });
  await q("update placar.agencias set meta_token = $2, meta_expira_em = now() + make_interval(secs => $3), meta_pessoa = $4 where id = $1", [
    agenciaId,
    cifrar(longo.access_token!),
    longo.expires_in ?? 60 * 86_400,
    eu.name ?? null,
  ]);
  return eu.name ?? "";
}

export function tokenDaAgencia(a: Pick<Agencia, "meta_token" | "meta_expira_em">) {
  if (!a.meta_token) return null;
  if (a.meta_expira_em && new Date(a.meta_expira_em).getTime() < Date.now()) return null;
  try {
    return decifrar(a.meta_token);
  } catch {
    return null;
  }
}

export type ContaDeAnuncio = { id: string; nome: string; moeda: string; ativa: boolean };

export async function contasDaAgencia(a: Pick<Agencia, "meta_token" | "meta_expira_em">): Promise<ContaDeAnuncio[]> {
  const token = tokenDaAgencia(a);
  if (!token) return [];
  const contas = await todasPaginas<{ id: string; name: string; currency: string; account_status: number }>(
    "me/adaccounts",
    { fields: "name,currency,account_status", limit: 200 },
    20,
    token,
  );
  return contas.map((c) => ({ id: c.id, nome: c.name, moeda: c.currency, ativa: c.account_status === 1 })).sort((x, y) => x.nome.localeCompare(y.nome));
}

/** Puxa as métricas por dia e campanha dos últimos `dias` e substitui o período no banco. */
export async function sincronizarCliente(c: Pick<Cliente, "id" | "agencia_id" | "meta_conta">, dias = 30) {
  if (!c.meta_conta) return { linhas: 0 };
  const agencia = await uma<Agencia>("select * from placar.agencias where id = $1", [c.agencia_id]);
  const token = agencia ? tokenDaAgencia(agencia) : null;
  if (!token) {
    await q("update placar.clientes set erro_meta = $2 where id = $1", [c.id, "A conexão com o Facebook venceu. Conecte de novo em Configurações."]);
    throw new Error("Facebook desconectado");
  }
  const fim = hoje();
  const inicio = somarDias(fim, -(dias - 1));
  try {
    const linhas = await todasPaginas<LinhaInsight>(
      `${c.meta_conta}/insights`,
      { level: "campaign", time_increment: 1, time_range: JSON.stringify({ since: inicio, until: fim }), fields: `campaign_name,${CAMPOS}`, limit: 500 },
      50,
      token,
    );
    const porChave = new Map<string, { data: string; campanha: string; gasto: number; impressoes: number; cliques: number; leads: number; conversoes: number; receita: number }>();
    for (const l of linhas) {
      const campanha = (l.campaign_name ?? "").slice(0, 200);
      const chave = `${l.date_start}|${campanha}`;
      const x = porChave.get(chave) ?? { data: l.date_start, campanha, gasto: 0, impressoes: 0, cliques: 0, leads: 0, conversoes: 0, receita: 0 };
      x.gasto += Number(l.spend ?? 0);
      x.impressoes += Number(l.impressions ?? 0);
      x.cliques += Number(l.inline_link_clicks ?? l.clicks ?? 0);
      x.leads += leadsDe(l.actions);
      x.conversoes += comprasDe(l.actions);
      x.receita += receitaDe(l.action_values);
      porChave.set(chave, x);
    }
    const d = [...porChave.values()];
    await q("delete from placar.metricas where cliente_id = $1 and data between $2 and $3", [c.id, inicio, fim]);
    if (d.length) {
      await q(
        `insert into placar.metricas (cliente_id, data, campanha, gasto, impressoes, cliques, leads, conversoes, receita)
         select $1, x.d, x.c, x.g, x.i, x.cl, x.le, x.co, x.r
           from unnest($2::date[], $3::text[], $4::numeric[], $5::bigint[], $6::bigint[], $7::int[], $8::int[], $9::numeric[]) as x(d, c, g, i, cl, le, co, r)
         on conflict (cliente_id, data, campanha) do update set gasto = excluded.gasto, impressoes = excluded.impressoes, cliques = excluded.cliques,
           leads = excluded.leads, conversoes = excluded.conversoes, receita = excluded.receita`,
        [
          c.id,
          d.map((x) => x.data),
          d.map((x) => x.campanha),
          d.map((x) => Math.round(x.gasto * 100) / 100),
          d.map((x) => x.impressoes),
          d.map((x) => x.cliques),
          d.map((x) => x.leads),
          d.map((x) => x.conversoes),
          d.map((x) => Math.round(x.receita * 100) / 100),
        ],
      );
    }
    await q("update placar.clientes set sincronizado_em = now(), erro_meta = null where id = $1", [c.id]);
    return { linhas: d.length };
  } catch (erro) {
    await q("update placar.clientes set erro_meta = $2 where id = $1", [c.id, (erro instanceof Error ? erro.message : String(erro)).slice(0, 400)]);
    throw erro;
  }
}
