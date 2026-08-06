"use client";

// Formulário de um aprovado. Serve para criar e para editar: a diferença é o
// campo escondido `id`.

import { useActionState } from "react";

import CampoFoto from "../../graficos/CampoFoto";
import { enviarSemLimpar } from "../../enviarSemLimpar";
import { salvarAprovadoAcao, type Resultado } from "../../acoes";
import type { Aprovado } from "../../../lib/aprovadosRepo";

const campo =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none " +
  "focus:border-gray-900 focus:ring-1 focus:ring-gray-900";
const rotulo = "text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function FormAprovado({
  estados,
  inicial,
  temBlob,
  aoFechar,
}: {
  estados: { uf: string; nome: string }[];
  inicial: Aprovado | null;
  temBlob: boolean;
  aoFechar?: () => void;
}) {
  const [resultado, acao, salvando] = useActionState<Resultado | null, FormData>(
    salvarAprovadoAcao,
    null,
  );

  const v = (x: string | number | null | undefined) => (x == null ? "" : String(x));

  return (
    <form
      onSubmit={enviarSemLimpar(acao)}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      {inicial && <input type="hidden" name="id" value={inicial.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1" htmlFor={`uf-${inicial?.id ?? "novo"}`}>
          <span className={rotulo}>Estado</span>
          <select
            id={`uf-${inicial?.id ?? "novo"}`}
            name="uf"
            className={campo}
            defaultValue={inicial?.uf ?? ""}
          >
            <option value="">Escolha…</option>
            {estados.map((e) => (
              <option key={e.uf} value={e.uf}>
                {e.uf} · {e.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1" htmlFor={`nome-${inicial?.id ?? "novo"}`}>
          <span className={rotulo}>Nome</span>
          <input
            id={`nome-${inicial?.id ?? "novo"}`}
            name="nome"
            className={campo}
            defaultValue={v(inicial?.nome)}
            placeholder="Dra. Ana Ribeiro"
            required
          />
        </label>

        <label className="flex flex-col gap-1" htmlFor={`titulo-${inicial?.id ?? "novo"}`}>
          <span className={rotulo}>Colocação</span>
          <input
            id={`titulo-${inicial?.id ?? "novo"}`}
            name="titulo"
            className={campo}
            defaultValue={v(inicial?.titulo)}
            placeholder="1º Lugar do Clube Forense"
          />
        </label>

        <label className="flex flex-col gap-1" htmlFor={`orgao-${inicial?.id ?? "novo"}`}>
          <span className={rotulo}>Órgão</span>
          <input
            id={`orgao-${inicial?.id ?? "novo"}`}
            name="orgao"
            className={campo}
            defaultValue={v(inicial?.orgao)}
            placeholder="Polícia Federal"
          />
          <span className="text-[11px] text-gray-400">
            Só quando o concurso não é o do estado escolhido.
          </span>
        </label>

        <label className="flex flex-col gap-1" htmlFor={`ano-${inicial?.id ?? "novo"}`}>
          <span className={rotulo}>Ano</span>
          <input
            id={`ano-${inicial?.id ?? "novo"}`}
            name="ano"
            type="number"
            className={campo}
            defaultValue={v(inicial?.ano)}
            placeholder="2026"
          />
        </label>

        <label className="flex flex-col gap-1" htmlFor={`ordem-${inicial?.id ?? "novo"}`}>
          <span className={rotulo}>Ordem</span>
          <input
            id={`ordem-${inicial?.id ?? "novo"}`}
            name="ordem"
            type="number"
            className={campo}
            defaultValue={v(inicial?.ordem ?? 0)}
          />
          <span className="text-[11px] text-gray-400">
            Menor aparece primeiro no card do estado.
          </span>
        </label>
      </div>

      <div className="mt-4">
        {temBlob ? (
          <CampoFoto
            nome="fotoUrl"
            pasta="aprovados"
            valorInicial={inicial?.fotoUrl ?? null}
            redondo
          />
        ) : (
          <>
            <input type="hidden" name="fotoUrl" value={inicial?.fotoUrl ?? ""} />
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Foto indisponível: falta conectar a store de imagens (Blob) ao projeto na
              Vercel. O resto do cadastro funciona normalmente.
            </p>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-[20px]">
          {resultado && (
            <p
              role="status"
              className={`text-sm font-medium ${
                resultado.ok ? "text-green-700" : "text-red-700"
              }`}
            >
              {resultado.mensagem}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {aoFechar && (
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={salvando}
            className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </form>
  );
}
