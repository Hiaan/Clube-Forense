// O fundo animado da seção da oferta: as capas de cada concurso passando.
//
// É a versão do Clube para o "palco" da referência (o site do Código Viral),
// onde os produtos giram atrás do título. Aqui são as capas dos preparatórios
// por estado, em duas fileiras que correm em sentidos opostos, inclinadas e
// apagadas: dizem "são muitos editais" sem disputar a leitura com o título.
//
// CSS puro, com a mesma `marquee` de globals.css. A lista é duplicada para o
// laço não ter costura; com `prefers-reduced-motion` as fileiras param.

import Image from "next/image";

const CAPAS = [
  "RJ",
  "MA",
  "DF",
  "ES",
  "PA",
  "TO",
  "AC",
  "MG",
  "MT",
  "PE",
  "CE",
  "PI",
];

function Fileira({
  ufs,
  reverso = false,
}: {
  ufs: string[];
  reverso?: boolean;
}) {
  const fila = [...ufs, ...ufs];
  return (
    <div
      className="flex w-max gap-4 motion-safe:animate-[marquee_60s_linear_infinite]"
      style={reverso ? { animationDirection: "reverse" } : undefined}
    >
      {fila.map((uf, i) => (
        <Image
          key={`${uf}-${i}`}
          src={`/black/capas/${uf}.webp`}
          alt=""
          width={180}
          height={180}
          className="h-36 w-36 shrink-0 rounded-2xl border border-white/10 object-cover sm:h-44 sm:w-44"
        />
      ))}
    </div>
  );
}

export default function FundoCapas() {
  const meio = Math.ceil(CAPAS.length / 2);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden opacity-40 [mask-image:linear-gradient(to_bottom,#000_30%,transparent_95%)]"
    >
      <div className="absolute left-1/2 top-6 flex w-[160%] -translate-x-1/2 -rotate-6 flex-col gap-4">
        <Fileira ufs={[...CAPAS.slice(meio), ...CAPAS.slice(0, meio)]} />
        <Fileira ufs={CAPAS} reverso />
      </div>
      {/* Véu: escurece o miolo para o título ler limpo por cima das capas. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(11,11,13,0.85)_0%,rgba(11,11,13,0.35)_55%,transparent_80%)]" />
    </div>
  );
}
