// Retrato da capa: o Miguel recortado, direto sobre o fundo da capa, sem
// moldura, com o nome, o cargo e os registros centralizados embaixo.

import Image from "next/image";

import fotoRecorte from "../../public/fotos/miguel-recorte.webp";

/** Registros profissionais; trocar pelos números reais. */
const CRM = "CRM-PE 00000";
const RQE = "RQE 0000";

export default function RetratoPericial() {
  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center lg:max-w-none">
      {/* Luz atrás do retrato, para a camisa escura não sumir no fundo */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[6%] h-[70%] w-[90%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(110,150,195,.45),transparent)]"
      />
      <div className="relative w-[78%] max-w-[400px]">
        <Image
          src={fotoRecorte}
          alt="Dr. Miguel Souza, perito médico legista, de braços cruzados e sorrindo"
          priority
          sizes="(min-width: 1024px) 30vw, 75vw"
          className="h-auto w-full drop-shadow-[0_20px_40px_rgba(0,0,0,.45)]"
        />
        {/* Esfuma a parte de baixo da foto no fundo da capa */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-fundo via-fundo/70 to-transparent" />
      </div>

      <div className="relative -mt-16 text-center">
        <p className="text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">Dr. Miguel Souza</p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-destaque sm:text-sm">
          Perito médico legista
        </p>
        <p className="mt-3 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs tracking-[0.12em] text-osso/80 sm:text-sm">
          <span>{CRM}</span>
          <span className="size-1 rounded-full bg-destaque" />
          <span>{RQE}</span>
        </p>
      </div>
    </div>
  );
}
