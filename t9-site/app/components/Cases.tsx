import Image from "next/image";
import type { CSSProperties } from "react";
import { CASES, type Case } from "@/lib/cases";

/**
 * Altura em que cada logo aparece: mesma área visual para todos, então os
 * quadrados ficam mais altos e os compridos mais baixos (entre 28 e 60px).
 */
function alturaDoLogo(proporcao: number) {
  return `clamp(28px, ${Math.round(Math.sqrt(7600 / proporcao))}px, 60px)`;
}

/** Logo do cliente; sem arquivo de logo, o nome em letra de marca faz as vezes. */
function MarcaCliente({ c, duplicado = false }: { c: Case; duplicado?: boolean }) {
  return (
    <li className="cliente-logo" aria-hidden={duplicado || undefined}>
      {c.logo ? (
        <Image
          src={c.logo}
          alt={c.cliente}
          width={Math.round(64 * (c.logoProporcao ?? 3))}
          height={64}
          className="w-auto object-contain"
          style={{ height: alturaDoLogo(c.logoProporcao ?? 3) }}
        />
      ) : (
        <span className="font-display text-xl font-extrabold tracking-tight whitespace-nowrap sm:text-2xl">{c.cliente}</span>
      )}
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
          <MarcaCliente key={c.cliente} c={c} />
        ))}
        {itens.map((c) => (
          <MarcaCliente key={`${c.cliente}-2`} c={c} duplicado />
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
    <section id="cases" className="relative overflow-hidden border-y border-white/10 bg-[#0d0203] py-16 sm:py-20">
      <div className="container-t9 flex flex-col items-center text-center">
        <p className="font-display text-sm font-extrabold tracking-[0.25em] text-[#ff5a63] uppercase" data-reveal>
          Clientes
        </p>
        <h2
          className="mt-3 max-w-3xl font-display text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl"
          data-reveal
        >
          Operações que passaram a funcionar como sistema, em quatro países.
        </h2>
      </div>

      <div className="mt-10 space-y-5 sm:mt-12" data-reveal>
        {fileiras.map((f, i) => (
          <Esteira key={i} itens={f} reverso={i % 2 === 1} duracao={f.length * 5} />
        ))}
      </div>
    </section>
  );
}
