"use client";

// Editor da lista de IMLs do estado: cidade e, quando tem, o nome da unidade.
//
// Mesma mecânica do editor do plano — as linhas viajam como JSON num campo
// escondido, porque é uma lista de tamanho variável dentro de um formulário.

import { useState } from "react";

import type { Iml } from "../../../../lib/imlsRepo";

const campo =
  "w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none " +
  "focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

export default function EditorImls({ inicial }: { inicial: Iml[] }) {
  const [linhas, setLinhas] = useState<Iml[]>(inicial);

  const trocar = (i: number, parte: Partial<Iml>) =>
    setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, ...parte } : l)));

  const serializado = JSON.stringify(
    linhas
      .filter((l) => l.cidade.trim())
      .map((l) => ({ cidade: l.cidade.trim(), nome: l.nome?.trim() || null })),
  );

  return (
    <div>
      <input type="hidden" name="imls" value={serializado} />

      {linhas.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">Nenhuma unidade cadastrada.</p>
          <button
            type="button"
            onClick={() => setLinhas([{ cidade: "", nome: null }])}
            className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            + Primeira unidade
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Cidade
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Nome da unidade
            </span>
            <span />

            {linhas.map((l, i) => (
              <div key={i} className="contents">
                <input
                  className={campo}
                  value={l.cidade}
                  onChange={(e) => trocar(i, { cidade: e.target.value })}
                  placeholder="Natal"
                  aria-label={`Cidade da unidade ${i + 1}`}
                />
                <input
                  className={campo}
                  value={l.nome ?? ""}
                  onChange={(e) => trocar(i, { nome: e.target.value })}
                  placeholder="IML Central (opcional)"
                  aria-label={`Nome da unidade ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setLinhas((ls) => ls.filter((_, j) => j !== i))}
                  className="rounded-lg px-2 text-sm text-gray-400 hover:bg-red-50 hover:text-red-700"
                  aria-label={`Remover a unidade ${i + 1}`}
                  title="Remover"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setLinhas((ls) => [...ls, { cidade: "", nome: null }])}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              + Unidade
            </button>
            <button
              type="button"
              onClick={() => setLinhas([])}
              className="text-xs font-semibold text-gray-400 hover:text-red-700"
            >
              Limpar lista
            </button>
          </div>
        </>
      )}
    </div>
  );
}
