// Retrato da capa montado como uma prancha pericial: o Miguel recortado sobre
// um fundo quadriculado, um crânio em vista lateral com as estruturas
// numeradas, a etiqueta de uma amostra e o nome com os registros no rodapé.
//
// Tudo é desenhado em SVG e CSS por cima de uma única foto recortada: não há
// imagem de fundo para baixar, e o texto continua selecionável e nítido em
// qualquer tamanho de tela.

import Image from "next/image";

import fotoRecorte from "../../public/fotos/miguel-recorte.webp";

/** Registros profissionais; trocar pelos números reais. */
const CRM = "CRM-PE 00000";
const RQE = "RQE 0000";

const LEGENDA = ["Osso frontal", "Osso parietal", "Osso temporal", "Arco zigomático", "Mandíbula"];

function Cranio() {
  const traco = "rgba(203,219,236,0.75)";
  const fino = "rgba(203,219,236,0.4)";
  const chamada = "rgba(203,219,236,0.55)";
  return (
    <svg viewBox="0 0 330 290" className="w-full" fill="none" aria-hidden>
      {/* Contorno do crânio */}
      <path
        d="M78 128 C66 76 116 32 182 32 C252 32 300 84 296 140 C294 170 278 190 252 200 L232 202"
        stroke={traco}
        strokeWidth="1.6"
      />
      {/* Face: nasal, maxila */}
      <path d="M78 128 C72 136 64 142 60 150 L68 152 L58 172 C56 182 58 190 64 196" stroke={traco} strokeWidth="1.6" />
      {/* Órbita */}
      <ellipse cx="100" cy="142" rx="20" ry="17" stroke={traco} strokeWidth="1.4" />
      <ellipse cx="102" cy="144" rx="12" ry="10" stroke={fino} />
      {/* Arco zigomático */}
      <path d="M104 166 C126 172 160 172 190 168" stroke={traco} strokeWidth="1.4" />
      <path d="M108 176 C134 180 164 180 192 176" stroke={fino} />
      {/* Meato acústico e mastoide */}
      <circle cx="210" cy="178" r="6" stroke={traco} strokeWidth="1.3" />
      <path d="M222 188 C226 200 222 210 214 212" stroke={traco} strokeWidth="1.3" />
      {/* Dentes */}
      <path d="M64 196 L118 200" stroke={traco} strokeWidth="1.2" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${68 + i * 6.5} 189 L${67 + i * 6.5} 211`} stroke={fino} />
      ))}
      {/* Mandíbula */}
      <path
        d="M66 204 L118 206 M66 210 C66 226 72 240 84 248 C112 252 150 246 178 238 C188 234 192 222 194 208 L200 184"
        stroke={traco}
        strokeWidth="1.6"
      />
      <path d="M200 184 L206 176 M192 190 L186 176" stroke={traco} strokeWidth="1.3" />
      {/* Suturas */}
      <path d="M150 34 C138 70 132 108 136 152" stroke={fino} strokeDasharray="3 3" />
      <path d="M136 152 C152 122 214 120 238 168" stroke={fino} strokeDasharray="3 3" />
      <path d="M258 56 C266 92 272 130 270 176" stroke={fino} strokeDasharray="3 3" />

      {/* Chamadas numeradas */}
      {[
        { n: "01", x: 96, y: 74, lx: 30, ly: 48 },
        { n: "02", x: 200, y: 62, lx: 238, ly: 18 },
        { n: "03", x: 182, y: 150, lx: 300, ly: 130 },
        { n: "04", x: 150, y: 172, lx: 300, ly: 196 },
        { n: "05", x: 140, y: 244, lx: 210, ly: 278 },
      ].map((c) => (
        <g key={c.n}>
          <line x1={c.x} y1={c.y} x2={c.lx} y2={c.ly} stroke={chamada} strokeDasharray="2 3" />
          <circle cx={c.x} cy={c.y} r="2.4" fill={traco} />
          <text
            x={c.lx + (c.lx >= 300 ? -2 : c.lx < 60 ? -4 : 4)}
            y={c.ly - 4}
            textAnchor={c.lx < 60 ? "start" : c.lx >= 300 ? "end" : "start"}
            fontFamily="ui-monospace, monospace"
            fontSize="11"
            fill={traco}
          >
            {c.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Mira({ className }: { className: string }) {
  return (
    <span aria-hidden className={`absolute size-4 ${className}`}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-destaque/60" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-destaque/60" />
    </span>
  );
}

export default function RetratoPericial() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-6 rounded-[3rem] bg-azul-claro/30 blur-3xl" aria-hidden />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#173a5c] via-[#10283f] to-fundo [container-type:inline-size]">
        {/* Quadriculado de prancha */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(169,193,220,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(169,193,220,.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Mira className="right-[4%] top-[4%]" />
        <Mira className="left-[4%] top-[4%]" />

        {/* Crânio com legenda */}
        <div className="absolute right-[3%] top-[5%] w-[58%] text-destaque-claro">
          <p className="border-l border-destaque/50 pl-2 font-mono text-[2.4cqw] uppercase leading-tight tracking-[0.12em]">
            Crânio humano
            <br />
            <span className="opacity-60">(vista lateral)</span>
          </p>
          <Cranio />
          <ol className="ml-auto w-fit space-y-[0.4cqw] font-mono text-[2.1cqw] leading-tight opacity-80">
            {LEGENDA.map((l, i) => (
              <li key={l}>
                {String(i + 1).padStart(2, "0")}. {l}
              </li>
            ))}
          </ol>
        </div>

        {/* Etiqueta de amostra */}
        <div className="absolute right-[4%] top-[63%] w-[40%] space-y-[1.2cqw] font-mono text-[2cqw] uppercase leading-tight text-destaque-claro">
          <div className="rounded-md border border-destaque/40 bg-fundo/50 px-[2cqw] py-[1.4cqw] backdrop-blur-sm">
            <p>ID. da amostra: MF-2026-0387</p>
            <div
              aria-hidden
              className="mt-[1cqw] h-[3.2cqw] opacity-80"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 3px, currentColor 3px 5px, transparent 5px 6px, currentColor 6px 7px, transparent 7px 10px)",
              }}
            />
          </div>
          <div className="rounded-md border border-destaque/40 bg-fundo/50 px-[2cqw] py-[1.4cqw] backdrop-blur-sm">
            <p>Tipo: material biológico</p>
            <p className="mt-[0.6cqw]">Finalidade: exame pericial</p>
          </div>
        </div>

        {/* Luz atrás do retrato, para a camisa escura não sumir no fundo */}
        <div
          aria-hidden
          className="absolute bottom-[8%] left-[2%] h-[80%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(110,150,195,.55),transparent)]"
        />
        <Image
          src={fotoRecorte}
          alt="Dr. Miguel Souza, perito médico legista, de braços cruzados e sorrindo"
          priority
          sizes="(min-width: 1024px) 28vw, 70vw"
          className="absolute bottom-0 left-[-4%] h-[92%] w-auto max-w-none drop-shadow-[0_20px_40px_rgba(0,0,0,.45)]"
        />

        {/* Nome e registros */}
        <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-fundo via-fundo/85 to-transparent" />
        <div className="absolute inset-x-4 bottom-[5%] text-center">
          <p className="text-[6.4cqw] font-bold uppercase leading-none tracking-tight">Dr. Miguel Souza</p>
          <p className="mt-[1.6cqw] text-[2.7cqw] font-semibold uppercase tracking-[0.22em] text-destaque">
            Perito médico legista
          </p>
          <p className="mt-[1.4cqw] inline-flex items-center gap-[2cqw] rounded-full border border-white/15 bg-white/5 px-[3cqw] py-[1cqw] font-mono text-[2.5cqw] tracking-[0.12em] text-osso/80">
            <span>{CRM}</span>
            <span className="size-1 rounded-full bg-destaque" />
            <span>{RQE}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
