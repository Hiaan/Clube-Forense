"use client";

// A seção "A plataforma" da Black — a que veio pronta no pacote de 23/10/2026.
//
// O MARCADOR É ESTÁTICO E O COMPORTAMENTO MORA EM iniciar.ts. Título,
// subtítulo e a caixa da lista de aulas saem do servidor já no HTML, então o
// buscador lê a seção e quem chega vê o título antes de qualquer script. As
// abas e as telas são montadas pelo script da seção quando o componente entra
// na tela, e desmontadas quando sai.
//
// O estilo é o do pacote, inteiro sob a classe `.cf-pl` — não vaza para o
// resto da página. A única troca foi a fonte, que passa a ser a do site em vez
// da do sistema, para o título desta seção não destoar dos vizinhos.

import { useEffect, useRef } from "react";

import { iniciarPlataforma } from "./iniciar";
import "./plataforma.css";

export default function SecaoPlataforma() {
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!raiz.current) return;
    return iniciarPlataforma(raiz.current);
  }, []);

  return (
    <section ref={raiz} className="cf-pl" id="plataforma">
      <div className="wrap">
        <p className="nota">a plataforma</p>
        <h2>Feito por legistas para futuros legistas</h2>
        <p className="sub">
          Um curso criado por quem passou por esse exato caminho e conhece bem o
          percurso até a aprovação.
        </p>
        {/* Sem este aviso as abas passam por enfeite: quem chega pelo celular
            vê uma fileira de rótulos e rola a página sem tocar em nenhum. */}
        <p className="toque">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 11V5a2 2 0 0 1 4 0v6" />
            <path d="M13 10.5a2 2 0 0 1 4 0V12a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L4.8 16.5a2 2 0 0 1 3.2-2.4L9 15.5" />
          </svg>
          Toque nas abas para explorar a plataforma
        </p>
        <div
          className="abas"
          id="cf-pl-abas"
          role="tablist"
          aria-label="Recursos da plataforma"
        />
        <div id="cf-pl-painel" />
      </div>

      <dialog id="cf-pl-dlg" aria-labelledby="cf-pl-dlg-t">
        <div className="dl">
          <div className="dl-topo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="cf-pl-dlg-capa" alt="" />
            <div>
              <p>aulas da matéria</p>
              <h4 id="cf-pl-dlg-t" />
            </div>
            <button
              className="fechar"
              type="button"
              aria-label="Fechar"
              id="cf-pl-dlg-x"
            >
              ×
            </button>
          </div>
          <div className="dl-lista" id="cf-pl-dlg-lista" />
        </div>
      </dialog>
    </section>
  );
}
