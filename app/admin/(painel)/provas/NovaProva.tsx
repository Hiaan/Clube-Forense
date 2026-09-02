"use client";

// Criar uma prova: só o essencial, porque o resto (matérias, gabarito, vagas)
// se preenche melhor na tela de edição, com espaço.

import { useActionState } from "react";

import { criarProvaAcao, type Resultado } from "../../acoes";
import { enviarSemLimpar } from "../../enviarSemLimpar";

const campo =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none " +
  "focus:border-gray-900 focus:ring-1 focus:ring-gray-900";
const rotulo = "text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function NovaProva({ estados }: { estados: { uf: string; nome: string }[] }) {
  const [resultado, acao, salvando] = useActionState<Resultado | null, FormData>(
    criarProvaAcao,
    null,
  );

  return (
    <form
      onSubmit={enviarSemLimpar(acao)}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <h2 className="font-bold text-gray-900">Nova prova</h2>
      <p className="mb-4 mt-1 text-sm text-gray-500">
        Ela nasce fechada. As matérias e o gabarito entram na tela seguinte, e o
        botão só aparece no mapa depois que você abrir a prova.
      </p>

      <div className="grid gap-4 sm:grid-cols-[140px_1fr_180px]">
        <label className="flex flex-col gap-1" htmlFor="nova-uf">
          <span className={rotulo}>Estado</span>
          <select id="nova-uf" name="uf" className={campo} defaultValue="" required>
            <option value="" disabled>
              Escolha…
            </option>
            {estados.map((e) => (
              <option key={e.uf} value={e.uf}>
                {e.uf} — {e.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1" htmlFor="nova-titulo">
          <span className={rotulo}>Nome da prova</span>
          <input
            id="nova-titulo"
            name="titulo"
            className={campo}
            placeholder="PC-MA 2026 — Perito Médico-Legista"
            required
          />
        </label>

        <label className="flex flex-col gap-1" htmlFor="nova-data">
          <span className={rotulo}>Data da prova</span>
          <input id="nova-data" name="dataProva" type="date" className={campo} />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p
          role="status"
          className={`text-sm font-medium ${resultado?.ok ? "text-green-700" : "text-red-700"}`}
        >
          {resultado?.mensagem}
        </p>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {salvando ? "Criando…" : "Criar prova"}
        </button>
      </div>
    </form>
  );
}
