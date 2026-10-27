"use client";

// A fita de isolamento no topo da tela, que estica conforme a página rola.
//
// É a parte da ideia da "fita zebrada" que aparece para todo mundo: a barra de
// rolagem desenhada (globals.css) só existe no computador, e esta fita
// aparece também no celular e no Firefox.
//
// O tamanho é escrito direto no estilo do elemento, uma vez por quadro de
// animação, e não em estado do React: re-renderizar a cada pixel rolado seria
// trabalho à toa para mudar uma única propriedade.

import { useEffect, useRef } from "react";

export default function FitaDeProgresso() {
  const fita = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const el = fita.current;
      if (!el) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const pedir = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1.5">
      <div ref={fita} className="fita-progresso h-full w-full" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
