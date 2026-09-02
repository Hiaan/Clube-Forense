"use client";

// Convite para entrar, na página do ranking.
//
// Existe separado do cabeçalho porque aqui o motivo é outro: no mapa, entrar
// libera o detalhe dos estados; aqui, é o que permite ATRIBUIR o cartão a
// alguém. Sem saber de quem é, não há "sua posição" nem como impedir que a
// mesma pessoa apareça três vezes no ranking.

import { useState } from "react";

import ModalAcesso from "../components/ModalAcesso";

export default function PrecisaEntrar({
  uf,
  estado,
  titulo,
  texto,
}: {
  uf: string | null;
  estado: string | null;
  titulo: string;
  texto: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-[#121215] p-6 text-center">
      <p className="text-lg font-bold text-white">{titulo}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-400">{texto}</p>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-5 inline-flex rounded-full bg-[#ffcd07] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:brightness-95"
      >
        Entrar para participar
      </button>

      {aberto && (
        <ModalAcesso
          estado={estado}
          uf={uf}
          aoFechar={() => setAberto(false)}
          // Recarregar traz a página já com o cartão-resposta no lugar deste
          // convite — o servidor decide, e não o cliente.
          aoEntrar={() => window.location.reload()}
        />
      )}
    </div>
  );
}
