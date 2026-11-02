// Retrato da capa: a foto do Miguel num cartão arredondado, com o nome, o
// cargo e os registros profissionais sobre o degradê da parte de baixo.

import Image from "next/image";

import fotoBracos from "../../public/fotos/miguel-bracos-cruzados.jpg";

/** Registros profissionais do Miguel. */
const CRM = "CRM-PE 21.839";
const RQE = "RQE 4.156";

export default function RetratoPericial() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-6 rounded-[3rem] bg-azul-claro/40 blur-3xl" aria-hidden />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cinza-foto">
        <Image
          src={fotoBracos}
          alt="Dr. Miguel Souza, médico legista, de braços cruzados e sorrindo"
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover object-[50%_10%]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-fundo via-fundo/40 to-transparent" />
        <div className="absolute inset-x-6 bottom-6">
          <p className="text-2xl font-bold uppercase leading-tight sm:text-3xl">Dr. Miguel Souza</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-destaque">
            Médico legista · Doutorando em Perícias Forenses
          </p>
          <p className="mt-3 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-fundo/50 px-3.5 py-1 font-mono text-[11px] tracking-[0.12em] text-osso/85 backdrop-blur-sm sm:text-xs">
            <span>{CRM}</span>
            <span className="size-1 rounded-full bg-destaque" />
            <span>{RQE}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
