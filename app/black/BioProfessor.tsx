"use client";

// A biografia do professor, cortada em cinco linhas com um "ver mais".
//
// POR QUE CORTAR. As três biografias têm oito, dez linhas cada — universidade,
// residência, fellowship, mestrado, onde atua hoje. É credencial de verdade, e
// é por isso que ela precisa estar na página; mas três blocos desse tamanho
// lado a lado viram uma parede de texto que ninguém lê, e o cartão do meio
// fica com o dobro da altura do vizinho. Cortado, o olho vê três cartões
// iguais e lê o começo de cada um — que é onde mora o que importa: médico legista de
// qual estado, formado onde.
//
// O CORTE É VISUAL, NÃO É PERDA. `line-clamp` esconde, não apaga: o texto
// inteiro está no HTML desde o primeiro render, então o buscador lê tudo e
// quem usa leitor de tela ouve tudo. É a diferença entre dobrar uma folha e
// rasgá-la.

import { useState } from "react";

export default function BioProfessor({ texto }: { texto: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <p
        className={`mt-2 text-sm leading-relaxed text-gray-600 ${
          aberto ? "" : "line-clamp-5"
        }`}
      >
        {texto}
      </p>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="mt-2 text-xs font-bold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
      >
        {aberto ? "ver menos" : "ver mais"}
      </button>
    </>
  );
}
