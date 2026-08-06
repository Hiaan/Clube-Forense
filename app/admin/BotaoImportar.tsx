"use client";

// Botão de importação da planilha. Cliente porque precisa mostrar o resultado
// sem recarregar, e porque a ação é destrutiva o bastante para pedir confirmação.

import { useState, useTransition } from "react";
import { importarPlanilhaAcao, type Resultado } from "./acoes";

export default function BotaoImportar() {
  const [pendente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function importar() {
    const certeza = window.confirm(
      "Importar a planilha vai sobrescrever os dados dos estados no painel.\n\n" +
        "A notícia principal que você escolheu em cada estado é preservada.\n\n" +
        "Continuar?",
    );
    if (!certeza) return;
    iniciar(async () => setResultado(await importarPlanilhaAcao()));
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={importar}
        disabled={pendente}
        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
      >
        {pendente ? "Importando…" : "Importar da planilha"}
      </button>
      {resultado && (
        <p
          role="status"
          className={`max-w-md text-right text-xs ${
            resultado.ok ? "text-green-700" : "text-red-700"
          }`}
        >
          {resultado.mensagem}
        </p>
      )}
    </div>
  );
}
