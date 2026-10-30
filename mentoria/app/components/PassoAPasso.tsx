"use client";

// Linha do tempo da mentoria: uma linha central, um marcador numerado por
// etapa e os cartões alternando de lado. No celular a linha vai para a
// esquerda e os cartões ficam todos à direita dela.
//
// Conforme a página desce, a linha se preenche de dourado e cada cartão
// surge quando entra na tela. Os dois efeitos são aplicados direto no DOM
// depois que a página carrega: sem JavaScript, tudo aparece normalmente, e
// nenhum cartão fica escondido esperando um script que não veio.

import { useEffect, useRef } from "react";

interface Passo {
  titulo: string;
  texto: string;
  icone: React.ReactNode;
}

export default function PassoAPasso({ passos }: { passos: Passo[] }) {
  const lista = useRef<HTMLOListElement>(null);
  const preenchimento = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ol = lista.current;
    const barra = preenchimento.current;
    if (!ol || !barra) return;

    const itens = Array.from(ol.querySelectorAll<HTMLElement>("[data-passo]"));
    const altura = window.innerHeight;
    for (const item of itens) {
      if (item.getBoundingClientRect().top > altura * 0.9) item.classList.add("oculto");
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.remove("oculto");
            observador.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    itens.forEach((i) => observador.observe(i));

    let quadro = 0;
    const atualizar = () => {
      quadro = 0;
      const r = ol.getBoundingClientRect();
      const progresso = (window.innerHeight * 0.6 - r.top) / r.height;
      barra.style.transform = `scaleY(${Math.min(1, Math.max(0, progresso))})`;
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar);
    };
    atualizar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <ol ref={lista} className="relative mt-16">
      {/* Linha central: o trilho apagado e o preenchimento dourado por cima. */}
      <div aria-hidden className="absolute bottom-0 left-5 top-0 w-px bg-white/10 lg:left-1/2">
        <div
          ref={preenchimento}
          className="absolute inset-0 origin-top bg-gradient-to-b from-ouro via-ouro to-ouro/40 shadow-[0_0_12px_rgba(231,172,60,0.8)]"
          style={{ transform: "scaleY(0)" }}
        />
      </div>

      {passos.map((p, i) => {
        const esquerda = i % 2 === 0;
        const numero = String(i + 1).padStart(2, "0");
        return (
          <li
            key={p.titulo}
            data-passo
            className={`passo relative grid grid-cols-[2.5rem_1fr] gap-4 pb-8 lg:grid-cols-[1fr_4rem_1fr] lg:gap-0 lg:pb-0 ${
              i > 0 ? "lg:-mt-20" : ""
            }`}
          >
            {/* Marcador */}
            <div className="relative z-10 flex justify-center lg:col-start-2 lg:row-start-1">
              <span className="marcador grid size-10 place-items-center rounded-full border border-ouro/60 bg-preto font-impacto text-base text-ouro shadow-[0_0_0_6px_rgba(10,10,10,1),0_0_24px_rgba(231,172,60,0.45)]">
                {numero}
              </span>
            </div>

            {/* Cartão */}
            <div
              className={`cartao relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-grafite to-carvao p-6 sm:p-7 lg:row-start-1 lg:max-w-[30rem] ${
                esquerda ? "lg:col-start-1 lg:justify-self-end" : "lg:col-start-3 lg:justify-self-start"
              }`}
            >
              <span aria-hidden className="pointer-events-none absolute -bottom-6 right-3 select-none font-impacto text-[7rem] leading-none text-white/[0.04]">
                {numero}
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-ouro text-preto shadow-[0_10px_30px_-8px_rgba(231,172,60,0.7)]">
                <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {p.icone}
                </svg>
              </span>
              <h3 className="relative mt-5 text-lg font-black uppercase leading-tight sm:text-xl">{p.titulo}</h3>
              <p className="relative mt-2 leading-relaxed text-osso/65">{p.texto}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
