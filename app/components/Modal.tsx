"use client";

// Pop-up escuro do site — o mesmo para o acesso, para a tabela de carreira e
// para a distribuição dos IMLs.
//
// Existe porque os três nasceram como conteúdo dentro do card do estado e o
// card não aguenta os três: a tabela de carreira sozinha empurrava a notícia
// para fora da tela. Tirar o conteúdo do fluxo e abrir por cima resolve sem
// esconder nada.

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  titulo,
  sobretitulo,
  rodape,
  aoFechar,
  children,
}: {
  titulo: string;
  /** Linha pequena e amarela acima do título. */
  sobretitulo?: string;
  rodape?: React.ReactNode;
  aoFechar: () => void;
  children: React.ReactNode;
}) {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);

    // Sem isto a página de trás rola junto quando o pop-up chega ao fim — no
    // celular é o bastante para a pessoa achar que o modal travou.
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    caixa.current?.focus();

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = rolagem;
    };
  }, [aoFechar]);

  // Vai para o fim do <body>, e não fica onde foi escrito.
  //
  // `position: fixed` e `z-50` não bastam: um ancestral com `position:
  // relative` e z-index próprio cria um contexto de empilhamento, e o z-50
  // passa a valer só DENTRO dele. Foi o que aconteceu quando o cabeçalho e o
  // radar ganharam `z-10` para ficar sobre o fundo de constelação — os dois
  // empatados, o radar vence por vir depois no DOM, e a tela de login, que
  // nasce dentro do cabeçalho, ficou ATRÁS do mapa: dava para ver o formulário,
  // mas o clique em "Entrar" era interceptado pelos botões do card do estado.
  //
  // No body o pop-up não depende de onde foi montado, o que vale para os três
  // que existem hoje e para qualquer outro depois.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={aoFechar}
      role="presentation"
    >
      <div
        ref={caixa}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#141418] p-6 shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {sobretitulo && (
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffcd07]">
                {sobretitulo}
              </p>
            )}
            <h2 className="mt-1 text-xl font-bold text-white">{titulo}</h2>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="-mr-1 -mt-1 shrink-0 rounded-lg px-2 py-1 text-xl leading-none text-gray-500 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        {children}

        {rodape}
      </div>
    </div>,
    document.body,
  );
}
