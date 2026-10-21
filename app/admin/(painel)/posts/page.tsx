// Lista de posts do blog, com a fila de revisão na frente.
//
// A ordem das abas não é alfabética nem por volume: "Para revisar" vem primeiro
// porque é a única que tem prazo. O robô abre pauta de hora em hora, e notícia
// de concurso envelhece em um dia — uma fila que ninguém vê é uma fila que
// ninguém esvazia.

import Link from "next/link";

import BotaoImportar from "./BotaoImportar";
import BotaoPesquisar from "./BotaoPesquisar";
import BotaoPublicarTodos from "./BotaoPublicarTodos";
import { contarEmRevisao, listarTodos, type StatusPost } from "../../../lib/postsRepo";
import { lerUltimaColeta } from "../../../lib/sistemaRepo";
import { lerResumoVisitas, lerVisitasPorSlug } from "../../../lib/visitasRepo";
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

/** Acima disto, a rotina automática provavelmente parou (ela roda de hora em hora). */
const HORAS_BUSCA_ATRASADA = 6;

function buscaAtrasada(iso: string): boolean {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000 > HORAS_BUSCA_ATRASADA;
}

/** "há 40 minutos", "há 3 horas", "há 2 dias" — do jeito que se fala. */
function haQuantoTempo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 2) return "agora";
  if (min < 60) return `há ${min} minutos`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

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

  const [posts, emRevisao, coleta, visitas, leituras] = await Promise.all([
    listarTodos(aba === "todos" ? undefined : aba),
    contarEmRevisao(),
    lerUltimaColeta(),
    lerResumoVisitas(),
    lerVisitasPorSlug(),
  ]);

  // Quantos o botão de publicar em massa realmente levaria. Conta o que está
  // pronto, e não a fila inteira: prometer "Publicar 20" e publicar 7 é pior
  // que não ter o botão.
  const prontos = aba === "revisao" ? posts.filter((p) => p.pronto).length : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            O robô do monitor abre a pauta; aqui ela é revisada e vai ao ar.
          </p>
          {/* A HORA DA BUSCA, NÃO A DO ÚLTIMO POST — e a diferença entre as
              duas é o mal-entendido que esta linha existe para desfazer. A
              lista abaixo mostra a data dos posts, então uma fila parada há
              uma semana parece busca parada há uma semana. Quase sempre não é:
              a busca rodou dezenas de vezes e recusou tudo, que é o trabalho
              dela. Só esta linha sabe dizer qual dos dois casos é. */}
          <p className="mt-2 text-xs text-gray-400">
            {coleta ? (
              <>
                Última busca do robô:{" "}
                <strong
                  className={buscaAtrasada(coleta.em) ? "text-amber-700" : "text-gray-600"}
                >
                  {haQuantoTempo(coleta.em)}
                </strong>
                {buscaAtrasada(coleta.em) && " — a rotina automática pode ter parado."}
              </>
            ) : (
              "O robô ainda não registrou nenhuma busca."
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          {/* Só na aba da fila: o botão publica o que está EM REVISÃO, e
              oferecê-lo na aba de rascunhos sugeriria outra coisa. */}
          {aba === "revisao" && <BotaoPublicarTodos quantos={prontos} />}
          <BotaoPesquisar />
          <BotaoImportar />
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

      {/* QUANTA GENTE LEU. A contagem é de navegador com JavaScript, ou seja,
          de pessoa: robô de buscador passa várias vezes por dia em cada post e
          inflaria justamente o número que precisa ser honesto. Os cliques de
          saída são a pergunta que vale dinheiro — não quantos leram, mas
          quantos leram e foram ver o curso. */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { r: "Leituras (7 dias)", v: visitas.posts7 },
          { r: "Leituras (30 dias)", v: visitas.posts30 },
          { r: "Leituras no total", v: visitas.postsTotal },
          { r: "Cliques para o curso (30 dias)", v: visitas.saidas30 },
        ].map((c) => (
          <div key={c.r} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-2xl font-black text-gray-900">{c.v.toLocaleString("pt-BR")}</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {c.r}
            </p>
          </div>
        ))}
      </div>
      {visitas.postsTotal === 0 && (
        <p className="mt-2 text-xs text-gray-400">
          A contagem começa agora — ela só registra visitas a partir de hoje, e
          não tem como recuperar o que aconteceu antes.
        </p>
      )}

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
                        {/* O que falta texto fica marcado: é o que o botão de
                            publicar em massa deixa para trás, e saber disso
                            antes de clicar evita a pergunta depois. */}
                        {!p.pronto && (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                            Falta texto
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
                    <span className="shrink-0 pt-1 text-right text-xs text-gray-400">
                      {quando(p.publicadoEm ?? p.criadoEm)}
                      {p.status === "publicado" && (
                        <span className="mt-0.5 block font-semibold text-gray-600">
                          {(leituras.get(p.slug) ?? 0).toLocaleString("pt-BR")} leitura
                          {(leituras.get(p.slug) ?? 0) === 1 ? "" : "s"}
                        </span>
                      )}
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
