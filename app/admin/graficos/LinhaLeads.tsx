"use client";

// Cadastros por dia. Uma série só: sem legenda — o título já diz o que está
// plotado — e com marcador direto apenas no último ponto.

import { useState } from "react";

export interface PontoLeads {
  /** AAAA-MM-DD */
  dia: string;
  total: number;
}

const COR = "#a67c00"; // ouro escurecido: o ouro da marca não alcança 3:1 no branco

/**
 * O gráfico é desenhado duas vezes, em caixas diferentes, e o CSS escolhe qual
 * mostrar. Um SVG só, esticado pela largura, vira uma tira de 100px de altura
 * no celular — com os rótulos do eixo ilegíveis.
 */
const DESKTOP = { larg: 720, alt: 210, saltoRotulo: 2 };
const CELULAR = { larg: 360, alt: 260, saltoRotulo: 3 };

const L = 34; // margem esquerda: cabe o maior tique do eixo
const R = 26; // direita: cabe metade do rótulo "05/08" sem cortar
const T = 14;
const B = 26;

/** Topo do eixo: um número redondo, nunca abaixo de 4 para o gráfico vazio ter altura. */
function topo(maior: number): number {
  if (maior <= 4) return 4;
  const passo = maior <= 10 ? 2 : maior <= 40 ? 5 : 10;
  return Math.ceil(maior / passo) * passo;
}

function diaMes(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function Grafico({
  dados,
  caixa,
  ativo,
  onAtivo,
}: {
  dados: PontoLeads[];
  caixa: typeof DESKTOP;
  ativo: number | null;
  onAtivo: (i: number | null) => void;
}) {
  const { larg, alt, saltoRotulo } = caixa;
  const maxY = topo(Math.max(...dados.map((d) => d.total)));
  const passoX = dados.length > 1 ? (larg - L - R) / (dados.length - 1) : 0;
  const x = (i: number) => L + i * passoX;
  const y = (v: number) => T + (alt - T - B) * (1 - v / maxY);

  const linha = dados.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.total)}`).join(" ");
  const area = `${linha} L${x(dados.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ultimo = dados.length - 1;

  return (
    <svg
      viewBox={`0 0 ${larg} ${alt}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Cadastros por dia nos últimos ${dados.length} dias`}
      onPointerLeave={() => onAtivo(null)}
      onPointerMove={(e) => {
        const caixaTela = e.currentTarget.getBoundingClientRect();
        const px = ((e.clientX - caixaTela.left) / caixaTela.width) * larg;
        const i = Math.round((px - L) / (passoX || 1));
        onAtivo(Math.min(dados.length - 1, Math.max(0, i)));
      }}
    >
      {[0, maxY / 2, maxY].map((t) => (
        <g key={t}>
          <line x1={L} x2={larg - R} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth={1} />
          <text
            x={L - 8}
            y={y(t) + 4}
            textAnchor="end"
            className="fill-gray-400"
            style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
          >
            {t}
          </text>
        </g>
      ))}

      <path d={area} fill={COR} opacity={0.1} />
      <path
        d={linha}
        fill="none"
        stroke={COR}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx={x(ultimo)}
        cy={y(dados[ultimo].total)}
        r={4}
        fill={COR}
        stroke="#fff"
        strokeWidth={2}
      />

      {ativo !== null && (
        <>
          <line x1={x(ativo)} x2={x(ativo)} y1={T} y2={alt - B} stroke="#9ca3af" strokeWidth={1} />
          <circle
            cx={x(ativo)}
            cy={y(dados[ativo].total)}
            r={5}
            fill={COR}
            stroke="#fff"
            strokeWidth={2}
          />
        </>
      )}

      {dados.map((d, i) =>
        // Um rótulo a cada N — com 14 dias todos juntos eles se encostariam — e
        // o último sempre. Os regulares perto demais do último saem de cena, ou
        // "04/08" e "05/08" se sobrepõem.
        i === ultimo || (i % saltoRotulo === 0 && ultimo - i >= saltoRotulo) ? (
          <text
            key={d.dia}
            x={x(i)}
            y={alt - 8}
            textAnchor={i === ultimo ? "end" : "middle"}
            className="fill-gray-400"
            style={{ fontSize: 11 }}
          >
            {diaMes(d.dia)}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export default function LinhaLeads({ dados }: { dados: PontoLeads[] }) {
  const [ativo, setAtivo] = useState<number | null>(null);

  if (dados.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-400">Sem dados ainda.</p>;
  }

  const props = { dados, ativo, onAtivo: setAtivo };

  return (
    <div className="relative">
      <div className="sm:hidden">
        <Grafico {...props} caixa={CELULAR} />
      </div>
      <div className="hidden sm:block">
        <Grafico {...props} caixa={DESKTOP} />
      </div>

      {ativo !== null && (
        <div
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          {diaMes(dados[ativo].dia)} · {dados[ativo].total}{" "}
          {dados[ativo].total === 1 ? "cadastro" : "cadastros"}
        </div>
      )}
    </div>
  );
}
