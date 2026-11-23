"use client";

// O mapa de escolha: cada estado é um link para o preparatório dele.
//
// O mesmo desenho do mapa dos concursos (mapaBrasilPaths), com a mesma escala
// de cor por etapa, mas outra pergunta: lá é "em que pé está o concurso?",
// aqui é "para qual você vai estudar?". Passar o mouse (ou tocar) mostra o
// estado, a etapa e o preço; clicar leva à página do estado. A lista embaixo
// faz o mesmo para quem está no celular ou no teclado.

import Link from "next/link";
import { useState } from "react";

import { MAPA_CENTROIDES, MAPA_PATHS, MAPA_VIEWBOX } from "../components/mapaBrasilPaths";

export interface EstadoNoMapa {
  uf: string;
  nome: string;
  etapa: string;
  cor: string;
  tinta: string;
  href: string;
  /** Estado com edital publicado ou concurso andando: ganha destaque. */
  quente: boolean;
}

/** Estados pequenos demais para a sigla caber dentro. */
const SEM_SIGLA = new Set(["DF", "SE", "AL", "RJ", "ES", "RN", "PB"]);

export default function MapaEscolha({ estados }: { estados: EstadoNoMapa[] }) {
  const porUf = new Map(estados.map((e) => [e.uf, e]));
  const [foco, setFoco] = useState<string | null>(null);
  const atual = foco ? porUf.get(foco) : null;

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={MAPA_VIEWBOX}
          className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          role="group"
          aria-label="Mapa do Brasil: escolha o estado do seu concurso"
        >
          {Object.entries(MAPA_PATHS).map(([uf, d]) => {
            const e = porUf.get(uf);
            if (!e) return null;
            return (
              <Link
                key={uf}
                href={e.href}
                aria-label={`Preparatório ${e.nome} — ${e.etapa}`}
                onMouseEnter={() => setFoco(uf)}
                onMouseLeave={() => setFoco(null)}
                onFocus={() => setFoco(uf)}
                onBlur={() => setFoco(null)}
              >
                <path
                  d={d}
                  fill={e.cor}
                  stroke="#0b0b0d"
                  strokeWidth={2}
                  className="cursor-pointer outline-none transition-[filter] hover:brightness-125"
                />
              </Link>
            );
          })}
          {foco && MAPA_PATHS[foco] && (
            <path
              d={MAPA_PATHS[foco]}
              fill="none"
              stroke="#ffcd07"
              strokeWidth={5}
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}
          {Object.entries(MAPA_CENTROIDES).map(([uf, [x, y]]) => {
            const e = porUf.get(uf);
            if (!e || SEM_SIGLA.has(uf)) return null;
            return (
              <text
                key={uf}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={800}
                fill={e.tinta}
                pointerEvents="none"
                style={{ userSelect: "none" }}
              >
                {uf}
              </text>
            );
          })}
        </svg>

        {/* O cartão do estado em foco, por cima do mapa. Sem foco, a dica. */}
        <div className="pointer-events-none absolute right-0 top-0 w-60 sm:w-72">
          {atual ? (
            <div className="rounded-2xl border border-[#ffcd07]/40 bg-[#0b0b0d]/95 p-4 shadow-xl backdrop-blur">
              <p className="text-lg font-black text-white">{atual.nome}</p>
              <p
                className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ background: atual.cor, color: atual.tinta }}
              >
                {atual.etapa}
              </p>
              <p className="mt-2 text-sm text-white/70">
                Clique para ver o preparatório{" "}
                <span className="font-bold text-[#ffcd07]">→</span>
              </p>
            </div>
          ) : (
            <p className="rounded-xl bg-[#0b0b0d]/80 px-3 py-2 text-center text-xs font-semibold text-white/60 backdrop-blur sm:text-left">
              👆 Toque no estado do seu concurso
            </p>
          )}
        </div>
      </div>

      {/* A lista, para quem prefere escolher pelo nome. */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[...estados]
          .sort((a, b) => Number(b.quente) - Number(a.quente) || a.nome.localeCompare(b.nome))
          .map((e) => (
            <Link
              key={e.uf}
              href={e.href}
              onMouseEnter={() => setFoco(e.uf)}
              onMouseLeave={() => setFoco(null)}
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white/85 transition hover:border-[#ffcd07]/60 hover:bg-white/[0.08]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: e.cor }}
              />
              <span className="min-w-0 flex-1 truncate">{e.nome}</span>
              <span className="text-[#ffcd07] opacity-0 transition group-hover:opacity-100">
                →
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}
