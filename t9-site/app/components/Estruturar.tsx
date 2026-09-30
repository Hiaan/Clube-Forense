import type { CSSProperties, ReactNode } from "react";
import { IconeBandeira, IconeDocumento, IconeEngrenagem, IconeEnviar, IconeLista, IconeLocal } from "./Icones";
import { Faixa, Subtitulo, Titulo } from "./ui";

type Ponto = {
  x: number;
  y: number;
  rotulo: string;
  icone: ReactNode;
  /** Onde fica o rótulo em relação ao ponto. */
  lado: "acima" | "abaixo";
  /** Deslocamento horizontal do rótulo, em px, para não encostar na linha. */
  dx?: number;
  extremo?: boolean;
};

// Coordenadas no viewBox 1000×380 — o trajeto passa exatamente por elas.
const PONTOS: Ponto[] = [
  { x: 60, y: 250, rotulo: "Hoje", icone: <IconeLocal />, lado: "acima", extremo: true },
  { x: 190, y: 300, rotulo: "Diagnóstico", icone: <IconeDocumento />, lado: "abaixo" },
  { x: 350, y: 190, rotulo: "Prioridades", icone: <IconeLista />, lado: "abaixo", dx: 46 },
  { x: 520, y: 118, rotulo: "Estrutura", icone: <IconeEngrenagem />, lado: "abaixo", dx: 20 },
  { x: 700, y: 100, rotulo: "Execução", icone: <IconeEnviar />, lado: "abaixo" },
  { x: 900, y: 50, rotulo: "Objetivo", icone: <IconeBandeira />, lado: "acima", extremo: true },
];

const TRAJETO =
  "M60,250 C110,285 150,305 190,300 C255,290 290,220 350,190 C410,160 460,126 520,118 C590,108 640,104 700,100 C780,94 850,70 900,50";

export default function Estruturar() {
  return (
    <section className="fundo-post relative overflow-hidden">
      <div className="brilho-canto -right-40 -bottom-40" aria-hidden="true" />
      <Faixa numero="2">Estruturar</Faixa>

      <div className="container-t9 relative pt-14 pb-24 sm:pt-20 sm:pb-32">
        <Titulo className="max-w-4xl">Desenhamos o caminho para sua empresa chegar mais longe.</Titulo>
        <Subtitulo>
          Identificamos o que está te impedindo de avançar e estruturamos tudo o que precisa ser criado, corrigido e
          otimizado.
        </Subtitulo>

        {/* Desktop: trajetória desenhada */}
        <div className="relative mt-16 hidden aspect-[1000/380] w-full md:block" data-reveal="zoom">
          <svg viewBox="0 0 1000 380" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="grad-trajeto" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#ff2d38" />
                <stop offset="0.85" stopColor="#ff2d38" />
                <stop offset="1" stopColor="#ff2d38" stopOpacity="0.2" />
              </linearGradient>
              <filter id="neon-trajeto" x="-10%" y="-50%" width="120%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              className="trajeto"
              pathLength={1}
              d={TRAJETO}
              fill="none"
              stroke="url(#grad-trajeto)"
              strokeWidth={4}
              strokeLinecap="round"
              filter="url(#neon-trajeto)"
            />
            {PONTOS.map((p, i) => (
              <g key={p.rotulo} className="ponto-trajeto" style={{ "--d": `${300 + i * 330}ms` } as CSSProperties}>
                {p.extremo ? (
                  <>
                    <circle cx={p.x} cy={p.y} r={22} fill="#ff2d38" opacity={0.25} />
                    <circle cx={p.x} cy={p.y} r={15} fill="#ff2d38" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
                    <circle cx={p.x} cy={p.y} r={7} fill="#fff" />
                  </>
                ) : (
                  <circle cx={p.x} cy={p.y} r={10} fill="#ff2d38" />
                )}
              </g>
            ))}
          </svg>

          {PONTOS.map((p, i) => (
            <div
              key={p.rotulo}
              className="ponto-trajeto absolute flex flex-col items-center gap-2 text-center"
              style={
                {
                  left: `${p.x / 10}%`,
                  top: `${(p.y / 380) * 100}%`,
                  transform: `translate(calc(-50% + ${p.dx ?? 0}px), ${p.lado === "acima" ? "calc(-100% - 30px)" : "26px"})`,
                  "--d": `${400 + i * 330}ms`,
                } as CSSProperties
              }
            >
              {p.extremo ? (
                <span className="font-display text-2xl font-extrabold lg:text-3xl">{p.rotulo}</span>
              ) : (
                <>
                  <span className="h-8 w-8 text-white/85 [&>svg]:h-full [&>svg]:w-full">{p.icone}</span>
                  <span className="text-lg font-light whitespace-nowrap text-white/90 lg:text-xl">{p.rotulo}</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Celular: a mesma trajetória em lista vertical */}
        <ol className="relative mt-12 space-y-7 pl-10 md:hidden">
          <span className="absolute top-3 bottom-3 left-[13px] w-[3px] rounded-full bg-gradient-to-b from-[#ff2d38] to-[#ff2d38]/20" aria-hidden="true" />
          {PONTOS.map((p, i) => (
            <li key={p.rotulo} className="relative flex items-center gap-4" data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties}>
              <span
                className={`absolute grid place-items-center rounded-full bg-[#ff2d38] ${
                  p.extremo ? "left-[-40px] h-[30px] w-[30px] border-[3px] border-white/40" : "left-[-34px] h-[18px] w-[18px]"
                }`}
                aria-hidden="true"
              >
                {p.extremo && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
              </span>
              <span className="h-7 w-7 text-white/80 [&>svg]:h-full [&>svg]:w-full">{p.icone}</span>
              <span className={p.extremo ? "font-display text-2xl font-extrabold" : "text-xl font-light"}>{p.rotulo}</span>
            </li>
          ))}
        </ol>

        <div
          className="mx-auto mt-16 max-w-2xl rounded-2xl border border-[#ff2d38]/35 bg-black/30 px-7 py-6 text-lg leading-relaxed font-light shadow-[0_20px_60px_-20px_rgba(255,30,40,0.35)] backdrop-blur-sm sm:text-xl"
          data-reveal
        >
          Sem aplicar nenhuma <strong className="font-bold">fórmula mágica</strong>. Nós{" "}
          <strong className="font-bold">desenvolvemos tudo do zero</strong>, pensando no seu{" "}
          <strong className="font-bold">negócio</strong>.
        </div>
      </div>
    </section>
  );
}
