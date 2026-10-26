"use client";

// O mapa dos aprovados do Clube, interativo.
//
// É a arte "Por que escolher o Clube Forense?" do site antigo — o Brasil com
// os estados onde o Clube aprovou e um cartão por estado — refeita para a
// tela: em vez de oito cartões disputando espaço em volta do mapa, um painel
// ao lado mostra o estado em que a pessoa está passando o mouse.
//
// COMO REAGE:
//   - mouse num estado do mapa ou numa linha da lista → aquele estado acende,
//     os outros apagam, e o painel mostra os aprovados dele;
//   - mouse num aprovado → acende o(s) estado(s) dele no mapa (o Dr. Bruno
//     Viana, por exemplo, está em Goiás e na Polícia Federal);
//   - no celular não há "passar o mouse": o toque faz o mesmo papel.
// Nada abre janela: tudo acontece no lugar.
//
// A POLÍCIA FEDERAL NÃO VAI NO MAPA. O concurso é nacional, e os dados a
// guardam no DF só por conveniência (`orgao` em aprovados.ts). Pintar o DF
// diria que foram aprovados num concurso do Distrito Federal — então a PF
// aparece só na lista, marcada como nacional.

import { useState } from "react";

import { APROVADOS, type Aprovacao } from "../monitor/lib/aprovados";
import { ESTADO_POR_UF } from "../monitor/lib/estados";
import Avatar from "./Avatar";
import { MAPA_CENTROIDES, MAPA_PATHS, MAPA_VIEWBOX } from "./mapaBrasilPaths";

interface Grupo extends Aprovacao {
  uf: string;
  titulo: string;
  nacional: boolean;
}

const GRUPOS: Grupo[] = Object.entries(APROVADOS)
  .map(([uf, a]) => ({
    ...a,
    uf,
    titulo: a.orgao ?? ESTADO_POR_UF[uf]?.nome ?? uf,
    nacional: Boolean(a.orgao),
  }))
  .sort((a, b) => b.total - a.total);

const TOTAL = GRUPOS.reduce((s, g) => s + g.total, 0);

/** Todos os aprovados divulgados, sem repetir quem aparece em dois grupos. */
const PESSOAS = [...new Set(GRUPOS.flatMap((g) => g.nomes))];

/** Estados pintados no mapa: os que têm aprovados de concurso do próprio estado. */
const NO_MAPA = new Set(GRUPOS.filter((g) => !g.nacional).map((g) => g.uf));

/** Em que grupos (estado ou PF) uma pessoa aparece. */
function gruposDaPessoa(nome: string): string[] {
  return GRUPOS.filter((g) => g.nomes.includes(nome)).map((g) => g.uf);
}

