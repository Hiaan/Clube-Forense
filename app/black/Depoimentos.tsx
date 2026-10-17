"use client";

// Os depoimentos dos aprovados, em vídeo.
//
// POR QUE EM VÍDEO, E NÃO EM ASPAS SOLTAS. Texto de depoimento é a coisa mais
// fácil de inventar na internet, e todo mundo sabe disso — por isso aspas
// anônimas não convencem mais ninguém. Rosto, voz e nome em vídeo são de uma
// categoria diferente de prova: dá para reconhecer a pessoa, procurar o nome
// na lista de aprovados do concurso e conferir. É o que a referência que o
// Clube pediu faz, e é o que esta seção faz aqui.
//
// O MATERIAL É O DO PRÓPRIO CLUBE, NÃO INVENTEI NENHUMA FRASE. Os seis
// depoimentos — quatro em vídeo, dois escritos — são exatamente os que já
// estavam publicados na página antiga da Black e na do preparatório, com o
// texto palavra por palavra como está lá. Dois vídeos estavam hospedados no
// site (entraram aqui como arquivo, recomprimidos de 15 MB para 3,6 MB) e dois
// são do canal do Clube no YouTube.
//
// NADA DO YOUTUBE CARREGA ANTES DO CLIQUE. A capa de cada vídeo é um arquivo
// nosso; o player só nasce quando a pessoa clica. Isso evita o que acontece
// quando se cola um <iframe> de YouTube numa página de vendas: três conexões e
// algumas centenas de KB de script por vídeo, antes mesmo de alguém querer
// assistir. Com seis cartões, isso seria a parte mais pesada da página — por
// um vídeo que a maioria não vai abrir.
//
// AS CAPAS SÃO 3:4 COM FUNDO BORRADO porque o material é de três formatos
// diferentes: vídeo vertical gravado no celular, arte de live em 16:9 e foto
// quadrada. Recortar tudo num mesmo quadro cortaria justamente o que importa —
// o rosto numa, o título na outra. Com o fundo borrado, cada peça aparece
// inteira e os seis cartões ficam do mesmo tamanho.

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface Depoimento {
  nome: string;
  /** Onde a pessoa passou, como está na arte do próprio depoimento. */
  cargo: string;
  /** Texto exatamente como publicado pelo Clube. */
  texto: string;
  /** Arquivo da capa em public/black/depoimentos/ (sem extensão). */
  capa: string;
  /** Vídeo do YouTube, quando é de lá. */
  youtube?: string;
  /** Arquivo .mp4 em public/black/depoimentos/, quando é nosso. */
  arquivo?: string;
  /** Molda o player: vertical (celular) ou horizontal (live). */
  formato?: "vertical" | "horizontal";
}

const DEPOIMENTOS: Depoimento[] = [
  {
    nome: "Dr. Bruno Viana",
    cargo: "SPTC-GO · aprovado em 1º lugar",
    texto:
      "Entrei no Clube Forense durante o intensivão de questões… Eu precisava de alguém que já tivesse passado pelo o que eu passei e nisso, o Clube Forense foi EXCELENTE.",
    capa: "bruno-viana",
    youtube: "N5l6oScrxBc",
    formato: "vertical",
  },
  {
    nome: "Dra. Laís Nader",
    cargo: "PC-PR · 1º lugar na ampla concorrência",
    texto:
      "Comprei todo o material, ebooks, mentoria… e agora, já aprovada, estou ainda com a ficha caindo, eufórica, a sensação é de dever cumprido.",
    capa: "lais-nader",
    youtube: "MvjUy5K9Vn4",
    formato: "horizontal",
  },
  {
    nome: "Dr. Marcel Medeiros",
    cargo: "PC-PE · médico-legista",
    texto:
      "Foi o grande diferencial na minha preparação, os encontros com os professores, bem como a disponibilidade para tirar dúvidas e discutir casos reais fizeram total diferença.",
    capa: "marcel-medeiros",
    arquivo: "marcel-medeiros.mp4",
    formato: "vertical",
  },
  {
    nome: "Dr. Pietro Tenório",
    cargo: "POLITEC-PE · médico-legista",
    texto:
      "Esses encontros semanais foram incrivelmente importantes… mnemônicos, mapas mentais fizeram total diferença… atribuo meu sucesso a essa equipe… gratidão.",
    capa: "pietro-tenorio",
    arquivo: "pietro-tenorio.mp4",
    formato: "vertical",
  },
  {
    nome: "Dr. André Souza",
    cargo: "aluno aprovado",
    texto:
      "De início achei que não conseguiria estudar; depois de um certo tempo vi que poderia ser aprovado mesmo com tantas dificuldades de conciliar tempo para estudo, trabalho, família e amigos. No final acreditei que teria chances: persisti e continuei esperançoso, assim hoje aprovado.",
    capa: "andre-souza",
  },
  {
    nome: "Dra. Carla Bandeira",
    cargo: "aluna do Clube",
    texto:
      "Para mim vcs se tornaram uma família por tanto cuidado que vai além de uma simples questão contratual de entregar conteúdos. A dedicação, atenção, cordialidade de cada um do Clube é incrível.",
    capa: "carla-bandeira",
  },
];

