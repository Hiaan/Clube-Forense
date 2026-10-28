"use client";

// O aviso de virada de lote da página dos alunos, em destaque: faixa vermelha
// com o relógio grande. Some sozinho quando o prazo passa — a troca de valor
// é manual (FAIXA_UNICA em cupons.ts), e não faz sentido seguir anunciando
// uma virada que já aconteceu.

import Contador, { usePrazo } from "../black/Contador";

export default function AvisoLote({
  ate,
  compacto = false,
}: {
  ate: string;
  compacto?: boolean;
}) {
  const falta = usePrazo(ate);
  if (falta?.acabou) return null;

  if (compacto) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border-2 border-red-500/70 bg-[#2a1214] px-4 py-3 text-center lg:mx-0">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-red-300">
          ⏰ O 1º lote vira à meia-noite
        </p>
        <p className="mt-1 text-2xl font-black text-white">
          <Contador compacto ate={ate} />
        </p>
        <p className="mt-1 text-xs font-semibold text-white/70">
          Depois disso, o valor será alterado.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-xl rounded-3xl border-2 border-red-500/70 bg-[#2a1214] px-5 py-6 text-center shadow-[0_20px_60px_-20px_rgba(239,68,68,0.6)] sm:px-8">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-300">
        ⏰ Atenção: o 1º lote vira à meia-noite
      </p>
      <p className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
        Depois da meia-noite,{" "}
        <span className="text-[#ffcd07]">o valor será alterado.</span>
      </p>
      <div className="mt-5 flex justify-center">
        <Contador ate={ate} />
      </div>
    </div>
  );
}
