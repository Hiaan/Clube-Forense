"use client";

// Botão de agendar preso ao pé da tela no celular.
//
// Só aparece quando o agendamento está fora da tela — dois botões iguais
// disputando o mesmo espaço só atrapalham.

import { useEffect, useState } from "react";

export default function BarraFixa() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const agendar = document.getElementById("agendar");
    if (!agendar) return;
    const observador = new IntersectionObserver(([e]) => setVisivel(!e.isIntersecting));
    observador.observe(agendar);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-preto/90 p-3 backdrop-blur transition-transform duration-300 md:hidden ${
        visivel ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visivel}
    >
      <a
        href="#agendar"
        tabIndex={visivel ? 0 : -1}
        className="flex items-center justify-between rounded-full bg-ouro px-6 py-3.5 text-sm font-black uppercase text-preto"
      >
        Agendar minha reunião <span aria-hidden>→</span>
      </a>
    </div>
  );
}
