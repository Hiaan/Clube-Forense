"use client";

// A barra que acompanha a rolagem, no rodapé.
//
// POR QUE ELA SÓ APARECE DEPOIS DO PRIMEIRO DOBRA. Enquanto a pessoa está no
// topo, o botão grande da capa já está na frente dela — a barra só repetiria o
// mesmo botão tapando o conteúdo. Ela entra quando a capa sai de vista, que é
// quando o botão deixa de existir na tela, e é também quando a pessoa já leu o
// bastante para o preço fazer sentido.
//
// NO CELULAR ELA É O BOTÃO. A página é longa; sem a barra, comprar exigiria
// rolar de volta. Com ela, a decisão está sempre a um toque — e o contador do
// lote fica junto, porque é ele que responde "preciso decidir agora?".

import { useEffect, useState } from "react";

import BotaoWhatsApp from "./BotaoWhatsApp";
import Contador from "./Contador";
import { useLote } from "./Contador";
import { LOTES } from "./oferta";

/** `aluno` troca o prazo do lote pela linha da página dos alunos. */
export default function BarraFixa({ aluno = false }: { aluno?: boolean }) {
  const { lote } = useLote();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const alvo = document.getElementById("capa");
    if (!alvo) return;
    // IntersectionObserver em vez de ouvir o scroll: o navegador avisa quando a
    // capa entra e sai, sem rodar código a cada pixel rolado. A troca de estado
    // acontece no aviso dele, e não durante o efeito — é o que o lint do
    // projeto cobra, e evita renderização em cascata na montagem.
    const observador = new IntersectionObserver(
      ([entrada]) => setVisivel(!entrada.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observador.observe(alvo);
    return () => observador.disconnect();
  }, []);

  const mostrado = lote ?? LOTES[0];

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
            <p className="truncate text-[11px] font-bold uppercase tracking-wider text-white/40">
              {aluno ? (
                "Oferta exclusiva para alunos"
              ) : (
                <>
                  {mostrado.nome} termina em <Contador compacto />
                </>
              )}
            </p>
            {/* SEM PREÇO AQUI. A barra acompanha a rolagem desde o fim da capa,
              então mostrar o valor nela seria entregar o preço logo no começo
              — exatamente o que a página decidiu não fazer. O que a barra
              carrega é o prazo e o caminho para a oferta. */}
            <p className="truncate text-sm font-bold text-white">
              Todos os editais autorizados
              <span className="ml-1.5 font-normal text-white/45">
                em um acesso só
              </span>
            </p>
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
