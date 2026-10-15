// Leitura e gravação dos posts do blog.
//
// Mesma regra dos outros repositórios daqui: toda leitura devolve vazio em caso
// de falha, nunca lança. O blog sem banco mostra uma lista vazia e uma linha
// dizendo que está fora do ar; não derruba o site inteiro, que é o que
// aconteceria se a home do blog estourasse uma exceção.

import { bancoConfigurado, garantirEsquema, sql } from "./db";

export type StatusPost = "rascunho" | "revisao" | "publicado";
export type OrigemPost = "manual" | "robo";

export interface Post {
  id: number;
  slug: string;
  titulo: string;
  resumo: string;
  corpo: string;
  capaUrl: string | null;
  capaCredito: string | null;
  /** `null` é nacional, e não "faltou preencher". */
  uf: string | null;
  orgao: string | null;
  categoria: string;
  origem: OrigemPost;
  fonteNome: string | null;
  fonteUrl: string | null;
  status: StatusPost;
  publicadoEm: string | null;
  criadoEm: string | null;
  atualizadoEm: string | null;
}

/** O que a lista precisa. Sem o corpo, que é o campo pesado. */
export type PostResumido = Omit<Post, "corpo">;

function texto(v: unknown): string | null {
  return v == null ? null : String(v);
}

function daLinha(l: Record<string, unknown>): Post {
  return {
    id: Number(l.id),
    slug: String(l.slug),
    titulo: String(l.titulo),
    resumo: String(l.resumo ?? ""),
    corpo: String(l.corpo ?? ""),
    capaUrl: texto(l.capa_url),
    capaCredito: texto(l.capa_credito),
    uf: texto(l.uf),
    orgao: texto(l.orgao),
    categoria: String(l.categoria ?? "noticia"),
    origem: (texto(l.origem) ?? "manual") as OrigemPost,
    fonteNome: texto(l.fonte_nome),
    fonteUrl: texto(l.fonte_url),
    status: (texto(l.status) ?? "rascunho") as StatusPost,
    publicadoEm: texto(l.publicado_em),
    criadoEm: texto(l.criado_em),
    atualizadoEm: texto(l.atualizado_em),
  };
}

const CAMPOS_LISTA =
  "id, slug, titulo, resumo, capa_url, capa_credito, uf, orgao, categoria, " +
  "origem, fonte_nome, fonte_url, status, publicado_em, criado_em, atualizado_em";

export interface Filtro {
  uf?: string | null;
  orgao?: string | null;
  categoria?: string | null;
  /** Texto procurado no título e no resumo. */
  busca?: string | null;
  limite?: number;
  deslocamento?: number;
}

/** O que a lista devolve: a página pedida e o total, para a paginação saber o fim. */
export interface Pagina {
  posts: PostResumido[];
  total: number;
}

/**
 * Posts publicados, mais novo primeiro.
 *
 * Os filtros entram como parâmetros, nunca interpolados: `uf` e `categoria`
 * chegam da query string, e concatenar isso no SQL seria abrir a porta para
 * quem souber escrever `'; drop table`.
 *
 * O `$N` é montado em sequência porque o driver HTTP numera por posição — daí
 * o contador, em vez de índices fixos que se desencontram quando um filtro não
 * vem.
 */
export async function listarPublicados(f: Filtro = {}): Promise<Pagina> {
  if (!bancoConfigurado()) return { posts: [], total: 0 };

  const onde: string[] = ["status = 'publicado'", "publicado_em <= now()"];
  const valores: unknown[] = [];
  const marcador = () => `$${valores.length + 1}`;

  if (f.uf) {
    onde.push(`uf = ${marcador()}`);
    valores.push(f.uf.toUpperCase());
  }
  if (f.orgao) {
    onde.push(`orgao = ${marcador()}`);
    valores.push(f.orgao);
  }
  if (f.categoria) {
    onde.push(`categoria = ${marcador()}`);
    valores.push(f.categoria);
  }
  if (f.busca?.trim()) {
    // ILIKE em título e resumo. Não é busca de verdade — não acha "legista"
    // escrito "legístas" nem ordena por relevância —, mas resolve o caso que
    // existe hoje, que é alguém procurando o nome de um estado ou de uma banca.
    //
    // O valor entra PRIMEIRO e o marcador é lido depois, uma vez só, usado nas
    // duas colunas. Chamar `marcador()` duas vezes antes de empilhar devolvia o
    // mesmo número nas duas (o contador ainda não tinha andado) e ainda assim
    // mandava dois valores — o Postgres recusava a consulta inteira por contagem
    // de parâmetros, e a busca não devolvia nada, nunca.
    valores.push(`%${f.busca.trim()}%`);
    const alvo = `$${valores.length}`;
    onde.push(`(titulo ilike ${alvo} or resumo ilike ${alvo})`);
  }

  const filtro = onde.join(" and ");
  const limite = Math.min(Math.max(f.limite ?? 12, 1), 50);
  const deslocamento = Math.max(f.deslocamento ?? 0, 0);

  try {
    await garantirEsquema();
    const s = sql();
    const [lista, conta] = await Promise.all([
      s.query(
        `select ${CAMPOS_LISTA} from posts where ${filtro}
         order by publicado_em desc, id desc
         limit ${limite} offset ${deslocamento}`,
        valores,
      ),
      s.query(`select count(*)::int as total from posts where ${filtro}`, valores),
    ]);
    return {
      posts: (lista as Record<string, unknown>[]).map(daLinha),
      total: Number((conta as Record<string, unknown>[])[0]?.total ?? 0),
    };
  } catch (e) {
    console.error("Falha ao listar posts:", e);
    return { posts: [], total: 0 };
  }
}

