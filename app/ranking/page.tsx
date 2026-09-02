// Todas as provas do ranking.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import Cabecalho from "../components/Cabecalho";
import { contarRespostas, lerProvas } from "../lib/provasRepo";
import { NOME_COOKIE, sessaoValida } from "../lib/sessao";
import { ESTADO_POR_UF } from "../monitor/lib/estados";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ranking e Notas | Clube Forense",
  description:
    "Lance seu cartão-resposta das provas para médico-legista, veja sua posição entre os candidatos e a estimativa de nota de corte.",
};

function formatarData(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function Ranking() {
  const [provas, cartoes, jar] = await Promise.all([
    lerProvas(),
    contarRespostas(),
    cookies(),
  ]);
  const liberado = sessaoValida(jar.get(NOME_COOKIE)?.value);

  const abertas = provas.filter((p) => p.aberta);
  const encerradas = provas.filter((p) => !p.aberta);

  const Cartao = ({ p }: { p: (typeof provas)[number] }) => (
    <Link
      href={`/ranking/${p.uf}`}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#121215] p-5 transition hover:border-white/25"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ffcd07] text-sm font-black text-gray-900">
        {p.uf}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-white">{p.titulo}</span>
        <span className="mt-0.5 block text-xs text-gray-400">
          {ESTADO_POR_UF[p.uf]?.nome ?? p.uf}
          {p.dataProva && ` · ${formatarData(p.dataProva)}`}
          {` · ${cartoes[p.id] ?? 0} participante(s)`}
        </span>
      </span>
      <span className="shrink-0 text-xs font-bold text-[#ffcd07]">
        {p.aberta ? "Participar →" : "Ver ranking →"}
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#0b0b0d]">
      <Cabecalho liberado={liberado} />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffcd07]">
          Ranking e Notas
        </p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          Como você foi, antes de a banca dizer.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
          Lance o seu cartão-resposta no dia da prova. Quando o gabarito sair, a
          correção é automática, e você vê sua posição entre os outros candidatos
          e a nossa estimativa de nota de corte.
        </p>

        {provas.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#121215] p-6">
            <p className="font-bold text-white">Nenhuma prova por enquanto.</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              O ranking abre quando a prova de algum estado acontece. Acompanhe o
              radar: é lá que o edital aparece primeiro.
            </p>
            <Link
              href="/#radar"
              className="mt-4 inline-flex rounded-full bg-[#ffcd07] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:brightness-95"
            >
              Ver o radar dos concursos
            </Link>
          </div>
        ) : (
          <>
            {abertas.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm font-bold text-white">Acontecendo agora</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {abertas.map((p) => (
                    <Cartao key={p.id} p={p} />
                  ))}
                </div>
              </section>
            )}

            {encerradas.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm font-bold text-white">Provas anteriores</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {encerradas.map((p) => (
                    <Cartao key={p.id} p={p} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
