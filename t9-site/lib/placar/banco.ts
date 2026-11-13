import "server-only";
import type { QueryResultRow } from "pg";
import { consulta as consultaPainel } from "@/lib/painel/db";

// Placar: produto à parte da T9, vendido por assinatura para agências e gestores de tráfego.
// Mora no mesmo banco, mas num esquema próprio ("placar"): nenhuma tabela da T9 é lida ou escrita
// por aqui, e dá para levar o esquema para um banco separado depois sem mudar o código.

const ESQUEMA = [
  `create schema if not exists placar`,
  `create table if not exists placar.agencias (
    id serial primary key,
    nome text not null,
    cor text not null default '#2F5BEA',
    logo text,
    plano text not null default 'teste',
    status text not null default 'teste' check (status in ('teste', 'ativa', 'atrasada', 'cancelada')),
    teste_ate timestamptz not null,
    pago_ate timestamptz,
    documento text,
    telefone text,
    asaas_cliente text,
    asaas_assinatura text,
    alertas_numeros text,
    meta_token text,
    meta_expira_em timestamptz,
    meta_pessoa text,
    wa_numero text,
    criado_em timestamptz not null default now()
  )`,
  `create table if not exists placar.usuarios (
    id serial primary key,
    agencia_id integer not null references placar.agencias on delete cascade,
    email text unique not null,
    nome text,
    senha text not null,
    criado_em timestamptz not null default now(),
    ultimo_acesso timestamptz
  )`,
  `create table if not exists placar.sessoes (
    hash text primary key,
    usuario_id integer not null references placar.usuarios on delete cascade,
    expira_em timestamptz not null
  )`,
  `create table if not exists placar.tokens (
    hash text primary key,
    usuario_id integer not null references placar.usuarios on delete cascade,
    tipo text not null,
    expira_em timestamptz not null,
    usado_em timestamptz
  )`,
  `create table if not exists placar.clientes (
    id serial primary key,
    agencia_id integer not null references placar.agencias on delete cascade,
    nome text not null,
    slug text not null,
    token text unique not null,
    tipo text not null default 'leads' check (tipo in ('leads', 'ecommerce')),
    idioma text not null default 'pt',
    moeda text not null default 'BRL',
    pais text not null default 'BR',
    meta_conta text,
    meta_cpl numeric,
    meta_leads integer,
    meta_investimento numeric,
    whatsapp text,
    sincronizado_em timestamptz,
    erro_meta text,
    conta_checada_em timestamptz,
    conta_alerta text,
    alertas_cliente boolean not null default false,
    rel_ativo boolean not null default false,
    rel_frequencia text not null default 'semanal',
    rel_dia_semana integer not null default 1,
    rel_dia_mes integer not null default 1,
    rel_hora integer not null default 9,
    rel_fuso text not null default 'America/Sao_Paulo',
    rel_ia boolean not null default true,
    rel_metricas text[],
    rel_abertura text,
    rel_fechamento text,
    rel_instrucao text,
    rel_destaque boolean not null default true,
    rel_link boolean not null default true,
    rel_ultimo_em timestamptz,
    criado_em timestamptz not null default now(),
    unique (agencia_id, slug)
  )`,
  `create table if not exists placar.metricas (
    cliente_id integer not null references placar.clientes on delete cascade,
    data date not null,
    campanha text not null default '',
    gasto numeric not null default 0,
    impressoes bigint not null default 0,
    cliques bigint not null default 0,
    leads integer not null default 0,
    conversoes integer not null default 0,
    receita numeric not null default 0,
    primary key (cliente_id, data, campanha)
  )`,
  `create table if not exists placar.envios (
    id serial primary key,
    cliente_id integer not null references placar.clientes on delete cascade,
    tipo text not null,
    chave text not null,
    destino text not null,
    texto text not null,
    ok boolean,
    erro text,
    criado_em timestamptz not null default now(),
    unique (cliente_id, chave)
  )`,
  `create table if not exists placar.pagamentos (
    evento_id text primary key,
    agencia_id integer references placar.agencias on delete set null,
    evento text not null,
    pagamento_id text,
    valor numeric,
    status text,
    vencimento date,
    link text,
    criado_em timestamptz not null default now()
  )`,
  `create table if not exists placar.ajustes (chave text primary key, valor text not null, atualizado_em timestamptz not null default now())`,
];

const global = globalThis as unknown as { esquemaPlacar?: Promise<void> };

async function garantir() {
  global.esquemaPlacar ??= (async () => {
    for (const comando of ESQUEMA) await consultaPainel(comando);
  })().catch((erro) => {
    global.esquemaPlacar = undefined;
    throw erro;
  });
  return global.esquemaPlacar;
}

/** Consulta com parâmetros ($1, $2…), sempre nas tabelas "placar.*". */
export async function q<T extends QueryResultRow = QueryResultRow>(texto: string, valores: unknown[] = []) {
  await garantir();
  return consultaPainel<T>(texto, valores);
}

export async function uma<T extends QueryResultRow = QueryResultRow>(texto: string, valores: unknown[] = []) {
  return (await q<T>(texto, valores))[0] ?? null;
}

// ---------- Tipos ----------

export type Agencia = {
  id: number;
  nome: string;
  cor: string;
  logo: string | null;
  plano: string;
  status: "teste" | "ativa" | "atrasada" | "cancelada";
  teste_ate: string;
  pago_ate: string | null;
  documento: string | null;
  telefone: string | null;
  asaas_cliente: string | null;
  asaas_assinatura: string | null;
  alertas_numeros: string | null;
  meta_token: string | null;
  meta_expira_em: string | null;
  meta_pessoa: string | null;
  wa_numero: string | null;
  criado_em: string;
};

export type Usuario = { id: number; agencia_id: number; email: string; nome: string | null };

export type Cliente = {
  id: number;
  agencia_id: number;
  nome: string;
  slug: string;
  token: string;
  tipo: "leads" | "ecommerce";
  idioma: "pt" | "en" | "es";
  moeda: string;
  pais: string;
  meta_conta: string | null;
  meta_cpl: number | null;
  meta_leads: number | null;
  meta_investimento: number | null;
  whatsapp: string | null;
  sincronizado_em: string | null;
  erro_meta: string | null;
  conta_checada_em: string | null;
  conta_alerta: string | null;
  alertas_cliente: boolean;
  rel_ativo: boolean;
  rel_frequencia: "diario" | "semanal" | "mensal";
  rel_dia_semana: number;
  rel_dia_mes: number;
  rel_hora: number;
  rel_fuso: string;
  rel_ia: boolean;
  rel_metricas: string[] | null;
  rel_abertura: string | null;
  rel_fechamento: string | null;
  rel_instrucao: string | null;
  rel_destaque: boolean;
  rel_link: boolean;
  rel_ultimo_em: string | null;
  criado_em: string;
};
