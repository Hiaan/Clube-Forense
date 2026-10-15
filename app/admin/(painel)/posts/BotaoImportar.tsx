"use client";

// Botão que traz o blog antigo para a fila.
//
// Separado da lista porque precisa de estado: a importação busca um feed de
// fora e demora alguns segundos, e um botão que não diz nada nesse intervalo é
// clicado três vezes seguidas.

import { useActionState } from "react";

import { importarBlogAntigoAcao, type Resultado } from "../../acoes";

export default function BotaoImportar() {
  const [resultado, importar, pendente] = useActionState<Resultado | null, FormData>(
    importarBlogAntigoAcao,
    null,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={importar}>
        <button
          type="submit"
          disabled={pendente}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          {pendente ? "Importando…" : "Importar blog antigo"}
        </button>
      </form>

      {resultado && (
        <p
          role="status"
          className={`max-w-sm rounded-xl px-3 py-2 text-xs leading-relaxed ${
            resultado.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {resultado.mensagem}
        </p>
      )}
    </div>
  );
}
