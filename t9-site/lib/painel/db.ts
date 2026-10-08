import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { Pool, types, type QueryResultRow } from "pg";

// Banco do painel: Postgres (Neon na Vercel). A conexão vem de DATABASE_URL,
// criada pela integração da Neon ao conectar o banco ao projeto.

// Datas (date) chegam como texto "2026-10-01", sem passar por fuso horário.
// Números (numeric, bigint) chegam como number: valores de anúncios cabem com folga.
types.setTypeParser(1082, (v) => v);
types.setTypeParser(1700, (v) => Number(v));
types.setTypeParser(20, (v) => Number(v));

const globalParaPool = globalThis as unknown as { poolPainel?: Pool; esquemaPronto?: Promise<void> };

export const bancoConfigurado = () => Boolean(process.env.DATABASE_URL);

function pool() {
  if (!globalParaPool.poolPainel) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não configurada");
    const local = /localhost|127\.0\.0\.1/.test(url);
    globalParaPool.poolPainel = new Pool({
      connectionString: url,
      max: 5,
      ssl: local ? undefined : { rejectUnauthorized: false },
    });
    // Na Vercel, fecha conexões ociosas antes de a função ser suspensa.
    attachDatabasePool(globalParaPool.poolPainel);
  }
  return globalParaPool.poolPainel;
}

const ESQUEMA = [
  `create table if not exists empresas (
    id serial primary key,
    slug text unique not null,
    nome text not null,
    tipo text not null default 'leads' check (tipo in ('leads', 'ecommerce')),
    pais text not null default 'BR',
    moeda text not null default 'BRL',
    idioma text not null default 'pt',
    meta_investimento numeric,
    meta_leads integer,
    meta_cpl numeric,
    meta_receita numeric,
    comentario text,
    comentario_em timestamptz,
    criado_em timestamptz not null default now()
  )`,
  `create table if not exists usuarios (
    id serial primary key,
    email text unique not null,
    nome text,
    perfil text not null check (perfil in ('admin', 'gestor', 'cliente')),
    idioma text not null default 'pt',
    criado_em timestamptz not null default now(),
    ultimo_acesso timestamptz
  )`,
  `create table if not exists acessos (
    usuario_id integer not null references usuarios on delete cascade,
    empresa_id integer not null references empresas on delete cascade,
    primary key (usuario_id, empresa_id)
  )`,
  `create table if not exists tokens_login (
    hash text primary key,
    email text not null,
    criado_em timestamptz not null default now(),
    expira_em timestamptz not null,
    usado_em timestamptz
  )`,
  `create table if not exists sessoes (
    hash text primary key,
    usuario_id integer not null references usuarios on delete cascade,
    criado_em timestamptz not null default now(),
    expira_em timestamptz not null
  )`,
  `create table if not exists metricas (
    id serial primary key,
    empresa_id integer not null references empresas on delete cascade,
    data date not null,
    plataforma text not null,
    campanha text not null default '',
    gasto numeric not null default 0,
    impressoes bigint not null default 0,
    cliques bigint not null default 0,
    leads integer not null default 0,
    conversoes integer not null default 0,
    receita numeric not null default 0,
    origem text not null default 'manual',
    unique (empresa_id, data, plataforma, campanha)
  )`,
  `create table if not exists leads (
    id serial primary key,
    empresa_id integer not null references empresas on delete cascade,
    nome text,
    email text,
    whatsapp text,
    origem text,
    campanha text,
    etapa text not null default 'novo',
    valor numeric,
    recebido_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    dados jsonb
  )`,
  `create table if not exists plano (
    id serial primary key,
    empresa_id integer not null references empresas on delete cascade,
    semana integer not null check (semana between 1 and 4),
    ordem integer not null default 0,
    titulo text not null,
    status text not null default 'pendente' check (status in ('pendente', 'andamento', 'feito'))
  )`,
  `create table if not exists registro (
    id bigserial primary key,
    usuario_id integer,
    empresa_id integer,
    acao text not null,
    detalhe text,
    em timestamptz not null default now()
  )`,
  `create table if not exists criativos (
    id serial primary key,
    empresa_id integer not null references empresas on delete cascade,
    titulo text not null,
    status text not null default 'teste' check (status in ('validado', 'teste', 'reprovado')),
    formato text not null default 'imagem',
    plataforma text,
    link text,
    imagem text,
    gasto numeric,
    resultados integer,
    ctr numeric,
    nota text,
    inicio date,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
  )`,
  `create table if not exists arquivos (
    id serial primary key,
    empresa_id integer not null references empresas on delete cascade,
    usuario_id integer references usuarios on delete set null,
    titulo text not null,
    url text not null,
    nota text,
    criado_em timestamptz not null default now()
  )`,
  `create table if not exists reunioes (
    id serial primary key,
    empresa_id integer not null references empresas on delete cascade,
    quando timestamptz not null,
    titulo text not null,
    link text,
    gravacao text,
    resumo text,
    proximos_passos text,
    criado_em timestamptz not null default now()
  )`,
  `create table if not exists relatorios (
    empresa_id integer not null references empresas on delete cascade,
    mes text not null,
    resumo text,
    destaques text,
    proximos_passos text,
    publicado boolean not null default false,
    atualizado_em timestamptz not null default now(),
    primary key (empresa_id, mes)
  )`,
  `create table if not exists cobrancas (
    id serial primary key,
    empresa_id integer not null references empresas on delete cascade,
    descricao text not null,
    valor numeric not null,
    moeda text not null default 'BRL',
    vencimento date not null,
    link text,
    pago_em date,
    baixa_por integer references usuarios on delete set null,
    criado_em timestamptz not null default now()
  )`,
  `create index if not exists cobrancas_empresa_vencimento on cobrancas (empresa_id, vencimento)`,
  `alter table empresas add column if not exists pagamento_instrucoes text`,
  `alter table empresas add column if not exists meta_conta text`,
  `alter table empresas add column if not exists meta_sincronizado_em timestamptz`,
  `alter table empresas add column if not exists meta_erro text`,
  `alter table criativos add column if not exists meta_ad_id text`,
  `create unique index if not exists criativos_meta_ad on criativos (empresa_id, meta_ad_id) where meta_ad_id is not null`,
  `create index if not exists metricas_empresa_data on metricas (empresa_id, data)`,
  `create index if not exists leads_empresa_recebido on leads (empresa_id, recebido_em desc)`,
];

