"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { MODULOS } from "./conteudo";

/**
 * Carrossel dos módulos.
 *
 * Cada cartão é só a arte do módulo: o nome e a numeração já vêm impressos na
 * própria imagem, então não há título nem descrição ao lado. Eles ficam numa
 * fileira que rola de lado, com o cartão seguinte aparecendo pela metade na
 * borda — é o que avisa que existe mais coisa ali sem precisar de legenda.
 *
 * A rolagem em si é CSS (`scroll-snap`), então funciona no dedo e no trackpad
 * mesmo antes do JavaScript carregar. O JavaScript entra para as setas, para
 * saber quando desligá-las nas pontas e para o arrastar com o mouse — que é o
 * que falta a quem não tem tela de toque nem trackpad.
 */
export function CarrosselModulos() {
  const trilho = useRef<HTMLOListElement>(null);
  const [noInicio, setNoInicio] = useState(true);
  const [noFim, setNoFim] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  // Fora do estado de propósito: isto muda a cada `pointermove` e re-renderizar
  // o carrossel inteiro a cada pixel arrastado engasgaria a rolagem.
  const gesto = useRef({ x: 0, scroll: 0 });

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

  // Só o mouse é sequestrado. No dedo e na caneta a rolagem nativa já faz isso
  // melhor do que qualquer coisa que eu escrevesse aqui, e roda fora da thread
  // principal.
  const comecarArrasto = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !trilho.current) return;
    gesto.current = { x: e.clientX, scroll: trilho.current.scrollLeft };
    setArrastando(true);
    trilho.current.setPointerCapture(e.pointerId);
  }, []);

  const arrastar = useCallback(
    (e: React.PointerEvent) => {
      if (!arrastando || !trilho.current) return;
      // `preventDefault` evita que o gesto vire seleção de texto no meio dos
      // cartões, que é o que acontece quando se arrasta por cima da descrição.
      e.preventDefault();
      trilho.current.scrollLeft =
        gesto.current.scroll - (e.clientX - gesto.current.x);
    },
    [arrastando],
  );

  const soltarArrasto = useCallback(
    (e: React.PointerEvent) => {
      if (!arrastando || !trilho.current) return;
      setArrastando(false);
      if (trilho.current.hasPointerCapture(e.pointerId)) {
        trilho.current.releasePointerCapture(e.pointerId);
      }
    },
    [arrastando],
  );

  return (
    <div className="relative mt-12">
      <ol
        ref={trilho}
        onScroll={medir}
        onPointerDown={comecarArrasto}
        onPointerMove={arrastar}
        onPointerUp={soltarArrasto}
        onPointerCancel={soltarArrasto}
        tabIndex={0}
        role="region"
        aria-label="Módulos do curso"
        // Enquanto arrasta: sem encaixe, senão o `scroll-snap` puxa o trilho de
        // volta a cada pixel e o gesto vira um cabo de guerra; sem rolagem
        // suave, que atrasaria a imagem em relação ao ponteiro; e sem seleção
        // de texto, que deixaria os cartões azuis no caminho.
        className={`trilho-modulos flex gap-5 overflow-x-auto pb-2 outline-hidden focus-visible:ring-2 focus-visible:ring-[#ffc781]/60 ${
          arrastando
            ? "cursor-grabbing select-none"
            : "cursor-grab snap-x snap-mandatory scroll-smooth"
        }`}
      >
        {MODULOS.map((m) => (
          <li
            key={m.imagem}
            className="w-[15rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 transition hover:border-[#ffc781] sm:w-[17rem] lg:w-[19rem]"
          >
            {/* 9:16, que é a proporção em que as artes foram feitas: assim elas
                entram inteiras, sem o `cover` cortar o título que está impresso
                no pé de cada uma. */}
            <div className="relative aspect-9/16">
              <Image
                src={m.imagem}
                alt={m.alt}
                fill
                sizes="(min-width: 1024px) 19rem, (min-width: 640px) 17rem, 15rem"
                className="object-cover"
              />
            </div>
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
