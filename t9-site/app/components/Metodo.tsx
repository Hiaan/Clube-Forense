"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Dicionario } from "@/lib/dicionarios";
import { fmt } from "@/lib/i18n";
import { IconeSeta } from "./Icones";

export default function Metodo({ t }: { t: Dicionario["metodo"] }) {
  const trilhaRef = useRef<HTMLOListElement>(null);
  const [progresso, setProgresso] = useState(0);
  const [ativas, setAtivas] = useState(0);

  useEffect(() => {
    const trilha = trilhaRef.current;
    if (!trilha) return;
    let quadro = 0;

    const atualizar = () => {
      quadro = 0;
      const caixa = trilha.getBoundingClientRect();
      const referencia = window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (referencia - caixa.top) / caixa.height));
      setProgresso(p);

      const itens = Array.from(trilha.querySelectorAll<HTMLElement>("[data-semana]"));
      setAtivas(itens.filter((el) => el.getBoundingClientRect().top < referencia).length);
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar);
    };

    atualizar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <section id="metodo" className="fundo-post relative overflow-hidden">
      <div data-reveal="faixa">
        <div className="faixa">
          <p className="container-t9 py-4 font-display text-base font-extrabold tracking-tight sm:py-5 sm:text-2xl">
            {t.faixa}
          </p>
        </div>
      </div>

      <div className="container-t9 relative grid gap-14 pt-16 pb-28 sm:pt-24 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:pb-36">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2
            className="font-display text-[2rem] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]"
            data-reveal
          >
            {t.titulo}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed font-light text-white/75" data-reveal>
            {t.texto}
          </p>
          <a href="#agendar" className="botao botao-vermelho mt-9 text-base" data-reveal>
            {t.cta}
            <IconeSeta className="h-5 w-5" />
          </a>
        </div>

        <ol ref={trilhaRef} className="relative pl-12 sm:pl-16">
          <span className="linha-metodo absolute top-2 bottom-2 left-[11px] w-[3px] rounded-full sm:left-[15px]" aria-hidden="true">
            <span
              className="linha-metodo-progresso absolute inset-0 rounded-full"
              style={{ "--progresso": progresso } as CSSProperties}
            />
          </span>

          {t.semanas.map((s, i) => (
            <li
              key={s.titulo}
              data-semana
              className={`etapa-metodo relative pb-14 last:pb-0 ${i < ativas ? "ativo" : ""}`}
            >
              <span
                className="no-metodo absolute top-[34px] -left-12 h-[25px] w-[25px] rounded-full sm:-left-16 sm:h-[33px] sm:w-[33px]"
                aria-hidden="true"
              />
              <p className="font-display text-xl font-extrabold text-[#ff4550] sm:text-2xl">{fmt(t.semana, { n: i + 1 })}</p>
              <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-[2rem]">{s.titulo}</h3>
              <p className="mt-3 max-w-xl text-lg leading-relaxed font-light text-white/80">{s.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
