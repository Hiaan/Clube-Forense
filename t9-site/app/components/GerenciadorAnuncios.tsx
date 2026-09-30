import { MarcaMeta } from "./Icones";

const LINHAS = [
  { custo: "R$ 687,85", gasto: "R$ 58.467,56" },
  { custo: "R$ 666,35", gasto: "R$ 45.978,18" },
  { custo: "R$ 1.551,62", gasto: "R$ 43.445,40" },
];

/** Recriação nítida do print do Gerenciador de Anúncios da última arte. */
export default function GerenciadorAnuncios() {
  return (
    <div className="relative [perspective:1400px]" role="img" aria-label="Gerenciador de Anúncios da Meta: R$ 2,30 por contato do site e R$ 528.717,04 em valor gasto">
      <div className="relative rounded-[22px] border border-black/5 bg-white p-5 shadow-[0_40px_80px_-30px_rgba(120,0,6,0.45)] [transform:rotateY(-9deg)_rotateX(4deg)]">
        <div className="flex items-center gap-3 border-b border-[#eef0f4] pb-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0866ff]">
            <MarcaMeta className="h-6 w-6" />
          </span>
          <span className="text-lg font-medium text-[#1c2b33]">Gerenciador de Anúncios</span>
          <span className="ml-auto rounded-md bg-[#1a8e3a] px-3 py-1.5 text-xs font-semibold text-white">+ Criar</span>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_1.2fr] gap-4 px-3 text-sm text-[#5b6b7a]">
          <span>Custo por resultado</span>
          <span className="text-[#0866ff]">Valor gasto ↓</span>
        </div>

        {/* Linha em destaque, "saltando" do painel como na arte */}
        <div className="relative -mx-9 mt-3 grid grid-cols-[1fr_1.2fr] gap-4 rounded-2xl border border-white bg-[#f4f8ff]/95 px-8 py-4 tabular-nums shadow-[0_24px_50px_-18px_rgba(8,102,255,0.45)] backdrop-blur [transform:translateZ(40px)]">
          <span className="text-xl text-[#1c2b33]">
            R$ 2,30
            <span className="block text-xs text-[#5b6b7a]">Por contato do site</span>
          </span>
          <span className="self-center font-display text-2xl font-extrabold tracking-tight text-[#0866ff]">R$ 528.717,04</span>
        </div>

        <ul className="mt-2 divide-y divide-[#eef0f4] opacity-60">
          {LINHAS.map((l) => (
            <li key={l.gasto} className="grid grid-cols-[1fr_1.2fr] gap-4 px-3 py-3 tabular-nums">
              <span className="text-[#1c2b33]">
                {l.custo}
                <span className="block text-xs text-[#8a96a3]">Por compra</span>
              </span>
              <span className="self-center text-lg text-[#1c2b33]">{l.gasto}</span>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
