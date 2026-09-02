"use client";

// Colar o gabarito de um tipo de caderno.
//
// Um formulário separado do resto da prova de propósito: o gabarito chega dias
// depois das respostas, muitas vezes de madrugada, e às vezes muda de novo
// quando saem os recursos. Ter um botão só para ele evita salvar a prova
// inteira — e recorrigir todo mundo — a cada colagem.

import { useActionState } from "react";

import { salvarGabaritoAcao, type Resultado } from "../../../acoes";
import { enviarSemLimpar } from "../../../enviarSemLimpar";
import { ANULADA, type Gabarito } from "../../../../lib/ranking";

/** Mostra o gabarito guardado no formato que o próprio campo aceita de volta. */
function paraTexto(g: Gabarito): string {
  return Object.entries(g)
    .map(([q, alt]) => [Number(q), alt] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([q, alt]) => `${q}-${alt}`)
    .join(" ");
}

export default function EditorGabarito({
  provaId,
  tipo,
  indice,
  gabarito,
}: {
  provaId: number;
  /** Vazio quando a prova tem caderno único. */
  tipo: string;
  /** Posição na lista de tipos — vira o id do campo. */
  indice: number;
  gabarito: Gabarito;
}) {
  const [resultado, acao, salvando] = useActionState<Resultado | null, FormData>(
    salvarGabaritoAcao,
    null,
  );

  const quantas = Object.keys(gabarito).length;
  // Pelo índice, e não pelo nome do tipo: "Tipo 2" viraria o id "gabarito-Tipo
  // 2", com espaço — válido em HTML, mas impossível de selecionar em CSS.
  const id = `gabarito-${indice}`;

  return (
    <form onSubmit={enviarSemLimpar(acao)} className="rounded-xl border border-gray-200 p-4">
      <input type="hidden" name="id" value={provaId} />
      <input type="hidden" name="tipo" value={tipo} />

      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold text-gray-900">
          {tipo || "Caderno único"}
        </label>
        <span className="text-xs text-gray-500">
          {quantas ? `${quantas} questões salvas` : "sem gabarito"}
        </span>
      </div>

      <textarea
        id={id}
        name="gabarito"
        rows={4}
        defaultValue={paraTexto(gabarito)}
        placeholder="1-A 2-B 3-C…  ou  ABCDE…  ou uma questão por linha"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />

      <p className="mt-1 text-xs text-gray-400">
        Aceita a sequência corrida, “1-A 2-B” ou uma por linha. Use{" "}
        <code className="font-mono">{ANULADA}</code> para questão anulada — ela
        conta como acerto para todo mundo, inclusive para quem deixou em branco.
        Salvar em branco apaga o gabarito e tira a nota dos cartões.
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p
          role="status"
          className={`text-sm font-medium ${resultado?.ok ? "text-green-700" : "text-red-700"}`}
        >
          {resultado?.mensagem}
        </p>
        <button
          type="submit"
          disabled={salvando}
          className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {salvando ? "Corrigindo…" : "Salvar e corrigir"}
        </button>
      </div>
    </form>
  );
}
