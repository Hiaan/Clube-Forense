"use client";

// Botão para o edital do estado.
//
// Dois caminhos, nesta ordem de preferência:
//
// 1. PDF hospedado por nós — abre num pop-up aqui mesmo. É o caminho bom: a
//    pessoa lê o edital sem sair do mapa, e o arquivo continua de pé mesmo
//    quando a banca tira o dela do ar ou troca o endereço, que é o que mais
//    acontece entre a publicação e a prova.
// 2. Só o link — abre em outra aba, como sempre foi.
//
// O rótulo muda com o estágio do funil, e não com o campo preenchido no
// painel: enquanto o edital não sai, o documento que a pessoa estuda é o
// anterior, e chamar os dois de "o edital" confundiria.

import { useState } from "react";

import Modal from "./Modal";
import type { Nivel } from "../monitor/lib/tipos";

const TEMAS = {
  escuro: {
    // Publicado ganha o amarelo: quando o edital saiu, ele é a coisa mais
    // importante do card.
    publicado: "bg-[#ffcd07] text-gray-900 hover:brightness-95",
    anterior: "border border-white/15 text-white hover:bg-white/[0.08]",
  },
  claro: {
    publicado: "bg-gray-900 text-[#ffcd07] hover:bg-gray-800",
    anterior:
      "border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900",
  },
} as const;

const BASE =
  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition";

export default function BotaoEdital({
  url,
  pdfUrl,
  nivel,
  estado,
  tema = "escuro",
}: {
  /** Página oficial do edital. Pode faltar quando só subimos o PDF. */
  url?: string | null;
  /** PDF hospedado por nós. Quando existe, é ele que manda. */
  pdfUrl?: string | null;
  nivel: Nivel;
  estado: string;
  tema?: keyof typeof TEMAS;
}) {
  const [aberto, setAberto] = useState(false);

  const publicado = nivel === "edital";
  const rotulo = publicado ? "Ver edital" : "Ver último edital";
  const classe = `${BASE} ${TEMAS[tema][publicado ? "publicado" : "anterior"]}`;

  // Sem PDF, o botão é o link de sempre.
  if (!pdfUrl) {
    if (!url) return null;
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={classe}>
        {rotulo} ↗
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={classe}>
        {rotulo}
      </button>

      {aberto && (
        <Modal
          sobretitulo={estado}
          titulo={publicado ? "Edital" : "Último edital"}
          largura="larga"
          aoFechar={() => setAberto(false)}
          rodape={
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs">
              {/* Sempre visível, e não só quando o quadro acima falha: no
                  iPhone o PDF dentro de moldura mostra a primeira página e não
                  rola, e o navegador não avisa que é isso que está havendo.
                  Quem precisar ler inteiro acha a saída sem ter que adivinhar. */}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#ffcd07] hover:underline"
              >
                Abrir em tela cheia ↗
              </a>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-400 hover:text-white"
                >
                  Ver no site oficial ↗
                </a>
              )}
            </div>
          }
        >
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white">
            {/* Altura em vh, e não proporção de página: o que importa é caber
                na tela de quem lê, e A4 em retrato numa janela larga deixaria
                faixa branca dos dois lados sem ganhar uma linha de texto. */}
            <iframe
              src={pdfUrl}
              title={`Edital — ${estado}`}
              className="h-[70vh] w-full"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
