// Lista de posts do blog, com a fila de revisão na frente.
//
// A ordem das abas não é alfabética nem por volume: "Para revisar" vem primeiro
// porque é a única que tem prazo. O robô abre pauta de hora em hora, e notícia
// de concurso envelhece em um dia — uma fila que ninguém vê é uma fila que
// ninguém esvazia.

import Link from "next/link";

import { contarEmRevisao, listarTodos, type StatusPost } from "../../../lib/postsRepo";
import { nomeCategoria, nomeEstado, orgaoPorSlug } from "../../../blog/lib/taxonomia";

export const dynamic = "force-dynamic";

const ABAS: { chave: StatusPost | "todos"; rotulo: string }[] = [
  { chave: "revisao", rotulo: "Para revisar" },
  { chave: "publicado", rotulo: "No ar" },
  { chave: "rascunho", rotulo: "Rascunhos" },
  { chave: "todos", rotulo: "Todos" },
];

const CORES: Record<StatusPost, string> = {
  revisao: "bg-[#fff9db] text-[#8a6d00]",
  publicado: "bg-green-50 text-green-700",
  rascunho: "bg-gray-100 text-gray-600",
};

const ROTULOS: Record<StatusPost, string> = {
  revisao: "Para revisar",
  publicado: "No ar",
  rascunho: "Rascunho",
};

function quando(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default async function PaginaPosts({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  const bruta = Array.isArray(q.status) ? q.status[0] : q.status;
  const aba = (ABAS.find((a) => a.chave === bruta)?.chave ?? "revisao") as StatusPost | "todos";

  const [posts, emRevisao] = await Promise.all([
    listarTodos(aba === "todos" ? undefined : aba),
    contarEmRevisao(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            O robô do monitor abre a pauta; aqui ela é revisada e vai ao ar.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/blog"
            target="_blank"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Ver o blog ↗
          </Link>
          <Link
            href="/admin/posts/novo"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-[#ffcd07] hover:bg-gray-800"
          >
            Novo post
          </Link>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2">
        {ABAS.map((a) => {
          const ativa = a.chave === aba;
          return (
            <Link
              key={a.chave}
              href={`/admin/posts?status=${a.chave}`}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                ativa
                  ? "bg-gray-900 text-white"
                  : "border border-gray-300 bg-white text-gray-600 hover:border-gray-900"
              }`}
            >
              {a.rotulo}
              {a.chave === "revisao" && emRevisao > 0 && (
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    ativa ? "bg-[#ffcd07] text-gray-900" : "bg-[#ffcd07] text-gray-900"
                  }`}
                >
                  {emRevisao}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {posts.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">
            {aba === "revisao"
              ? "Nenhuma pauta esperando. Quando a coleta achar notícia de concurso, o rascunho aparece aqui."
              : "Nada por aqui ainda."}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {posts.map((p) => {
              const orgao = p.orgao ? orgaoPorSlug(p.orgao) : null;
              return (
                <li key={p.id}>
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="flex items-start gap-4 px-5 py-4 transition hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CORES[p.status]}`}
                        >
                          {ROTULOS[p.status]}
                        </span>
                        {p.origem === "robo" && (
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            Robô
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-gray-400">
                          {orgao?.curto ?? nomeEstado(p.uf) ?? "Nacional"} ·{" "}
                          {nomeCategoria(p.categoria)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-bold text-gray-900">
                        {p.titulo}
                      </p>
                      {p.resumo && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{p.resumo}</p>
                      )}
                    </div>
                    <span className="shrink-0 pt-1 text-xs text-gray-400">
                      {quando(p.publicadoEm ?? p.criadoEm)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
