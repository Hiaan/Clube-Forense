"use client";

// O mural de rostos dos aprovados, com "ver mais".
//
// São mais de vinte cartões; todos de uma vez viram uma parede que empurra a
// oferta para longe. No computador aparecem os primeiros oito (duas fileiras)
// e o resto fica a um clique; no celular viram um carrossel de arrastar com o
// dedo, todos na mesma fileira. Os cartões escondidos continuam no HTML, só
// ocultos — o buscador lê todos os nomes.

import { useState } from "react";

import Avatar from "../components/Avatar";

export interface CartaoAprovado {
  nome: string;
  uf: string;
  onde: string;
  destaque: string | null;
}

const VISIVEIS = 8;

export default function MuralAprovados({
  aprovados,
}: {
  aprovados: CartaoAprovado[];
}) {
  const [aberto, setAberto] = useState(false);
  const sobra = aprovados.length - VISIVEIS;

  return (
    <>
      {/* No celular, carrossel de arrastar com todos os nomes; do tablet para
          cima, a grade com "ver mais". */}
      <div className="-mx-4 mt-10 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {aprovados.map((a, i) => (
          <div
            key={`${a.uf}-${a.nome}`}
            className={`card-white w-[42%] shrink-0 snap-start p-4 text-center sm:w-auto sm:p-5 ${
              !aberto && i >= VISIVEIS ? "sm:hidden" : ""
            }`}
          >
            <div className="flex justify-center">
              <Avatar nome={a.nome} size={72} />
            </div>
            <p className="mt-3 text-sm font-bold leading-tight text-gray-900">
              {a.nome}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#b38f00]">
              {a.onde}
            </p>
            {a.destaque && (
              <p className="mt-1 text-[11px] text-gray-500">{a.destaque}</p>
            )}
          </div>
        ))}
      </div>

      {sobra > 0 && (
        <div className="mt-6 hidden text-center sm:block">
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-900 transition hover:border-gray-900"
          >
            {aberto ? "Ver menos" : `Ver mais ${sobra} aprovados`}
          </button>
        </div>
      )}
    </>
  );
}
