"use client";

import { useMemo, useState } from "react";
import {
  type EstadoStatus,
  type Nivel,
  NIVEL_COR,
  NIVEL_LABEL,
  type Relatorio,
} from "./lib/tipos";

const ORDEM_FILTRO: { chave: Nivel | "todos"; rotulo: string }[] = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "edital", rotulo: NIVEL_LABEL.edital },
  { chave: "banca", rotulo: NIVEL_LABEL.banca },
  { chave: "previsto", rotulo: NIVEL_LABEL.previsto },
  { chave: "noticia", rotulo: NIVEL_LABEL.noticia },
  { chave: "sem", rotulo: NIVEL_LABEL.sem },
];

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Pill({ nivel }: { nivel: Nivel }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: NIVEL_COR[nivel] }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      {NIVEL_LABEL[nivel]}
    </span>
  );
}

function CartaoEstado({ estado }: { estado: EstadoStatus }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-[#ffcd07]">
            {estado.uf}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">{estado.nome}</h3>
            <p className="text-xs text-gray-500">
              Última menção: {formatarData(estado.ultimaMencao)}
            </p>
          </div>
        </div>
        <Pill nivel={estado.nivel} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Intensidade</span>
          <span>{estado.score}/100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${estado.score}%`, backgroundColor: NIVEL_COR[estado.nivel] }}
          />
        </div>
      </div>

      {estado.mencoes.length > 0 && (
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="mt-4 self-start text-sm font-medium text-gray-700 underline-offset-2 hover:underline"
        >
          {aberto ? "Ocultar" : `Ver ${estado.mencoes.length} menção(ões)`}
        </button>
      )}

      {aberto && (
        <ul className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {estado.mencoes.map((m, i) => (
            <li key={i} className="text-sm">
              <a
                href={m.link || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-900 hover:text-[#b8860b] hover:underline"
              >
                {m.titulo}
              </a>
              <p className="mt-0.5 text-xs text-gray-500">
                {m.fonte} · {formatarData(m.data)} · {NIVEL_LABEL[m.nivel]}
              </p>
            </li>
          ))}
        </ul>
      )}

      <a
        href={estado.diarioOficial}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-700"
      >
        Conferir no Diário Oficial ↗
      </a>
    </div>
  );
}

export default function PainelMonitor({ relatorio }: { relatorio: Relatorio }) {
  const [filtro, setFiltro] = useState<Nivel | "todos">("todos");
  const [busca, setBusca] = useState("");

  const estadosVisiveis = useMemo(() => {
    return relatorio.estados.filter((e) => {
      const passaFiltro = filtro === "todos" || e.nivel === filtro;
      const passaBusca =
        busca.trim() === "" ||
        e.nome.toLowerCase().includes(busca.toLowerCase()) ||
        e.uf.toLowerCase().includes(busca.toLowerCase());
      return passaFiltro && passaBusca;
    });
  }, [relatorio.estados, filtro, busca]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {ORDEM_FILTRO.map(({ chave, rotulo }) => {
            const ativo = filtro === chave;
            const contagem =
              chave === "todos"
                ? relatorio.estados.length
                : relatorio.resumo[chave];
            return (
              <button
                key={chave}
                type="button"
                onClick={() => setFiltro(chave)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  ativo
                    ? "border-gray-900 bg-gray-900 text-[#ffcd07]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                {rotulo} ({contagem})
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar estado…"
          className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-gray-900 sm:w-56"
        />
      </div>

      {estadosVisiveis.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          Nenhum estado encontrado para este filtro.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {estadosVisiveis.map((e) => (
            <CartaoEstado key={e.uf} estado={e} />
          ))}
        </div>
      )}
    </div>
  );
}