export default function MapaAprovados() {
  // O estado em destaque fica até outro tomar o lugar — e só volta ao resumo
  // quando o mouse sai do componente inteiro. Assim dá para ir do mapa até o
  // painel sem ele trocar no caminho. No celular, o toque faz o mesmo papel.
  const [ativo, setAtivo] = useState<string | null>(null);
  // O aprovado sob o mouse, dentro do painel: acende o(s) estado(s) dele.
  const [pessoa, setPessoa] = useState<string | null>(null);

  const ufsAcesas = new Set(
    pessoa ? gruposDaPessoa(pessoa) : ativo ? [ativo] : [],
  );
  const algumAceso = ufsAcesas.size > 0;
  const grupo = GRUPOS.find((g) => g.uf === ativo) ?? null;

  const entrar = (uf: string) => {
    setAtivo(uf);
    setPessoa(null);
  };

  return (
    <div
      className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10"
      onMouseLeave={() => {
        setAtivo(null);
        setPessoa(null);
      }}
    >
      {/* ------------------------------------------------------------ mapa */}
      <div className="relative mx-auto w-full max-w-[560px]">
        <svg
          viewBox={MAPA_VIEWBOX}
          className="h-auto w-full"
          role="group"
          aria-label="Mapa dos aprovados do Clube Forense"
        >
          {Object.entries(MAPA_PATHS).map(([uf, d]) => {
            const temAprovado = NO_MAPA.has(uf);
            const aceso = ufsAcesas.has(uf);
            const fill = !temAprovado
              ? "#e5e7eb"
              : aceso || !algumAceso
                ? "#ffcd07"
                : "#fde68a";
            return (
              <path
                key={uf}
                d={d}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={2}
                strokeLinejoin="round"
                opacity={temAprovado && algumAceso && !aceso ? 0.55 : 1}
                onMouseEnter={temAprovado ? () => entrar(uf) : undefined}
                onClick={temAprovado ? () => entrar(uf) : undefined}
                className={`transition-[fill,opacity] duration-300 ${temAprovado ? "cursor-pointer" : ""}`}
              >
                {temAprovado && <title>{ESTADO_POR_UF[uf]?.nome ?? uf}</title>}
              </path>
            );
          })}

          {/* Contorno do estado aceso, por cima de todos. */}
          {[...ufsAcesas]
            .filter((uf) => NO_MAPA.has(uf))
            .map((uf) => (
              <path
                key={`contorno-${uf}`}
                d={MAPA_PATHS[uf]}
                fill="none"
                stroke="#111827"
                strokeWidth={3}
                strokeLinejoin="round"
                pointerEvents="none"
              />
            ))}

          {/* Os marcadores com o número de aprovados de cada estado. */}
          {GRUPOS.filter((g) => !g.nacional).map((g) => {
            const [x, y] = MAPA_CENTROIDES[g.uf];
            const aceso = ufsAcesas.has(g.uf);
            const apagado = algumAceso && !aceso;
            const r = aceso ? 38 : 30;
            return (
              <g
                key={`pino-${g.uf}`}
                transform={`translate(${x} ${y})`}
                onMouseEnter={() => entrar(g.uf)}
                onClick={() => entrar(g.uf)}
                className="cursor-pointer"
                opacity={apagado ? 0.45 : 1}
                style={{ transition: "opacity 300ms" }}
              >
                {aceso && (
                  <circle r={r + 10} fill="#111827" opacity={0.12}>
                    <animate
                      attributeName="r"
                      values={`${r + 4};${r + 16};${r + 4}`}
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  r={r}
                  fill="#111827"
                  stroke="#ffffff"
                  strokeWidth={4}
                  style={{ transition: "r 250ms" }}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffcd07"
                  fontSize={aceso ? 34 : 28}
                  fontWeight={900}
                  style={{ transition: "font-size 250ms" }}
                >
                  {g.total}
                </text>
              </g>
            );
          })}
        </svg>

        <p className="mt-2 text-center text-xs text-gray-400">
          Passe o mouse (ou toque) num estado para ver os aprovados
        </p>
      </div>

      {/* ----------------------------------------------------------- painel */}
      <div className="flex flex-col gap-4">
        {/* ALTURA FIXA NO COMPUTADOR: o painel do estado com mais nomes
            (Santa Catarina) é bem mais alto que o resumo. Com altura variável,
            a lista logo abaixo andaria a cada troca e o botão sairia de baixo
            do mouse. */}
        <div className="flex flex-col lg:min-h-[520px]">
          {grupo ? (
            <CartaoDoGrupo
              grupo={grupo}
              pessoa={pessoa}
              setPessoa={setPessoa}
            />
          ) : (
            <div className="flex flex-1 flex-col justify-center rounded-3xl bg-gray-900 p-6 text-center sm:p-7">
              <p className="text-5xl font-black text-[#ffcd07]">{TOTAL}</p>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.15em] text-white/70">
                aprovados do Clube
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Em {GRUPOS.length} concursos para médico legista desde 2024, com
                alunos nos primeiros lugares de todos eles.
              </p>
              {/* O mural de rostos: cada um que já foi divulgado. Passar o
                  mouse num rosto acende o estado dele no mapa. */}
              <ul className="mx-auto mt-6 flex max-w-sm flex-wrap justify-center gap-2">
                {PESSOAS.map((nome) => (
                  <li
                    key={nome}
                    title={nome}
                    onMouseEnter={() => setPessoa(nome)}
                    onMouseLeave={() => setPessoa(null)}
                    className={`rounded-full transition ${
                      pessoa === nome
                        ? "scale-110 ring-2 ring-[#ffcd07] ring-offset-2 ring-offset-gray-900"
                        : ""
                    }`}
                  >
                    <Avatar nome={nome} size={40} />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-white/40">
                {pessoa ?? "Passe o mouse num rosto ou num estado"}
              </p>
            </div>
          )}
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {GRUPOS.map((g) => {
            const aceso = ativo === g.uf;
            return (
              <li key={g.uf}>
                <button
                  type="button"
                  onMouseEnter={() => entrar(g.uf)}
                  onFocus={() => entrar(g.uf)}
                  onClick={() => entrar(g.uf)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                    aceso
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {g.titulo}
                    </span>
                    {g.nacional && (
                      <span
                        className={`block text-[10px] font-bold uppercase tracking-wider ${aceso ? "text-white/50" : "text-gray-400"}`}
                      >
                        concurso nacional
                      </span>
                    )}
                  </span>
                  <span
                    className={`shrink-0 text-base font-black ${aceso ? "text-[#ffcd07]" : "text-[#b38f00]"}`}
                  >
                    {g.total}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CartaoDoGrupo({
  grupo,
  pessoa,
  setPessoa,
}: {
  grupo: Grupo;
  pessoa: string | null;
  setPessoa: (nome: string | null) => void;
}) {
  return (
    <div className="flex-1 rounded-3xl bg-gray-900 p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcd07]">
            {grupo.nacional ? "concurso nacional" : "aprovados no estado"}
          </p>
          <p className="mt-1 text-2xl font-black leading-tight text-white">
            {grupo.titulo}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-4xl font-black leading-none text-[#ffcd07]">
            {grupo.total}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
            aprovados
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {grupo.destaques.map((d) => (
          <span
            key={d}
            className="rounded-full bg-[#ffcd07] px-2.5 py-1 text-[11px] font-black text-gray-900"
          >
            {d}
          </span>
        ))}
      </div>

      <ul
        className={`mt-5 grid gap-1.5 ${grupo.nomes.length > 5 ? "sm:grid-cols-2" : ""}`}
      >
        {grupo.nomes.map((nome) => {
          const aceso = pessoa === nome;
          return (
            <li
              key={nome}
              onMouseEnter={() => setPessoa(nome)}
              onMouseLeave={() => setPessoa(null)}
              className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition ${
                aceso ? "bg-white/10" : ""
              }`}
            >
              <span
                className={`rounded-full transition ${aceso ? "ring-2 ring-[#ffcd07] ring-offset-2 ring-offset-gray-900" : ""}`}
              >
                <Avatar nome={nome} size={34} />
              </span>
              <span
                className={`text-sm font-semibold transition ${aceso ? "text-[#ffcd07]" : "text-white/85"}`}
              >
                {nome}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
