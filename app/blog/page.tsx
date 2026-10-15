// Home do blog: o que saiu, com os filtros em cima.
//
// Dinâmica de propósito. O robô abre pauta de hora em hora e a aprovação sai do
// painel; uma home pré-renderizada mostraria a lista de ontem para quem acabou
// de publicar, e o primeiro reflexo de quem publica é abrir o site para
// conferir.

import Link from "next/link";

import CartaoPost from "./CartaoPost";
import Filtros from "./Filtros";
import { listarPublicados } from "../lib/postsRepo";
import { categoriaPorSlug, nomeEstado, orgaoPorSlug } from "./lib/taxonomia";

export const dynamic = "force-dynamic";

const POR_PAGINA = 12;

/** Primeiro valor, quando o parâmetro vem repetido na URL. */
function um(v: string | string[] | undefined): string | null {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() ? s.trim() : null;
}

/**
 * A frase do topo.
 *
 * As boas-vindas valem só para a home limpa. Com filtro ligado, o que a pessoa
 * precisa ler é o recorte em que entrou ("Editais — PCERJ"): quem clicou num
 * concurso específico não está chegando ao blog, está dentro dele.
 */
function manchete(uf: string | null, orgao: string | null, categoria: string | null): string {
  const o = orgao ? orgaoPorSlug(orgao) : null;
  const c = categoria ? categoriaPorSlug(categoria) : null;
  if (o) return `${c ? `${c.nome} — ` : ""}${o.curto}`;
  if (uf) return `${c ? `${c.nome} — ` : ""}${nomeEstado(uf)}`;
  if (c) return c.nome;
  return "Bem-vindo ao blog do Clube Forense.";
}

export default async function BlogHome({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  const uf = um(q.uf);
  const orgao = um(q.orgao);
  const categoria = um(q.categoria);
  const busca = um(q.busca);
  const pagina = Math.max(Number(um(q.pagina) ?? 1) || 1, 1);

  const { posts, total } = await listarPublicados({
    uf,
    orgao,
    categoria,
    busca,
    limite: POR_PAGINA,
    deslocamento: (pagina - 1) * POR_PAGINA,
  });

  const paginas = Math.ceil(total / POR_PAGINA);
  const filtrado = Boolean(uf || orgao || categoria || busca);
  // Só a primeira página sem filtro ganha destaque. Na página 3, o post do topo
  // não é o mais importante de nada — é só o 25º mais recente.
  const temDestaque = !filtrado && pagina === 1 && posts.length > 2;
  const descricaoCategoria = categoria ? categoriaPorSlug(categoria)?.descricao : null;

  function comPagina(n: number): string {
    const p = new URLSearchParams();
    if (uf) p.set("uf", uf);
    if (orgao) p.set("orgao", orgao);
    if (categoria) p.set("categoria", categoria);
    if (busca) p.set("busca", busca);
    if (n > 1) p.set("pagina", String(n));
    return p.size ? `/blog?${p}` : "/blog";
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-[2.6rem]">
          {manchete(uf, orgao, categoria)}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
          {descricaoCategoria ??
            "Toda semana: o que mudou nos concursos de médico-legista nos 27 estados, e o conteúdo de medicina legal que cai na prova."}
        </p>
      </header>

      <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <Filtros uf={uf} orgao={orgao} categoria={categoria} busca={busca} total={total} />
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-bold text-gray-900">
            {filtrado ? "Nada por aqui com esses filtros" : "O blog está começando agora"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
            {filtrado
              ? "Tente afrouxar um dos filtros — ou veja o mapa, que acompanha os 27 estados mesmo sem post publicado."
              : "Enquanto o primeiro post não sai, o mapa já mostra em que etapa está o edital de cada estado."}
          </p>
          <Link
            href={filtrado ? "/blog" : "/"}
            className="mt-6 inline-flex rounded-full bg-gray-900 px-5 py-2.5 text-sm font-bold text-[#ffcd07] transition hover:bg-gray-800"
          >
            {filtrado ? "Limpar filtros" : "Abrir o mapa"}
          </Link>
        </div>
      ) : (
        <>
          {temDestaque && (
            <div className="mb-6">
              <CartaoPost post={posts[0]} destaque />
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(temDestaque ? posts.slice(1) : posts).map((p) => (
              <CartaoPost key={p.id} post={p} />
            ))}
          </div>
        </>
      )}

      {paginas > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginação">
          {pagina > 1 && (
            <Link
              href={comPagina(pagina - 1)}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-900"
            >
              ← Anterior
            </Link>
          )}
          <span className="px-3 text-sm text-gray-500">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && (
            <Link
              href={comPagina(pagina + 1)}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-900"
            >
              Próxima →
            </Link>
          )}
        </nav>
      )}

      {/* O caminho para o mapa fica no fim da lista, e não no meio dela: quem
          chegou até aqui sem clicar em nenhum post provavelmente queria a visão
          geral, que é o que o mapa dá. */}
      <aside className="mt-16 overflow-hidden rounded-2xl bg-gray-900 px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffcd07]">
              Mapa dos concursos
            </p>
            <p className="mt-2 text-xl font-bold leading-snug text-white">
              Em que etapa está o edital de cada estado, hoje
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Os 27 estados, do edital publicado ao silêncio total — com vagas,
              salário, banca e onde ficam os IMLs.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-full bg-[#ffcd07] px-5 py-3 text-sm font-bold text-gray-900 transition hover:brightness-95"
          >
            Abrir o mapa →
          </Link>
        </div>
      </aside>
    </main>
  );
}
