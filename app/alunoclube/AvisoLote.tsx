"use client";

// O aviso de virada de lote da página dos alunos, em destaque: faixa vermelha
// com o relógio grande. Some sozinho quando o prazo passa — a troca de valor
// é manual (FAIXA_UNICA em cupons.ts), e não faz sentido seguir anunciando
// uma virada que já aconteceu. Lote e data vêm de VIRADA_ALUNO.
//
// O VALOR DO PRÓXIMO LOTE NÃO APARECE: o Clube decidiu só avisar que muda.

import Contador, { usePrazo } from "../black/Contador";
import { VIRADA_ALUNO } from "./cupons";

export default function AvisoLote({
  compacto = false,
}: {
  compacto?: boolean;
}) {
  const { ate, sai, entra, quando } = VIRADA_ALUNO;
  const falta = usePrazo(ate);
  if (falta?.acabou) return null;

  if (compacto) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border-2 border-red-500/70 bg-[#2a1214] px-4 py-3 text-center lg:mx-0">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-red-300">
          ⏰ O {sai} encerra {quando}
        </p>
        <p className="mt-1 text-2xl font-black text-white">
          <Contador compacto ate={ate} />
        </p>
        <p className="mt-1 text-xs font-semibold text-white/70">
          À meia-noite do dia 11 entra o {entra}, com um novo valor.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-xl rounded-3xl border-2 border-red-500/70 bg-[#2a1214] px-5 py-6 text-center shadow-[0_20px_60px_-20px_rgba(239,68,68,0.6)] sm:px-8">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-red-300">
        ⏰ Atenção: o {sai} encerra {quando}
      </p>
      <p className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
        À meia-noite do dia 11 entra o {entra}{" "}
        <span className="text-[#ffcd07]">com um novo valor.</span>
      </p>
      <div className="mt-5 flex justify-center">
        <Contador ate={ate} />
      </div>
    </div>
  );
}
