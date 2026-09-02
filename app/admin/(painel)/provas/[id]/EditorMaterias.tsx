"use client";

// As matérias da prova: nome, faixa de questões e peso.
//
// A faixa é o que define o cartão-resposta que o candidato vê — "Medicina Legal,
// da 41 à 70" vira trinta questões numeradas na tela. Por isso o editor avisa
// quando duas matérias se sobrepõem ou quando sobra um buraco entre elas: os
// dois erros são invisíveis aqui e gritantes lá, onde a questão 40 simplesmente
// não existiria.

import { useState } from "react";

import type { MateriaProva } from "../../../../lib/ranking";

const campo =
  "w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none " +
  "focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

type Linha = { nome: string; questaoDe: string; questaoAte: string; peso: string };

function paraLinha(m: MateriaProva): Linha {
  return {
    nome: m.nome,
    questaoDe: String(m.questaoDe),
    questaoAte: String(m.questaoAte),
    peso: String(m.peso),
  };
}

/** Buracos e sobreposições na numeração. Lista vazia quando está tudo certo. */
function conferir(linhas: Linha[]): string[] {
  const faixas = linhas
    .map((l) => ({ nome: l.nome.trim(), de: Number(l.questaoDe), ate: Number(l.questaoAte) }))
    .filter((f) => f.nome && Number.isFinite(f.de) && Number.isFinite(f.ate))
    .sort((a, b) => a.de - b.de);

  const avisos: string[] = [];
  for (let i = 0; i < faixas.length; i++) {
    const f = faixas[i];
    if (f.ate < f.de) avisos.push(`${f.nome}: a última questão vem antes da primeira.`);
    const proxima = faixas[i + 1];
    if (!proxima) continue;
    if (proxima.de <= f.ate) {
      avisos.push(`${f.nome} e ${proxima.nome} dividem a questão ${proxima.de}.`);
    } else if (proxima.de > f.ate + 1) {
      const quantas = proxima.de - f.ate - 1;
      avisos.push(
        `Sobram ${quantas} questão(ões) sem matéria entre ${f.ate} e ${proxima.de}.`,
      );
    }
  }
  return avisos;
}

export default function EditorMaterias({ inicial }: { inicial: MateriaProva[] }) {
  const [linhas, setLinhas] = useState<Linha[]>(inicial.map(paraLinha));

  const trocar = (i: number, parte: Partial<Linha>) =>
    setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, ...parte } : l)));

  /** A próxima matéria começa onde a anterior parou — é o caso normal. */
  function acrescentar() {
    const ultima = linhas[linhas.length - 1];
    const inicio = ultima ? Number(ultima.questaoAte) + 1 : 1;
    const de = Number.isFinite(inicio) && inicio > 0 ? String(inicio) : "1";
    setLinhas((ls) => [...ls, { nome: "", questaoDe: de, questaoAte: de, peso: "1" }]);
  }

  const serializado = JSON.stringify(
    linhas
      .filter((l) => l.nome.trim())
      .map((l) => ({
        nome: l.nome.trim(),
        questaoDe: Number(l.questaoDe),
        questaoAte: Number(l.questaoAte),
        peso: Number(String(l.peso).replace(",", ".")) || 1,
      })),
  );

  const total = linhas.reduce((t, l) => {
    const n = Number(l.questaoAte) - Number(l.questaoDe) + 1;
    return t + (Number.isFinite(n) && n > 0 ? n : 0);
  }, 0);

  const avisos = conferir(linhas);

  return (
    <div>
      <input type="hidden" name="materias" value={serializado} />

      {linhas.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-500">Nenhuma matéria cadastrada.</p>
          <button
            type="button"
            onClick={acrescentar}
            className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            + Primeira matéria
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_78px_78px_78px_auto] gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Matéria
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Da questão
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Até
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Peso
            </span>
            <span />

            {linhas.map((l, i) => (
              <div key={i} className="contents">
                <input
                  className={campo}
                  value={l.nome}
                  onChange={(e) => trocar(i, { nome: e.target.value })}
                  placeholder="Medicina Legal"
                  aria-label={`Nome da matéria ${i + 1}`}
                />
                <input
                  className={campo}
                  type="number"
                  min={1}
                  value={l.questaoDe}
                  onChange={(e) => trocar(i, { questaoDe: e.target.value })}
                  aria-label={`Primeira questão da matéria ${i + 1}`}
                />
                <input
                  className={campo}
                  type="number"
                  min={1}
                  value={l.questaoAte}
                  onChange={(e) => trocar(i, { questaoAte: e.target.value })}
                  aria-label={`Última questão da matéria ${i + 1}`}
                />
                <input
                  className={campo}
                  inputMode="decimal"
                  value={l.peso}
                  onChange={(e) => trocar(i, { peso: e.target.value })}
                  aria-label={`Peso da matéria ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => setLinhas((ls) => ls.filter((_, j) => j !== i))}
                  className="rounded-lg px-2 text-sm text-gray-400 hover:bg-red-50 hover:text-red-700"
                  aria-label={`Remover a matéria ${i + 1}`}
                  title="Remover"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {avisos.length > 0 && (
            <ul className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {avisos.map((a) => (
                <li key={a}>⚠️ {a}</li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={acrescentar}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              + Matéria
            </button>
            <span className="text-xs text-gray-500">{total} questões no total</span>
          </div>
        </>
      )}
    </div>
  );
}
