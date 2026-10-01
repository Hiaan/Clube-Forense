import type { CSSProperties } from "react";
import { IconeSubindo } from "./Icones";
import type { Dicionario } from "@/lib/dicionarios";
import { CONFIG_IDIOMA, moeda, type Idioma } from "@/lib/i18n";
import { Titulo } from "./ui";

const CARDS = [
  { valor: 286799.42, variacao: 0.124, classe: "lg:absolute lg:w-[340px] lg:top-[-6%] lg:left-[-4%] lg:-rotate-3", d: 0 },
  { valor: 528717.04, variacao: 0.087, classe: "lg:absolute lg:w-[340px] lg:top-[26%] lg:right-[-5%] lg:-rotate-2", d: 180 },
  { valor: 402318.18, variacao: 0.151, classe: "lg:absolute lg:w-[340px] lg:bottom-[-8%] lg:left-[12%] lg:-rotate-2", d: 360 },
];

// Gráfico ilustrativo do painel (eixo de 0 a 250 mil, de janeiro a junho; meses no dicionário).
const EIXO = [250, 200, 150, 100, 50, 0];
const SERIE_A = [60, 118, 104, 150, 132, 185];
const SERIE_B = [22, 34, 26, 40, 58, 96];

function pontos(serie: number[]) {
  return serie.map((v, i) => `${40 + i * 88},${210 - (v / 250) * 190}`).join(" ");
}

export default function Numeros({ t, idioma }: { t: Dicionario["numeros"]; idioma: Idioma }) {
  const percentual = new Intl.NumberFormat(CONFIG_IDIOMA[idioma].locale, { style: "percent", minimumFractionDigits: 1 });
  return (
    <section id="resultados" className="fundo-post relative overflow-hidden">
      <div className="faixa h-4 sm:h-6" aria-hidden="true" />
      <div className="brilho-canto -top-40 -left-40 opacity-70" aria-hidden="true" />

      <div className="container-t9 relative grid items-center gap-16 pt-20 pb-28 sm:pt-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:pb-40">
        <div>
          <p className="font-display text-sm font-extrabold tracking-[0.25em] text-[#ff5a63] uppercase" data-reveal>
            {t.eyebrow}
          </p>
          <Titulo className="mt-3">{t.titulo}</Titulo>
          <p className="mt-5 max-w-xl text-lg leading-relaxed font-light text-white/80 sm:text-xl" data-reveal>
            {t.texto}
          </p>
          <a href="#agendar" className="botao botao-vermelho mt-9 text-base" data-reveal>
            {t.cta}
          </a>
        </div>

        <div className="relative lg:py-16">
          {/* Painel de fundo */}
          <div className="card-claro relative hidden p-6 lg:block" data-reveal="zoom" aria-hidden="true">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-sm font-medium text-[#51607f]">{t.painel}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-5">
              <ul className="space-y-3">
                {["#3b82f6", "#f97316", "#10b981", "#ef4444", "#8b5cf6", "#0ea5e9", "#f59e0b"].map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: c }} />
                    <span className="h-2 flex-1 rounded-full bg-[#dfe4ef]" />
                  </li>
                ))}
              </ul>
              <svg viewBox="0 0 500 240" className="w-full">
                {EIXO.map((v, i) => (
                  <g key={v}>
                    <line x1="40" x2="490" y1={20 + i * 38} y2={20 + i * 38} stroke="#e6eaf2" />
                    <text x="0" y={24 + i * 38} fontSize="11" fill="#8792ab">
                      {v === 0 ? "0" : `${v}K`}
                    </text>
                  </g>
                ))}
                {t.meses.map((m, i) => (
                  <text key={m} x={40 + i * 88} y="236" fontSize="11" fill="#8792ab" textAnchor="middle">
                    {m}
                  </text>
                ))}
                <polyline points={pontos(SERIE_A)} fill="none" stroke="#f0525c" strokeWidth="2.5" />
                <polyline points={pontos(SERIE_B)} fill="none" stroke="#b05cf0" strokeWidth="2.5" />
                {SERIE_A.map((v, i) => (
                  <circle key={`a${i}`} cx={40 + i * 88} cy={210 - (v / 250) * 190} r="4" fill="#f0525c" />
                ))}
                {SERIE_B.map((v, i) => (
                  <circle key={`b${i}`} cx={40 + i * 88} cy={210 - (v / 250) * 190} r="4" fill="#b05cf0" />
                ))}
              </svg>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <span key={n} className="h-10 rounded-xl bg-[#eef1f7]" />
              ))}
            </div>
          </div>

          {/* Cards de valor gasto */}
          <div className="grid gap-5 sm:grid-cols-2 lg:block">
            {CARDS.map((c, i) => (
              <div
                key={c.valor}
                className={`card-claro px-6 py-5 sm:px-7 sm:py-6 ${c.classe} ${i === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                data-reveal
                style={{ "--d": `${c.d}ms` } as CSSProperties}
              >
                <p className="text-lg text-[#26324f]">{t.valorGasto}</p>
                <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#0f1b3d] tabular-nums sm:text-[2.35rem]">
                  <span data-contar={c.valor} data-locale={CONFIG_IDIOMA[idioma].locale}>
                    {moeda(c.valor, idioma)}
                  </span>
                </p>
                <p className="mt-2 flex items-center gap-1 font-display text-xl font-extrabold text-[#12a44a]">
                  <IconeSubindo className="h-5 w-5" />
                  {percentual.format(c.variacao)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
