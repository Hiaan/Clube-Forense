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

  // Texto livre sobre a distribuição — o que a lista de cidades não conta:
  // regionais, plantões, para onde os aprovados costumam ser lotados.
  "alter table estados add column if not exists imls_texto text;",

  // De onde saiu a distribuição dos IMLs: órgão, documento e data, por extenso.
  // Mesma regra do plano de carreira — número sem procedência é boato, e a tela
  // mostra a fonte junto da lista.
  "alter table estados add column if not exists imls_fonte text;",

  // Link do edital. Um campo só para os dois casos: enquanto não sai, aponta
  // para o último edital; quando sai, para o novo. O rótulo no site muda com o
  // estágio, então não faz falta uma segunda coluna dizendo qual dos dois é.
  "alter table estados add column if not exists edital_url text;",

  // Vendas dos infoprodutos, espelhadas da Eduzz.
  //
  // A Eduzz é a fonte da verdade — isto é cópia, para o painel ter faturamento
  // sem depender de a API dela responder no momento em que a página abre, e
  // para conseguir olhar série histórica, que a tela deles não dá de graça.
  //
  // A chave é o id da fatura na Eduzz, não um id nosso: a mesma venda chega
  // duas vezes por caminhos diferentes (o webhook avisa na hora, a sincronização
  // diária varre o período de novo) e as duas precisam cair na mesma linha.
  `
create table if not exists vendas (
  id             bigint primary key,
  produto_id     bigint,
  produto        text,
  cliente_nome   text,
  cliente_email  text,
  -- Código numérico da Eduzz e o nome que ela mesma deu. Guardamos os dois
  -- porque o código é estável para agrupar e o nome é o que o humano reconhece
  -- na tela; traduzir código para texto aqui seria inventar um dicionário que a
  -- Eduzz pode mudar sem avisar.
  status         integer not null default 0,
  status_nome    text not null default '',
  -- Se a venda conta como dinheiro entrando. Derivado do status na hora de
  -- gravar, e não na hora de ler, para o SQL dos relatórios não repetir a regra.
  paga           boolean not null default false,
  -- Líquido do produtor e o que o cliente pagou. numeric, nunca float: é
  -- dinheiro, e erro de arredondamento aqui vira divergência com o extrato.
  valor_liquido  numeric(12,2) not null default 0,
  valor_bruto    numeric(12,2),
  criada_em      timestamptz,
  paga_em        timestamptz,
  -- 'api' ou 'webhook'. O webhook manda menos campos que a API, então saber de
  -- onde a linha veio explica por que ela pode estar incompleta.
  fonte          text not null default 'api',
  -- Resposta crua. A Eduzz acrescenta campo sem avisar, e sem isto a única
  -- forma de recuperar um dado que não previmos seria varrer a API de novo.
  bruto          jsonb,
  atualizado_em  timestamptz not null default now()
);
`,
  "create index if not exists vendas_criada_em_idx on vendas (criada_em desc);",
  "create index if not exists vendas_paga_idx on vendas (paga, paga_em desc);",

  // Gasto com anúncios, um registro por campanha por dia.
  //
  // Existe para o faturamento da tabela acima poder ser dividido por alguma
  // coisa: venda sem custo não é resultado, é movimento. Fica por dia, e não
  // por mês, porque é o dia que permite refazer a conta em qualquer recorte —
  // o contrário não dá.
  //
  // A chave é (dia, campanha): o Meta corrige os números dos últimos dias
  // conforme atribui conversões, então a mesma linha é reescrita várias vezes
  // antes de assentar, e um id sequencial criaria uma cópia a cada correção.
  `
create table if not exists gastos_ads (
  dia          date not null,
  -- 'meta' hoje. A coluna existe para o dia em que houver Google ou TikTok:
  -- sem ela, a segunda plataforma exigiria uma tabela nova e um relatório novo.
  plataforma   text not null default 'meta',
  campanha_id  text not null,
  campanha     text,
  gasto        numeric(12,2) not null default 0,
  impressoes   bigint not null default 0,
  cliques      bigint not null default 0,
  atualizado_em timestamptz not null default now(),
  primary key (dia, plataforma, campanha_id)
);
`,
  "create index if not exists gastos_ads_dia_idx on gastos_ads (dia desc);",

  // ------------------------------------------------------------------------
  // Ranking de provas
  // ------------------------------------------------------------------------
  //
  // Quando a prova de um estado acontece, o candidato lança o próprio
  // cartão-resposta aqui e vê como foi diante de quem também lançou. São quatro
  // tabelas porque são quatro coisas de vidas diferentes: a prova (cadastrada
  // antes), as matérias (a estrutura do caderno), o gabarito (que costuma sair
  // dias depois) e as respostas (que chegam na mesma tarde).
  //
  // Separar o gabarito das respostas é o que permite o caso normal: a pessoa
  // lança as respostas no domingo, o gabarito sai na quarta, e a correção
  // acontece sem ninguém precisar voltar e digitar de novo.
  `
create table if not exists provas (
  id           bigint generated always as identity primary key,
  uf           text not null,
  titulo       text not null,
  data_prova   date,
  -- Como o caderno é respondido: 'abcde', 'abcd' ou 'ce' (certo/errado).
  estilo       text not null default 'abcde',
  -- Estilo Cebraspe: cada errada anula uma certa. Muda a nota, não o cartão.
  penalidade   boolean not null default false,
  -- Cadernos/tipos ("Tipo 1, Tipo 2" ou "Branco, Amarelo"), separados por
  -- vírgula. Vazio quando a prova é única — que é o caso mais comum.
  tipos        text not null default '',
  -- É esta coluna que faz o botão aparecer no mapa. Fica no controle do painel
  -- de propósito: só quem sabe que a prova está acontecendo deve abri-la.
  aberta       boolean not null default false,
  -- Vagas do edital e inscritos confirmados pela banca. Os dois juntos são o
  -- que permite estimar a nota de corte; sem eles, o ranking mostra só a
  -- distribuição de quem respondeu.
  vagas        integer,
  inscritos    integer,
  criada_em    timestamptz not null default now(),
  atualizada_em timestamptz not null default now()
);
`,
  "create index if not exists provas_uf_idx on provas (uf, id desc);",

  // A estrutura do caderno: cada matéria ocupa uma faixa de questões. É daqui
  // que sai o cartão-resposta na tela e a nota por matéria.
  `
create table if not exists prova_materias (
  id          bigint generated always as identity primary key,
  prova_id    bigint not null references provas(id) on delete cascade,
  nome        text not null,
  questao_de  integer not null,
  questao_ate integer not null,
  -- Peso da matéria na nota final. numeric, e não float: é o multiplicador de
  -- uma nota que decide vaga.
  peso        numeric(6,2) not null default 1,
  ordem       integer not null default 0
);
`,
  "create index if not exists prova_materias_idx on prova_materias (prova_id, ordem, id);",

  // O gabarito, uma linha por questão. `tipo` vazio quando a prova é única.
  // 'A'..'E' ou 'C'/'E'; '*' marca questão anulada, que conta certo para todos.
  `
create table if not exists prova_gabaritos (
  prova_id  bigint not null references provas(id) on delete cascade,
  tipo      text not null default '',
  questao   integer not null,
  correta   text not null,
  primary key (prova_id, tipo, questao)
);
`,

  // O cartão-resposta de cada pessoa.
  //
  // A chave é (prova, e-mail): a mesma pessoa corrigindo o que digitou não pode
  // virar dois lugares no ranking. `respostas` é jsonb ({"1":"A","2":"C"}) e não
  // uma linha por questão — são até duas centenas por cartão, sempre lidas
  // juntas, e nunca consultadas uma a uma.
  //
  // acertos/erros/nota ficam gravados em vez de calculados na leitura porque o
  // ranking ordena por eles: recalcular 300 cartões a cada abertura de página
  // seria pagar de novo, a cada visita, uma conta que só muda quando o gabarito
  // muda.
  `
create table if not exists prova_respostas (
  id            bigint generated always as identity primary key,
  prova_id      bigint not null references provas(id) on delete cascade,
  email         text not null,
  -- Como a pessoa quer ser chamada no ranking. Nunca o e-mail: o ranking é
  -- visto por outros candidatos.
  apelido       text not null,
  tipo          text not null default '',
  respostas     jsonb not null default '{}'::jsonb,
  acertos       integer,
  erros         integer,
  nota          numeric(8,2),
  corrigido_em  timestamptz,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (prova_id, email)
);
`,
  "create index if not exists prova_respostas_ranking_idx on prova_respostas (prova_id, nota desc nulls last, criado_em);",

  // Nota de corte do estado, mostrada no card do mapa.
  //
  // É independente do ranking: aqui vai o número oficial, o do concurso passado
  // ou o que a curadoria apurar. Só aparece com `nota_corte_visivel` marcado —
  // um número desses sem contexto vira boato, e o rótulo é o contexto.
  "alter table estados add column if not exists nota_corte numeric(8,2);",
  "alter table estados add column if not exists nota_corte_rotulo text;",
  "alter table estados add column if not exists nota_corte_visivel boolean not null default false;",

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
