// URL bonita de categoria: /blog/categoria/noticia.
//
// Redireciona para o filtro em vez de renderizar a lista de novo. Os dois
// endereços mostrariam exatamente o mesmo conteúdo, e conteúdo igual em URL
// diferente divide a reputação no buscador e dobra o lugar onde um bug pode
// morar. O caminho bonito existe para ser escrito no menu e dito em voz alta;
// quem manda é o filtro.

import { permanentRedirect, notFound } from "next/navigation";

import { categoriaPorSlug } from "../../lib/taxonomia";

export default async function PaginaCategoria({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!categoriaPorSlug(slug)) notFound();
  permanentRedirect(`/blog?categoria=${slug}`);
}
