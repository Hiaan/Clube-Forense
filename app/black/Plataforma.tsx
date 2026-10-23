"use client";

// A plataforma por dentro, em abas.
//
// POR QUE ABAS E NÃO UMA LISTA. Lista de recursos é lida em diagonal e não
// convence ninguém: "flashcards" numa bala de bullet point não diz nada a quem
// nunca viu os nossos. Em abas, a pessoa escolhe o que quer ver e cada recurso
// ganha a tela inteira por um momento — e a escolha dela já é um pequeno
// compromisso com a página.
//
// A MÍDIA É A PLATAFORMA DE VERDADE, ONDE ELA EXISTE. Aulas, questões e mapas
// mostram gravações da própria plataforma — os GIFs que o Clube já usava no
// site do preparatório, convertidos para vídeo (38 MB de GIF viraram 1,7 MB de
// MP4; GIF é um formato de 1989 e paga caro por cada quadro).
//
// Onde ainda não há gravação — flashcards e mini-jogos —, a aba mostra uma
// maquete desenhada em CSS do recurso. É honesto, não é captura de tela
// fingida, e some sob o arquivo real no instante em que ele for colocado em
// `public/black/` e escrito no campo `midia`.

import { useState } from "react";

interface Recurso {
  chave: string;
  nome: string;
  titulo: string;
  texto: string;
  /**
   * Arquivo em `public/black/`. Aceita .mp4 (vira vídeo em laço, sem som) e
   * .gif/.webp/.png (vira imagem). Deixe `null` para ficar com a maquete.
   */
  midia: string | null;
}

const RECURSOS: Recurso[] = [
  {
    chave: "aulas",
    nome: "Aulas",
    titulo: "O edital inteiro, na ordem certa",
    texto:
      "Videoaulas gravadas cobrindo o conteúdo de medicina legal do começo ao fim, na sequência em que ele se constrói — e não na ordem em que o edital lista. Quando um edital novo sai, o curso daquele concurso entra para você sem custo.",
    midia: "aulas.mp4",
  },
  {
    chave: "questoes",
    nome: "Questões",
    titulo: "Mais de 25 mil questões, com o professor explicando",
    texto:
      "O Almanaque Forense reúne as questões das bancas que cobram o cargo, com comentário escrito e vídeo do professor resolvendo as que derrubam mais gente. Errar com explicação do lado é o que transforma erro em ponto.",
    midia: "questoes.mp4",
  },
  {
    chave: "flashcards",
    nome: "Flashcards",
    titulo: "Revisão ativa, no intervalo do plantão",
    texto:
      "Baralhos de flashcards por tema, para revisar em cinco minutos o que levaria uma hora relendo resumo. Repetição espaçada é o que mantém tanatologia fresca em dezembro para uma prova que é em março.",
    midia: null,
  },
  {
    chave: "jogos",
    nome: "Mini-jogos",
    titulo: "Conceito que não gruda lendo, gruda jogando",
    texto:
      "Mini-jogos de associação e classificação para os assuntos que todo mundo confunde — tipos de lesão, fenômenos cadavéricos, cronotanatognose. Você joga, erra barato e fixa.",
    midia: null,
  },
  {
    chave: "mapas",
    nome: "Mapas mentais",
    titulo: "Cada assunto numa página ilustrada",
    texto:
      "Os mapas mentais do Clube condensam o assunto inteiro numa página desenhada — a que você olha na véspera e lembra do resto. Feitos para medicina legal, não adaptados de outra carreira.",
    midia: "mapas.mp4",
  },
  {
    chave: "ebooks",
    nome: "eBooks",
    titulo: "eBooks de todas as matérias",
    texto:
      "Escritos pelos nossos professores a partir das principais bibliografias de cada matéria, já no recorte que a prova de médico-legista cobra. Você estuda pelo que cai, e não pelo livro inteiro.",
    midia: "ebooks.mp4",
  },
  {
    chave: "verticalizado",
    nome: "Edital verticalizado",
    titulo: "O edital inteiro, item por item",
    texto:
      "Cada tópico do conteúdo programático virado em linha, com o que você já estudou, o que falta e o que ainda precisa de revisão. É o edital deixando de ser um PDF e virando uma lista que você risca.",
    midia: null,
  },
  {
    chave: "painel",
    nome: "Painel pericial",
    titulo: "Onde você está, em números",
    texto:
      "O acompanhamento do seu desempenho por matéria e por assunto, para a próxima hora de estudo ir onde ela rende mais — e não onde é mais confortável.",
    midia: null,
  },
  {
    chave: "cronograma",
    nome: "Cronograma",
    titulo: "O edital encaixado na sua rotina",
    texto:
      "Você diz quanto tempo tem; o cronograma distribui o conteúdo e as revisões pelos seus dias, de forma automatizada. Atrasou numa semana, ele se refaz em vez de virar cobrança.",
    midia: null,
  },
];

