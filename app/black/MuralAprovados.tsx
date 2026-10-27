"use client";

// O mural de rostos dos aprovados, com "ver mais".
//
// São mais de vinte cartões; todos de uma vez viram uma parede que empurra a
// oferta para longe. Aparecem os primeiros oito (duas fileiras no computador)
// e o resto fica a um clique. Os cartões escondidos continuam no HTML, só
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

export default function MuralAprovados({ aprovados }: { aprovados: CartaoAprovado[] }) {
  const [aberto, setAberto] = useState(false);
  const sobra = aprovados.length - VISIVEIS;

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {aprovados.map((a, i) => (
          <div
            key={`${a.uf}-${a.nome}`}
            className={`card-white p-5 text-center ${!aberto && i >= VISIVEIS ? "hidden" : ""}`}
          >
            <div className="flex justify-center">
              <Avatar nome={a.nome} size={88} />
            </div>
            <p className="mt-3 text-sm font-bold leading-tight text-gray-900">{a.nome}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#b38f00]">
              {a.onde}
            </p>
            {a.destaque && <p className="mt-1 text-[11px] text-gray-500">{a.destaque}</p>}
          </div>
        ))}
      </div>

      {sobra > 0 && (
        <div className="mt-6 text-center">
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
