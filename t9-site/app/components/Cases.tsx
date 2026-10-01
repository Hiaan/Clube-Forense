import Image from "next/image";
import type { CSSProperties } from "react";
import { CASES } from "@/lib/cases";
import { Subtitulo, Titulo } from "./ui";

export default function Cases() {
  if (!CASES.length) return null;

  return (
    <section id="cases" className="fundo-post relative overflow-hidden">
      <div className="faixa h-4 sm:h-6" aria-hidden="true" />
      <div className="brilho-canto -bottom-48 -left-40 opacity-60" aria-hidden="true" />

      <div className="relative pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="container-t9">
          <p className="font-display text-sm font-extrabold tracking-[0.25em] text-[#ff5a63] uppercase" data-reveal>
            Cases
          </p>
          <Titulo className="mt-3 max-w-4xl">Operações que passaram por nós.</Titulo>
          <Subtitulo>Empresas que estruturaram tráfego, vendas e automação com o nosso time, e os números que vieram depois.</Subtitulo>
        </div>

        {/* Celular: carrossel com rolagem lateral. Desktop: grade. */}
        <ul className="sem-barra mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:mx-auto lg:grid lg:max-w-[1200px] lg:grid-cols-3 lg:gap-7 lg:overflow-visible lg:px-8">
          {CASES.map((c, i) => (
            <li
              key={c.cliente}
              className="case-card group w-[84%] shrink-0 snap-center sm:w-[48%] lg:w-auto"
              data-reveal
              style={{ "--d": `${(i % 3) * 110}ms` } as CSSProperties}
            >
              <div className="flex min-h-[64px] items-center justify-between gap-4">
                {c.logo ? (
                  <Image
                    src={c.logo}
                    alt={c.cliente}
                    width={180}
                    height={64}
                    className="h-12 w-auto max-w-[170px] object-contain object-left"
                  />
                ) : (
                  <span className="font-display text-2xl leading-tight font-extrabold tracking-tight">{c.cliente}</span>
                )}
                <span className="shrink-0 rounded-full border border-[#ff2d38]/50 bg-[#ff2d38]/10 px-3 py-1 text-xs font-medium tracking-wide text-[#ffb3b8]">
                  {c.segmento}
                </span>
              </div>

              <div className="mt-7 grid gap-5 border-y border-white/10 py-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {c.destaques.map((d) => (
                  <div key={d.legenda}>
                    <p className="font-display text-[1.9rem] leading-none font-extrabold tracking-tight whitespace-nowrap text-white texto-brilho">
                      {d.valor}
                    </p>
                    <p className="mt-2 text-sm leading-snug font-light text-white/65">{d.legenda}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[15px] leading-relaxed font-light text-white/80">{c.resumo}</p>
            </li>
          ))}
        </ul>

        <div className="container-t9 mt-12" data-reveal>
          <a href="#agendar" className="botao botao-vermelho text-base">
            Quero ser o próximo case
          </a>
        </div>
      </div>
    </section>
  );
}
