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

/** Poucas fileiras de capas grandes, como na referência: capa pequena em excesso vira ruído. */
const FILEIRAS = 7;

function Fileira({ n }: { n: number }) {
  // Cada fileira começa num estado diferente, para as mesmas capas não
  // formarem colunas alinhadas de cima a baixo.
  const giro = (n * 5) % CAPAS.length;
  const ufs = [...CAPAS.slice(giro), ...CAPAS.slice(0, giro)];
  const fila = [...ufs, ...ufs];
  const duracao = 90 + ((n * 17) % 50);

  return (
    <div
      className="flex w-max gap-5 motion-safe:animate-[marquee_linear_infinite] sm:gap-8"
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
          width={360}
          height={360}
          decoding="async"
          className="h-52 w-52 shrink-0 rounded-3xl border border-white/[0.06] object-cover sm:h-80 sm:w-80"
        />
      ))}
    </div>
  );
}

/**
 * `veu` escolhe onde o fundo escurece: "centro" (a oferta, título e card no
 * meio) ou "capa" (o topo da página, com o texto à esquerda e a foto à
 * direita — escurece mais o lado do texto).
 */
export default function FundoCapas({
  veu = "centro",
}: {
  veu?: "centro" | "capa";
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 flex w-[220%] -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] flex-col gap-5 opacity-35 sm:gap-8">
        {Array.from({ length: FILEIRAS }, (_, n) => (
          <Fileira key={n} n={n} />
        ))}
      </div>

      {/* Véus: o centro escurece para o título e o card lerem limpos, e as
          bordas de cima e de baixo somem no preto das seções vizinhas. */}
      {veu === "centro" ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_30%_at_50%_18%,rgba(11,11,13,0.9)_0%,rgba(11,11,13,0.6)_65%,rgba(11,11,13,0.45)_100%)] sm:bg-[radial-gradient(ellipse_45%_60%_at_50%_45%,rgba(11,11,13,0.95)_0%,rgba(11,11,13,0.65)_60%,rgba(11,11,13,0.45)_100%)]" />
      ) : (
        <div className="absolute inset-0 bg-[rgba(11,11,13,0.72)] lg:bg-[linear-gradient(90deg,rgba(11,11,13,0.94)_0%,rgba(11,11,13,0.85)_45%,rgba(11,11,13,0.55)_100%)]" />
      )}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0b0b0d] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0b0b0d] to-transparent" />
    </div>
  );
}
