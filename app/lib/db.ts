// Conexão com o Postgres (Neon) e criação das tabelas.
//
// O banco é criado pela integração da Vercel, que injeta DATABASE_URL no
// projeto. Nada aqui precisa ser cadastrado à mão — foi o que motivou escolher
// esse caminho, depois de uma variável de ambiente se perder três vezes entre
// dois projetos.
//
// O driver é o @neondatabase/serverless: cada requisição numa função serverless
// é um processo novo, então um pool de conexões tradicional não se sustenta
// entre elas. Este conversa por HTTP e não deixa conexão pendurada.

import { neon } from "@neondatabase/serverless";

export type Sql = ReturnType<typeof neon>;

/** True quando o banco está configurado. Sem ele o site cai no piso embutido. */
export function bancoConfigurado(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let cliente: Sql | null = null;

/** Conexão reaproveitada dentro do mesmo processo. */
export function sql(): Sql {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada");
  }
  cliente ??= neon(process.env.DATABASE_URL);
  return cliente;
}

/**
 * SQL de criação das tabelas, um comando por item. Exportado como texto para
 * poder ser testado contra um Postgres de verdade, sem depender do driver da
 * Neon — e em lista, e não num texto só, porque o driver HTTP manda um comando
 * por chamada e um `split(";")` cortaria os blocos `do $$ ... $$` no meio.
 *
 * Todo comando é idempotente: rodar de novo é inofensivo, então a inicialização
 * pode acontecer a cada boot sem migração manual.
 */
