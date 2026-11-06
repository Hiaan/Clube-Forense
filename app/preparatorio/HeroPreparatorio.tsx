// A capa das páginas do preparatório, no desenho da capa da Black.
//
// O desenho anterior era um bloco de oito itens ao lado de uma composição de
// telas — texto demais para a primeira dobra e nenhum rosto. Esta é a da
// Black: as capas dos concursos correndo ao fundo, o texto à esquerda com três
// provas curtas e os três professores à direita, com o selo de aprovados. A
// mesma capa serve ao preparatório geral e ao do Acre; muda o que se escreve
// nela, não o lugar das coisas.

import Image from "next/image";

import FundoCapas from "../black/FundoCapas";

export default function HeroPreparatorio({
  selo,
  titulo,
  subtitulo,
  itens,
  rodape,
  aprovados,
  capasAoFundo = true,
}: {
  selo: string;
  titulo: React.ReactNode;
  subtitulo: React.ReactNode;
  itens: string[];
  /** Embaixo do botão: preço da Black, contagem regressiva da prova… */
  rodape?: React.ReactNode;
  aprovados: number;
  /**
   * As capas dos concursos de todos os estados correndo ao fundo. A página do
   * Acre desliga: ela vende um concurso só, e a parede de outros estados
   * dizia o contrário.
   */
  capasAoFundo?: boolean;
}) {
  return (
    <div id="capa" className="relative overflow-hidden bg-[#0b0b0d]">
      {capasAoFundo && <FundoCapas veu="capa" />}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[#ffcd07]/10 blur-[130px]" />

      <section className="relative mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:pt-10">
        <Image
          src="/logo-fundo-escuro.png"
          alt="Clube Forense"
          width={162}
          height={28}
          priority
          className="mx-auto h-7 w-auto lg:mx-0"
        />

        <div className="mt-10 grid items-center gap-14 lg:mt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <span className="badge-pulse inline-flex items-center gap-2 rounded-full border border-[#ffcd07]/30 bg-[#ffcd07]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#ffcd07]">
              {selo}
            </span>

            <h1 className="mt-6 text-[28px] font-black leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[40px]">
              {titulo}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65 lg:mx-0">
              {subtitulo}
            </p>

            {/* Lista longa vai em duas colunas: numa só, ela empurrava o botão
                e o preço para fora da primeira dobra. */}
            <ul
              className={`mx-auto mt-7 grid max-w-xl gap-2.5 text-left lg:mx-0 ${
                itens.length > 4 ? "sm:grid-cols-2 sm:gap-x-5" : ""
              }`}
            >
              {itens.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#ffcd07] text-[10px] font-black text-gray-900">
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed text-white/70">
                    {t}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col items-center gap-4 lg:items-start">
              <a
                href="#oferta"
                className="w-full max-w-sm rounded-2xl bg-[#ffcd07] px-8 py-5 text-center text-base font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110 sm:text-lg"
              >
                Quero garantir minha vaga
              </a>
              {rodape}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-[600px]">
            <Image
              src="/black/hero-professores.webp"
              alt="Dr. João Paulo, Dra. Erika Anjos e Dr. Miguel Souza com a plataforma do Clube Forense"
              width={900}
              height={773}
              priority
              sizes="(max-width: 1024px) 92vw, 600px"
              className="h-auto w-full"
            />
            <div className="absolute right-2 top-[12%] rounded-2xl border border-[#ffcd07]/40 bg-[#0b0b0d]/90 px-4 py-2.5 text-center backdrop-blur">
              <p className="text-xl font-black leading-none text-[#ffcd07]">
                +{aprovados}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
                aprovados
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
