"use client";

// A barra de compra no rodapé, e o botão do WhatsApp junto dela.
//
// Entra quando a capa sai de vista, como a da Black: no topo o botão grande já
// está na frente da pessoa. Depois disso, no celular, é o atalho para a oferta
// sem rolar a página de volta.

import { useEffect, useState } from "react";

import BotaoWhatsApp from "../black/BotaoWhatsApp";

export default function BarraCompra({
  linha,
  sublinha,
}: {
  linha: string;
  sublinha: string;
}) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const alvo = document.getElementById("capa");
    if (!alvo) return;
    const observador = new IntersectionObserver(
      ([entrada]) => setVisivel(!entrada.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observador.observe(alvo);
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <BotaoWhatsApp elevado={visivel} />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0b0d]/95 backdrop-blur transition-transform duration-300 ${
          visivel ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold uppercase tracking-wider text-[#ffcd07]">
              {linha}
            </p>
            <p className="truncate text-sm font-bold text-white">{sublinha}</p>
          </div>
          <a
            href="#oferta"
            className="shrink-0 rounded-xl bg-[#ffcd07] px-5 py-3 text-sm font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110"
          >
            Garantir vaga
          </a>
        </div>
      </div>
    </>
  );
}
