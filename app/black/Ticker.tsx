// A faixa da campanha, repetida entre as seções.
//
// POR QUE ELA EXISTE. Numa página longa, a pessoa esquece em que oferta
// entrou: ela rola, lê sobre a plataforma, vê os professores e, quando chega
// ao preço, a campanha já saiu da cabeça. A faixa é o lembrete que atravessa a
// página sem ocupar uma seção inteira — é o recurso que a referência usa e o
// que mais dá ritmo ao percurso.
//
// EM CSS PURO, SEM JAVASCRIPT. É animação decorativa: não vale carregar
// componente de cliente para ela. A duplicação do conteúdo é o truque que faz
// o laço parecer infinito — quando a primeira cópia sai da tela, a segunda já
// está no lugar dela, e o `translateX(-50%)` da animação volta ao começo sem
// costura visível. A animação é a `marquee` que já existia em globals.css,
// escrita para outra tela e nunca usada; reaproveitá-la evita um segundo
// keyframe fazendo a mesma coisa. Com `prefers-reduced-motion` a faixa para e
// vira tarja estática, que continua lembrando a campanha.

export default function Ticker({ texto }: { texto: string }) {
  const itens = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="flex items-center gap-4 px-4">
      <span className="text-sm font-black uppercase tracking-[0.18em] text-gray-900">
        {texto}
      </span>
      <span aria-hidden className="text-sm text-gray-900/40">
        ●
      </span>
    </span>
  ));

  return (
    <div
      className="overflow-hidden border-y border-[#ffcd07] bg-[#ffcd07] py-3"
      aria-hidden
    >
      {/* A duração vem daqui, e não da classe: `marquee-track` nasceu com 30s,
          que para um texto que se lê passa rápido demais — o olho persegue a
          frase em vez de absorvê-la. 70s é a metade da velocidade, pedida
          depois de ver a primeira versão no ar. */}
      <div
        className="marquee-track flex w-max motion-reduce:animate-none"
        style={{ animationDuration: "70s" }}
      >
        <div className="flex shrink-0">{itens}</div>
        <div className="flex shrink-0">{itens}</div>
      </div>
    </div>
  );
}
