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
import type { Dicionario } from "@/lib/dicionarios";
import Rico from "./Rico";
import { Faixa, Pill, Subtitulo, Titulo } from "./ui";

const ICONES = [
  <IconeMaleta key="0" />,
  <IconeMegafone key="1" />,
  <IconeCifrao key="2" />,
  <IconePessoas key="3" />,
  <IconeGraficoLinha key="4" />,
  <IconeGlobo key="5" />,
  <IconeAlvo key="6" />,
  <IconeEngrenagem key="7" />,
];

export default function Entender({ t }: { t: Dicionario["entender"] }) {
  return (
    <section id="como-funciona" className="fundo-post relative overflow-hidden">
      <div className="fundo-pontilhado pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden="true" />
      <div className="container-t9 relative pt-24 pb-8 sm:pt-32">
        <p className="font-display text-sm font-extrabold tracking-[0.25em] text-[#ff5a63] uppercase" data-reveal>
          {t.eyebrow}
        </p>
        <h2
          className="mt-3 max-w-3xl font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl"
          data-reveal
        >
          {t.tresEtapas}
        </h2>
      </div>

      <div className="relative mt-10">
        <Faixa numero="1">{t.faixa}</Faixa>
      </div>

      <div className="container-t9 relative pt-14 pb-24 sm:pt-20 sm:pb-32">
        <Titulo>{t.titulo}</Titulo>
        <Subtitulo>{t.subtitulo}</Subtitulo>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6">
          {t.itens.map((texto, i) => (
            <Pill key={texto} icone={ICONES[i]} style={{ "--d": `${(i % 2) * 90 + Math.floor(i / 2) * 70}ms` } as CSSProperties}>
              {texto}
            </Pill>
          ))}
        </div>

        <p
          className="mt-16 ml-auto max-w-xl text-right text-xl leading-snug font-light text-white/90 sm:text-[1.65rem]"
          data-reveal
        >
          <Rico texto={t.rodape} />
        </p>
      </div>
    </section>
  );
}
