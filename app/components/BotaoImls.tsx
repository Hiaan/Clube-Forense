"use client";

// "Ver IMLs": onde ficam as unidades do estado.
//
// Abre em pop-up, e não dentro do card, porque é a resposta para "se eu passar,
// para onde posso ser lotado" — pergunta central para quem vai prestar, e ruído
// para todo o resto. Deixá-la aberta empurrava a notícia e os aprovados para
// fora da tela em todo estado com a lista preenchida.
//
// O mesmo botão serve ao mapa (fundo preto) e ao painel detalhado (fundo
// branco); só o tema muda.

import { useState } from "react";

import Modal from "./Modal";

/** Os IMLs do estado, como saem no site. */
export interface ImlsEstado {
  /**
   * Total informado no painel. Pode ser maior que a lista: dá para saber que o
   * estado tem 20 unidades e conhecer o endereço de 8.
   */
  total: number | null;
  /** Como a rede é organizada, escrito no painel. O que a lista não conta. */
  texto: string | null;
  /** De onde saiu, por extenso. Texto, e não link — é lei, portaria ou portal. */
  fonte: string | null;
  unidades: { cidade: string; nome: string | null }[];
}

const TEMAS = {
  escuro:
    "border border-white/15 text-white hover:bg-white/[0.08]",
  claro:
    "border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900",
} as const;

export default function BotaoImls({
  imls,
  estado,
  tema = "escuro",
}: {
  imls: ImlsEstado;
  /** Nome do estado, usado como sobretítulo do pop-up. */
  estado: string;
  tema?: keyof typeof TEMAS;
}) {
  const [aberto, setAberto] = useState(false);
  const total = imls.total ?? imls.unidades.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${TEMAS[tema]}`}
      >
        Ver IMLs
        <span className="text-[11px] font-medium opacity-60">({total})</span>
      </button>

      {aberto && (
        <Modal
          sobretitulo={estado}
          titulo="Distribuição dos IMLs"
          aoFechar={() => setAberto(false)}
        >
          <p className="mt-3 text-sm text-gray-400">
            {total} {total === 1 ? "unidade" : "unidades"} no estado.
          </p>

          {imls.texto && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-300">
              {imls.texto}
            </p>
          )}

          {imls.unidades.length > 0 && (
            <ul className="mt-4 flex flex-col divide-y divide-white/5 border-t border-white/10 pt-1">
              {imls.unidades.map((u, i) => (
                <li key={`${u.cidade}-${i}`} className="flex items-baseline gap-2 py-1.5">
                  <span className="text-sm text-gray-200">{u.cidade}</span>
                  {u.nome && <span className="text-[11px] text-gray-500">{u.nome}</span>}
                </li>
              ))}
            </ul>
          )}

          {/* Quando o total informado é maior que a lista, dizer isso é mais
              honesto do que deixar a pessoa achar que são só estas. */}
          {imls.total != null && imls.total > imls.unidades.length && (
            <p className="mt-3 text-[11px] text-gray-500">
              {imls.unidades.length} de {imls.total} unidades com cidade
              identificada.
            </p>
          )}

          {imls.fonte && (
            <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-gray-500">
              {imls.fonte}
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
