"use client";

// Cabeçalho do site: a marca e os três caminhos que a pessoa pode querer daqui.
//
// O "Entrar" existe para quem já é aluno não precisar esbarrar no muro antes de
// ser convidado a entrar — antes, a única porta era clicar num estado bloqueado
// e esperar o pop-up aparecer. Depois de entrar ele some, porque não há mais
// nada para liberar.

import { useState } from "react";

import ModalAcesso from "./ModalAcesso";

const PLATAFORMA = "https://app.clubeforense.com.br";
const PREPARATORIO = "https://www.clubeforense.com.br/preparatorio";

const externo =
  "rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-gray-200 " +
  "transition hover:border-white/40 hover:text-white";

export default function Cabecalho({ liberado }: { liberado: boolean }) {
  const [entrando, setEntrando] = useState(false);

  return (
    <header className="relative z-10 pt-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
        <p className="text-lg font-black tracking-tight text-white">
          <span className="text-[#ffcd07]">Clube</span>Forense
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-2">
          <a href={PLATAFORMA} target="_blank" rel="noopener noreferrer" className={externo}>
            Plataforma do aluno ↗
          </a>
          <a
            href={PREPARATORIO}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#ffcd07] px-3.5 py-1.5 text-xs font-bold text-gray-900 transition hover:brightness-95"
          >
            Comprar preparatório
          </a>

          {liberado ? (
            <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500">
              ✓ Acesso liberado
            </span>
          ) : (
            <button type="button" onClick={() => setEntrando(true)} className={externo}>
              Entrar
            </button>
          )}
        </nav>
      </div>

      {entrando && (
        <ModalAcesso
          estado={null}
          uf={null}
          aoFechar={() => setEntrando(false)}
          // Recarregar é mais simples e mais confiável que remontar no cliente:
          // o servidor devolve a página inteira já liberada, mapa e painel.
          aoEntrar={() => window.location.reload()}
        />
      )}
    </header>
  );
}
