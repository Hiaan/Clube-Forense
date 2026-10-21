// Feed RSS do blog.
//
// Fecha um ciclo que é quase piada: o monitor do Clube lê feed RSS dos portais
// para descobrir notícia de concurso. Publicar o nosso é o mínimo para quem
// quiser acompanhar sem depender de rede social — inclusive outros agregadores,
// que é como um blog novo é encontrado.

import { listarPublicados } from "../../lib/postsRepo";
import { baseDoSite } from "../../lib/site";

const SITE = baseDoSite();

export const dynamic = "force-dynamic";



/**
 * Escapa o que vai dentro de um nó XML.
 *
 * Título de notícia vem com & e aspas o tempo todo ("Edital & cronograma"), e
 * um & solto quebra o feed inteiro — o leitor não mostra o item com problema,
 * mostra um erro e nada mais.
 */
function xml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const { posts } = await listarPublicados({ limite: 30 });

  const itens = posts
    .map((p) =>
      [
        "    <item>",
        `      <title>${xml(p.titulo)}</title>`,
        `      <link>${SITE}/blog/${p.slug}</link>`,
        `      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>`,
        p.publicadoEm
          ? `      <pubDate>${new Date(p.publicadoEm).toUTCString()}</pubDate>`
          : "",
        p.resumo ? `      <description>${xml(p.resumo)}</description>` : "",
        p.categoria ? `      <category>${xml(p.categoria)}</category>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");

  const corpo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog do Clube Forense</title>
    <link>${SITE}</link>
    <description>Notícias, editais e conteúdo de medicina legal para quem presta concurso de perito médico-legista.</description>
    <language>pt-BR</language>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
${itens}
  </channel>
</rss>`;

  return new Response(corpo, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      // Cinco minutos na borda: leitor de feed costuma checar de hora em hora,
      // e o custo de servir isto quente é menor que o de montar a cada visita.
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
