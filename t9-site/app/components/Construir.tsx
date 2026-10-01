import type { CSSProperties } from "react";
import { IconeBarras, IconeCRM, IconeFunil, IconeGlobo, IconeMais, IconePainel, IconeRobo } from "./Icones";
import type { Dicionario } from "@/lib/dicionarios";
import { Faixa, Pill, Tile, Titulo } from "./ui";

const ICONES = [
  <IconeBarras key="0" />,
  <IconeGlobo key="1" />,
  <IconeCRM key="2" />,
  <IconeFunil key="3" />,
  <IconeRobo key="4" />,
  <IconePainel key="5" />,
];

export default function Construir({ t }: { t: Dicionario["construir"] }) {
  return (
    <section id="servicos" className="fundo-post relative overflow-hidden">
      <Faixa numero="3">{t.faixa}</Faixa>

      {/* Ícones flutuando ao fundo, como na arte */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        <Tile marca="instagram" tamanho={92} className="flutua absolute top-[16%] right-[6%]" style={{ "--atraso": "0s" } as CSSProperties} />
        <Tile marca="meta" tamanho={78} className="flutua absolute top-[46%] right-[2%] opacity-80 blur-[1px]" style={{ "--atraso": "1.2s" } as CSSProperties} />
        <Tile marca="whatsapp" tamanho={70} className="flutua absolute right-[14%] bottom-[10%] opacity-70 blur-[2px]" style={{ "--atraso": "2s" } as CSSProperties} />
        <Tile marca="ia" tamanho={64} className="flutua absolute top-[30%] right-[18%] opacity-60 blur-[3px]" style={{ "--atraso": "0.6s" } as CSSProperties} />
      </div>

      <div className="container-t9 relative pt-14 pb-24 sm:pt-20 sm:pb-32">
        <Titulo className="max-w-4xl">{t.titulo}</Titulo>

        <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:max-w-[980px]">
          {t.servicos.map((s, i) => (
            <div key={s.titulo}>
              <Pill icone={ICONES[i]} style={{ "--d": `${(i % 2) * 90 + Math.floor(i / 2) * 70}ms` } as CSSProperties}>
                {s.titulo}
              </Pill>
              <p className="mt-4 pl-1 text-[15px] leading-relaxed font-light text-white/65" data-reveal style={{ "--d": `${150 + (i % 2) * 90}ms` } as CSSProperties}>
                {s.texto}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 lg:max-w-[980px]">
          <Pill icone={<IconeMais />} destaque>
            {t.muitoMais}
          </Pill>
        </div>
      </div>
    </section>
  );
}
