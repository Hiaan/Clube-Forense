// Página de captura do grupo MedLegal Dose Diária.
//
// Fica dentro do mesmo site da mentoria, em /dose-diaria, com o mesmo
// visual, mas sem o menu nem o agendamento: o único caminho é a inscrição.

import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import Inscricao from "./Inscricao";

import logo from "../../public/logo-miguel-souza.png";
import fotoLivros from "../../public/fotos/miguel-livros.jpg";
import conversa1 from "../../public/grupo/conversa-1.jpg";
import conversa2 from "../../public/grupo/conversa-2.jpg";
import conversa3 from "../../public/grupo/conversa-3.jpg";
import conversa4 from "../../public/grupo/conversa-4.jpg";
import conversa5 from "../../public/grupo/conversa-5.jpg";

export const metadata: Metadata = {
  title: "MedLegal Dose Diária — um caso de Medicina Legal por dia | Dr. Miguel Souza",
  description:
    "Entre no grupo do Dr. Miguel Souza: todo dia um caso real de Medicina Legal comentado, com o que a banca cobra e em qual referência está.",
  openGraph: {
    title: "MedLegal Dose Diária — um caso de Medicina Legal por dia",
    description:
      "Todo dia um caso forense comentado pelo Dr. Miguel Souza, médico legista. Entre no grupo pelo WhatsApp.",
    type: "website",
    locale: "pt_BR",
  },
};

