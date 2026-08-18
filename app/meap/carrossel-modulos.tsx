"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { MODULOS } from "./conteudo";

/**
 * Carrossel dos módulos.
 *
 * Os cartões eram uma grade empilhada de três colunas. Como carrossel eles
 * ficam numa única fileira que rola de lado, e o cartão seguinte aparece pela
 * metade na borda — é o que avisa que existe mais coisa ali sem precisar de
 * legenda.
 *
 * A rolagem em si é CSS (`scroll-snap`), então funciona no dedo e no trackpad
 * mesmo antes do JavaScript carregar. O JavaScript entra só para as setas e
 * para saber quando desligá-las nas pontas, que é o que falta a quem está no
 * mouse.
 */
export function CarrosselModulos() {
  const trilho = useRef<HTMLOListElement>(null);
  const [noInicio, setNoInicio] = useState(true);
  const [noFim, setNoFim] = useState(false);

  const medir = useCallback(() => {
    const el = trilho.current;
    if (!el) return;
    // 1px de folga: com zoom ou densidade fracionária o scroll não fecha exato
    // no fim, e sem isso a seta da direita ficaria acesa para sempre.
    setNoInicio(el.scrollLeft <= 1);
    setNoFim(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    medir();
    const el = trilho.current;
    if (!el) return;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [medir]);

  const andar = useCallback((sentido: 1 | -1) => {
    const el = trilho.current;
    if (!el) return;
    // Um cartão por clique: o passo sai da largura do primeiro item, então
    // acompanha sozinho a troca de largura entre celular e desktop.
    const cartao = el.querySelector("li");
    const passo = cartao ? cartao.getBoundingClientRect().width + 20 : 300;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    el.scrollBy({
      left: passo * sentido,
      behavior: suave ? "smooth" : "auto",
    });
  }, []);

  return (
    <div className="relative mt-12">
      <ol
        ref={trilho}
        onScroll={medir}
        tabIndex={0}
        role="region"
        aria-label="Módulos do curso"
        className="trilho-modulos flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 outline-hidden focus-visible:ring-2 focus-visible:ring-[#ffc781]/60"
      >
        {MODULOS.map((m) => (
          <li
            key={m.numero}
            className="group w-[15rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#0f1626] transition hover:border-[#ffc781] sm:w-[17rem] lg:w-[19rem]"
          >
            <div className="relative aspect-3/4 overflow-hidden">
              {m.imagem ? (
                <Image
                  src={m.imagem}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 19rem, (min-width: 640px) 17rem, 15rem"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                // Sem capa ainda: um grafismo do próprio sistema segura o lugar
                // sem parecer imagem quebrada.
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-br from-[#2c375b] to-[#0f1626]"
                >
                  <div className="absolute -right-10 top-10 h-40 w-40 rotate-12 rounded-2xl border-[8px] border-white/[0.06]" />
                  <div className="absolute -left-8 bottom-8 h-28 w-28 rotate-12 rounded-xl border-[8px] border-white/[0.04]" />
                </div>
              )}

              {/* Escurece a base para o título vazado ter contraste qualquer que
                  seja a foto colocada depois. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-[#0f1626] via-[#0f1626]/40 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 p-4">
                {m.linha1 && (
                  <p className="font-sora text-xl font-extrabold uppercase leading-[0.95] tracking-tight text-white/85">
                    {m.linha1}
                  </p>
                )}
                <p className="font-sora text-xl font-extrabold uppercase leading-[0.95] tracking-tight text-[#ffc781]">
                  {m.linha2}
                </p>
                <span className="mt-3 inline-flex rounded-md bg-[#ffc781] px-2.5 py-1 font-sora text-[0.65rem] font-bold uppercase tracking-wider text-[#1b243a]">
                  Módulo {m.numero}
                </span>
              </div>
            </div>

            <p className="p-5 text-sm leading-relaxed text-white/70">
              {m.texto}
            </p>
          </li>
        ))}
      </ol>

      {/* As setas ficam fora do trilho para não cobrir cartão. No celular elas
          somem: ali o gesto de arrastar já resolve e sobra pouca largura. */}
      <div className="mt-6 hidden justify-center gap-3 sm:flex">
        <BotaoSeta
          rotulo="Módulos anteriores"
          desligado={noInicio}
          onClick={() => andar(-1)}
          sentido="esquerda"
        />
        <BotaoSeta
          rotulo="Próximos módulos"
          desligado={noFim}
          onClick={() => andar(1)}
          sentido="direita"
        />
      </div>
    </div>
  );
}

function BotaoSeta({
  rotulo,
  desligado,
  onClick,
  sentido,
}: {
  rotulo: string;
  desligado: boolean;
  onClick: () => void;
  sentido: "esquerda" | "direita";
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      disabled={desligado}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[#ffc781] hover:text-[#ffc781] disabled:pointer-events-none disabled:opacity-30"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 ${sentido === "esquerda" ? "rotate-180" : ""}`}
      >
        <path d="m9 5 7 7-7 7" />
      </svg>
    </button>
  );
}
