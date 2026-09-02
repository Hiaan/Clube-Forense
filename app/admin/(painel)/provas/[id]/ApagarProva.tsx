"use client";

// Apagar a prova. Leva junto matérias, gabarito e todos os cartões enviados —
// daí a confirmação, que é a única do painel.

import { useActionState } from "react";

import { apagarProvaAcao, type Resultado } from "../../../acoes";
import { enviarSemLimpar } from "../../../enviarSemLimpar";

export default function ApagarProva({
  provaId,
  cartoes,
}: {
  provaId: number;
  cartoes: number;
}) {
  const [resultado, acao, apagando] = useActionState<Resultado | null, FormData>(
    apagarProvaAcao,
    null,
  );

  return (
    <form
      onSubmit={(e) => {
        const aviso = cartoes
          ? `Apagar esta prova e os ${cartoes} cartão(ões) já enviados? Não dá para desfazer.`
          : "Apagar esta prova?";
        if (!confirm(aviso)) {
          e.preventDefault();
          return;
        }
        enviarSemLimpar(acao)(e);
      }}
    >
      <input type="hidden" name="id" value={provaId} />
      {resultado && !resultado.ok && (
        <p role="status" className="mb-2 text-sm font-medium text-red-700">
          {resultado.mensagem}
        </p>
      )}
      <button
        type="submit"
        disabled={apagando}
        className="text-xs font-semibold text-gray-400 hover:text-red-700 disabled:opacity-60"
      >
        {apagando ? "Apagando…" : "Apagar esta prova"}
      </button>
    </form>
  );
}