/** Cria as tabelas na primeira consulta de cada instância (comandos idempotentes). */
async function garantirEsquema() {
  if (!globalParaPool.esquemaPronto) {
    globalParaPool.esquemaPronto = (async () => {
      const cliente = await pool().connect();
      try {
        for (const comando of ESQUEMA) await cliente.query(comando);
      } finally {
        cliente.release();
      }
    })().catch((erro) => {
      globalParaPool.esquemaPronto = undefined;
      throw erro;
    });
  }
  return globalParaPool.esquemaPronto;
}

/** Consulta com parâmetros ($1, $2…). Nunca monte SQL concatenando valores. */
export async function consulta<T extends QueryResultRow = QueryResultRow>(texto: string, valores: unknown[] = []) {
  await garantirEsquema();
  const resultado = await pool().query<T>(texto, valores);
  return resultado.rows;
}

/** Executa várias consultas numa transação: ou tudo é gravado, ou nada. */
export async function transacao<T>(trabalho: (q: <L extends QueryResultRow = QueryResultRow>(texto: string, valores?: unknown[]) => Promise<L[]>) => Promise<T>) {
  await garantirEsquema();
  const cliente = await pool().connect();
  try {
    await cliente.query("begin");
    const resultado = await trabalho(async (texto, valores = []) => (await cliente.query(texto, valores)).rows);
    await cliente.query("commit");
    return resultado;
  } catch (erro) {
    await cliente.query("rollback").catch(() => undefined);
    throw erro;
  } finally {
    cliente.release();
  }
}

export async function umaLinha<T extends QueryResultRow = QueryResultRow>(texto: string, valores: unknown[] = []) {
  const linhas = await consulta<T>(texto, valores);
  return linhas[0] ?? null;
}

/** Registro de auditoria: quem fez o quê (LGPD). Falha aqui nunca derruba a ação. */
export async function registrar(usuarioId: number | null, empresaId: number | null, acao: string, detalhe?: string) {
  try {
    await consulta("insert into registro (usuario_id, empresa_id, acao, detalhe) values ($1, $2, $3, $4)", [
      usuarioId,
      empresaId,
      acao,
      detalhe ?? null,
    ]);
  } catch (erro) {
    console.error("[painel] falha ao registrar", acao, erro);
  }
}