export const ESQUEMA: string[] = [
  `
create table if not exists estados (
  uf                          text primary key,
  etapa                       text not null default 'sem',
  andamento                   text not null default '',
  previsao                    text,
  vagas_imediatas             integer,
  vagas_cr                    integer,
  salario_inicial             numeric(12,2),
  carga_horaria               integer,
  especialidades              text,
  banca                       text,
  inscricoes_ate              date,
  data_prova                  date,
  ultimo_edital               date,
  ultima_prova                date,
  banca_anterior              text,
  validade_certame_anterior   date,
  confianca                   text not null default 'media',
  fonte_url                   text,
  verificado_em               date,
  travado                     boolean not null default false,
  observacao                  text,

  -- Notícia principal escolhida à mão no painel. Guardada como texto, e não
  -- como referência à menção coletada, porque a menção some da janela de 2 anos
  -- e a escolha editorial não pode sumir junto.
  noticia_titulo              text,
  noticia_resumo              text,
  noticia_fonte               text,
  noticia_link                text,

  atualizado_em               timestamptz not null default now()
);
`,

  // Restringe o que pode entrar em etapa e confianca: o painel usa lista
  // suspensa, mas a importação da planilha e o SQL direto não passam por ela.
  //
  // Só adiciona se faltar. A versão antiga fazia `drop ... add` a cada chamada,
  // e como isto roda em toda requisição, duas ao mesmo tempo colidiam ("já
  // existe") — o erro derrubava a leitura e o site caía no piso embutido. Pior:
  // entre o drop e o add a coluna ficava sem validação nenhuma.
  `
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'estados_etapa_valida') then
    alter table estados add constraint estados_etapa_valida
      check (etapa in ('estudo','solicitado','autorizado','comissao','banca','edital','noticia','sem'));
  end if;
end $$;
`,
  `
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'estados_confianca_valida') then
    alter table estados add constraint estados_confianca_valida
      check (confianca in ('alta','media','baixa'));
  end if;
end $$;
`,

  `
-- Quem se cadastrou pelo muro do mapa.
--
-- O cadastro em si vai para a plataforma de alunos, que é a fonte da verdade
-- das contas. Isto aqui é a cópia do Clube: sem ela, não há como saber quantas
-- pessoas o mapa converteu nem de quais estados elas vieram.
--
-- A chave é o e-mail, e não um id sequencial: a mesma pessoa voltando de outro
-- navegador não deve virar dois leads. A coluna vezes registra o retorno, que
-- por si só é sinal de interesse.
create table if not exists leads (
  email          text primary key,
  nome           text not null,
  celular        text,
  -- Estado que a pessoa tentou abrir quando o cadastro apareceu. É o dado mais
  -- valioso da tabela: mostra a demanda por UF antes de qualquer edital.
  uf_interesse   text,
  vezes          integer not null default 1,
  criado_em      timestamptz not null default now(),
  visto_em       timestamptz not null default now()
);
`,

  "create index if not exists leads_criado_em_idx on leads (criado_em desc);",
  "create index if not exists leads_uf_idx on leads (uf_interesse);",

  // Imagem do estado, mostrada no lugar da sigla quando existe. Coluna nova numa
  // tabela que já está em produção, por isso `if not exists`.
  "alter table estados add column if not exists imagem_url text;",

  // Alunos aprovados do Clube.
  //
  // Vira tabela porque agora tem foto e é editado no painel; a lista antiga
  // ficava dentro do código, e trocar uma colocação exigia publicar o site.
  // O código continua sendo o piso: se esta tabela estiver vazia, o site mostra
  // a lista embutida, do mesmo jeito que faz com a curadoria.
  `
create table if not exists aprovados (
  id          bigint generated always as identity primary key,
  uf          text not null,
  nome        text not null,
  -- "1º Lugar do Clube Forense", quando houver.
  titulo      text,
  -- Órgão/concurso, para os casos em que o aprovado não é do concurso da UF —
  -- é o que hoje distingue a Polícia Federal, hospedada no DF.
  orgao       text,
  ano         integer,
  foto_url    text,
  -- Menor primeiro: é a ordem em que aparecem no card do estado.
  ordem       integer not null default 0,
  criado_em   timestamptz not null default now()
);
`,
  "create index if not exists aprovados_uf_idx on aprovados (uf, ordem, id);",

  // Cabeçalho do plano de cargos e carreiras do estado: de quem é, de quando, e
  // de onde saiu. As classes ficam na tabela abaixo.
  "alter table estados add column if not exists plano_orgao text;",
  "alter table estados add column if not exists plano_ano integer;",
  "alter table estados add column if not exists plano_fonte text;",

  // Uma linha por classe da carreira (7ª, 6ª, … 1ª, Especial).
  //
  // `subsidio` é numeric, e não float: dinheiro em ponto flutuante acumula
  // erro de arredondamento, e aqui são valores que a pessoa compara com o
  // contracheque.
  `
create table if not exists plano_classes (
  id         bigint generated always as identity primary key,
  uf         text not null,
  classe     text not null,
  subsidio   numeric(12,2),
  -- Menor primeiro. A carreira começa na última classe e sobe até a especial,
  -- então a ordem de exibição não sai do nome.
  ordem      integer not null default 0
);
`,
  "create index if not exists plano_classes_uf_idx on plano_classes (uf, ordem, id);",

  // Quantos IMLs o estado tem no total. Fica separado da lista de cidades
  // porque uma coisa não implica a outra: dá para saber que são 20 unidades e
  // conhecer o endereço de 8. Vazio aqui significa "conte as cidades".
  "alter table estados add column if not exists imls_total integer;",

  // Onde ficam os IMLs. É o que responde "se eu passar, onde posso ser lotado".
  `
create table if not exists imls (
  id       bigint generated always as identity primary key,
  uf       text not null,
  cidade   text not null,
  -- Nome da unidade, quando ela tem um ("IML Central", "Posto Regional").
  nome     text,
  ordem    integer not null default 0
);
`,
  "create index if not exists imls_uf_idx on imls (uf, ordem, id);",

  // Marcos do sistema, em chave/valor. Hoje guarda só quando a coleta de
  // notícias rodou pela última vez; é um lugar para esse tipo de registro não
  // virar uma tabela nova a cada necessidade.
  `
create table if not exists sistema (
  chave         text primary key,
  valor         text not null,
  atualizado_em timestamptz not null default now()
);
`,
];

/** Promessa da preparação em curso — o esquema só é criado uma vez por processo. */
let preparando: Promise<void> | null = null;

/**
 * Cria as tabelas se ainda não existirem. Seguro de chamar várias vezes.
 *
 * O resultado fica guardado: sem isso, cada leitura da página pagava uma ida ao
 * banco por comando do esquema só para ouvir "já existe".
 */
export async function garantirEsquema(): Promise<void> {
  preparando ??= (async () => {
    const s = sql();
    try {
      // O driver HTTP não aceita várias instruções num comando só.
      for (const comando of ESQUEMA) await s.query(comando);
    } catch (e) {
      // Se falhou, a próxima chamada tenta de novo: guardar a falha deixaria o
      // processo inteiro sem banco até ser reciclado.
      preparando = null;
      throw e;
    }
  })();
  return preparando;
}
