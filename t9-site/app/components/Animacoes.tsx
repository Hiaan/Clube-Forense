"use client";

import { useEffect } from "react";
import { CONFIG_IDIOMA, type Idioma } from "@/lib/i18n";

const moedaEm = (locale: string) => new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" });

function contar(el: HTMLElement) {
  const alvo = Number(el.dataset.contar);
  if (!Number.isFinite(alvo)) return;
  const moeda = moedaEm(el.dataset.locale ?? "pt-BR");
  const duracao = 1800;
  const inicio = performance.now();
  const passo = (agora: number) => {
    const t = Math.min(1, (agora - inicio) / duracao);
    const suave = 1 - Math.pow(1 - t, 4);
    el.textContent = moeda.format(alvo * suave);
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

/**
 * Um único observador para a página inteira: revela os elementos com
 * `data-reveal` e dispara os contadores com `data-contar` quando entram na tela.
 */
export default function Animacoes({ idioma }: { idioma: Idioma }) {
  // O layout raiz é único; o idioma da página é ajustado aqui.
  useEffect(() => {
    document.documentElement.lang = CONFIG_IDIOMA[idioma].html;
  }, [idioma]);

  useEffect(() => {
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const contadores = Array.from(document.querySelectorAll<HTMLElement>("[data-contar]"));
    if (!reduzido) contadores.forEach((el) => (el.textContent = moedaEm(el.dataset.locale ?? "pt-BR").format(0)));

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const el = entrada.target as HTMLElement;
          el.classList.add("visivel");
          if (el.dataset.contar && !reduzido) contar(el);
          observador.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    document.querySelectorAll("[data-reveal], [data-contar]").forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);

  return null;
}
