// Mapa do site para os buscadores.
//
// Cobre as duas metades do projeto: as páginas fixas e cada post publicado. Os
// recortes de filtro ficam de fora — são combinação de três eixos, dariam
// centenas de endereços com o mesmo conteúdo reordenado, e é exatamente isso
// que um buscador penaliza. Quem indexa recorte é a navegação, não o sitemap.

import type { MetadataRoute } from "next";

import { listarSlugsPublicados } from "./lib/postsRepo";
import { CATEGORIAS } from "./blog/lib/taxonomia";
import { baseDoSite } from "./lib/site";


const MAPA = "https://mapa.clubeforense.com.br";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Mesma base da canônica: sitemap e canônica discordando é o buscador
  // recebendo duas respostas para a mesma pergunta.
  const BLOG = baseDoSite();
  const posts = await listarSlugsPublicados();

  return [
    { url: MAPA, changeFrequency: "daily", priority: 1 },
    { url: `${BLOG}/blog`, changeFrequency: "daily", priority: 0.9 },

    // As categorias entram porque são poucas, fixas e cada uma tem um recorte
    // que se sustenta sozinho — diferente das combinações de filtro.
    ...CATEGORIAS.map((c) => ({
      url: `${BLOG}/blog/categoria/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),

    ...posts.map((p) => ({
      url: `${BLOG}/blog/${p.slug}`,
      lastModified: p.em ? new Date(p.em) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
