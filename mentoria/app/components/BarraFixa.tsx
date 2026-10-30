"use client";

// Botão de agendar preso ao pé da tela no celular.
//
// Aparece depois que o botão do topo some e sai de cena quando o formulário
// entra na tela — dois botões iguais disputando o mesmo espaço só atrapalham.

import { useEffect, useState } from "react";

export default function BarraFixa() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const topo = document.getElementById("topo");
    const agendar = document.getElementById("agendar");
    if (!topo || !agendar) return;

    let passouDoTopo = false;
    let noFormulario = false;
    const atualizar = () => setVisivel(passouDoTopo && !noFormulario);

    const observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.target === topo) passouDoTopo = !e.isIntersecting;
        if (e.target === agendar) noFormulario = e.isIntersecting;
      }
      atualizar();
    });
    observador.observe(topo);
    observador.observe(agendar);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-tinta/95 p-3 backdrop-blur transition-transform duration-300 md:hidden ${
        visivel ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visivel}
    >
      <a
        href="#agendar"
        tabIndex={visivel ? 0 : -1}
        className="flex items-center justify-between bg-latao px-5 py-3.5 font-medium text-tinta"
      >
        Agendar minha reunião <span aria-hidden>→</span>
      </a>
    </div>
  );
}