function Pilula({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-verde/40 bg-verde/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-verde">
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function BotaoInscricao({ className = "" }: { className?: string }) {
  return (
    <a
      href="#inscricao"
      className={`group inline-flex items-center justify-center gap-3 rounded-full bg-verde px-8 py-4 text-sm font-bold uppercase tracking-wide text-preto shadow-[0_15px_40px_-12px_rgba(34,180,110,0.6)] transition hover:brightness-110 ${className}`}
    >
      Quero entrar no grupo
      <span aria-hidden className="transition group-hover:translate-x-1">→</span>
    </a>
  );
}

function Celular({ img, alt, className = "" }: { img: StaticImageData; alt: string; className?: string }) {
  return (
    <div className={`rounded-[2.2rem] border border-white/15 bg-preto p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ${className}`}>
      <Image src={img} alt={alt} sizes="(min-width: 1024px) 18vw, 62vw" className="h-auto w-full rounded-[1.7rem]" />
    </div>
  );
}

const ROTINA = [
  {
    hora: "Manhã",
    titulo: "O caso do dia",
    texto: "Uma foto, um achado, uma história. E a pergunta: o que provocou essa lesão?",
  },
  {
    hora: "Ao longo do dia",
    titulo: "A discussão",
    texto: "Os colegas arriscam o diagnóstico e o mecanismo. Errar aqui não custa ponto — e é aqui que se aprende.",
  },
  {
    hora: "Fechamento",
    titulo: "O gabarito comentado",
    texto: "Eu fecho o caso com o raciocínio pericial, o que a banca cobra e em qual referência está.",
  },
];

const GANHOS = [
  {
    titulo: "Olhar pericial",
    texto: "Reconhecer lesões, sinais e mecanismos de cabeça — do jeito que a prova exige e o IML pede.",
  },
  {
    titulo: "Leitura de banca",
    texto: "Onde CESPE, FGV e outras bancas divergem, e qual autor cada uma costuma seguir.",
  },
  {
    titulo: "Constância",
    texto: "Um caso por dia, poucos minutos. Medicina Legal vira hábito, não maratona de véspera.",
  },
  {
    titulo: "Além dos livros",
    texto: "Respostas que não estão nas principais referências bibliográficas das bancas.",
  },
];

const PARA_QUEM = [
  "Médicos que querem ser médicos legistas",
  "Estudantes de Medicina mirando a perícia",
  "Concurseiros de perito criminal, odontolegista e delegado",
];

const PERGUNTAS = [
  {
    p: "Como eu entro no grupo?",
    r: "Preencha nome, e-mail e WhatsApp no formulário. Assim que você se inscreve, o acesso ao grupo é liberado.",
  },
  {
    p: "O grupo é só para médicos?",
    r: "Não. Ele é pensado para quem estuda Medicina Legal para concurso — médicos, estudantes e candidatos a carreiras periciais e policiais.",
  },
  {
    p: "Vou receber muita mensagem?",
    r: "Não. A dinâmica é de um caso por dia, com discussão e fechamento. Você pode silenciar o grupo e acompanhar no seu horário.",
  },
  {
    p: "As imagens são pesadas?",
    r: "Alguns casos trazem fotos reais de lesões, como na prática pericial. Elas são sempre usadas com finalidade de estudo.",
  },
];

export default function DoseDiaria() {
  return (
    <div className="bg-verde-escuro">
      {/* ───────── Cabeçalho ───────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-preto/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center">
            <Image src={logo} alt="Miguel Souza · Medicina Forensis" priority className="h-10 w-auto sm:h-12" />
          </Link>
          <a
            href="#inscricao"
            className="hidden rounded-full border border-verde/50 px-5 py-2 text-xs font-bold uppercase tracking-wide text-verde transition hover:bg-verde hover:text-preto sm:inline-block"
          >
            Entrar no grupo
          </a>
        </div>
      </header>

      <main>
        {/* ───────── Capa ───────── */}
        <section className="brilho-verde relative overflow-hidden pt-16">
          <div aria-hidden className="textura-capa pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-28 lg:pt-20">
            <div className="min-w-0">
              <div className="animate-surgir">
                <Pilula>Grupo no WhatsApp · MedLegal Dose Diária</Pilula>
              </div>
              <h1 className="mt-6 animate-surgir text-[2.4rem] font-bold uppercase leading-[0.95] tracking-tight [animation-delay:80ms] sm:text-6xl xl:text-7xl">
                Todo dia,
                <br />
                <span className="text-verde">um caso</span>
                <br />
                de Medicina Legal.
              </h1>
              <p className="mt-6 max-w-xl animate-surgir text-lg leading-relaxed text-osso/75 [animation-delay:160ms]">
                Entre no grupo em que eu, <strong className="font-bold text-osso">Dr. Miguel Souza</strong>, médico
                legista, posto um caso real por dia, provoco a discussão e fecho com o que a banca cobra — e em qual
                referência está.
              </p>
              <ul className="mt-8 grid animate-surgir gap-2 text-sm font-semibold text-osso/70 [animation-delay:240ms] sm:grid-cols-2">
                {["Um caso real por dia", "Gabarito comentado por um legista", "Leitura de banca e bibliografia", "Direto no seu WhatsApp"].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="grid size-4 place-items-center rounded-full bg-verde text-[9px] font-bold text-preto">✓</span>
                      {t}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div id="inscricao" className="scroll-mt-24">
              <Inscricao />
            </div>
          </div>
        </section>

        {/* ───────── Como funciona ───────── */}
        <section className="bg-osso px-4 py-24 text-preto sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-preto/15 bg-preto/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-preto/70">
                <span className="size-1.5 rounded-full bg-current" />
                Como funciona
              </span>
              <h2 className="mt-6 text-3xl font-bold uppercase leading-[1] tracking-tight sm:text-[2.6rem]">
                Um ciclo por dia.
                <span className="mt-3 block">
                  <span className="bg-azul px-2 leading-[1.2] text-osso [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                    Poucos minutos, muito aprendizado.
                  </span>
                </span>
              </h2>
            </div>

            <ol className="mt-14 grid gap-4 md:grid-cols-3">
              {ROTINA.map((r, i) => (
                <li key={r.titulo} className="relative overflow-hidden rounded-3xl border border-preto/10 bg-white p-7">
                  <span aria-hidden className="pointer-events-none absolute -bottom-6 right-3 select-none font-impacto text-[7rem] leading-none text-preto/[0.05]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-azul">{r.hora}</p>
                  <h3 className="mt-3 text-2xl font-bold uppercase leading-tight">{r.titulo}</h3>
                  <p className="relative mt-2 leading-relaxed text-preto/65">{r.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────── Por dentro do grupo ───────── */}
        <section className="brilho-verde relative overflow-hidden px-4 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <Pilula>Por dentro do grupo</Pilula>
                <h2 className="mt-6 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
                  É assim que o
                  <span className="block text-verde">olhar pericial treina.</span>
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-osso/70">
                Conversas reais do grupo. Nomes, números e imagens dos casos foram borrados para preservar os
                participantes.
              </p>
            </div>

            <div className="-mx-4 mt-14 flex snap-x gap-4 overflow-x-auto px-4 pb-6 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:items-start lg:overflow-visible lg:px-0">
              {[
                { img: conversa2, alt: "Caso do dia: o Miguel pergunta o que provocou a lesão, imagem borrada", cls: "lg:mt-10" },
                { img: conversa1, alt: "O Miguel explica a diferença de gabarito entre bancas", cls: "" },
                { img: conversa4, alt: "Participantes caracterizam uma lesão perfurocortante", cls: "lg:mt-16" },
                { img: conversa5, alt: "O Miguel comenta o raciocínio sobre distância de disparo", cls: "lg:mt-4" },
                { img: conversa3, alt: "Resposta que vai além das referências mais usadas pelas bancas", cls: "lg:mt-12" },
              ].map((c) => (
                <Celular key={c.alt} img={c.img} alt={c.alt} className={`w-[62vw] max-w-[260px] shrink-0 snap-center lg:w-auto lg:max-w-none ${c.cls}`} />
              ))}
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {GANHOS.map((g) => (
                <div key={g.titulo} className="rounded-2xl border border-verde/20 bg-preto/40 p-6">
                  <p className="text-lg font-bold uppercase text-verde">{g.titulo}</p>
                  <p className="mt-1 text-osso/70">{g.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Quem conduz ───────── */}
        <section className="bg-osso px-4 py-24 text-preto sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-cinza-foto">
              <Image
                src={fotoLivros}
                alt="Dr. Miguel Souza, médico legista, apoiado sobre livros de Medicina Legal"
                fill
                sizes="(min-width: 1024px) 36vw, 100vw"
                className="object-cover object-[50%_30%]"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-fundo via-fundo/80 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 text-osso">
                <p className="text-2xl font-bold uppercase leading-tight">Dr. Miguel Souza</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-destaque">
                  Médico legista · CRM-PE 21.839 · RQE 4.156
                </p>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-preto/15 bg-preto/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-preto/70">
                <span className="size-1.5 rounded-full bg-current" />
                Quem conduz o grupo
              </span>
              <h2 className="mt-6 text-3xl font-bold uppercase leading-[1] tracking-tight sm:text-[2.6rem]">
                Casos comentados
                <span className="mt-3 block">
                  <span className="bg-azul px-2 leading-[1.2] text-osso [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                    por quem assina laudos.
                  </span>
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-preto/70">
                Sou médico legista de carreira desde 2018, mestre e doutorando em Perícias Forenses, instrutor de
                Academia de Polícia e professor de preparatório para concursos de médico legista. No Dose Diária,
                levo para o seu celular o raciocínio que uso no dia a dia da perícia.
              </p>
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-preto/50">O grupo é para</p>
                <ul className="mt-3 space-y-2">
                  {PARA_QUEM.map((t) => (
                    <li key={t} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-bold">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-azul text-xs text-osso">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <BotaoInscricao className="mt-10" />
            </div>
          </div>
        </section>

        {/* ───────── Chamada final ───────── */}
        <section className="brilho-verde relative overflow-hidden px-4 py-24 sm:px-8 sm:py-28">
          <div aria-hidden className="textura-capa pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <Pilula>Entre agora</Pilula>
              <h2 className="mt-6 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
                O caso de amanhã
                <span className="block text-verde">já está separado.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-osso/70">
                Deixe seu nome, e-mail e WhatsApp e entre no grupo. Amanhã cedo, a sua primeira dose de Medicina
                Legal chega no celular.
              </p>
              <div className="mt-10 space-y-3">
                {PERGUNTAS.map(({ p, r }) => (
                  <details key={p} className="group rounded-2xl border border-white/10 bg-preto/40 px-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold marker:hidden [&::-webkit-details-marker]:hidden">
                      {p}
                      <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-verde text-preto transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="pb-5 leading-relaxed text-osso/70">{r}</p>
                  </details>
                ))}
              </div>
            </div>
            <Inscricao />
          </div>
        </section>
      </main>

      <footer className="bg-preto px-4 pb-24 pt-12 text-osso/50 sm:px-8 md:pb-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Image src={logo} alt="Miguel Souza · Medicina Forensis" className="h-11 w-auto" />
          <p>
            Conheça também a{" "}
            <Link href="/" className="font-bold text-verde underline-offset-4 hover:underline">
              mentoria individualizada
            </Link>
            .
          </p>
        </div>
      </footer>

      {/* Botão fixo no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-preto/90 p-3 backdrop-blur md:hidden">
        <a
          href="#inscricao"
          className="flex items-center justify-between rounded-full bg-verde px-6 py-3.5 text-sm font-bold uppercase text-preto"
        >
          Quero entrar no grupo <span aria-hidden>→</span>
        </a>
      </div>
    </div>
  );
}
