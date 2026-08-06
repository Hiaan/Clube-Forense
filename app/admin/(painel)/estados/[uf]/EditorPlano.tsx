"use client";

// Editor do plano de cargos e carreiras: uma tabela de classes que cresce e
// encolhe dentro do formulário do estado.
//
// As linhas viajam como JSON num campo escondido. Como campos soltos, cada
// linha viraria nomes numerados (classe0, subsidio0, classe1…), e remover a do
// meio exigiria renumerar tudo no navegador.

import { useState } from "react";

import type { ClassePlano } from "../../../../lib/planoRepo";

/** Ponto de partida de um plano novo: a carreira típica das perícias. */
const MODELO = ["7ª", "6ª", "5ª", "4ª", "3ª", "2ª", "1ª", "Especial"];

interface Linha {
  classe: string;
  /** Texto enquanto está sendo digitado; vira número na hora de salvar. */
  subsidio: string;
}

function paraTexto(v: number | null): string {
  if (v == null) return "";
  // Formato brasileiro na edição: é como o valor aparece no plano oficial.
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** "19.967,73" e "19967.73" viram 19967.73. Vazio vira null. */
export function paraNumero(texto: string): number | null {
  const limpo = texto.trim().replace(/\s|R\$/g, "");
  if (!limpo) return null;
  // Se tem vírgula, ela é o separador decimal e os pontos são de milhar.
  const normal = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  const n = Number(normal);
  return Number.isFinite(n) ? n : null;
}

const campo =
  "w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none " +
  "focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

export default function EditorPlano({ inicial }: { inicial: ClassePlano[] }) {
  const [linhas, setLinhas] = useState<Linha[]>(
    inicial.map((c) => ({ classe: c.classe, subsidio: paraTexto(c.subsidio) })),
  );

  const trocar = (i: number, parte: Partial<Linha>) =>
    setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, ...parte } : l)));

  const serializado = JSON.stringify(
    linhas
      .filter((l) => l.classe.trim())
      .map((l) => ({ classe: l.classe.trim(), subsidio: paraNumero(l.subsidio) })),
  );

  return (
    <div>
      <input type="hidden" name="planoClasses" value={serializado} />

      {linhas.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">Nenhuma classe cadastrada.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                setLinhas(MODELO.map((classe) => ({ classe, subsidio: "" })))
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Começar com 7ª até Especial
            </button>
            <button
              type="button"
              onClick={() => setLinhas([{ classe: "", subsidio: "" }])}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              Começar vazio
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Classe
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Subsídio (R$)
            </span>
            <span />

            {linhas.map((l, i) => (
              <div key={i} className="contents">
                <input
                  className={campo}
                  value={l.classe}
                  onChange={(e) => trocar(i, { classe: e.target.value })}
                  placeholder="1ª"
                  aria-label={`Classe da linha ${i + 1}`}
                />
                <input
                  className={campo}
                  value={l.subsidio}
                  onChange={(e) => trocar(i, { subsidio: e.target.value })}
                  placeholder="19.967,73"
                  inputMode="decimal"
                  aria-label={`Subsídio da linha ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setLinhas((ls) => ls.filter((_, j) => j !== i))}
                  className="rounded-lg px-2 text-sm text-gray-400 hover:bg-red-50 hover:text-red-700"
                  aria-label={`Remover a linha ${i + 1}`}
                  title="Remover"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setLinhas((ls) => [...ls, { classe: "", subsidio: "" }])}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              + Classe
            </button>
            <button
              type="button"
              onClick={() => setLinhas([])}
              className="text-xs font-semibold text-gray-400 hover:text-red-700"
            >
              Limpar plano
            </button>
          </div>

          <p className="mt-3 text-[11px] text-gray-400">
            A ordem das linhas é a ordem que aparece no site. Deixe o subsídio em
            branco quando o valor da classe não for público.
          </p>
        </>
      )}
    </div>
  );
}
