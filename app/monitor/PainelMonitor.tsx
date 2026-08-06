"use client";

import { useMemo, useState } from "react";
import Avatar from "../components/Avatar";
import BancaLink from "../components/BancaLink";
import { APROVADOS } from "./lib/aprovados";
import {
  type EstadoStatus,
  type Nivel,
  NIVEL_COR,
  NIVEL_LABEL,
  NIVEL_TINTA,
  type Relatorio,
} from "./lib/tipos";

// Ordem do funil, do estágio mais avançado ao mais incipiente.
const ORDEM_FILTRO: { chave: Nivel | "todos"; rotulo: string }[] = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "edital", rotulo: NIVEL_LABEL.edital },
  { chave: "banca", rotulo: NIVEL_LABEL.banca },
  { chave: "comissao", rotulo: NIVEL_LABEL.comissao },
  { chave: "autorizado", rotulo: NIVEL_LABEL.autorizado },
  { chave: "solicitado", rotulo: NIVEL_LABEL.solicitado },
  { chave: "estudo", rotulo: NIVEL_LABEL.estudo },
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

/** Menções do Instagram têm a fonte prefixada por "Instagram" (ver coletor). */
function ehInstagram(fonte: string): boolean {
  return fonte.startsWith("Instagram");
}

function TagInstagram({ rotulo = "Instagram" }: { rotulo?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] px-2 py-0.5 text-[10px] font-semibold leading-none text-white">
      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-current" aria-hidden>
        <path d="M12 2c2.7 0 3 0 4.1.1 1 0 1.7.2 2.3.5.6.2 1.1.5 1.6 1s.8 1 1 1.6c.3.6.5 1.3.5 2.3.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1-.2 1.7-.5 2.3-.2.6-.5 1.1-1 1.6s-1 .8-1.6 1c-.6.3-1.3.5-2.3.5-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1 0-1.7-.2-2.3-.5-.6-.2-1.1-.5-1.6-1s-.8-1-1-1.6c-.3-.6-.5-1.3-.5-2.3C2 15 2 14.7 2 12s0-3 .1-4.1c0-1 .2-1.7.5-2.3.2-.6.5-1.1 1-1.6s1-.8 1.6-1c.6-.3 1.3-.5 2.3-.5C9 2 9.3 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.4 5.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" />
      </svg>
      {rotulo}
    </span>
  );
}

function Pill({ nivel }: { nivel: Nivel }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-black/10"
      style={{ backgroundColor: NIVEL_COR[nivel], color: NIVEL_TINTA[nivel] }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {NIVEL_LABEL[nivel]}
    </span>
  );
}

function CartaoEstado({ estado }: { estado: EstadoStatus }) {
  const [aberto, setAberto] = useState(false);
  const temInstagram = estado.mencoes.some((m) => ehInstagram(m.fonte));
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
        <div className="flex flex-col items-end gap-1.5">
          <Pill nivel={estado.nivel} />
          {temInstagram && <TagInstagram />}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Intensidade</span>
          <span>{estado.score}/100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full ring-1 ring-inset ring-black/10 transition-all"
            style={{ width: `${estado.score}%`, backgroundColor: NIVEL_COR[estado.nivel] }}
          />
        </div>
      </div>

      {estado.historico && (
        <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Último edital:</span>{" "}
            {estado.historico.ultimoEdital ?? "—"} ·{" "}
            <span className="font-semibold">Última prova:</span>{" "}
            {estado.historico.ultimaProva ?? "—"}
            {estado.historico.banca ? (
              <>
                {" · "}
                <BancaLink
                  nome={estado.historico.banca}
                  className="font-medium text-amber-700 hover:underline"
                />
              </>
            ) : null}
          </p>
          {estado.historico.obs && (
            <p className="mt-1 text-[11px] leading-snug text-gray-400">
              {estado.historico.obs}
            </p>
          )}
          <p className="mt-1 text-[10px] text-gray-400">Fonte: QConcursos</p>
        </div>
      )}

      {APROVADOS[estado.uf] && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="text-xs font-bold text-amber-700">
            🏆{" "}
            {APROVADOS[estado.uf].orgao
              ? `Aprovados na ${APROVADOS[estado.uf].orgao}`
              : `${APROVADOS[estado.uf].total} aprovados do Clube Forense`}
          </p>
          {APROVADOS[estado.uf].orgao && (
            <p className="text-[10px] text-amber-600/80">
              Concurso nacional, não do {estado.uf}
            </p>
          )}
          <p className="mt-1 text-[11px] font-semibold text-amber-600">
            {APROVADOS[estado.uf].destaques.join(" · ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1.5">
            {APROVADOS[estado.uf].nomes.map((n) => (
              <span key={n} className="flex items-center gap-1">
                <Avatar nome={n} size={22} />
                <span className="text-[11px] text-gray-600">{n}</span>
              </span>
            ))}
          </div>
        </div>
      )}

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
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                {ehInstagram(m.fonte) && <TagInstagram rotulo="IG" />}
                <span>
                  {m.fonte} · {formatarData(m.data)} · {NIVEL_LABEL[m.nivel]}
                </span>
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
  const [soInstagram, setSoInstagram] = useState(false);
  const [busca, setBusca] = useState("");

  const totalInstagram = useMemo(
    () =>
      relatorio.estados.filter((e) => e.mencoes.some((m) => ehInstagram(m.fonte)))
        .length,
    [relatorio.estados],
  );

  const estadosVisiveis = useMemo(() => {
    return relatorio.estados.filter((e) => {
      const passaFiltro = filtro === "todos" || e.nivel === filtro;
      const passaBusca =
        busca.trim() === "" ||
        e.nome.toLowerCase().includes(busca.toLowerCase()) ||
        e.uf.toLowerCase().includes(busca.toLowerCase());
      const passaInstagram =
        !soInstagram || e.mencoes.some((m) => ehInstagram(m.fonte));
      return passaFiltro && passaBusca && passaInstagram;
    });
  }, [relatorio.estados, filtro, busca, soInstagram]);

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
          <button
            type="button"
            onClick={() => setSoInstagram((v) => !v)}
            aria-pressed={soInstagram}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              soInstagram
                ? "border-transparent bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            Instagram ({totalInstagram})
          </button>
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
