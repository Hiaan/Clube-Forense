// A página de leitura.
//
// Coluna estreita, tipo de 17px, muito respiro — nada aqui disputa atenção com
// o texto. As três coisas que aparecem fora da coluna (a procedência, o estado
// no mapa e o preparatório) vêm depois do fim da leitura, nessa ordem, que é a
// ordem em que elas interessam.

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import AvisoPostAntigo from "../AvisoPostAntigo";
import CartaoPost, { dataCurta } from "../CartaoPost";
import Markdown from "../Markdown";
import { lerPublicado, lerRelacionados } from "../../lib/postsRepo";
import { nomeCategoria, nomeEstado, orgaoPorSlug } from "../lib/taxonomia";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await lerPublicado((await params).slug);
  if (!post) return { title: "Post não encontrado" };

  return {
    title: post.titulo,
    description: post.resumo || undefined,
    openGraph: {
      title: post.titulo,
      description: post.resumo || undefined,
      type: "article",
      publishedTime: post.publicadoEm ?? undefined,
      images: post.capaUrl ? [post.capaUrl] : undefined,
    },
    // A canônica aponta para o domínio do blog, e não para o caminho relativo:
    // a mesma página responde em dois endereços (o /blog do mapa e o
    // blog.clubeforense.com.br), e sem isso o Google escolhe sozinho qual
    // indexar — às vezes um, às vezes o outro, dividindo a reputação dos dois.
    alternates: { canonical: `https://blog.clubeforense.com.br/blog/${post.slug}` },
  };
}

export default async function PaginaPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = await lerPublicado((await params).slug);
  if (!post) notFound();

  const orgao = post.orgao ? orgaoPorSlug(post.orgao) : null;
  const estado = nomeEstado(post.uf);
  const relacionados = await lerRelacionados(post);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <nav className="mb-6 text-xs font-semibold text-gray-500">
        <Link href="/blog" className="hover:text-gray-900">
          Blog
        </Link>
        <span className="px-1.5 text-gray-300">/</span>
        <Link
          href={`/blog?categoria=${post.categoria}`}
          className="hover:text-gray-900"
        >
          {nomeCategoria(post.categoria)}
        </Link>
      </nav>

      <article>
        <header>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
            {orgao && (
              <Link
                href={`/blog?orgao=${orgao.slug}`}
                className="rounded bg-[#fff9db] px-2 py-0.5 text-gray-900 transition hover:bg-[#ffcd07]"
              >
                {orgao.curto}
              </Link>
            )}
            {estado && (
              <Link
                href={`/blog?uf=${post.uf}`}
                className="rounded border border-gray-200 px-2 py-0.5 text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
              >
                {estado}
              </Link>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-black leading-[1.15] tracking-tight text-gray-900 sm:text-[2.5rem]">
            {post.titulo}
          </h1>

          {post.resumo && (
            <p className="mt-4 text-lg leading-relaxed text-gray-600">{post.resumo}</p>
          )}

          <p className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-500">
            {dataCurta(post.publicadoEm)}
          </p>

          {/* Antes da capa e do texto, e não num rodapé: quem lê "edital sai em
              agosto" e só descobre no fim que o post é do ano passado já tomou
              a decisão errada. */}
          <AvisoPostAntigo publicadoEm={post.publicadoEm} uf={post.uf} />
        </header>

        {post.capaUrl && (
          <figure className="my-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
              <Image
                src={post.capaUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            {post.capaCredito && (
              <figcaption className="mt-2 text-xs text-gray-400">
                Foto: {post.capaCredito}
              </figcaption>
            )}
          </figure>
        )}

        <div className="mt-8">
          <Markdown corpo={post.corpo} />
        </div>
      </article>

      {/* Procedência, quando o post tem uma a declarar.
          A condição é o NOME da fonte, e não o link. Os dois campos existem por
          motivos diferentes: o link é guardado em toda pauta do robô porque é
          ele que impede a mesma notícia de virar dois posts, e porque quem
          revisa precisa conferir o fato na origem. O nome é o crédito — e só
          existe quando há o que creditar. O texto que o robô escreve sai da
          nossa própria base (etapa do funil e ficha do estado, conferida à
          mão), sem citar nem reaproveitar frase de veículo nenhum, então não
          há a quem dar crédito; num post que de fato se apoia em terceiro,
          quem escreve preenche o nome no painel e a caixa aparece. */}
      {post.fonteUrl && post.fonteNome && (
        <div className="mt-10 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Fonte
          </p>
          <a
            href={post.fonteUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-1 inline-block text-sm font-semibold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-2"
          >
            {post.fonteNome} ↗
          </a>
        </div>
      )}

      {/* O estado deste post, no mapa. Mais útil que um link genérico: quem
          leu sobre a Politec-PE quer ver a ficha de Pernambuco, não a home. */}
      {post.uf && (
        <Link
          href={`/?uf=${post.uf}`}
          className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-gray-900 px-5 py-4 transition hover:bg-gray-800"
        >
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#ffcd07]">
              No mapa
            </span>
            <span className="mt-0.5 block text-sm font-bold text-white">
              Veja a etapa, as vagas e o salário em {estado}
            </span>
          </span>
          <span className="shrink-0 text-lg text-[#ffcd07]">→</span>
        </Link>
      )}

      <aside className="mt-4 rounded-xl border border-[#ffcd07] bg-[#fff9db] px-5 py-4">
        <p className="text-sm font-bold text-gray-900">
          Estudando para médico-legista?
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-700">
          O preparatório do Clube Forense é feito só para esse cargo — aula,
          questão e revisão pelo recorte que cai na prova de perícia.
        </p>
        <a
          href="https://app.clubeforense.com.br"
          className="mt-3 inline-flex rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-[#ffcd07] transition hover:bg-gray-800"
        >
          Conhecer o preparatório
        </a>
      </aside>

      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-lg font-bold tracking-tight text-gray-900">
            Continue lendo
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relacionados.map((p) => (
              <CartaoPost key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
