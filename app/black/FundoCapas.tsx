// O fundo animado da seção da oferta: as capas de cada concurso passando.
//
// É a versão do Clube para o "palco" da referência (o site do Código Viral),
// onde os produtos enchem a tela inteira atrás do card. Aqui são as capas dos
// preparatórios por estado, numa parede de fileiras que cobre a seção de ponta
// a ponta: cada fileira corre num sentido e numa velocidade, o conjunto vem
// inclinado, e um véu escuro no centro abre espaço para o título e o card.
//
// CSS puro, com a mesma `marquee` de globals.css. Cada fileira é duplicada
// para o laço não ter costura; com `prefers-reduced-motion` a parede para.
//
// <img> SIMPLES, E NÃO next/image: são as mesmas 12 imagens repetidas
// centenas de vezes, já pequenas e em webp. O otimizador só multiplicaria
// variantes do mesmo arquivo.

const CAPAS = ["RJ", "MA", "DF", "ES", "PA", "TO", "AC", "MG", "MT", "PE", "CE", "PI"];

/** Quantas fileiras: o bastante para cobrir a seção inteira, mesmo inclinada. */
const FILEIRAS = 16;

function Fileira({ n }: { n: number }) {
  // Cada fileira começa num estado diferente, para as mesmas capas não
  // formarem colunas alinhadas de cima a baixo.
  const giro = (n * 5) % CAPAS.length;
  const ufs = [...CAPAS.slice(giro), ...CAPAS.slice(0, giro)];
  const fila = [...ufs, ...ufs];
  const duracao = 70 + ((n * 13) % 40);

  return (
    <div
      className="flex w-max gap-3 motion-safe:animate-[marquee_linear_infinite] sm:gap-4"
      style={{
        animationDuration: `${duracao}s`,
        animationDirection: n % 2 ? "reverse" : "normal",
      }}
    >
      {fila.map((uf, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${uf}-${i}`}
          src={`/black/capas/${uf}.webp`}
          alt=""
          width={180}
          height={180}
          decoding="async"
          className="h-28 w-28 shrink-0 rounded-xl border border-white/10 object-cover sm:h-40 sm:w-40 sm:rounded-2xl"
        />
      ))}
    </div>
  );
}

export default function FundoCapas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 flex w-[180%] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] flex-col gap-3 opacity-60 sm:gap-4">
        {Array.from({ length: FILEIRAS }, (_, n) => (
          <Fileira key={n} n={n} />
        ))}
      </div>

      {/* Véus: o centro escurece para o título e o card lerem limpos, e as
          bordas de cima e de baixo somem no preto das seções vizinhas. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_28%_at_50%_18%,rgba(11,11,13,0.85)_0%,rgba(11,11,13,0.45)_65%,rgba(11,11,13,0.2)_100%)] sm:bg-[radial-gradient(ellipse_55%_45%_at_50%_40%,rgba(11,11,13,0.92)_0%,rgba(11,11,13,0.55)_60%,rgba(11,11,13,0.25)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0b0b0d] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0b0b0d] to-transparent" />
    </div>
  );
}
