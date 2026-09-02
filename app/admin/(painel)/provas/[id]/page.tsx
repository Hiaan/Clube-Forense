// Edição de uma prova do ranking.

import Link from "next/link";
import { notFound } from "next/navigation";

import ApagarProva from "./ApagarProva";
import EditorGabarito from "./EditorGabarito";
import FormProva from "./FormProva";
import { lerProva, lerRespostas } from "../../../../lib/provasRepo";
import {
  cartoesParaEstimar,
  estatisticas,
  estimarCorte,
  MIN_AMOSTRA,
} from "../../../../lib/ranking";
import { ESTADOS } from "../../../../monitor/lib/estados";

export const dynamic = "force-dynamic";

/** Quantos cartões mostrar na tela. O resto é ruído para conferência. */
const MAX_CARTOES = 30;

export default async function EditarProva({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const prova = await lerProva(id);
  if (!prova) notFound();

  const respostas = await lerRespostas(id);
  const notas = respostas
    .filter((r) => r.nota != null)
    .map((r) => r.nota as number)
    .sort((a, b) => b - a);

  const stats = estatisticas(notas);
  const corte = estimarCorte(notas, prova.vagas, prova.inscritos);
  const precisaDe = cartoesParaEstimar(prova.vagas, prova.inscritos);

  // Caderno único é representado pelo tipo vazio, e continua precisando de um
  // gabarito — por isso a lista nunca fica vazia.
  const tipos = prova.tipos.length > 0 ? prova.tipos : [""];

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <Link
          href="/admin/provas"
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Provas
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          <span className="font-mono text-gray-400">{prova.uf}</span> {prova.titulo}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {respostas.length} cartão(ões) enviado(s) ·{" "}
          {notas.length} com nota ·{" "}
          <Link href={`/ranking/${prova.uf}`} className="font-medium underline">
            ver a página pública
          </Link>
        </p>
      </header>

      <FormProva prova={prova} estados={ESTADOS.map((e) => ({ uf: e.uf, nome: e.nome }))} />

      {/* ---------- Gabarito ---------- */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-bold text-gray-900">Gabarito</h2>
        <p className="mb-4 text-sm text-gray-500">
          Um por tipo de caderno. Assim que você salvar, todos os cartões daquele
          tipo são corrigidos — inclusive os enviados antes de o gabarito existir.
        </p>
        <div className="flex flex-col gap-4">
          {tipos.map((t, i) => (
            <EditorGabarito
              key={t || "unico"}
              provaId={prova.id}
              tipo={t}
              indice={i}
              gabarito={prova.gabaritos[t] ?? {}}
            />
          ))}
        </div>
      </section>

      {/* ---------- Como está o ranking ---------- */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-gray-900">Como está o ranking</h2>

        {stats ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Respondentes", stats.respondentes],
                ["Maior nota", stats.maior],
                ["Média", stats.media],
                ["Mediana", stats.mediana],
              ].map(([r, v]) => (
                <div key={String(r)} className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">{r}</p>
                  <p className="mt-0.5 text-lg font-bold text-gray-900">{v}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-gray-600">
              {corte ? (
                corte.base === "projetada" ? (
                  <>
                    Corte estimado: <strong>{corte.nota}</strong> — a nota de quem
                    está na posição {corte.posicao} aqui, que é a fatia
                    equivalente às {prova.vagas} vagas entre {prova.inscritos}{" "}
                    inscritos. Sai alta: quem responde aqui estudou mais que a
                    média dos inscritos.
                  </>
                ) : (
                  <>
                    Sem o número de inscritos, dá para dizer apenas que a última
                    vaga entre os respondentes daqui fez{" "}
                    <strong>{corte.nota}</strong>. Preencha “Inscritos” para a
                    projeção sobre o concurso inteiro.
                  </>
                )
              ) : precisaDe && notas.length >= MIN_AMOSTRA ? (
                <>
                  Sem estimativa: com {prova.vagas} vagas para {prova.inscritos}{" "}
                  inscritos, {notas.length} cartões fazem a projeção cair no
                  primeiro colocado — seria a maior nota daqui, não um corte. São
                  precisos cerca de {precisaDe}.
                </>
              ) : (
                <>
                  Ainda sem estimativa de corte: são precisos {MIN_AMOSTRA} cartões
                  com nota e o número de vagas preenchido.
                </>
              )}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Nenhum cartão com nota ainda. Sem gabarito, os cartões ficam guardados
            e entram no ranking assim que ele for colado acima.
          </p>
        )}

        {respostas.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="pb-2 font-semibold">Apelido</th>
                  <th className="pb-2 font-semibold">E-mail</th>
                  <th className="pb-2 font-semibold">Tipo</th>
                  <th className="pb-2 text-right font-semibold">Acertos</th>
                  <th className="pb-2 text-right font-semibold">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {respostas.slice(0, MAX_CARTOES).map((r) => (
                  <tr key={r.id}>
                    <td className="py-1.5 text-gray-900">{r.apelido}</td>
                    <td className="py-1.5 text-gray-500">{r.email}</td>
                    <td className="py-1.5 text-gray-500">{r.tipo || "—"}</td>
                    <td className="py-1.5 text-right text-gray-700">{r.acertos ?? "—"}</td>
                    <td className="py-1.5 text-right font-semibold text-gray-900">
                      {r.nota ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {respostas.length > MAX_CARTOES && (
              <p className="mt-2 text-xs text-gray-400">
                Mostrando {MAX_CARTOES} de {respostas.length}.
              </p>
            )}
          </div>
        )}
      </section>

      <div className="mt-6 border-t border-gray-200 pt-5">
        <ApagarProva provaId={prova.id} cartoes={respostas.length} />
      </div>
    </div>
  );
}