/** Um post publicado, pelo slug. `null` quando não existe ou não está no ar. */
export async function lerPublicado(slug: string): Promise<Post | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select * from posts where slug = $1 and status = 'publicado' and publicado_em <= now()",
      [slug],
    )) as Record<string, unknown>[];
    return linhas[0] ? daLinha(linhas[0]) : null;
  } catch (e) {
    console.error("Falha ao ler post:", e);
    return null;
  }
}

/**
 * Posts parecidos com este, para o rodapé da leitura.
 *
 * A ordem da preferência é a mesma que a pessoa teria: primeiro o mesmo órgão,
 * depois o mesmo estado, depois a mesma categoria. Sem isso a sugestão vira
 * "os mais recentes", que é o que ela já viu na home.
 */
export async function lerRelacionados(post: Post, quantos = 3): Promise<PostResumido[]> {
  if (!bancoConfigurado()) return [];
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select ${CAMPOS_LISTA},
              case when orgao is not distinct from $2 then 0
                   when uf is not distinct from $3 then 1
                   when categoria = $4 then 2
                   else 3 end as proximidade
       from posts
       where status = 'publicado' and publicado_em <= now() and id <> $1
       order by proximidade, publicado_em desc
       limit ${Math.min(Math.max(quantos, 1), 6)}`,
      [post.id, post.orgao, post.uf, post.categoria],
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao ler relacionados:", e);
    return [];
  }
}

/** Todos os slugs publicados — para o sitemap e o feed. */
export async function listarSlugsPublicados(): Promise<{ slug: string; em: string | null }[]> {
  if (!bancoConfigurado()) return [];
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select slug, publicado_em from posts where status = 'publicado' and publicado_em <= now() order by publicado_em desc limit 1000",
    )) as Record<string, unknown>[];
    return linhas.map((l) => ({ slug: String(l.slug), em: texto(l.publicado_em) }));
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ painel */

/** Tudo, de qualquer status. Só o painel chama. */
export async function listarTodos(status?: StatusPost): Promise<PostResumido[]> {
  if (!bancoConfigurado()) return [];
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      status
        ? `select ${CAMPOS_LISTA} from posts where status = $1 order by coalesce(publicado_em, criado_em) desc limit 300`
        : `select ${CAMPOS_LISTA} from posts order by coalesce(publicado_em, criado_em) desc limit 300`,
      status ? [status] : [],
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao listar posts do painel:", e);
    return [];
  }
}

/** Quantos esperam revisão. É o número do aviso no topo do painel. */
export async function contarEmRevisao(): Promise<number> {
  if (!bancoConfigurado()) return 0;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select count(*)::int as total from posts where status = 'revisao'",
    )) as Record<string, unknown>[];
    return Number(linhas[0]?.total ?? 0);
  } catch {
    return 0;
  }
}

export async function lerPorId(id: number): Promise<Post | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query("select * from posts where id = $1", [id])) as Record<
      string,
      unknown
    >[];
    return linhas[0] ? daLinha(linhas[0]) : null;
  } catch (e) {
    console.error("Falha ao ler post por id:", e);
    return null;
  }
}

export interface PostParaGravar {
  id?: number | null;
  slug: string;
  titulo: string;
  resumo: string;
  corpo: string;
  capaUrl: string | null;
  capaCredito: string | null;
  uf: string | null;
  orgao: string | null;
  categoria: string;
  origem: OrigemPost;
  fonteNome: string | null;
  fonteUrl: string | null;
  status: StatusPost;
  /** ISO. Quando vazio e o status é publicado, vale agora. */
  publicadoEm: string | null;
}

/**
 * Grava e devolve o id.
 *
 * `publicado_em` é decidido aqui, e não no formulário: um post publicado sem
 * data sai da listagem (a consulta exige `publicado_em <= now()`), e esse é o
 * tipo de buraco que só aparece depois, quando alguém pergunta por que o post
 * aprovado não está no ar.
 */
export async function gravarPost(p: PostParaGravar): Promise<number | null> {
  if (!bancoConfigurado()) return null;
  await garantirEsquema();

  const em = p.status === "publicado" ? (p.publicadoEm?.trim() || new Date().toISOString()) : p.publicadoEm?.trim() || null;

  const valores = [
    p.slug, p.titulo, p.resumo, p.corpo, p.capaUrl, p.capaCredito,
    p.uf ? p.uf.toUpperCase() : null, p.orgao, p.categoria,
    p.origem, p.fonteNome, p.fonteUrl, p.status, em,
  ];

  if (p.id) {
    const linhas = (await sql().query(
      `update posts set slug=$1, titulo=$2, resumo=$3, corpo=$4, capa_url=$5,
         capa_credito=$6, uf=$7, orgao=$8, categoria=$9, origem=$10,
         fonte_nome=$11, fonte_url=$12, status=$13, publicado_em=$14,
         atualizado_em = now()
       where id = $15 returning id`,
      [...valores, p.id],
    )) as Record<string, unknown>[];
    return linhas[0] ? Number(linhas[0].id) : null;
  }

  const linhas = (await sql().query(
    `insert into posts (slug, titulo, resumo, corpo, capa_url, capa_credito, uf,
       orgao, categoria, origem, fonte_nome, fonte_url, status, publicado_em)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning id`,
    valores,
  )) as Record<string, unknown>[];
  return linhas[0] ? Number(linhas[0].id) : null;
}

export async function apagarPost(id: number): Promise<void> {
  if (!bancoConfigurado()) return;
  await garantirEsquema();
  await sql().query("delete from posts where id = $1", [id]);
}

/** True quando o slug já é de outro post. O painel usa para avisar antes de gravar. */
export async function slugOcupado(slug: string, exceto?: number | null): Promise<boolean> {
  if (!bancoConfigurado()) return false;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      "select id from posts where slug = $1 and ($2::bigint is null or id <> $2) limit 1",
      [slug, exceto ?? null],
    )) as Record<string, unknown>[];
    return linhas.length > 0;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------- robô */

/**
 * Abre um rascunho vindo da coleta, se aquela fonte ainda não virou post.
 *
 * Devolve `true` quando criou. O índice único em `fonte_url` é quem garante a
 * unicidade de verdade — a checagem antes é só para não gastar um insert que já
 * se sabe que vai bater. Entre a checagem e o insert cabe outra execução da
 * coleta, e é o banco que decide quem chegou primeiro.
 */
export async function abrirRascunhoDoRobo(p: PostParaGravar): Promise<boolean> {
  if (!bancoConfigurado()) return false;
  await garantirEsquema();
  try {
    const linhas = (await sql().query(
      // O status é fixo em 'revisao' — nada que o robô traga vai ao ar sem
      // alguém aprovar, e deixar isso como parâmetro seria deixar a regra
      // depender de quem chama. A data, não: a importação do blog antigo traz
      // a data original de publicação, e perdê-la colocaria um post de 2024 no
      // topo da listagem no dia em que fosse aprovado. Como o status é que
      // decide o que aparece, data preenchida em rascunho não vaza nada.
      `insert into posts (slug, titulo, resumo, corpo, capa_url, capa_credito, uf,
         orgao, categoria, origem, fonte_nome, fonte_url, status, publicado_em)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'robo',$10,$11,'revisao',$12)
       on conflict do nothing returning id`,
      [
        p.slug, p.titulo, p.resumo, p.corpo, p.capaUrl, p.capaCredito,
        p.uf ? p.uf.toUpperCase() : null, p.orgao, p.categoria,
        p.fonteNome, p.fonteUrl, p.publicadoEm?.trim() || null,
      ],
    )) as Record<string, unknown>[];
    return linhas.length > 0;
  } catch (e) {
    // Sem alvo, o `on conflict do nothing` cobre tanto a fonte repetida quanto
    // o slug repetido, então o que chega aqui é falha de verdade — banco fora
    // do ar, coluna faltando. Devolve false e segue: a coleta não pode parar
    // por causa de um rascunho, e a próxima passada tenta de novo.
    console.error("Falha ao abrir rascunho do robô:", e);
    return false;
  }
}

/**
 * Preenche o corpo dos posts importados do blog antigo.
 *
 * Só mexe em quem ainda está intocado: origem 'robo', em revisão, e com o
 * aviso de texto faltando ainda no corpo. Essa última condição é a que importa
 * — ela garante que rodar isto de novo nunca sobrescreve o que alguém reescreveu
 * no painel. Quem editou e tirou o aviso saiu do alcance desta função para
 * sempre, que é o comportamento certo: o texto do código é um piso, não uma
 * verdade que se reimpõe.
 */
export async function preencherTextosImportados(
  textos: Record<string, { resumo: string; corpo: string }>,
): Promise<number> {
  if (!bancoConfigurado()) return 0;
  await garantirEsquema();

  let preenchidos = 0;
  for (const [fonte, texto] of Object.entries(textos)) {
    try {
      const linhas = (await sql().query(
        `update posts set corpo = $1, resumo = $2, atualizado_em = now()
         where fonte_url = $3 and origem = 'robo' and status = 'revisao'
           and corpo like '%TEXTO INCOMPLETO%'
         returning id`,
        [texto.corpo, texto.resumo, fonte],
      )) as Record<string, unknown>[];
      preenchidos += linhas.length;
    } catch (e) {
      // Um texto que falha não pode levar os outros junto.
      console.error("Falha ao preencher texto importado:", e);
    }
  }
  return preenchidos;
}
