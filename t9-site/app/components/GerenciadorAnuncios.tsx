import type { Dicionario } from "@/lib/dicionarios";
import { fmt, moeda, type Idioma } from "@/lib/i18n";
import { MarcaMeta } from "./Icones";

// Valores do print do Gerenciador de Anúncios na última arte.
const DESTAQUE = { custo: 2.3, gasto: 528717.04 };
const LINHAS = [
  { custo: 687.85, gasto: 58467.56 },
  { custo: 666.35, gasto: 45978.18 },
  { custo: 1551.62, gasto: 43445.4 },
];

/** Recriação nítida do print do Gerenciador de Anúncios da última arte. */
export default function GerenciadorAnuncios({ t, idioma }: { t: Dicionario["gerenciador"]; idioma: Idioma }) {
  return (
    <div className="relative [perspective:1400px]" role="img" aria-label={fmt(t.aria, { custo: moeda(DESTAQUE.custo, idioma), gasto: moeda(DESTAQUE.gasto, idioma) })}>
      <div className="relative rounded-[22px] border border-black/5 bg-white p-5 shadow-[0_40px_80px_-30px_rgba(120,0,6,0.45)] [transform:rotateY(-9deg)_rotateX(4deg)]">
        <div className="flex items-center gap-3 border-b border-[#eef0f4] pb-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0866ff]">
            <MarcaMeta className="h-6 w-6" />
          </span>
          <span className="text-lg font-medium text-[#1c2b33]">{t.titulo}</span>
          <span className="ml-auto rounded-md bg-[#1a8e3a] px-3 py-1.5 text-xs font-semibold text-white">{t.criar}</span>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_1.2fr] gap-4 px-3 text-sm text-[#5b6b7a]">
          <span>{t.custoPorResultado}</span>
          <span className="text-[#0866ff]">{t.valorGasto} ↓</span>
        </div>

        {/* Linha em destaque, "saltando" do painel como na arte */}
        <div className="relative -mx-9 mt-3 grid grid-cols-[1fr_1.2fr] gap-4 rounded-2xl border border-white bg-[#f4f8ff]/95 px-8 py-4 tabular-nums shadow-[0_24px_50px_-18px_rgba(8,102,255,0.45)] backdrop-blur [transform:translateZ(40px)]">
          <span className="text-xl text-[#1c2b33]">
            {moeda(DESTAQUE.custo, idioma)}
            <span className="block text-xs text-[#5b6b7a]">{t.porContato}</span>
          </span>
          <span className="self-center font-display text-2xl font-extrabold tracking-tight text-[#0866ff]">{moeda(DESTAQUE.gasto, idioma)}</span>
        </div>

        <ul className="mt-2 divide-y divide-[#eef0f4] opacity-60">
          {LINHAS.map((l) => (
            <li key={l.gasto} className="grid grid-cols-[1fr_1.2fr] gap-4 px-3 py-3 tabular-nums">
              <span className="text-[#1c2b33]">
                {moeda(l.custo, idioma)}
                <span className="block text-xs text-[#8a96a3]">{t.porCompra}</span>
              </span>
              <span className="self-center text-lg text-[#1c2b33]">{moeda(l.gasto, idioma)}</span>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
