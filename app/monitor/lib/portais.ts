// Fontes próprias dos portais de concurso — sem passar pelo Google.
//
// POR QUE EXISTE, SE JÁ HÁ BUSCA `site:` NO GOOGLE NOTÍCIAS. Porque `site:` só
// alcança o que o Google indexou como notícia, quando indexou. O blog do Gran
// Cursos publica dezenas de posts por dia e boa parte nunca entra no Google
// Notícias; o MedConcursos, que é o site do Método Legista, é pequeno demais
// para o radar de notícias do Google e é justamente o mais certeiro deste
// nicho — publica sobre médico-legista e nada mais. Lendo o feed da casa, a
// gente vê o que o veículo publicou, no minuto em que publicou, sem depender
// do critério de terceiro.
//
// AS TRÊS FONTES, E O FORMATO DE CADA UMA:
//
//   • Gran Cursos — WordPress. Em vez do feed inteiro (trinta posts, quase
//     todos de outras carreiras), três feeds de BUSCA, um por termo do nosso
//     assunto. O WordPress serve `?s=termo&feed=rss2` e devolve só o que casa,
//     o que troca 1 MB de ruído por três listas curtas e certeiras.
//
//   • MedConcursos (Método Legista) — WordPress também, mas aqui o feed
//     inteiro é o certo: o site todo é sobre concurso médico, e a busca por
//     termo devolveu vazio (o tema é o site, não uma palavra dentro dele).
//
//   • QConcursos / Folha Dirigida — não tem RSS. Tem sitemap de notícias do
//     Google (`daily_sitemap.xml.gz`), que é XML com título, link e data de
//     tudo publicado no dia. Serve ao mesmo propósito, comprimido. Uma fonte,
//     dois portais: o QConcursos comprou a Folha Dirigida e as duas redações
//     publicam ali.
//
// SEM RESUMO NO SITEMAP. O sitemap traz título e data, sem resumo — quem
// preenche essa lacuna é a leitura da própria matéria (ver materiaDeOrigem.ts),
// na hora de abrir a pauta.

import { extrairTag, limparTexto, parseRSS, type ItemRSS } from "./rss";

const TIMEOUT_MS = 12_000;

/** Teto do que a gente aceita baixar de um portal, por feed. */
const TAMANHO_MAXIMO = 8_000_000;

/**
 * Os termos que valem busca no blog de portal generalista.
 *
 * Três, e não dez: cada termo é uma requisição por rodada, e estes três são os
 * que aparecem nos títulos de verdade. "Legista" pega "médico legista" e
 * "perito legista"; os outros dois pegam o edital que engloba o cargo sem
 * nomeá-lo — que é como a notícia costuma sair primeiro.
 */
const TERMOS = ["legista", "polícia científica", "medicina legal"];

export interface FeedPortal {
  /** Nome do veículo, como vai no crédito do post. */
  nome: string;
  url: string;
  formato: "rss" | "sitemap-noticias";
}

/** Busca do WordPress em formato de feed. */
function buscaWordpress(base: string, termo: string): string {
  return `${base}/?s=${encodeURIComponent(termo)}&feed=rss2`;
}

/** Todos os feeds próprios, já montados. */
export function feedsDosPortais(): FeedPortal[] {
  const feeds: FeedPortal[] = [];

  for (const termo of TERMOS) {
    feeds.push({
      nome: "Gran Cursos",
      url: buscaWordpress("https://blog.grancursosonline.com.br", termo),
      formato: "rss",
    });
  }

  feeds.push({
    nome: "MedConcursos (Método Legista)",
    url: "https://medconcursos.com.br/feed/",
    formato: "rss",
  });

  feeds.push({
    nome: "QConcursos / Folha Dirigida",
    url: "https://folha.qconcursos.com/daily_sitemap.xml.gz",
    formato: "sitemap-noticias",
  });

  return feeds;
}

