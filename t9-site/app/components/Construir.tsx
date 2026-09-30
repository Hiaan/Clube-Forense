import type { CSSProperties } from "react";
import { IconeBarras, IconeCRM, IconeFunil, IconeGlobo, IconeMais, IconePainel, IconeRobo } from "./Icones";
import { Faixa, Pill, Tile, Titulo } from "./ui";

const SERVICOS = [
  {
    icone: <IconeBarras />,
    titulo: "Tráfego Pago",
    texto: "Campanhas no Meta Ads e no Google Ads com foco em venda, não em curtida.",
  },
  {
    icone: <IconeGlobo />,
    titulo: "Páginas de Vendas",
    texto: "Páginas rápidas e persuasivas, feitas para transformar clique em contato.",
  },
  {
    icone: <IconeCRM />,
    titulo: "CRM",
    texto: "Todos os leads organizados, do primeiro contato ao fechamento.",
  },
  {
    icone: <IconeFunil />,
    titulo: "Funis de Vendas",
    texto: "A jornada certa para cada público, do anúncio ao pós-venda.",
  },
  {
    icone: <IconeRobo />,
    titulo: "Automações",
    texto: "Follow-ups, mensagens e agentes de IA trabalhando 24 horas por você.",
  },
  {
    icone: <IconePainel />,
    titulo: "Dashboard Central",
    texto: "Os números do negócio em um só lugar, atualizados e fáceis de ler.",
  },
];

export default function Construir() {
  return (
    <section id="servicos" className="fundo-post relative overflow-hidden">
      <Faixa numero="3">Construir</Faixa>

      {/* Ícones flutuando ao fundo, como na arte */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        <Tile marca="instagram" tamanho={92} className="flutua absolute top-[16%] right-[6%]" style={{ "--atraso": "0s" } as CSSProperties} />
        <Tile marca="meta" tamanho={78} className="flutua absolute top-[46%] right-[2%] opacity-80 blur-[1px]" style={{ "--atraso": "1.2s" } as CSSProperties} />
        <Tile marca="whatsapp" tamanho={70} className="flutua absolute right-[14%] bottom-[10%] opacity-70 blur-[2px]" style={{ "--atraso": "2s" } as CSSProperties} />
        <Tile marca="ia" tamanho={64} className="flutua absolute top-[30%] right-[18%] opacity-60 blur-[3px]" style={{ "--atraso": "0.6s" } as CSSProperties} />
      </div>

      <div className="container-t9 relative pt-14 pb-24 sm:pt-20 sm:pb-32">
        <Titulo className="max-w-4xl">Montamos a estrutura que leva sua empresa para outro nível.</Titulo>

        <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:max-w-[980px]">
          {SERVICOS.map((s, i) => (
            <div key={s.titulo}>
              <Pill icone={s.icone} style={{ "--d": `${(i % 2) * 90 + Math.floor(i / 2) * 70}ms` } as CSSProperties}>
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
            E muito mais! A depender da sua necessidade.
          </Pill>
        </div>
      </div>
    </section>
  );
}
