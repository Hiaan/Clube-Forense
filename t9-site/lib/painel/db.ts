import "server-only";
import { Pool, type QueryResultRow } from "pg";

// Banco do painel: Postgres (Neon na Vercel). A conexão vem de DATABASE_URL,
// criada pela integração da Neon ao conectar o banco ao projeto.

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
