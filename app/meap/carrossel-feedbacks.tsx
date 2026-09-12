"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Feedback } from "./conteudo";

/**
 * Carrossel 3D dos feedbacks — o cartão do meio fica de frente, os vizinhos
 * ficam girados e recuados em perspectiva, tipo capa de álbum (coverflow).
 * Arrasta com o dedo ou o mouse para girar; solta e o cartão mais perto do
 * centro assume.
 *
 * Ao contrário do carrossel dos módulos, aqui não dá para usar `scroll-snap`:
 * o efeito de profundidade pede que cada cartão receba uma rotação e uma
 * translação em Z calculadas pela distância até o centro, e isso só se
 * consegue aplicando `transform` cartão por cartão — não com a rolagem nativa
 * do navegador. Por isso o arrasto inteiro é feito na mão, com Pointer
 * Events, e funciona igual para mouse, toque e caneta (não só mouse, como no
 * carrossel dos módulos): aqui não existe rolagem nativa para o toque cair de
 * volta caso eu deixasse passar.
 */
export function CarrosselFeedbacks({ itens }: { itens: Feedback[] }) {
  const [indice, setIndice] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const gesto = useRef({ x: 0, ativo: false });
  const trilhoRef = useRef<HTMLDivElement>(null);
  // Distância, em px, entre o centro de um cartão e o do próximo. Sai de uma
  // fração da largura do próprio carrossel, medida de verdade em vez de
  // chutada, para acompanhar sozinha a troca de largura entre telas.
  const [passo, setPasso] = useState(240);

  useEffect(() => {
    const medir = () => {
      const largura = trilhoRef.current?.getBoundingClientRect().width;
      if (largura) setPasso(largura * 0.34);
    };
    medir();
    const el = trilhoRef.current;
    if (!el) return;
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const irPara = useCallback(
    (i: number) => {
      setIndice(Math.min(Math.max(i, 0), itens.length - 1));
    },
    [itens.length],
  );

  const comecarArrasto = (e: React.PointerEvent<HTMLDivElement>) => {
    gesto.current = { x: e.clientX, ativo: true };
    setArrastando(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const arrastar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!gesto.current.ativo) return;
    setDeltaX(e.clientX - gesto.current.x);
  };

  const soltarArrasto = () => {
    if (!gesto.current.ativo) return;
    gesto.current.ativo = false;
    setArrastando(false);
    // Arrastar para a esquerda (deltaX negativo) avança para o próximo
    // cartão — é o sentido natural de folhear uma galeria de fotos.
    irPara(indice + Math.round(-deltaX / passo));
    setDeltaX(0);
  };

  // Posição contínua (fracionária durante o arrasto), para os cartões
  // seguirem o dedo em vez de só pularem quando solta.
  const posicao = indice - deltaX / passo;

  return (
    <div className="mx-auto mt-12 w-full max-w-4xl">
      <div
        ref={trilhoRef}
        onPointerDown={comecarArrasto}
        onPointerMove={arrastar}
        onPointerUp={soltarArrasto}
        onPointerCancel={soltarArrasto}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") irPara(indice - 1);
          if (e.key === "ArrowRight") irPara(indice + 1);
        }}
        role="region"
        aria-label="Feedbacks de alunos e clientes"
        tabIndex={0}
        // `touch-pan-y`: a rolagem vertical da página continua livre; só o
        // gesto horizontal, que aqui não tem rolagem nativa nenhuma por trás,
        // fica por conta do JavaScript acima.
        // `overflow-hidden`: em telas estreitas os cartões vizinhos, girados
        // em perspectiva, chegam a se projetar para fora da largura da seção
        // — sem isto, a página inteira ganha rolagem horizontal.
        className={`trilho-feedbacks relative h-[27rem] touch-pan-y select-none overflow-hidden outline-hidden focus-visible:ring-2 focus-visible:ring-[#ffc781]/60 sm:h-[31rem] ${
          arrastando ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ perspective: "1600px" }}
      >
        {itens.map((item, i) => {
          const relativo = i - posicao;
          const distancia = Math.abs(relativo);

          // Passado ~2,5 cartões de distância o item nem aparece — sem isso o
          // navegador continua desenhando (e a imagem carregando) fora de
          // vista, à toa.
          if (distancia > 2.6) return null;

          const rotacao = Math.max(Math.min(relativo * -28, 28), -28);
          const escala = 1 - Math.min(distancia, 1) * 0.22;
          const opacidade = Math.max(1 - Math.max(distancia - 1, 0) * 0.55, 0);
          const central = i === indice && !arrastando;

          return (
            <div
              key={i}
              onClick={() => !arrastando && i !== indice && irPara(i)}
              className={`absolute left-1/2 top-1/2 w-56 sm:w-64 ${
                arrastando ? "" : "transition-[transform,opacity] duration-300 ease-out"
              }`}
              style={{
                // O centralizar (-50%, -50%) precisa estar dentro desta mesma
                // string: um `transform` em `style` substitui por completo
                // qualquer `transform` vindo de classe, então não dá para
                // deixar a centralização numa utility do Tailwind à parte.
                transform: `translate(-50%, -50%) translateX(${relativo * passo}px) translateZ(${-distancia * 90}px) rotateY(${rotacao}deg) scale(${escala})`,
                opacity: opacidade,
                zIndex: 100 - Math.round(distancia * 10),
                cursor: i === indice ? "default" : "pointer",
              }}
            >
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
                {/* `object-contain`, não `cover`: isto é print de comentário e
                    de conversa, não foto — cortar a borda cortaria texto. A
                    proporção 3/4 só existe para dar um box previsível; o que
                    sobrar de vazio nas pontas assume o fundo escuro do
                    cartão. */}
                <div className="relative aspect-3/4 bg-[#0b1220]">
                  {item.tipo === "video" ? (
                    // Sem <track>: é depoimento espontâneo, sem roteiro para
                    // legendar. Os controles nativos já dão play/pausa/volume.
                    <video
                      src={item.src}
                      poster={item.poster}
                      controls={central}
                      muted
                      playsInline
                      draggable={false}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      draggable={false}
                      sizes="(min-width: 640px) 16rem, 14rem"
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bolinhas indicam quantos são e qual está na frente — o giro em
          perspectiva sozinho não deixa isso óbvio para quem acabou de chegar
          na seção. */}
      <div className="mt-6 flex justify-center gap-2">
        {itens.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir para o feedback ${i + 1}`}
            onClick={() => irPara(i)}
            className={`h-2 rounded-full transition-all ${
              i === indice ? "w-6 bg-[#ffc781]" : "w-2 bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
