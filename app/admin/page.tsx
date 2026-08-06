// Lista dos 27 estados. Porta de entrada do painel.

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import BotaoImportar from "./BotaoImportar";
import NavAdmin from "./NavAdmin";
import { NOME_COOKIE_ADMIN, sessaoAdminValida } from "../lib/admin";
import { lerEstados, type EstadoCuradoria } from "../lib/estadosRepo";
import { ESTADOS } from "../monitor/lib/estados";
import { NIVEL_COR, NIVEL_LABEL, NIVEL_PESO, type Nivel } from "../monitor/lib/tipos";

export const dynamic = "force-dynamic";

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Quantos dias desde a última conferência humana. */
function diasDesde(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default async function PainelEstados() {
  const jar = await cookies();
  if (!sessaoAdminValida(jar.get(NOME_COOKIE_ADMIN)?.value)) redirect("/admin/login");

  const gravados = await lerEstados();
  const porUf = new Map<string, EstadoCuradoria>((gravados ?? []).map((e) => [e.uf, e]));

  // Sempre os 27, mesmo que o banco esteja vazio: um estado sem linha é um
  // estado a preencher, e some da tela se listássemos só o que já existe.
  const linhas = [...ESTADOS]
    .map((e) => ({ uf: e.uf, nome: e.nome, dados: porUf.get(e.uf) ?? null }))
    .sort((a, b) => {
      const pa = a.dados ? NIVEL_PESO[a.dados.etapa] : -1;
      const pb = b.dados ? NIVEL_PESO[b.dados.etapa] : -1;
      return pb - pa || a.nome.localeCompare(b.nome);
    });

  const preenchidos = linhas.filter((l) => l.dados).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <NavAdmin atual="estados" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Estados</h1>
          <p className="mt-1 text-sm text-gray-500">
            {gravados === null
              ? "Banco indisponível — o site está usando a curadoria embutida no código."
              : `${preenchidos} de 27 estados preenchidos. Ordenados pelo estágio do edital.`}
          </p>
        </div>
        <BotaoImportar />
      </div>

      {gravados !== null && preenchidos === 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          O banco está vazio. Clique em <strong>Importar da planilha</strong> para
          trazer os 27 estados — enquanto isso, o site usa a curadoria embutida no
          código.
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Estágio</th>
              <th className="px-4 py-3 font-semibold">Notícia principal</th>
              <th className="px-4 py-3 font-semibold">Conferido</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {linhas.map(({ uf, nome, dados }) => {
              const etapa: Nivel = dados?.etapa ?? "sem";
              const dias = diasDesde(dados?.verificadoEm ?? null);
              return (
                <tr key={uf} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-gray-400">{uf}</span>{" "}
                    <span className="font-medium text-gray-900">{nome}</span>
                    {dados?.travado && (
                      <span
                        className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600"
                        title="Nenhuma notícia altera o estágio deste estado"
                      >
                        travado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: NIVEL_COR[etapa] }}
                      />
                      <span className="text-gray-700">{NIVEL_LABEL[etapa]}</span>
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                    {dados?.noticiaTitulo ? (
                      dados.noticiaTitulo
                    ) : (
                      <span className="text-gray-400">automática</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatarData(dados?.verificadoEm ?? null)}
                    {dias !== null && dias > 60 && (
                      <span
                        className="ml-2 text-xs font-semibold text-amber-600"
                        title="Faz mais de dois meses que ninguém confere este estado"
                      >
                        há {dias} dias
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/${uf}`}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