/** O triângulo do play. Em SVG para não depender de fonte nem de emoji. */
function Play({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.5-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

/**
 * O player, em cima da página.
 *
 * Fecha no Esc, no clique fora e no botão — as três saídas que a pessoa tenta.
 * Enquanto está aberto, a página atrás não rola: nada pior do que fechar o
 * vídeo e descobrir que perdeu o lugar na leitura.
 */
function Player({ d, aoFechar }: { d: Depoimento; aoFechar: () => void }) {
  const fechar = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", tecla);
    const overflowAntes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechar.current?.focus();
    // O atributo `autoplay` sozinho basta no Chrome, que conta o clique no
    // cartão como permissão. O Safari é mais rígido e às vezes ignora — o
    // play() explícito resolve, e quando ele é recusado a promessa é engolida
    // de propósito: o vídeo fica parado com os controles à mostra, que é o
    // pior caso aceitável (um toque a mais), não um erro no console.
    video.current?.play().catch(() => {});
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflowAntes;
    };
  }, [aoFechar]);

  const vertical = d.formato !== "horizontal";

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={`Depoimento de ${d.nome}`}
      onClick={aoFechar}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
    >
      <div
        // O clique dentro do player não pode fechar o player.
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${vertical ? "max-w-[400px]" : "max-w-3xl"}`}
      >
        <button
          ref={fechar}
          onClick={aoFechar}
          className="absolute -top-11 right-0 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
        >
          fechar ✕
        </button>

        <div
          className={`overflow-hidden rounded-2xl bg-black shadow-2xl ${
            vertical ? "aspect-[9/16]" : "aspect-video"
          }`}
        >
          {d.youtube ? (
            // nocookie: o YouTube só passa a guardar cookie depois que a pessoa
            // decide assistir, e mesmo assim no domínio sem rastreio.
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${d.youtube}?autoplay=1&rel=0&modestbranding=1`}
              title={`Depoimento de ${d.nome}`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <video
              ref={video}
              // O quadro do vídeo no formato do vídeo. A capa do cartão é
              // 3:4 e, dentro do player 9:16, apareceria com tarja preta em
              // cima e embaixo até o primeiro frame carregar.
              poster={`/black/depoimentos/${d.capa}-quadro.webp`}
              controls
              autoPlay
              playsInline
              className="h-full w-full"
            >
              {/* Dois formatos, pela mesma razão dos vídeos da plataforma: o
                  mp4 (H.264) é o que iPhone e Safari tocam, e o webm (VP9) é o
                  que builds livres do Chromium tocam — sem ele, parte do Linux
                  abre o depoimento e vê um retângulo preto. O navegador pega a
                  primeira fonte que sabe ler e baixa só aquela. */}
              <source src={`/black/depoimentos/${d.capa}.webm`} type="video/webm" />
              <source src={`/black/depoimentos/${d.arquivo}`} type="video/mp4" />
            </video>
          )}
        </div>

        <p className="mt-4 text-center text-sm font-bold text-white">
          {d.nome}
          <span className="ml-2 font-semibold text-white/50">{d.cargo}</span>
        </p>
      </div>
    </div>
  );
}

function Cartao({ d, aoAbrir }: { d: Depoimento; aoAbrir: () => void }) {
  const temVideo = Boolean(d.youtube || d.arquivo);

  const capa = (
    <>
      <Image
        src={`/black/depoimentos/${d.capa}.webp`}
        alt={d.nome}
        width={600}
        height={800}
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 310px"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      {/* NADA DE NOME ESCRITO POR CIMA DA IMAGEM. Os vídeos já trazem o cargo e
          a colocação gravados no rodapé do quadro — é a arte do próprio Clube,
          e vale mais do que uma legenda nossa. A primeira versão punha o nome
          ali em cima e os dois textos ficavam empilhados, ilegíveis. O nome
          desceu para o corpo branco do cartão, onde tem espaço. */}
      {temVideo && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ffcd07] text-gray-900 shadow-lg transition group-hover:scale-110">
          <Play className="ml-0.5 h-6 w-6" />
        </span>
      )}
    </>
  );

  return (
    <figure className="card-white w-[78vw] shrink-0 snap-center overflow-hidden sm:w-auto">
      {temVideo ? (
        <button
          type="button"
          onClick={aoAbrir}
          aria-label={`Assistir ao depoimento de ${d.nome}`}
          className="group relative block aspect-[3/4] w-full overflow-hidden"
        >
          {capa}
        </button>
      ) : (
        // Sem vídeo não há botão: um retângulo clicável que não faz nada é pior
        // do que um retângulo honesto.
        <div className="group relative block aspect-[3/4] w-full overflow-hidden">{capa}</div>
      )}
      <figcaption className="px-5 pt-5">
        <p className="text-base font-black leading-tight text-gray-900">{d.nome}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#b38f00]">
          {d.cargo}
        </p>
      </figcaption>
      <blockquote className="px-5 pb-5 pt-3 text-sm leading-relaxed text-gray-600">
        <span className="text-[#b38f00]">“</span>
        {d.texto}
        <span className="text-[#b38f00]">”</span>
      </blockquote>
    </figure>
  );
}

export default function Depoimentos() {
  const [aberto, setAberto] = useState<string | null>(null);
  const atual = DEPOIMENTOS.find((d) => d.nome === aberto) ?? null;
  // Estável de propósito: se esta função nascesse de novo a cada render, o
  // efeito do player rodaria junto e o vídeo voltaria ao começo sozinho.
  const fechar = useCallback(() => setAberto(null), []);

  return (
    <>
      {/* NO CELULAR, A MESMA GRADE VIRAVA UMA COLUNA DE QUASE CINCO MIL
          PIXELS: seis cartões altos empilhados, no meio de uma página de
          vendas que ainda tem oferta e FAQ pela frente. Virou faixa que desliza
          com o dedo, um depoimento de cada vez — e a seção passa a ocupar uma
          tela. Da largura `sm` em diante volta a ser grade, que é onde grade
          faz sentido. */}
      <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {DEPOIMENTOS.map((d) => (
          <Cartao key={d.nome} d={d} aoAbrir={() => setAberto(d.nome)} />
        ))}
      </div>
      {atual && <Player d={atual} aoFechar={fechar} />}
    </>
  );
}