/**
 * Baixa o feed, descomprimindo quando vem em gzip.
 *
 * O `fetch` descomprime sozinho o que o servidor marca como `Content-Encoding`,
 * e não é o caso aqui: o arquivo do QConcursos É um .gz, servido como
 * `application/x-gzip`. Para a rede é um arquivo binário comum, e quem tem de
 * abrir é a gente. `DecompressionStream` faz isso na própria plataforma, sem
 * dependência nova.
 */
async function baixar(feed: FeedPortal, semCache: boolean): Promise<string | null> {
  try {
    const resp = await fetch(feed.url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        accept: "application/rss+xml, application/xml, text/xml, */*",
        // Identificar o robô é mais honesto que fingir ser navegador — e quem
        // não quiser ser lido pode bloquear por aqui.
        "user-agent": "ClubeForenseBot/1.0 (+https://clubeforense.com.br)",
      },
      redirect: "follow",
      // Mesma regra dos outros feeds: uma hora de cache, furada pela coleta
      // manual do painel e pelo cron, que existem para ver o que acabou de sair.
      ...(semCache ? { cache: "no-store" as const } : { next: { revalidate: 3600 } }),
    });
    if (!resp.ok) return null;

    const tamanho = Number(resp.headers.get("content-length") ?? 0);
    if (tamanho > TAMANHO_MAXIMO) return null;

    const comprimido =
      feed.url.endsWith(".gz") ||
      (resp.headers.get("content-type") ?? "").includes("gzip");

    if (!comprimido) return await resp.text();
    if (!resp.body) return null;

    const aberto = resp.body.pipeThrough(new DecompressionStream("gzip"));
    return await new Response(aberto).text();
  } catch {
    // Portal fora do ar, prazo estourado, gzip corrompido: a coleta continua
    // com as outras fontes. Fonte que falha hoje volta na próxima hora.
    return null;
  }
}

/**
 * Lê um sitemap de notícias do Google e devolve os itens.
 *
 * O formato é `<url>` com `<loc>`, e dentro de `<news:news>` o título e a data
 * de publicação. Os `<url>` sem bloco de notícia são as páginas de seção do
 * portal ("Concursos Nordeste", "Concursos abertos"), que não são matéria e
 * ficam de fora — sem isso, a listagem de seção viraria pauta todo dia, já que
 * a data dela muda sozinha.
 */
export function parseSitemapNoticias(xml: string, fonte: string): ItemRSS[] {
  const itens: ItemRSS[] = [];

  for (const parte of xml.split(/<url>/i).slice(1)) {
    const fim = parte.search(/<\/url>/i);
    if (fim === -1) continue;
    const bloco = parte.slice(0, fim);

    const tituloBruto = extrairTag(bloco, "news:title");
    if (!tituloBruto) continue;
    const titulo = limparTexto(tituloBruto);
    if (!titulo) continue;

    const link = limparTexto(extrairTag(bloco, "loc") ?? "");
    if (!link.startsWith("http")) continue;

    let data: string | null = null;
    const dataBruta = extrairTag(bloco, "news:publication_date");
    if (dataBruta) {
      const d = new Date(limparTexto(dataBruta));
      if (!Number.isNaN(d.getTime())) data = d.toISOString();
    }

    itens.push({ titulo, link, data, fonte, resumo: "" });
  }

  return itens;
}

/**
 * Lê todos os feeds próprios e devolve os itens, já com o crédito do veículo.
 *
 * Nunca lança: o que falhar sai da lista. A `fonte` é sobrescrita com o nome
 * do portal porque o feed do WordPress não traz `<source>` — sem isto, o post
 * creditaria "Google Notícias" uma matéria que não veio de lá.
 */
export async function lerPortais(semCache = false): Promise<ItemRSS[]> {
  const feeds = feedsDosPortais();
  const textos = await Promise.all(feeds.map((f) => baixar(f, semCache)));

  const itens: ItemRSS[] = [];
  for (const [i, texto] of textos.entries()) {
    if (!texto) continue;
    const feed = feeds[i];
    const lidos =
      feed.formato === "sitemap-noticias"
        ? parseSitemapNoticias(texto, feed.nome)
        : parseRSS(texto).map((item) => ({ ...item, fonte: feed.nome }));
    itens.push(...lidos);
  }

  return itens;
}
