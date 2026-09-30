import type { CSSProperties } from "react";
import {
  IconeAlvo,
  IconeCifrao,
  IconeEngrenagem,
  IconeGlobo,
  IconeGraficoLinha,
  IconeMaleta,
  IconeMegafone,
  IconePessoas,
} from "./Icones";
import { Faixa, Pill, Subtitulo, Titulo } from "./ui";

const ITENS = [
  { icone: <IconeMaleta />, texto: "Processo Comercial" },
  { icone: <IconeMegafone />, texto: "Investimento em MKT" },
  { icone: <IconeCifrao />, texto: "Ticket Médio" },
  { icone: <IconePessoas />, texto: "Público-Alvo" },
  { icone: <IconeGraficoLinha />, texto: "Seus Números" },
  { icone: <IconeGlobo />, texto: "Levantamento de Mercado" },
  { icone: <IconeAlvo />, texto: "Gargalos e Oportunidades" },
  { icone: <IconeEngrenagem />, texto: "Operação Atual" },
];

export default function Entender() {
  return (
    <section id="como-funciona" className="fundo-post relative overflow-hidden">
      <div className="fundo-pontilhado pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden="true" />
      <div className="container-t9 relative pt-24 pb-8 sm:pt-32">
        <p className="font-display text-sm font-extrabold tracking-[0.25em] text-[#ff5a63] uppercase" data-reveal>
          Como a T9 trabalha
        </p>
        <h2
          className="mt-3 max-w-3xl font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl"
          data-reveal
        >
          Três etapas. Nenhuma fórmula mágica.
        </h2>
      </div>

      <div className="relative mt-10">
        <Faixa numero="1">Entender</Faixa>
      </div>

      <div className="container-t9 relative pt-14 pb-24 sm:pt-20 sm:pb-32">
        <Titulo>Tudo começa no alinhamento.</Titulo>
        <Subtitulo>
          Fazemos uma reunião para entender todo o seu negócio, o seu mercado e os seus objetivos.
        </Subtitulo>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
          {ITENS.map((item, i) => (
            <Pill key={item.texto} icone={item.icone} style={{ "--d": `${(i % 2) * 90 + Math.floor(i / 2) * 70}ms` } as CSSProperties}>
              {item.texto}
            </Pill>
          ))}
        </div>

        <p
          className="mt-16 ml-auto max-w-xl text-right text-xl leading-snug font-light text-white/90 sm:text-[1.65rem]"
          data-reveal
        >
          Antes de anunciar, precisamos saber <strong className="font-semibold text-white">exatamente</strong> o que
          estamos construindo.
        </p>
      </div>
    </section>
  );
}
