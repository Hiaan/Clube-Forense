"use client";

// Fundo de constelação da abertura: pontos à deriva no preto, ligados por
// linhas quando ficam perto, atraídos pelo ponteiro do mouse.
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
const AMBAR = "255, 205, 7";
/**
 * Parte dos pontos é branca. Só âmbar, a malha vira um véu monocromático e
 * some no fundo; o branco cria os poucos pontos de brilho que dão profundidade.
 */
const BRANCO = "255, 255, 255";
const PROPORCAO_BRANCOS = 0.35;

/** Distância máxima para ligar dois pontos, e para o ponteiro atrair. */
const DIST_LIGACAO = 130;
const DIST_PONTEIRO = 175;

/**
 * Atração pelo ponteiro. A força entra numa velocidade SEPARADA da deriva
 * base, que decai a cada quadro: assim o ponto é puxado enquanto o mouse está
 * perto e volta a vagar sozinho quando ele sai, em vez de acelerar para sempre
 * ou de parar de vez por causa do atrito.
 */
const RAIO_ATRACAO = 230;
const FORCA_ATRACAO = 0.05;
const DECAIMENTO = 0.9;

/**
 * Um ponto a cada N pixels de área, até um teto. A densidade constante evita
 * que a tela de um monitor grande vire uma malha fechada, e o teto segura o
 * custo do laço, que é quadrático no número de pontos.
 */
const AREA_POR_PONTO = 15_000;
const MAX_PONTOS = 120;

interface Ponto {
  x: number;
  y: number;
  /** Deriva base, constante — é ela que mantém o movimento sem o mouse. */
  vx: number;
  vy: number;
  /** Empurrão do ponteiro, somado à deriva e decaindo a cada quadro. */
  ax: number;
  ay: number;
  r: number;
  cor: string;
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

    function quantosPontos() {
      return Math.min(MAX_PONTOS, Math.round((largura * altura) / AREA_POR_PONTO));
    }

    function semear() {
      pontos = Array.from({ length: quantosPontos() }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        // Devagar de propósito: o fundo é ambiente, não deve competir com o
        // texto que está por cima.
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        ax: 0,
        ay: 0,
        r: 0.9 + Math.random() * 1.5,
        cor: Math.random() < PROPORCAO_BRANCOS ? BRANCO : AMBAR,
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
      if (Math.abs(quantosPontos() - pontos.length) > 6) {
        semear();
        return;
      }
      for (const p of pontos) {
        if (p.x > largura) p.x = Math.random() * largura;
        if (p.y > altura) p.y = Math.random() * altura;
      }
    }

    function desenhar() {
      ctx!.clearRect(0, 0, largura, altura);

      // As linhas primeiro, os pontos depois: assim nenhum traço corta um
      // ponto ao meio, e o brilho dos pontos fica por cima da malha.
      ctx!.lineWidth = 1;
      for (let i = 0; i < pontos.length; i++) {
        const a = pontos[i];

        for (let j = i + 1; j < pontos.length; j++) {
          const b = pontos[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > DIST_LIGACAO) continue;
          ctx!.strokeStyle = `rgba(${AMBAR}, ${0.2 * (1 - d / DIST_LIGACAO)})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }

        // O ponteiro é mais um nó, e liga mais forte que os pares entre si —
        // é o que faz o fundo parecer responder a quem está ali.
        const dm = Math.hypot(a.x - ponteiro.x, a.y - ponteiro.y);
        if (dm < DIST_PONTEIRO) {
          ctx!.strokeStyle = `rgba(${AMBAR}, ${0.42 * (1 - dm / DIST_PONTEIRO)})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(ponteiro.x, ponteiro.y);
          ctx!.stroke();
        }
      }

      // O halo é o que separa um ponto de um pixel sujo na tela. Sai caro em
      // canvas, então vale só para os pontos — são poucas dezenas.
      for (const p of pontos) {
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = `rgba(${p.cor}, 0.9)`;
        ctx!.fillStyle = `rgba(${p.cor}, ${p.cor === BRANCO ? 0.75 : 0.62})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.shadowBlur = 0;
    }

    function passo() {
      for (const p of pontos) {
        const dx = ponteiro.x - p.x;
        const dy = ponteiro.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < RAIO_ATRACAO && d > 1) {
          const f = (FORCA_ATRACAO * (1 - d / RAIO_ATRACAO)) / d;
          p.ax += dx * f;
          p.ay += dy * f;
        }
        p.ax *= DECAIMENTO;
        p.ay *= DECAIMENTO;

        p.x += p.vx + p.ax;
        p.y += p.vy + p.ay;

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
    <>
      {/* Luz âmbar difusa por trás de tudo. É CSS, e não canvas: é um degradê
          parado, e redesenhá-lo 60 vezes por segundo seria desperdício. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 22% 12%, rgba(255, 205, 7, 0.09), transparent 68%), " +
            "radial-gradient(55% 45% at 82% 62%, rgba(255, 150, 20, 0.05), transparent 70%)",
        }}
      />
      <canvas
        ref={ref}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </>
  );
}
