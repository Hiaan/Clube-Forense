// Cartão de um post na listagem.
//
// Serve a duas larguras: `destaque` ocupa a faixa inteira no topo da home, o
// resto vai na grade. É o mesmo componente porque o conteúdo é o mesmo — só
// muda quanto espaço ele tem para respirar.

import Image from "next/image";
import Link from "next/link";

import type { PostResumido } from "../lib/postsRepo";
import { nomeCategoria, nomeEstado, orgaoPorSlug } from "./lib/taxonomia";

/** Data por extenso, curta. Em post de concurso o ano importa tanto quanto o dia. */
export function dataCurta(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * A etiqueta mais específica que o post tiver.
 *
 * Órgão ganha do estado: quem procura a Politec-PE reconhece "Politec-PE" na
 * hora, e "Pernambuco" obriga a um segundo passo de tradução. Sem os dois,
 * sobra a categoria, que todo post tem.
 */
function etiqueta(p: PostResumido): string {
  const orgao = p.orgao ? orgaoPorSlug(p.orgao) : null;
  if (orgao) return orgao.curto;
  return nomeEstado(p.uf) ?? nomeCategoria(p.categoria);
}

/**
 * True quando a etiqueta já É a categoria — post nacional, sem órgão nem estado.
 *
 * Sem esta checagem o cartão imprimia "Carreira · Carreira", e a repetição some
 * do radar de quem escreveu o componente mas salta aos olhos de quem lê a
 * grade. Um dos dois tem que sair, e o que sai é a repetição, não a informação.
 */
function etiquetaEhCategoria(p: PostResumido): boolean {
  return !p.orgao && !p.uf;
}

export default function CartaoPost({
  post,
  destaque = false,
}: {
  post: PostResumido;
  destaque?: boolean;
}) {
  const href = `/blog/${post.slug}`;

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${
        destaque ? "sm:grid sm:grid-cols-2" : ""
      }`}
    >
      <Link href={href} className="block">
        <div
          className={`relative overflow-hidden bg-gray-100 ${
            destaque ? "aspect-[16/10] h-full sm:aspect-auto sm:min-h-[260px]" : "aspect-[16/9]"
          }`}
        >
          {post.capaUrl ? (
            <Image
              src={post.capaUrl}
              alt=""
              fill
              sizes={destaque ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              unoptimized
            />
          ) : (
            // Sem capa, a sigla do órgão vira a capa. Um retângulo cinza vazio
            // faria a grade inteira parecer quebrada.
            <div className="flex h-full w-full items-center justify-center bg-gray-900">
              <span className="px-4 text-center text-lg font-black tracking-tight text-[#ffcd07]">
                {etiqueta(post)}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className={`flex flex-col ${destaque ? "justify-center p-6 sm:p-7" : "p-5"}`}>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
          <span className="rounded bg-[#fff9db] px-2 py-0.5 text-gray-900">
            {etiqueta(post)}
          </span>
          {!etiquetaEhCategoria(post) && (
            <span className="text-gray-400">{nomeCategoria(post.categoria)}</span>
          )}
        </div>

        <h2
          className={`mt-2.5 font-bold tracking-tight text-gray-900 ${
            destaque ? "text-2xl leading-snug" : "text-[17px] leading-snug"
          }`}
        >
          <Link href={href} className="hover:underline hover:decoration-[#ffcd07] hover:decoration-2 hover:underline-offset-4">
            {post.titulo}
          </Link>
        </h2>

        {post.resumo && (
          <p
            className={`mt-2 text-gray-600 ${
              destaque ? "text-[15px] leading-relaxed" : "line-clamp-3 text-sm leading-relaxed"
            }`}
          >
            {post.resumo}
          </p>
        )}

        <p className="mt-3 text-xs text-gray-400">{dataCurta(post.publicadoEm)}</p>
      </div>
    </article>
  );
}
