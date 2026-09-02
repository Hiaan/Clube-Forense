// Provas do ranking.

import Link from "next/link";

import NovaProva from "./NovaProva";
import { contarRespostas, lerProvas } from "../../../lib/provasRepo";
import { ESTADOS } from "../../../monitor/lib/estados";

export const dynamic = "force-dynamic";

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function PainelProvas() {
  const [provas, cartoes] = await Promise.all([lerProvas(), contarRespostas()]);
  const abertas = provas.filter((p) => p.aberta).length;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Provas e ranking</h1>
        <p className="mt-1 text-sm text-gray-500">
          {provas.length === 0
            ? "Nenhuma prova cadastrada ainda."
            : `${provas.length} prova(s) · ${abertas} aberta(s) recebendo cartões.`}
        </p>
      </header>

      <div className="mb-6">
        <NovaProva estados={ESTADOS.map((e) => ({ uf: e.uf, nome: e.nome }))} />
      </div>

      {provas.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Prova</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Situação</th>
                <th className="px-4 py-3 font-semibold">Cartões</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {provas.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-gray-400">{p.uf}</span>{" "}
                    <span className="font-medium text-gray-900">{p.titulo}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatarData(p.dataProva)}</td>
                  <td className="px-4 py-3">
                    {p.aberta ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-green-800">
                        aberta
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-bold uppercase text-gray-600">
                        fechada
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cartoes[p.id] ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/provas/${p.id}`}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
