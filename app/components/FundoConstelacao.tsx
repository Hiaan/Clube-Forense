"use client";

// Fundo de constelação da abertura: pontos à deriva no preto, ligados por
// linhas quando ficam perto, e o ponteiro do mouse virando mais um nó.
//
// É desenho em canvas, e não CSS: as linhas dependem da distância entre pares
// de pontos, que muda a cada quadro. Em DOM seriam centenas de elementos
// recalculados 60 vezes por segundo.
//
// Três cuidados que não são detalhe:
//
//   - `pointer-events: none`. O mapa do Brasil fica por cima e cada estado é
//     clicável; um canvas cobrindo a seção inteira engoliria todos os cliques.
//   - Para de desenhar quando a aba sai de foco ou quando a seção sai da tela.
//     Sem isso a animação continua queimando bateria no celular enquanto a
//     pessoa lê o painel lá embaixo.
//   - Respeita `prefers-reduced-motion`: quem pediu menos movimento recebe um
//     quadro estático, não a tela vazia — o fundo continua fazendo seu papel.

import { useEffect, useRef } from "react";

/** Amarelo da marca (#ffcd07) em RGB, para compor a opacidade linha a linha. */
const COR = "255, 205, 7";

/** Distância máxima para ligar dois pontos, e para o ponteiro atrair. */
const DIST_LIGACAO = 130;
const DIST_PONTEIRO = 170;

/**
 * Um ponto a cada N pixels de área, até um teto. A densidade constante evita
 * que a tela de um monitor grande vire uma malha fechada, e o teto segura o
 * custo do laço, que é quadrático no número de pontos.
 */
const AREA_POR_PONTO = 17_000;
const MAX_PONTOS = 110;

interface Ponto {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export default function FundoConstelacao() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const alvo = canvas?.parentElement;
    if (!canvas || !alvo) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let largura = 0;
    let altura = 0;
    let pontos: Ponto[] = [];
    const ponteiro = { x: -9999, y: -9999 };
    let pedido = 0;
    let naTela = true;

    function semear() {
      const quantos = Math.min(
        MAX_PONTOS,
        Math.round((largura * altura) / AREA_POR_PONTO),
      );
      pontos = Array.from({ length: quantos }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        // Devagar de propósito: o fundo é ambiente, não deve competir com o
        // texto que está por cima.
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.8 + Math.random() * 1.4,
      }));
    }

    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = alvo!.clientWidth;
      altura = alvo!.clientHeight;
      canvas!.width = Math.round(largura * dpr);
      canvas!.height = Math.round(altura * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Só semeia de novo quando a área mudou o bastante para pedir outra
      // quantidade de pontos. A seção muda de altura toda vez que alguém abre
      // "Cargos e Carreiras" ou troca de estado no mapa, e resemear a cada uma
      // dessas fazia o fundo inteiro piscar e se reorganizar — um susto visual
      // causado por um clique que não tem nada a ver com ele.
      const alvoPontos = Math.min(
        MAX_PONTOS,
        Math.round((largura * altura) / AREA_POR_PONTO),
      );
      if (Math.abs(alvoPontos - pontos.length) > 6) {
        semear();
        return;
      }
      // Mantendo os pontos, os que ficaram fora da nova caixa voltam para dentro.
      for (const p of pontos) {
        if (p.x > largura) p.x = Math.random() * largura;
        if (p.y > altura) p.y = Math.random() * altura;
      }
    }

    function desenhar() {
      ctx!.clearRect(0, 0, largura, altura);

      // As linhas primeiro, os pontos depois: assim nenhum traço corta um
      // ponto ao meio.
      for (let i = 0; i < pontos.length; i++) {
        const a = pontos[i];

        for (let j = i + 1; j < pontos.length; j++) {
          const b = pontos[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d > DIST_LIGACAO) continue;
          ctx!.strokeStyle = `rgba(${COR}, ${0.16 * (1 - d / DIST_LIGACAO)})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }

        // O ponteiro é mais um nó, e liga mais forte que os pares entre si —
        // é o que faz o fundo parecer responder a quem está ali.
        const dxm = a.x - ponteiro.x;
        const dym = a.y - ponteiro.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < DIST_PONTEIRO) {
          ctx!.strokeStyle = `rgba(${COR}, ${0.34 * (1 - dm / DIST_PONTEIRO)})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(ponteiro.x, ponteiro.y);
          ctx!.stroke();
        }
      }

      for (const p of pontos) {
        ctx!.fillStyle = `rgba(${COR}, 0.55)`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function passo() {
      for (const p of pontos) {
        p.x += p.vx;
        p.y += p.vy;
        // Atravessa a borda e reaparece do outro lado: sem isso os pontos se
        // acumulariam nos cantos depois de alguns minutos.
        if (p.x < -10) p.x = largura + 10;
        if (p.x > largura + 10) p.x = -10;
        if (p.y < -10) p.y = altura + 10;
        if (p.y > altura + 10) p.y = -10;
      }
      desenhar();
      pedido = requestAnimationFrame(passo);
    }

    function tocar() {
      cancelAnimationFrame(pedido);
      if (semMovimento) {
        desenhar();
        return;
      }
      if (naTela && !document.hidden) pedido = requestAnimationFrame(passo);
    }

    medir();
    tocar();

    const aoMover = (e: PointerEvent) => {
      const caixa = alvo.getBoundingClientRect();
      ponteiro.x = e.clientX - caixa.left;
      ponteiro.y = e.clientY - caixa.top;
    };
    const aoSair = () => {
      ponteiro.x = -9999;
      ponteiro.y = -9999;
    };

    // No elemento, e não na janela: o ponteiro só interessa enquanto está sobre
    // esta seção.
    alvo.addEventListener("pointermove", aoMover);
    alvo.addEventListener("pointerleave", aoSair);
    document.addEventListener("visibilitychange", tocar);

    const observadorTamanho = new ResizeObserver(() => {
      medir();
      tocar();
    });
    observadorTamanho.observe(alvo);

    const observadorTela = new IntersectionObserver((entradas) => {
      naTela = entradas[0]?.isIntersecting ?? true;
      tocar();
    });
    observadorTela.observe(alvo);

    return () => {
      cancelAnimationFrame(pedido);
      alvo.removeEventListener("pointermove", aoMover);
      alvo.removeEventListener("pointerleave", aoSair);
      document.removeEventListener("visibilitychange", tocar);
      observadorTamanho.disconnect();
      observadorTela.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
