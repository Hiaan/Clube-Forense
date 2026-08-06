// Quem se cadastrou pelo muro do mapa.

import { listarLeads, resumoLeads } from "../../../lib/leadsRepo";
import { ESTADO_POR_UF } from "../../../monitor/lib/estados";

export const dynamic = "force-dynamic";

/** Quantos estados aparecem no ranking do topo. */
const TOP_UFS = 6;

function quando(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PainelLeads() {
  const [leads, resumo] = await Promise.all([listarLeads(), resumoLeads()]);

  if (leads === null) {
    return (
      <>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Banco indisponível. Confira a variável <code>DATABASE_URL</code> do
          projeto na Vercel.
        </div>
      </>
    );
  }

  const total = resumo?.total ?? leads.length;
  const topo = (resumo?.porUf ?? []).slice(0, TOP_UFS);

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total === 0
              ? "Ninguém se cadastrou ainda."
              : `${total} cadastro(s) pelo mapa. A conta em si fica na plataforma de alunos; aqui é o registro de quem veio por aqui e de qual estado.`}
          </p>
        </div>
        {leads.length > 0 && (
          <a
            href="/api/admin/leads"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Baixar CSV
          </a>
        )}
      </header>

      {topo.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {topo.map(({ uf, total: n }) => (
            <span
              key={uf}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600"
              title={ESTADO_POR_UF[uf]?.nome ?? uf}
            >
              <strong className="font-mono text-gray-900">{uf}</strong> {n}
            </span>
          ))}
        </div>
      )}

      {leads.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Celular</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Cadastro</th>
                <th className="px-4 py-3 font-semibold">Voltou</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((l) => (
                <tr key={l.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{l.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{l.email}</td>
                  <td className="px-4 py-3 text-gray-600">{l.celular ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {l.ufInteresse ? (
                      <span className="font-mono text-xs font-bold">{l.ufInteresse}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{quando(l.criadoEm)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {l.vezes > 1 ? `${l.vezes}× · ${quando(l.vistoEm)}` : "—"}
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
