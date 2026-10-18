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
      // Recortado do depoimento publicado, com as reticências marcando o
      // corte: inteiro, ele tinha o dobro do tamanho dos outros cinco e
      // esticava todos os cartões da faixa para caber.
      "De início achei que não conseguiria estudar… No final acreditei que teria chances: persisti e continuei esperançoso, assim hoje aprovado.",
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
        sizes="250px"
        // O NAVEGADOR ACHAVA QUE ESTAVA ARRASTANDO A FOTO. Imagem é arrastável
        // por padrão: no meio do puxão a faixa travava porque o Chrome tinha
        // começado um arrastar-e-soltar da própria imagem e parado de mandar
        // os eventos de ponteiro. Sem isto, a faixa anda uns 70 pixels e morre.
        draggable={false}
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
    <figure className="card-white w-[224px] shrink-0 overflow-hidden sm:w-[248px]">
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
      <figcaption className="px-4 pt-4">
        <p className="text-sm font-black leading-tight text-gray-900">{d.nome}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#b38f00]">
          {d.cargo}
        </p>
      </figcaption>
      <blockquote className="px-4 pb-5 pt-2.5 text-[13px] leading-relaxed text-gray-600">
        <span className="text-[#b38f00]">“</span>
        {d.texto}
        <span className="text-[#b38f00]">”</span>
      </blockquote>
    </figure>
  );
}

