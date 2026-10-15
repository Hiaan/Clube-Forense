"use client";

// Publicar em massa o que está na fila de revisão.
//
// Só aparece na aba "Para revisar", e só quando há fila: um botão de publicar
// tudo visível na aba de rascunhos convidaria a publicar rascunho.

import { useActionState } from "react";

import { publicarTodosAcao, type Resultado } from "../../acoes";

export default function BotaoPublicarTodos({ quantos }: { quantos: number }) {
  const [resultado, publicar, pendente] = useActionState<Resultado | null>(
    publicarTodosAcao,
    null,
  );

  if (quantos === 0) return null;

  return (
    <div className="flex flex-col items-end gap-2">
      <form
        action={publicar}
        onSubmit={(e) => {
          // Confirmação porque é a ação de maior alcance do painel: põe no ar,
          // de uma vez, conteúdo que ninguém abriu item por item. Dá para
          // desfazer pelo editor, um a um — e é justamente esse "um a um" que
          // torna o engano caro.
          if (
            !confirm(
              `Publicar ${quantos} ${quantos === 1 ? "post" : "posts"} de uma vez?\n\n` +
                "Vão para o ar agora, com a data original de cada um. " +
                "Os que ainda estão sem texto ficam de fora.",
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <button
          type="submit"
          disabled={pendente}
          className="rounded-xl bg-[#ffcd07] px-4 py-2 text-sm font-bold text-gray-900 transition hover:brightness-95 disabled:opacity-60"
        >
          {pendente ? "Publicando…" : `Publicar ${quantos}`}
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
