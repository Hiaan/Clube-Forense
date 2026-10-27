"use client";

// A digital no clique: quem aperta um botão de compra deixa uma impressão
// digital amarela no ponto do clique, que aparece e some em menos de um
// segundo — o vestígio na cena, a assinatura da perícia.
//
// SÓ NOS BOTÕES DE COMPRA (links para a oferta e para o checkout, ou o que
// tiver `data-digital`). Em todo clique viraria ruído; aqui marca o gesto
// que importa. Só com mouse — no toque o dedo cobre o lugar da marca — e
// nunca para quem pediu ao sistema menos movimento.
//
// Não desenha nada no React: cria o elemento direto no corpo da página e o
// remove quando a animação termina. É efeito de um instante; passar por
// estado só faria a página re-renderizar a cada clique.

import { useEffect } from "react";

const ALVOS = 'a[href="#oferta"], a[href*="eduzz.com"], [data-digital]';

// Ícone "fingerprint" do Lucide (licença ISC), em traço.
const DIGITAL = `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>`;

/**
 * A tinta da digital conforme o fundo onde ela cai: escura sobre botão claro
 * (os de compra são amarelos, e digital amarela sumiria neles), amarela sobre
 * fundo escuro. O fundo é o do primeiro elemento, de dentro para fora, que
 * tenha cor de fundo de verdade.
 */
function fundoClaro(el: Element | null): boolean {
  for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
    const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
    if (!m) continue;
    const [r, g, b, a = "1"] = m;
    if (Number(a) < 0.5) continue;
    return 0.299 * Number(r) + 0.587 * Number(g) + 0.114 * Number(b) > 140;
  }
  return false;
}

export default function DigitalNoClique() {
  useEffect(() => {
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)");

    function aoClicar(e: PointerEvent) {
      if (e.pointerType !== "mouse" || calmo.matches) return;
      const alvo = e.target as Element | null;
      if (!alvo?.closest(ALVOS)) return;

      const marca = document.createElement("span");
      marca.className = fundoClaro(alvo) ? "digital-marca digital-marca--escura" : "digital-marca";
      marca.setAttribute("aria-hidden", "true");
      marca.style.left = `${e.clientX}px`;
      marca.style.top = `${e.clientY}px`;
      marca.innerHTML = DIGITAL;
      marca.addEventListener("animationend", () => marca.remove());
      document.body.appendChild(marca);
    }

    document.addEventListener("pointerdown", aoClicar);
    return () => document.removeEventListener("pointerdown", aoClicar);
  }, []);

  return null;
}