/** A moldura do recurso: o arquivo real quando existe, a maquete quando não. */
function Midia({ recurso }: { recurso: Recurso }) {
  if (recurso.midia) {
    const ehVideo = recurso.midia.endsWith(".mp4");
    const semExtensao = recurso.midia.replace(/\.mp4$/, "");
    return ehVideo ? (
      // Dois formatos: webm (VP9) e mp4 (H.264). Ver a explicação em
      // HeroComposicao.tsx — com só um deles, parte dos navegadores mostra
      // um retângulo preto no lugar da plataforma.
      <video
        autoPlay
        loop
        muted
        playsInline
        // `contain` e não `cover`: a gravação é 16:9 dentro de uma moldura
        // 4:3, e cortar as laterais come justamente o texto do slide e os
        // filtros da tela — o que a pessoa foi ali ver.
        className="h-full w-full rounded-2xl object-contain"
      >
        <source src={`/black/${semExtensao}.webm`} type="video/webm" />
        <source src={`/black/${semExtensao}.mp4`} type="video/mp4" />
      </video>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/black/${recurso.midia}`}
        alt={recurso.titulo}
        className="h-full w-full rounded-2xl object-cover"
      />
    );
  }
  return <Maquete chave={recurso.chave} />;
}

/** Maquetes em CSS — o que cada recurso é, desenhado. */
function Maquete({ chave }: { chave: string }) {
  if (chave === "questoes") {
    return (
      <div className="flex h-full w-full flex-col gap-2.5 rounded-2xl bg-[#101016] p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#ffcd07]">
          Questão 1.284 · FGV
        </p>
        <p className="text-sm leading-relaxed text-white/80">
          Na cronotanatognose, a mancha verde abdominal costuma surgir na fossa
          ilíaca direita porque…
        </p>
        <div className="mt-1 space-y-1.5">
          {["é a região de maior proliferação bacteriana", "há menor espessura da parede"].map(
            (alt, i) => (
              <div
                key={alt}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  i === 0
                    ? "border-green-500/40 bg-green-500/10 text-green-300"
                    : "border-white/10 bg-white/[0.03] text-white/50"
                }`}
              >
                {alt}
              </div>
            ),
          )}
        </div>
        <div className="mt-auto flex items-center gap-2 rounded-lg bg-[#ffcd07]/10 px-3 py-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#ffcd07] text-xs font-black text-gray-900">
            ▶
          </span>
          <span className="text-xs font-semibold text-[#ffcd07]">
            Ver o professor resolvendo
          </span>
        </div>
      </div>
    );
  }

  if (chave === "flashcards") {
    return (
      <div className="relative grid h-full w-full place-items-center rounded-2xl bg-[#101016] p-5">
        <div className="absolute h-36 w-56 rotate-6 rounded-xl border border-white/10 bg-white/[0.04]" />
        <div className="absolute h-36 w-56 -rotate-3 rounded-xl border border-white/10 bg-white/[0.06]" />
        <div className="relative flex h-36 w-56 flex-col justify-between rounded-xl border border-[#ffcd07]/40 bg-[#15151c] p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
            Tanatologia
          </span>
          <span className="text-sm font-bold leading-snug text-white">
            Qual fenômeno cadavérico transitivo aparece primeiro?
          </span>
          <span className="text-[11px] font-semibold text-[#ffcd07]">
            tocar para virar →
          </span>
        </div>
      </div>
    );
  }

  if (chave === "jogos") {
    return (
      <div className="grid h-full w-full grid-cols-3 gap-2.5 rounded-2xl bg-[#101016] p-5">
        {[
          "Equimose",
          "Escoriação",
          "Ferida contusa",
          "Perfuro-cortante",
          "Corto-contusa",
          "Perfurante",
        ].map((t, i) => (
          <div
            key={t}
            className={`grid place-items-center rounded-xl border px-2 text-center text-[11px] font-semibold ${
              i === 1 || i === 4
                ? "border-[#ffcd07]/50 bg-[#ffcd07]/10 text-[#ffcd07]"
                : "border-white/10 bg-white/[0.03] text-white/60"
            }`}
          >
            {t}
          </div>
        ))}
      </div>
    );
  }

  if (chave === "verticalizado") {
    return (
      <div className="flex h-full w-full flex-col gap-1.5 rounded-2xl bg-[#101016] p-5">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#ffcd07]">
          Medicina Legal · 1. Tanatologia
        </p>
        {[
          ["1.1 Conceito e tipos de morte", "ok"],
          ["1.2 Fenômenos cadavéricos", "ok"],
          ["1.3 Cronotanatognose", "revisar"],
          ["1.4 Documentos médico-legais", "falta"],
        ].map(([item, estado]) => (
          <div
            key={item}
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <span
              className={`grid h-4 w-4 shrink-0 place-items-center rounded text-[9px] font-black ${
                estado === "ok"
                  ? "bg-green-500/80 text-gray-900"
                  : estado === "revisar"
                    ? "bg-[#ffcd07] text-gray-900"
                    : "border border-white/20 text-transparent"
              }`}
            >
              ✓
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] text-white/70">{item}</span>
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-white/30">
              {estado === "ok" ? "estudado" : estado === "revisar" ? "revisar" : "a fazer"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (chave === "painel") {
    return (
      <div className="flex h-full w-full flex-col gap-3 rounded-2xl bg-[#101016] p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#ffcd07]">
          Seu desempenho
        </p>
        {[
          ["Tanatologia", 82],
          ["Traumatologia", 64],
          ["Asfixiologia", 41],
          ["Sexologia forense", 73],
        ].map(([materia, pct]) => (
          <div key={String(materia)}>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-white/70">{materia}</span>
              <span className="text-[11px] font-bold text-white/50">{pct}%</span>
            </div>
            <span className="mt-1 block h-1.5 rounded-full bg-white/10">
              <span
                className="block h-1.5 rounded-full bg-[#ffcd07]"
                style={{ width: `${pct}%` }}
              />
            </span>
          </div>
        ))}
        <p className="mt-auto rounded-lg bg-[#ffcd07]/10 px-3 py-2 text-[11px] font-semibold text-[#ffcd07]">
          Estude asfixiologia hoje — é onde você mais erra.
        </p>
      </div>
    );
  }

  if (chave === "cronograma") {
    return (
      <div className="flex h-full w-full flex-col gap-2 rounded-2xl bg-[#101016] p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#ffcd07]">
          Esta semana · 2h por dia
        </p>
        {[
          ["Seg", "Tanatologia — aula 4", true],
          ["Ter", "Questões: tanatologia", true],
          ["Qua", "Traumatologia — aula 1", false],
          ["Qui", "Revisão: fenômenos cadavéricos", false],
        ].map(([dia, tarefa, feito]) => (
          <div
            key={String(dia)}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <span className="w-8 shrink-0 text-[10px] font-black uppercase text-white/35">
              {dia}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-[11px] ${
                feito ? "text-white/35 line-through" : "text-white/75"
              }`}
            >
              {tarefa}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (chave === "mapas") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#101016] p-5">
        <div className="relative h-full w-full">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffcd07] px-4 py-2 text-xs font-black text-gray-900">
            Asfixiologia
          </div>
          {[
            { t: "Enforcamento", c: "left-0 top-2" },
            { t: "Estrangulamento", c: "right-0 top-6" },
            { t: "Esganadura", c: "left-2 bottom-4" },
            { t: "Afogamento", c: "right-2 bottom-0" },
          ].map((n) => (
            <div
              key={n.t}
              className={`absolute ${n.c} rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-white/70`}
            >
              {n.t}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-2xl bg-[#101016] p-5">
      {["Tanatologia — aula 1", "Tanatologia — aula 2", "Traumatologia — aula 1"].map(
        (t, i) => (
          <div
            key={t}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3"
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${
                i === 0 ? "bg-[#ffcd07] text-gray-900" : "bg-white/10 text-white/50"
              }`}
            >
              ▶
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-white/80">{t}</span>
              <span className="mt-1 block h-1 rounded-full bg-white/10">
                <span
                  className="block h-1 rounded-full bg-[#ffcd07]"
                  style={{ width: i === 0 ? "70%" : "0%" }}
                />
              </span>
            </span>
          </div>
        ),
      )}
    </div>
  );
}

export default function Plataforma() {
  const [ativo, setAtivo] = useState(RECURSOS[0].chave);
  const recurso = RECURSOS.find((r) => r.chave === ativo) ?? RECURSOS[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Recursos da plataforma"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
      >
        {RECURSOS.map((r) => (
          <button
            key={r.chave}
            role="tab"
            aria-selected={r.chave === ativo}
            onClick={() => setAtivo(r.chave)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
              r.chave === ativo
                ? "bg-gray-900 text-[#ffcd07]"
                : "border border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900"
            }`}
          >
            {r.nome}
          </button>
        ))}
      </div>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <p className="font-mono text-sm font-black text-[#b38f00]">
            {String(RECURSOS.findIndex((r) => r.chave === recurso.chave) + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            {recurso.titulo}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-gray-600">{recurso.texto}</p>
        </div>
        {/* Moldura de tela: a maquete é escura e, sobre o fundo claro, lê-se
            como a tela do produto — que é exatamente o que ela representa. */}
        <div className="order-1 aspect-[4/3] w-full overflow-hidden rounded-3xl border border-gray-200 bg-[#101016] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] lg:order-2">
          <Midia recurso={recurso} />
        </div>
      </div>
    </div>
  );
}