/** A setinha das pontas. Vira para o outro lado com `espelhada`. */
function Seta({ espelhada = false }: { espelhada?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-5 w-5 ${espelhada ? "rotate-180" : ""}`}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function Depoimentos() {
  const [aberto, setAberto] = useState<string | null>(null);
  const atual = DEPOIMENTOS.find((d) => d.nome === aberto) ?? null;
  // Estável de propósito: se esta função nascesse de novo a cada render, o
  // efeito do player rodaria junto e o vídeo voltaria ao começo sozinho.
  const fechar = useCallback(() => setAberto(null), []);

  const faixa = useRef<HTMLDivElement>(null);
  const [noComeco, setNoComeco] = useState(true);
  const [noFim, setNoFim] = useState(false);

  // O estado do arrasto mora em ref, não em state: ele muda a cada pixel do
  // mouse e um render por pixel transformaria o arrasto num slideshow.
  const arrasto = useRef({ ativo: false, preso: false, x0: 0, scroll0: 0, andou: 0 });

  /** Acende e apaga as setas conforme a faixa chega nas pontas. */
  const medir = useCallback(() => {
    const el = faixa.current;
    if (!el) return;
    setNoComeco(el.scrollLeft <= 1);
    setNoFim(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = faixa.current;
    if (!el) return;
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [medir]);

  /** Anda um cartão para o lado (a largura do primeiro + o vão). */
  const andar = (direcao: 1 | -1) => {
    const el = faixa.current;
    const cartao = el?.firstElementChild as HTMLElement | undefined;
    if (!el || !cartao) return;
    el.scrollBy({ left: direcao * (cartao.clientWidth + 16), behavior: "smooth" });
  };

  return (
    <>
      {/* TUDO NUMA LINHA SÓ, QUE SE PUXA COM O MOUSE — e foi pedido assim, com
          razão: em grade, o olho varre seis cartões de uma vez e não para em
          nenhum. Numa faixa, cada depoimento chega por vez e o próximo aparece
          pela metade na borda, que é o que faz a pessoa continuar.

          POR QUE NÃO É A MESMA FAIXA DOS EDITAIS. Aquela anda sozinha, em CSS,
          porque lá o conteúdo é um dado curto que só precisa passar. Aqui a
          pessoa escolhe quem vai assistir — uma faixa andando sozinha tiraria
          da mão dela justamente a escolha. Então esta não anda: ela obedece. O
          dedo já arrastava de graça (rolagem horizontal nativa); o mouse não,
          e é o que este punhado de código adiciona.

          O ARRASTO NÃO PODE VIRAR CLIQUE. Quem puxa a faixa segurando em cima
          de um cartão solta o botão em cima de outro — e sem cuidado isso abre
          um vídeo que ninguém pediu. Por isso o movimento é medido: passou de
          6 pixels, o clique seguinte é engolido. */}
      <div className="relative mt-10">
        <div
          ref={faixa}
          onScroll={medir}
          onPointerDown={(e) => {
            // Só mouse. No toque, a rolagem nativa já faz isso melhor do que
            // qualquer código nosso — e interceptar estragaria a inércia.
            if (e.pointerType !== "mouse") return;
            const el = faixa.current;
            if (!el) return;
            arrasto.current = {
              ativo: true,
              x0: e.clientX,
              scroll0: el.scrollLeft,
              andou: 0,
              preso: false,
            };
          }}
          onPointerMove={(e) => {
            const a = arrasto.current;
            const el = faixa.current;
            if (!a.ativo || !el) return;
            const dx = e.clientX - a.x0;
            a.andou = Math.max(a.andou, Math.abs(dx));
            // A CAPTURA SÓ COMEÇA DEPOIS QUE A MÃO ANDA, e esse detalhe custou
            // caro: capturando já no apertar do botão, o clique passa a ser
            // entregue à faixa em vez do cartão — e nenhum vídeo abria mais.
            // Agora, enquanto o ponteiro está parado, ele é um clique comum;
            // virou arrasto, a faixa toma o ponteiro para si e a pessoa pode
            // puxar para fora da seção sem a faixa largar no meio do caminho.
            if (!a.preso && a.andou > 4) {
              el.setPointerCapture(e.pointerId);
              a.preso = true;
            }
            el.scrollLeft = a.scroll0 - dx;
          }}
          onPointerUp={(e) => {
            const a = arrasto.current;
            if (a.preso) faixa.current?.releasePointerCapture(e.pointerId);
            a.ativo = false;
            a.preso = false;
          }}
          onPointerCancel={() => {
            arrasto.current.ativo = false;
            arrasto.current.preso = false;
          }}
          onClickCapture={(e) => {
            if (arrasto.current.andou > 6) {
              e.preventDefault();
              e.stopPropagation();
              arrasto.current.andou = 0;
            }
          }}
          // `[scrollbar-width:none]` e o `::-webkit-scrollbar` escondem a barra:
          // ela aparecia como um risco cinza no meio de uma seção clara. A
          // rolagem continua lá, com o dedo, com a roda e com as setas.
          // Sem `scroll-smooth` de propósito: com ele, cada `scrollLeft` do
          // arrasto vira uma animação e a faixa passa a vir atrás do mouse,
          // borrachuda. As setas pedem a animação por conta própria, no
          // scrollBy.
          className="-mx-4 flex cursor-grab gap-4 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          style={{
            // Sem isto o arrasto na horizontal também seleciona o texto das
            // citações, e a faixa fica cheia de azul de seleção.
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {DEPOIMENTOS.map((d) => (
            <Cartao key={d.nome} d={d} aoAbrir={() => setAberto(d.nome)} />
          ))}
        </div>

        {/* As setas existem para quem não descobre que dá para arrastar — e
            para teclado, que não arrasta nada. Somem no celular, onde o dedo
            resolve e elas só tapariam cartão. */}
        {[
          { lado: "esq" as const, desligada: noComeco },
          { lado: "dir" as const, desligada: noFim },
        ].map(({ lado, desligada }) => (
          <button
            key={lado}
            type="button"
            onClick={() => andar(lado === "dir" ? 1 : -1)}
            disabled={desligada}
            aria-label={lado === "dir" ? "Próximos depoimentos" : "Depoimentos anteriores"}
            className={`absolute top-[34%] z-10 hidden h-11 w-11 place-items-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)] transition hover:border-gray-900 disabled:pointer-events-none disabled:opacity-0 sm:grid ${
              lado === "dir" ? "-right-3" : "-left-3"
            }`}
          >
            <Seta espelhada={lado === "esq"} />
          </button>
        ))}
      </div>
      {atual && <Player d={atual} aoFechar={fechar} />}
    </>
  );
}
