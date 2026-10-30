import Image, { type StaticImageData } from "next/image";

import Agendamento from "./components/Agendamento";
import BarraFixa from "./components/BarraFixa";
import PassoAPasso from "./components/PassoAPasso";
import Perguntas from "./components/Perguntas";
import { LINK_GRUPO_CASOS } from "../lib/site";

import fotoBracos from "../public/fotos/miguel-bracos-cruzados.jpg";
import fotoPerfil from "../public/fotos/miguel-cadeira-perfil.jpg";
import fotoAcademia from "../public/fotos/miguel-academia.jpg";
import capaEbook from "../public/material/eponimos-capa.webp";
import paginaFilhos from "../public/material/eponimos-filhos-langer.webp";
import paginaArma from "../public/material/eponimos-arma-de-fogo.webp";
import paginaEnforcamento from "../public/material/eponimos-enforcamento.webp";
import conversa1 from "../public/grupo/conversa-1.jpg";
import conversa2 from "../public/grupo/conversa-2.jpg";
import conversa3 from "../public/grupo/conversa-3.jpg";
import conversa4 from "../public/grupo/conversa-4.jpg";
import conversa5 from "../public/grupo/conversa-5.jpg";

/** Etiqueta em pílula acima dos títulos. */
function Pilula({ children, cor = "ouro" }: { children: React.ReactNode; cor?: "ouro" | "verde" | "preto" }) {
  const estilos = {
    ouro: "border-ouro/40 bg-ouro/10 text-ouro",
    verde: "border-verde/40 bg-verde/10 text-verde",
    preto: "border-preto/15 bg-preto/5 text-preto/70",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] ${estilos[cor]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function BotaoAgendar({ className = "", texto = "Agendar reunião gratuita" }: { className?: string; texto?: string }) {
  return (
    <a
      href="#agendar"
      className={`group inline-flex items-center justify-center gap-3 rounded-full bg-ouro px-8 py-4 text-sm font-black uppercase tracking-wide text-preto shadow-[0_15px_40px_-12px_rgba(231,172,60,0.6)] transition hover:bg-ouro-claro ${className}`}
    >
      {texto}
      <span aria-hidden className="transition group-hover:translate-x-1">→</span>
    </a>
  );
}

/** Captura do grupo dentro de uma moldura de celular. */
function Celular({ img, alt, className = "" }: { img: StaticImageData; alt: string; className?: string }) {
  return (
    <div className={`rounded-[2.2rem] border border-white/15 bg-preto p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ${className}`}>
      <Image src={img} alt={alt} sizes="(min-width: 1024px) 18vw, 62vw" className="h-auto w-full rounded-[1.7rem]" />
    </div>
  );
}

const FAIXA = [
  "Encontros individuais semanais",
  "Aulas individuais",
  "Discussão de casos clínicos",
  "Resolução contínua de questões",
  "Planejamento de horários",
  "Estratégias avançadas de estudo",
  "WhatsApp direto com o mentor",
];

const CREDENCIAIS = [
  ["Médico legista", "de carreira em Pernambuco"],
  ["Doutorando", "em Perícias Forenses (UPE)"],
  ["Instrutor titular", "da Academia de Polícia"],
  ["Professor", "de preparatório para legista"],
];

const PASSOS = [
  {
    titulo: "Reunião de diagnóstico",
    icone: <><path d="M9 4h6v3H9z" /><path d="M9 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3" /><path d="m9 14 2 2 4-4" /></>,
    texto:
      "Tudo começa com uma conversa individual: seu momento, sua prova-alvo, sua rotina e o que você já estudou. Não existe recomeçar do zero — existe ajustar a rota a partir de onde você está.",
  },
  {
    titulo: "Planejamento dos seus horários",
    icone: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14v3l2 1" /></>,
    texto:
      "O Miguel estrutura a sua semana de estudo em cima da vida real: plantões, família, cansaço. E reestrutura periodicamente, conforme o seu desempenho.",
  },
  {
    titulo: "Encontros individuais toda semana",
    icone: <><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m16 10 6-3v10l-6-3" /></>,
    texto:
      "Uma hora ao vivo, só vocês dois, pelo Google Meet. Acompanhamento do que foi estudado, direcionamento do que vem a seguir e alinhamento da rota até o dia da prova.",
  },
  {
    titulo: "Aulas individuais e estratégia avançada",
    icone: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z" /></>,
    texto:
      "O conteúdo explicado exatamente onde você travou, com técnicas de retenção pensadas para a Medicina Legal: epônimos, classificações, sinais e as pegadinhas que as bancas repetem.",
  },
  {
    titulo: "Questões com leitura de banca",
    icone: <><path d="m3 6 2 2 3-3M3 13l2 2 3-3M3 20l2 2 3-3" transform="translate(0 -2)" /><path d="M11 6h10M11 13h10M11 20h10" transform="translate(0 -2)" /></>,
    texto:
      "Resolução contínua de questões em cada encontro. CESPE segue o França, FGV pode seguir o Hygino — a mesma pergunta muda de gabarito conforme a banca, e você aprende a reconhecer isso.",
  },
  {
    titulo: "Casos clínicos e aprofundamento forense",
    icone: <><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1" /><path d="M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" /><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" /></>,
    texto:
      "Casos reais discutidos com o raciocínio de quem assina laudos. É onde a teoria vira reconhecimento rápido na hora da prova.",
  },
  {
    titulo: "WhatsApp direto com o mentor",
    icone: <><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    texto:
      "Entre um encontro e outro, a dúvida não espera: vai direto para o WhatsApp privado do Miguel, durante toda a mentoria.",
  },
];

const PROVAS_DO_GRUPO = [
  ["Um caso por dia", "Foto, achado e a pergunta: o que provocou essa lesão?"],
  ["Gabarito por banca", "O que vale para CESPE, o que vale para FGV — e em qual autor está."],
  ["Além dos livros", "Respostas que não estão nem no França nem no Hygino."],
];

export default function Pagina() {
  return (
    <>
      {/* ───────── Cabeçalho ───────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-preto/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <a href="#" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-ouro font-impacto text-lg text-preto">MS</span>
            <span className="leading-none">
              <span className="block text-[15px] font-black uppercase tracking-wide">Miguel Souza</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.3em] text-osso/45">Medicina Forensis</span>
            </span>
          </a>
          <a
            href="#agendar"
            className="hidden rounded-full border border-ouro/50 px-5 py-2 text-xs font-extrabold uppercase tracking-wide text-ouro transition hover:bg-ouro hover:text-preto sm:inline-block"
          >
            Reunião gratuita
          </a>
        </div>
      </header>

      <main>
        {/* ───────── Capa ───────── */}
        <section className="brilho-ouro relative overflow-hidden pt-16">
          <div aria-hidden className="textura-capa pointer-events-none absolute inset-0" />
          <div aria-hidden className="grao pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pb-24 lg:pt-20">
            <div className="min-w-0">
              <div className="animate-surgir">
                <Pilula>Mentoria individual · vagas limitadas</Pilula>
              </div>
              <h1 className="mt-6 animate-surgir text-[2.15rem] font-black uppercase leading-[0.95] tracking-tight [animation-delay:80ms] min-[400px]:text-[2.5rem] sm:text-6xl xl:text-7xl">
                Mentoria
                <br />
                individualizada
                <br />
                <span className="text-ouro">em Medicina Legal</span>
              </h1>
              <p className="mt-6 max-w-xl animate-surgir text-lg leading-relaxed text-osso/70 [animation-delay:160ms]">
                O professor que já aprovou <strong className="font-extrabold text-osso">mais de 240 médicos legistas</strong>{" "}
                vai acompanhar só você. Toda semana, ao vivo, até o dia da prova.
              </p>

              <div id="topo" className="mt-9 flex animate-surgir flex-col gap-4 [animation-delay:240ms] sm:flex-row sm:items-center">
                <BotaoAgendar />
                <a href="#como-funciona" className="px-2 py-2 text-center text-sm font-bold uppercase tracking-wide text-osso/60 transition hover:text-osso">
                  Como funciona ↓
                </a>
              </div>
              <ul className="mt-8 flex animate-surgir flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-osso/55 [animation-delay:320ms]">
                {["Reunião gratuita e individual", "Pelo Google Meet", "Plano de estudo personalizado"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="grid size-4 place-items-center rounded-full bg-ouro text-[9px] font-black text-preto">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Retrato */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-6 rounded-[3rem] bg-ouro/20 blur-3xl" aria-hidden />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cinza-foto lg:aspect-[4/5]">
                <Image
                  src={fotoBracos}
                  alt="Dr. Miguel Souza, médico legista, de braços cruzados e sorrindo"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-[50%_10%]"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-preto via-preto/40 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-impacto text-7xl leading-none text-ouro sm:text-8xl">+240</p>
                    <p className="mt-1 text-sm font-extrabold uppercase tracking-wide">alunos aprovados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black uppercase leading-tight">Dr. Miguel Souza</p>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-osso/60">Médico legista</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Faixa corrida */}
          <div className="overflow-hidden border-y border-ouro/30 bg-ouro py-3 text-preto" aria-hidden>
            <div className="flex w-max animate-faixa gap-10 whitespace-nowrap font-impacto text-xl uppercase tracking-wide">
              {[...FAIXA, ...FAIXA].map((t, i) => (
                <span key={i} className="flex items-center gap-10">
                  {t}
                  <span className="size-2 rounded-full bg-preto" />
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Quem acompanha ───────── */}
        <section className="bg-osso px-4 py-24 text-preto sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-cinza-foto">
                <Image
                  src={fotoPerfil}
                  alt="Dr. Miguel Souza sentado, com as mãos entrelaçadas"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-[50%_25%]"
                />
              </div>
              <div className="absolute -bottom-6 -right-2 rounded-2xl bg-preto px-6 py-5 text-osso shadow-2xl sm:-right-6">
                <p className="font-impacto text-5xl leading-none text-ouro">1:1</p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-wide">Um aluno por vez</p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Pilula cor="preto">Quem vai te acompanhar</Pilula>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
                Não é mais um curso gravado.
                <span className="mt-3 block">
                  <span className="bg-ouro px-2 leading-[1.15] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                    É um médico legista olhando só para você.
                  </span>
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-preto/70">
                O Dr. Miguel Souza é perito oficial médico legista, mestre e doutorando em Perícias Forenses e
                instrutor da Academia de Polícia. Depois de anos preparando turmas inteiras para o concurso, pela
                primeira vez ele abre acompanhamento individual — sem dividir a atenção com mais ninguém.
              </p>
              <dl className="mt-10 grid grid-cols-2 gap-3">
                {CREDENCIAIS.map(([titulo, sub]) => (
                  <div key={titulo} className="rounded-2xl border border-preto/10 bg-white p-5">
                    <dt className="text-lg font-black uppercase leading-tight">{titulo}</dt>
                    <dd className="mt-1 text-sm text-preto/60">{sub}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ───────── Passo a passo ───────── */}
        <section id="como-funciona" className="brilho-ouro relative overflow-hidden px-4 py-24 sm:px-8 sm:py-32">
          <div aria-hidden className="textura-capa pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto max-w-6xl">
            <div className="text-center">
              <Pilula>Por dentro da mentoria</Pilula>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
                O passo a passo
                <br />
                <span className="text-ouro">que faremos com você</span>
              </h2>
            </div>

            <PassoAPasso passos={PASSOS} />

            <div className="mt-14 text-center">
              <p className="text-xl font-extrabold uppercase sm:text-2xl">
                Do diagnóstico à prova, <span className="text-ouro">com um legista conferindo cada semana.</span>
              </p>
              <BotaoAgendar className="mt-8" />
            </div>
          </div>
        </section>

        {/* ───────── Grupo Dose Diária ───────── */}
        <section id="grupo" className="brilho-verde relative overflow-hidden border-y border-verde/20 bg-verde-escuro px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <Pilula cor="verde">Grupo de discussão de casos</Pilula>
                <h2 className="mt-6 text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">
                  Todo dia,
                  <br />
                  <span className="text-verde">uma dose</span>
                  <br />
                  de Medicina Legal.
                </h2>
              </div>
              <div>
                <p className="text-lg leading-relaxed text-osso/75">
                  No <strong className="text-osso">MedLegal Dose Diária</strong>, o Miguel posta um caso real, provoca a
                  discussão e fecha com o que a banca cobra — e em qual referência está. Médicos do Brasil inteiro
                  treinando o olho pericial, todos os dias.
                </p>
                <div className="mt-8">
                  {LINK_GRUPO_CASOS ? (
                    <a
                      href={LINK_GRUPO_CASOS}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 rounded-full bg-verde px-8 py-4 text-sm font-black uppercase tracking-wide text-preto shadow-[0_15px_40px_-12px_rgba(34,180,110,0.6)] transition hover:brightness-110"
                    >
                      Quero entrar no Dose Diária
                      <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                    </a>
                  ) : (
                    <a
                      href="#agendar"
                      className="group inline-flex items-center gap-3 rounded-full bg-verde px-8 py-4 text-sm font-black uppercase tracking-wide text-preto shadow-[0_15px_40px_-12px_rgba(34,180,110,0.6)] transition hover:brightness-110"
                    >
                      Quero entrar no Dose Diária
                      <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Celulares */}
            <div className="-mx-4 mt-16 flex snap-x gap-4 overflow-x-auto px-4 pb-6 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:items-start lg:overflow-visible lg:px-0">
              {[
                { img: conversa2, alt: "Caso do dia no grupo: o Miguel pergunta o que provocou a lesão, imagem borrada", cls: "lg:mt-10" },
                { img: conversa1, alt: "O Miguel explica a diferença de gabarito entre CESPE e FGV", cls: "" },
                { img: conversa4, alt: "Alunos caracterizam uma lesão perfurocortante no grupo", cls: "lg:mt-16" },
                { img: conversa5, alt: "O Miguel comenta o raciocínio de uma aluna sobre distância de disparo", cls: "lg:mt-4" },
                { img: conversa3, alt: "Resposta que está no e-book de epônimos do Miguel e não está no França nem no Hygino", cls: "lg:mt-12" },
              ].map((c) => (
                <Celular key={c.alt} img={c.img} alt={c.alt} className={`w-[62vw] max-w-[260px] shrink-0 snap-center lg:w-auto lg:max-w-none ${c.cls}`} />
              ))}
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {PROVAS_DO_GRUPO.map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-verde/20 bg-preto/40 p-6">
                  <p className="text-lg font-black uppercase text-verde">{t}</p>
                  <p className="mt-1 text-osso/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Material ───────── */}
        <section className="overflow-hidden bg-osso px-4 py-24 text-preto sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <Pilula cor="preto">Material autoral</Pilula>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
                Até o PDF
                <br />
                <span className="bg-ouro px-2 leading-[1.15] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">tem padrão de laudo.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-preto/70">
                Além dos encontros ao vivo, o Miguel escreve o próprio material. O compêndio{" "}
                <strong className="text-preto">Epônimos em Traumatologia Forense</strong> organiza sinais, leis e
                síndromes por energia causadora e lesão elementar — do jeito que a banca cobra.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Quadros sinópticos por energia",
                  "Pegadinhas de prova sinalizadas",
                  "Ilustrações anatômicas comentadas",
                  "Simulado de fixação no final",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-bold">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ouro text-xs text-preto">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto aspect-[4/4.2] w-full max-w-[560px]">
              {[
                { img: paginaEnforcamento, cls: "left-[46%] top-[6%] rotate-[7deg]", alt: "Página sobre lesões internas do pescoço no enforcamento" },
                { img: paginaArma, cls: "left-[30%] top-[2%] rotate-[3deg]", alt: "Página sobre arma de fogo: anel de Fisch e orla de Chavigny" },
                { img: paginaFilhos, cls: "left-[14%] top-[4%] -rotate-[2deg]", alt: "Página sobre as leis de Filhos e Langer" },
              ].map((p) => (
                <Image
                  key={p.alt}
                  src={p.img}
                  alt={p.alt}
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  className={`absolute h-auto w-[52%] rounded-md shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] ${p.cls}`}
                />
              ))}
              <Image
                src={capaEbook}
                alt="Capa do e-book Epônimos em Traumatologia Forense, do Prof. José Miguel Souza"
                sizes="(min-width: 1024px) 26vw, 60vw"
                className="absolute bottom-0 left-0 h-auto w-[60%] -rotate-[4deg] rounded-md shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
              />
            </div>
          </div>
        </section>

        {/* ───────── Academia de Polícia ───────── */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[460px] lg:order-2 lg:min-h-[680px]">
              <Image
                src={fotoAcademia}
                alt="Miguel Souza na Academia de Polícia, de braços cruzados"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[60%_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-preto via-preto/10 to-transparent lg:bg-gradient-to-r lg:from-preto lg:via-preto/0" />
            </div>
            <div className="relative z-10 -mt-28 px-4 pb-24 sm:px-8 lg:mt-0 lg:flex lg:flex-col lg:justify-center lg:py-28 lg:pr-16">
              <div>
                <Pilula>Academia de Polícia</Pilula>
              </div>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
                Ele forma os legistas depois da aprovação.
                <span className="mt-2 block text-ouro">Agora prepara você antes dela.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-osso/70">
                O Miguel é instrutor titular do Curso de Formação de Médico Legista da Academia de Polícia de
                Pernambuco, nas turmas de 2021 e 2026 — a etapa em que os aprovados aprendem o ofício antes de assumir
                o cargo. Ele sabe o que a perícia exige no dia a dia. Por isso sabe o que a banca vai cobrar.
              </p>
            </div>
          </div>
        </section>

        {/* ───────── Agendamento ───────── */}
        <section id="agendar" className="brilho-ouro relative overflow-clip border-t border-ouro/20 px-4 py-24 sm:px-8 sm:py-32">
          <div aria-hidden className="textura-capa pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <Pilula>Reunião gratuita</Pilula>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
                Agende sua reunião
                <span className="block text-ouro">com o Miguel.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-osso/70">
                Uma conversa individual, pelo Google Meet, para o Miguel entender exatamente onde você está — e
                desenhar um plano de estudo personalizado até a sua aprovação.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  ["Seu ponto de partida", "O que você já estudou, onde trava e quanto tempo sobra na rotina."],
                  ["Sua prova-alvo", "Banca, edital e referências que vão pesar na sua aprovação."],
                  ["Seu plano", "Como a mentoria se encaixa no seu caso — e todos os detalhes para começar."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="w-9 shrink-0 font-impacto text-3xl leading-none text-ouro">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-black uppercase">{t}</span>
                      <span className="block text-osso/60">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Agendamento />
          </div>
        </section>

        {/* ───────── Perguntas ───────── */}
        <section className="bg-osso px-4 py-24 text-preto sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Pilula cor="preto">Perguntas frequentes</Pilula>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
                Antes de agendar.
              </h2>
            </div>
            <Perguntas />
          </div>
        </section>
      </main>

      <footer className="px-4 pb-24 pt-12 text-osso/50 sm:px-8 md:pb-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-black uppercase tracking-wide text-osso">
            Miguel Souza <span className="mx-2 text-osso/30">|</span>
            <span className="text-xs font-bold tracking-[0.25em] text-osso/50">Medicina Forensis</span>
          </p>
          <p>Mentoria individualizada em Medicina Legal para concursos.</p>
        </div>
      </footer>

      <BarraFixa />
    </>
  );
}
