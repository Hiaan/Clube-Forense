// Os professores parceiros, passando em faixa.
//
// POR QUE ELA PODE NASCER VAZIA. Os três criadores do Clube têm arte pronta e
// entram em cartão grande, logo acima. Os parceiros — quem cobre as matérias
// que completam o edital — não têm foto no material que está publicado, e eu
// não invento rosto nem nome de professor. Então a faixa existe pronta e some
// quando a lista está vazia: no dia em que as fotos chegarem, preencher
// `PARCEIROS` é a única coisa a fazer.
//
// COMO PREENCHER: ponha o arquivo em `public/black/professores/` e escreva uma
// linha por pessoa — nome, a matéria que ela leciona e o nome do arquivo.

import Image from "next/image";

export interface Parceiro {
  nome: string;
  materia: string;
  /** Arquivo em public/black/professores/ */
  arquivo: string;
}

export const PARCEIROS: Parceiro[] = [];

export default function ProfessoresParceiros() {
  if (PARCEIROS.length === 0) return null;

  // Duplicada para o laço não ter emenda, como nas outras faixas da página.
  const fila = [...PARCEIROS, ...PARCEIROS];

  return (
    <div
      className="relative -mx-4 mt-10 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="carousel-track flex w-max gap-4 px-4 py-2 motion-reduce:animate-none"
        style={{ animationDuration: "80s" }}
      >
        {fila.map((p, i) => (
          <figure
            key={`${p.nome}-${i}`}
            className="w-[180px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white"
            aria-hidden={i >= PARCEIROS.length}
          >
            <div className="relative aspect-[3/4] w-full bg-gray-100">
              <Image
                src={`/black/professores/${p.arquivo}`}
                alt={p.nome}
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
            <figcaption className="p-3">
              <p className="truncate text-sm font-black text-gray-900">{p.nome}</p>
              <p className="truncate text-[11px] font-bold uppercase tracking-wider text-[#b38f00]">
                {p.materia}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
