"use client";

// Botão "Buscar notícias agora", no topo do Blog.
//
// POR QUE ELE PRECISOU EXISTIR. O robô roda sozinho de hora em hora, mas quando
// a fila fica dias parada não há como saber, olhando esta tela, se a busca
// quebrou ou se simplesmente não saiu notícia que preste. Até aqui a única
// forma de forçar uma passada era abrir Estados, escolher um estado e clicar no
// botão de lá — o que exige saber que esse botão existe e adivinhar em qual
// estado clicar. Este faz a passada inteira, dos 27 estados, de onde a pergunta
// nasce.
//
// E ELE RESPONDE O PORQUÊ, não só o quanto. Sem pauta nova, a mensagem diz o
// que barrou cada notícia — repetida, ficha magra, estado travado, fora da
// janela. É a diferença entre "nada aconteceu" e "aconteceu isto, e foi por
// esta razão".
//
// A busca lê todas as fontes sem cache e leva alguns segundos. Enquanto corre,
// o botão fica desabilitado e dizendo "Buscando…": um botão mudo nesse intervalo
// é clicado três vezes, e cada clique é uma passada inteira.

import { useActionState } from "react";

import { pesquisarAgoraAcao, type Resultado } from "../../acoes";

export default function BotaoPesquisar() {
  const [resultado, pesquisar, pendente] = useActionState<Resultado | null, FormData>(
    pesquisarAgoraAcao,
    null,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={pesquisar}>
        <button
          type="submit"
          disabled={pendente}
          className="rounded-xl border border-gray-900 bg-white px-4 py-2 text-sm font-bold text-gray-900 transition hover:bg-gray-900 hover:text-[#ffcd07] disabled:opacity-60"
        >
          {pendente ? "Buscando…" : "Buscar notícias agora"}
        </button>
      </form>

      {resultado && (
        <p
          role="status"
          className={`max-w-md rounded-xl px-3 py-2 text-xs leading-relaxed ${
            resultado.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {resultado.mensagem}
        </p>
      )}
    </div>
  );
}
