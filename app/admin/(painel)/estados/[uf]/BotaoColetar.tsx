"use client";

// "Coletar agora": roda o robô na hora, sem esperar o agendador.
//
// Cliente por causa do estado de espera. A coleta refaz dezenas de buscas sem
// cache e leva dezenas de segundos — um botão que não avisa disso parece
// travado, e quem administra clica de novo, dobrando o trabalho à toa.

import { useActionState } from "react";

import { coletarAgoraAcao, type Resultado } from "../../../acoes";
import { enviarSemLimpar } from "../../../enviarSemLimpar";

export default function BotaoColetar({
  uf,
  consultas,
}: {
  uf: string;
  /** Quantas buscas a coleta refaz — vem contado do servidor. */
  consultas: number;
}) {
  const [resultado, acao, coletando] = useActionState<Resultado | null, FormData>(
    coletarAgoraAcao,
    null,
  );

  return (
    <form onSubmit={enviarSemLimpar(acao)} className="mt-4 border-t border-gray-100 pt-4">
      <input type="hidden" name="uf" value={uf} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={coletando}
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {coletando ? "Coletando…" : "Coletar agora"}
        </button>
        <span className="text-xs text-gray-400">
          {coletando
            ? `Refazendo as ${consultas} buscas. Pode levar meio minuto — não feche a página.`
            : "Roda o robô agora, ignorando o cache de uma hora."}
        </span>
      </div>

      {resultado && (
        <p
          role="status"
          className={`mt-3 text-sm leading-relaxed ${
            resultado.ok ? "text-green-700" : "text-red-700"
          }`}
        >
          {resultado.mensagem}
        </p>
      )}
    </form>
  );
}
