"use client";

// Escolher o estado por lista, e não só pelo mapa.
//
// O mapa continua sendo a porta principal, mas no celular ele mede 358×326 e
// oito estados ficam abaixo do alvo mínimo de toque (44×44): o Distrito Federal
// tem 7×4 pixels, Sergipe 13×15, Alagoas 22×12. Aumentar o mapa não resolve —
// o DF é pequeno EM RELAÇÃO ao Brasil, e dobrar a escala levaria o toque dele a
// 14×8, ainda inutilizável, com o mapa ocupando duas telas.
//
// Serve também a quem navega por teclado, que hoje precisa passar por 27 `path`
// de SVG para chegar ao seu estado, sem lista e sem busca.
//
// Reaproveita o pop-up dos IMLs e do plano em vez de inventar um dropdown: ele
// já sai no fim do <body>, já fecha no Esc e já trava a rolagem do fundo — que
// é exatamente onde dropdown caseiro costuma quebrar.

import { useMemo, useState } from "react";

import Modal from "./Modal";
import { NIVEL_COR, NIVEL_LABEL, type Nivel } from "../monitor/lib/tipos";

export interface OpcaoEstado {
  uf: string;
  nome: string;
  nivel: Nivel;
}

/** "Rondônia" casa com "rondonia" — ninguém digita acento no celular. */
function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default function SeletorEstado({
  estados,
  ufSelecionada,
  aoEscolher,
}: {
  /** Já vem do servidor ordenado por proximidade do edital. */
  estados: OpcaoEstado[];
  ufSelecionada: string;
  aoEscolher: (uf: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [porNome, setPorNome] = useState(false);

  const atual = estados.find((e) => e.uf === ufSelecionada) ?? estados[0];

  const visiveis = useMemo(() => {
    const alvo = normalizar(busca.trim());
    const lista = alvo
      ? estados.filter(
          (e) => normalizar(e.nome).includes(alvo) || normalizar(e.uf) === alvo,
        )
      : estados;
    return porNome ? [...lista].sort((a, b) => a.nome.localeCompare(b.nome)) : lista;
  }, [estados, busca, porNome]);

  function escolher(uf: string) {
    setAberto(false);
    setBusca("");
    aoEscolher(uf);
  }

  if (!atual) return null;

  const pilula = (ativa: boolean) =>
    `rounded-full px-3 py-1 text-[11px] font-semibold transition ${
      ativa
        ? "bg-[#ffcd07] text-gray-900"
        : "border border-white/15 text-gray-400 hover:text-white"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#121215] px-4 py-3.5 text-left transition hover:border-white/25"
      >
        <span
          aria-hidden
          className="h-3 w-3 shrink-0 rounded-full"
          style={{
            backgroundColor: NIVEL_COR[atual.nivel],
            boxShadow: `0 0 10px ${NIVEL_COR[atual.nivel]}66`,
          }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold leading-tight text-white">
            {atual.nome}
          </span>
          <span className="mt-0.5 block text-xs text-gray-400">
            {NIVEL_LABEL[atual.nivel]}
          </span>
        </span>
        <span className="shrink-0 text-xs font-bold text-[#ffcd07]">Trocar ▾</span>
      </button>

      {aberto && (
        <Modal
          sobretitulo="Radar"
          titulo="Escolha o estado"
          aoFechar={() => {
            setAberto(false);
            setBusca("");
          }}
        >
          <input
            type="search"
            autoFocus
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar estado…"
            aria-label="Buscar estado"
            className="mt-4 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#ffcd07]"
          />

          <div className="mt-3 flex gap-1.5">
            <button type="button" onClick={() => setPorNome(false)} className={pilula(!porNome)}>
              Mais perto do edital
            </button>
            <button type="button" onClick={() => setPorNome(true)} className={pilula(porNome)}>
              A–Z
            </button>
          </div>

          {visiveis.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Nenhum estado com esse nome.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-white/5">
              {visiveis.map((e) => {
                const escolhido = e.uf === atual.uf;
                return (
                  <li key={e.uf}>
                    <button
                      type="button"
                      onClick={() => escolher(e.uf)}
                      aria-current={escolhido ? "true" : undefined}
                      className="flex w-full items-center gap-2.5 py-2.5 text-left transition hover:opacity-80"
                    >
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          // A cor canônica da escala, e não a que o mapa usa:
                          // lá o "sem novidades" é escurecido para recuar no
                          // preto, e aqui isso o deixaria invisível.
                          backgroundColor: NIVEL_COR[e.nivel],
                          // Mas ele não pode ser o ponto MAIS claro da lista —
                          // seria o inverso do que a escala diz. Apagado, e não
                          // escurecido: continua visível, sem chamar atenção.
                          opacity: e.nivel === "sem" ? 0.4 : 1,
                        }}
                      />
                      <span
                        className={`flex-1 text-sm ${
                          escolhido ? "font-bold text-white" : "text-gray-200"
                        }`}
                      >
                        {e.nome}
                      </span>
                      <span className="shrink-0 text-[11px] text-gray-500">
                        {NIVEL_LABEL[e.nivel]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Modal>
      )}
    </>
  );
}
