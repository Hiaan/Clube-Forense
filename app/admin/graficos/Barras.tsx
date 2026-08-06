// Barras horizontais rotuladas.
//
// Cada linha carrega o próprio nome e o próprio número, então a cor nunca é o
// único canal de identidade — ela existe para amarrar a linha à cor do mapa.
//
// A barra fica EMBAIXO do rótulo, não ao lado: "Concurso autorizado" com uma
// trilha de largura fixa ao lado não cabia num cartão de um terço da tela, e o
// número era empurrado para fora do cartão.

import Link from "next/link";

export interface Barra {
  chave: string;
  rotulo: string;
  valor: number;
  cor: string;
  href?: string;
}

export default function Barras({
  barras,
  vazio = "Sem dados ainda.",
}: {
  barras: Barra[];
  vazio?: string;
}) {
  if (barras.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">{vazio}</p>;
  }

  const max = Math.max(1, ...barras.map((b) => b.valor));

  return (
    <ul className="flex flex-col gap-3">
      {barras.map((b) => {
        const conteudo = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-baseline gap-2 text-sm text-gray-600">
                <span
                  aria-hidden
                  className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full"
                  style={{ backgroundColor: b.cor }}
                />
                <span className="truncate">{b.rotulo}</span>
              </span>
              <span
                className="shrink-0 text-sm font-semibold text-gray-900"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {b.valor}
              </span>
            </div>
            {/* Trilha no cinza da superfície; a barra cresce de uma base só, com
                a ponta arredondada e o pé quadrado. */}
            <span className="mt-1.5 block h-2 w-full overflow-hidden rounded-[1px] bg-gray-100">
              <span
                className="block h-full rounded-r"
                style={{
                  width: `${Math.max(2, (b.valor / max) * 100)}%`,
                  backgroundColor: b.cor,
                }}
              />
            </span>
          </>
        );

        return (
          <li key={b.chave}>
            {b.href ? (
              <Link href={b.href} className="block rounded-lg transition hover:opacity-80">
                {conteudo}
              </Link>
            ) : (
              conteudo
            )}
          </li>
        );
      })}
    </ul>
  );
}
