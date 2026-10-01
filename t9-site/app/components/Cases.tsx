import Image from "next/image";
import type { CSSProperties } from "react";
import { CASES, type Case } from "@/lib/cases";
import { Subtitulo, Titulo } from "./ui";

function CardCase({ c, duplicado = false }: { c: Case; duplicado?: boolean }) {
  return (
    <li className="case-card w-[300px] shrink-0 sm:w-[340px]" aria-hidden={duplicado || undefined}>
      <div className="flex items-start justify-between gap-4">
        {c.logo ? (
          <Image src={c.logo} alt={c.cliente} width={160} height={56} className="h-12 w-auto max-w-[150px] object-contain object-left" />
        ) : (
          <span className="case-iniciais" aria-hidden="true">
            {c.iniciais}
          </span>
        )}
        <span className="mt-1 rounded-full border border-[#ff2d38]/45 bg-[#ff2d38]/10 px-3 py-1 text-right text-[11px] leading-tight font-medium tracking-wide text-[#ffb3b8]">
          {c.segmento}
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl leading-tight font-extrabold tracking-tight">{c.cliente}</h3>
      <p className="mt-1 text-xs tracking-wide text-white/45 uppercase">{c.local}</p>

      <div className="mt-5 border-y border-white/10 py-5">
        <p
          className={`font-display leading-none font-extrabold tracking-tight whitespace-nowrap text-white texto-brilho ${
            c.destaque.valor.length > 11 ? "text-[1.75rem]" : c.destaque.valor.length > 8 ? "text-[2rem]" : "text-[2.4rem]"
          }`}
        >
          {c.destaque.valor}
        </p>
        <p className="mt-2 text-sm leading-snug font-light text-white/70">{c.destaque.legenda}</p>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed font-light text-white/75">{c.resumo}</p>
    </li>
  );
}

/** Uma fileira que desliza sem parar; a lista vai duplicada para o laço não ter emenda. */
function Esteira({ itens, reverso = false, duracao }: { itens: Case[]; reverso?: boolean; duracao: number }) {
  return (
    <div className="esteira">
      <ul
        className={`esteira-trilho ${reverso ? "esteira-reverso" : ""}`}
        style={{ "--duracao": `${duracao}s` } as CSSProperties}
      >
        {itens.map((c) => (
          <CardCase key={c.cliente} c={c} />
        ))}
        {itens.map((c) => (
          <CardCase key={`${c.cliente}-2`} c={c} duplicado />
        ))}
      </ul>
    </div>
  );
}

export default function Cases() {
  if (!CASES.length) return null;
  const metade = Math.ceil(CASES.length / 2);
  const fileiras = [CASES.slice(0, metade), CASES.slice(metade)].filter((f) => f.length);

  return (
    <section id="cases" className="fundo-post relative overflow-hidden">
      <div className="faixa h-4 sm:h-6" aria-hidden="true" />
      <div className="brilho-canto -bottom-48 -left-40 opacity-60" aria-hidden="true" />

      <div className="relative pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="container-t9">
          <p className="font-display text-sm font-extrabold tracking-[0.25em] text-[#ff5a63] uppercase" data-reveal>
            Cases
          </p>
          <Titulo className="mt-3 max-w-4xl">Operações que passaram a funcionar como sistema, em quatro países.</Titulo>
          <Subtitulo>
            Clientes reais no Brasil, em Portugal, na Argentina e nos Estados Unidos. Cada número abaixo veio de uma
            operação que passou a funcionar como sistema.
          </Subtitulo>
        </div>

        <div className="mt-14 space-y-6" data-reveal>
          {fileiras.map((f, i) => (
            <Esteira key={i} itens={f} reverso={i % 2 === 1} duracao={f.length * 12} />
          ))}
        </div>

        <div className="container-t9 mt-14" data-reveal>
          <a href="#agendar" className="botao botao-vermelho text-base">
            Quero ser o próximo case
          </a>
        </div>
      </div>
    </section>
  );
}
