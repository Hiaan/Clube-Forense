import Image from "next/image";

import Agendamento from "./components/Agendamento";
import BarraFixa from "./components/BarraFixa";
import Escala from "./components/Escala";
import Perguntas from "./components/Perguntas";
import { LINK_GRUPO_CASOS } from "../lib/site";

import fotoBracos from "../public/fotos/miguel-bracos-cruzados.jpg";
import fotoPerfil from "../public/fotos/miguel-cadeira-perfil.jpg";
import fotoSorrindo from "../public/fotos/miguel-cadeira-sorrindo.jpg";
import fotoAcademia from "../public/fotos/miguel-academia.jpg";
import capaEbook from "../public/material/eponimos-capa.webp";
import paginaFilhos from "../public/material/eponimos-filhos-langer.webp";
import paginaArma from "../public/material/eponimos-arma-de-fogo.webp";
import paginaEnforcamento from "../public/material/eponimos-enforcamento.webp";

/** Rótulo de seção no estilo de laudo: "§ 02 — O método". */
function Secao({ n, nome, claro = false }: { n: string; nome: string; claro?: boolean }) {
  return (
    <p
      className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] ${
        claro ? "text-latao-claro" : "text-latao"
      }`}
    >
      <span>§ {n}</span>
      <span className={`h-px w-8 ${claro ? "bg-latao-claro/50" : "bg-latao/50"}`} />
      <span>{nome}</span>
    </p>
  );
}

function BotaoAgendar({ className = "" }: { className?: string }) {
  return (
    <a
      href="#agendar"
      className={`group inline-flex items-center justify-between gap-6 bg-latao px-7 py-4 text-[17px] font-medium text-tinta transition hover:bg-latao-claro ${className}`}
    >
      Agendar minha reunião
      <span aria-hidden className="transition group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

const CREDENCIAIS = [
  { rotulo: "Atuação oficial", valor: "Médico legista de carreira" },
  { rotulo: "Titulação", valor: "Mestre e doutorando em Perícias Forenses" },
  { rotulo: "Formação policial", valor: "Instrutor titular da Academia de Polícia" },
  { rotulo: "Docência", valor: "Mais de 240 alunos aprovados" },
];

const COMPARACAO = [
  ["Cronograma genérico, igual para todo mundo", "Rotina montada em cima dos seus plantões e da sua prova"],
  ["A dúvida entra na fila do fórum", "A dúvida vai direto para o Miguel, no WhatsApp"],
  ["Você descobre os erros no dia da prova", "Os erros são corrigidos toda semana, antes de virar hábito"],
  ["Teoria longe da rotina do IML", "Casos discutidos por quem faz perícia de verdade"],
];

const CICLO = [
  {
    titulo: "Encontro individual",
    texto: "Uma hora ao vivo, só vocês dois, pelo Google Meet. O que você estudou, onde errou e o que vem a seguir.",
  },
  {
    titulo: "Rota ajustada",
    texto: "O planejamento dos seus horários é reestruturado periodicamente, conforme seu desempenho e sua rotina.",
  },
  {
    titulo: "Questões e casos",
    texto: "Resolução contínua de questões e discussão de casos clínicos, para fixar o conteúdo aplicando.",
  },
  {
    titulo: "WhatsApp direto",
    texto: "Entre um encontro e outro, a dúvida não espera: vai direto para o Miguel.",
  },
];

const ACHADOS = [
  {
    titulo: "Encontros individuais toda semana",
    texto: "Atenção indivisa: uma hora ao vivo dedicada só à sua preparação, com acompanhamento dos estudos, direcionamento e alinhamento da rota.",
  },
  {
    titulo: "Aulas individuais",
    texto: "O conteúdo explicado exatamente no ponto em que você travou, no seu ritmo — não no ritmo de uma turma.",
  },
  {
    titulo: "Planejamento e estrutura periódica dos horários",
    texto: "Uma rotina de estudo que cabe na sua vida real, revista a cada etapa da preparação.",
  },
  {
    titulo: "Estratégias avançadas de estudo",
    texto: "Técnicas de retenção pensadas para a Medicina Legal: epônimos, classificações, sinais e as armadilhas que as bancas repetem.",
  },
  {
    titulo: "Discussão de casos clínicos",
    texto: "Aplicação prática e aprofundamento forense, com o raciocínio de quem assina laudos.",
  },
  {
    titulo: "Resolução contínua de questões",
    texto: "Em cada encontro, no seu ritmo, com leitura estratégica do que a banca quer de você.",
  },
  {
    titulo: "Suporte direto no WhatsApp",
    texto: "O número privado do Miguel durante toda a mentoria, para resolver qualquer dúvida.",
  },
];

const TRAJETORIA = [
  ["Medicina", "Universidade Federal de Pernambuco (UFPE)"],
  ["Residência", "Ortopedia e Traumatologia — Hospital das Clínicas da UFPE"],
  ["Especialização", "Pós-graduação em Medicina Legal e Perícia Médica"],
  ["Carreira", "Perito oficial médico legista do estado de Pernambuco"],
  ["Pós-graduação", "Mestre e doutorando em Perícias Forenses — UPE"],
  ["Academia de Polícia", "Instrutor titular do Curso de Formação de Médico Legista (2021 e 2026)"],
  ["Docência", "Professor de preparatório para médico legista, com mais de 240 aprovados"],
];

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII"];

export default function Pagina() {
  return (
    <>
      {/* ───────────── Cabeçalho ───────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-tinta/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <a href="#" className="flex items-center gap-3 text-osso">
            <span className="grid size-9 place-items-center border border-latao/60 font-serif text-[15px] tracking-tight text-latao-claro">
              MS
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-[17px]">Miguel Souza</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.28em] text-osso/50">
                Medicina Forensis
              </span>
            </span>
          </a>
          <a
            href="#agendar"
            className="hidden border border-latao/60 px-4 py-2 text-sm text-latao-claro transition hover:bg-latao hover:text-tinta sm:inline-block"
          >
            Agendar reunião
          </a>
        </div>
      </header>

      <main>
        {/* ───────────── Capa ───────────── */}
        <section className="grao relative overflow-hidden bg-tinta pt-16 text-osso">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10 px-4 pb-14 pt-14 sm:px-8 sm:pt-20 lg:pb-24 lg:pt-28">
              <p className="animate-surgir font-mono text-[11px] uppercase tracking-[0.24em] text-latao-claro">
                Mentoria individualizada · Medicina Legal para concursos
              </p>
              <h1 className="mt-7 animate-surgir font-serif text-[2.6rem] leading-[1.02] tracking-[-0.02em] [animation-delay:80ms] sm:text-6xl lg:text-[4.6rem]">
                O professor de mais de 240 médicos legistas aprovados agora vai acompanhar{" "}
                <em className="text-latao-claro">só você.</em>
              </h1>
              <p className="mt-7 max-w-xl animate-surgir text-lg leading-relaxed text-osso/70 [animation-delay:160ms] sm:text-xl">
                Pela primeira vez, o Dr. Miguel Souza abre acompanhamento individual. Toda semana, ao vivo,
                ele revisa seus estudos, corrige a rota e prepara você até o dia da prova — sem turma e sem
                dividir a atenção com ninguém.
              </p>
              <div
                id="topo"
                className="mt-10 flex animate-surgir flex-col gap-4 [animation-delay:240ms] sm:flex-row sm:items-center"
              >
                <BotaoAgendar />
                <a href="#como-funciona" className="px-1 py-2 text-osso/70 underline-offset-4 hover:text-osso hover:underline">
                  Ver como funciona
                </a>
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-osso/40">
                Reunião individual pelo Google Meet · agenda a partir de amanhã
              </p>
            </div>

            {/* Retrato com escala pericial */}
            <div className="relative min-h-[520px] bg-cinza-foto lg:min-h-0">
              <Image
                src={fotoBracos}
                alt="Dr. Miguel Souza, médico legista, de braços cruzados e sorrindo"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover object-[50%_12%]"
              />
              <Escala className="absolute bottom-6 left-6 w-40 opacity-90 sm:w-48" />
              <div className="absolute right-4 top-6 bg-osso/90 px-3 py-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-tinta/70 backdrop-blur sm:right-6">
                Fig. 1 — Dr. Miguel Souza
                <br />
                <span className="text-tinta">Médico legista · PE</span>
              </div>
            </div>
          </div>

          {/* Credenciais */}
          <div className="border-t border-white/[0.08]">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
              {CREDENCIAIS.map((c, i) => (
                <div
                  key={c.rotulo}
                  className={`border-white/[0.08] px-4 py-6 sm:px-8 ${i % 2 ? "border-l" : ""} ${
                    i > 1 ? "border-t lg:border-t-0" : ""
                  } ${i === 2 ? "lg:border-l" : ""}`}
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-latao">{c.rotulo}</dt>
                  <dd className="mt-2 font-serif text-lg leading-snug text-osso sm:text-xl">{c.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ───────────── O diferencial ───────────── */}
        <section className="px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Secao n="01" nome="O diferencial" />
            <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
              <h2 className="font-serif text-4xl leading-[1.05] tracking-[-0.015em] sm:text-6xl">
                No cursinho, você é um entre milhares. Aqui, é <em>o único.</em>
              </h2>
              <div className="space-y-5 text-lg leading-relaxed text-tinta/70 lg:pt-3">
                <p>
                  Aula gravada não percebe que você travou em asfixiologia. Fórum não nota que seu cronograma
                  não cabe nos seus plantões. Ninguém avisa que você está estudando muito o que cai pouco.
                </p>
                <p>
                  A mentoria existe para isso: <strong className="font-semibold text-tinta">um médico legista
                  olhando para a sua preparação — e só para ela</strong>, toda semana, até o dia da prova.
                </p>
              </div>
            </div>

            <div className="mt-16 overflow-hidden border border-tinta/10">
              <div className="grid grid-cols-2 bg-papel font-mono text-[10px] uppercase tracking-[0.18em] sm:text-[11px]">
                <p className="px-4 py-3 text-tinta/50 sm:px-6">Preparação comum</p>
                <p className="border-l border-tinta/10 bg-floresta px-4 py-3 text-latao-claro sm:px-6">
                  Mentoria individualizada
                </p>
              </div>
              {COMPARACAO.map(([antes, depois]) => (
                <div key={antes} className="grid grid-cols-2 border-t border-tinta/10">
                  <p className="px-4 py-5 text-[15px] text-tinta/45 line-through decoration-tinta/20 sm:px-6 sm:text-base">
                    {antes}
                  </p>
                  <p className="border-l border-tinta/10 bg-white/50 px-4 py-5 text-[15px] font-medium text-tinta sm:px-6 sm:text-base">
                    {depois}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── Como funciona ───────────── */}
        <section id="como-funciona" className="bg-floresta px-4 py-24 text-osso sm:px-8 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <Secao n="02" nome="O método" claro />
            <h2 className="mt-8 max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.015em] sm:text-6xl">
              Um ciclo semanal, do primeiro encontro <em className="text-latao-claro">ao dia da prova.</em>
            </h2>

            <ol className="mt-16 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {CICLO.map((etapa, i) => (
                <li key={etapa.titulo} className="relative bg-floresta p-7 pr-10 sm:p-8">
                  <span className="font-mono text-xs text-latao-claro">0{i + 1}</span>
                  <h3 className="mt-10 font-serif text-2xl">{etapa.titulo}</h3>
                  <p className="mt-3 leading-relaxed text-osso/65">{etapa.texto}</p>
                  <span aria-hidden className="absolute right-6 top-7 font-mono text-osso/30">
                    {i < CICLO.length - 1 ? "→" : "↺"}
                  </span>
                </li>
              ))}
            </ol>
            <div className="regua mt-12 text-osso" />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-osso/50">
              E recomeça — toda semana, até a aprovação.
            </p>
          </div>
        </section>

        {/* ───────────── O que está incluído ───────────── */}
        <section className="px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Secao n="03" nome="O que você recebe" />
              <h2 className="mt-8 font-serif text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">
                Tudo o que a sua preparação pede, <em>sob medida.</em>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-tinta/70">
                Cada item é readequado ao seu foco e à sua necessidade. O ponto de partida é a sua prova, não
                um pacote pronto.
              </p>
              <BotaoAgendar className="mt-10 hidden lg:inline-flex" />
            </div>

            <ol className="border-t border-tinta/15">
              {ACHADOS.map((a, i) => (
                <li key={a.titulo} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-tinta/15 py-7 sm:grid-cols-[4.5rem_1fr]">
                  <span className="pt-1 font-serif text-2xl italic text-latao sm:text-3xl">{ROMANOS[i]}.</span>
                  <div>
                    <h3 className="font-serif text-2xl leading-snug sm:text-[1.7rem]">{a.titulo}</h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-tinta/65">{a.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────────── Material ───────────── */}
        <section className="overflow-hidden bg-papel px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <Secao n="04" nome="O nível do material" />
              <h2 className="mt-8 font-serif text-4xl leading-[1.05] tracking-[-0.015em] sm:text-6xl">
                Até o PDF tem <em>rigor de laudo.</em>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-tinta/70">
                Além dos encontros ao vivo, o Miguel escreve o próprio material. O compêndio{" "}
                <em className="text-tinta">Epônimos em Traumatologia Forense</em> organiza sinais, leis e
                síndromes por energia causadora e lesão elementar — do jeito que a banca cobra.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Quadros sinópticos por energia",
                  "Pegadinhas de prova sinalizadas",
                  "Ilustrações anatômicas comentadas",
                  "Simulado de fixação no final",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 border-t border-tinta/15 pt-3 text-[15px]">
                    <span className="mt-[7px] size-1.5 shrink-0 bg-latao" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Páginas em leque */}
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
                  className={`absolute h-auto w-[52%] shadow-[0_20px_50px_-20px_rgba(11,18,16,0.45)] ${p.cls}`}
                />
              ))}
              <Image
                src={capaEbook}
                alt="Capa do e-book Epônimos em Traumatologia Forense, do Prof. José Miguel Souza"
                sizes="(min-width: 1024px) 26vw, 60vw"
                className="absolute bottom-0 left-0 h-auto w-[60%] -rotate-[4deg] shadow-[0_30px_60px_-20px_rgba(11,18,16,0.6)]"
              />
            </div>
          </div>
        </section>

        {/* ───────────── Academia de Polícia ───────────── */}
        <section className="relative overflow-hidden bg-tinta text-osso">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
            <div className="relative min-h-[480px] lg:order-2 lg:min-h-[680px]">
              <Image
                src={fotoAcademia}
                alt="Miguel Souza na Academia de Polícia, de braços cruzados"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[60%_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tinta via-tinta/10 to-transparent lg:bg-gradient-to-r lg:from-tinta lg:via-tinta/0" />
            </div>
            <div className="relative z-10 -mt-32 px-4 pb-20 sm:px-8 lg:mt-0 lg:flex lg:flex-col lg:justify-center lg:py-28 lg:pr-16">
              <Secao n="05" nome="Antes e depois da aprovação" claro />
              <h2 className="mt-8 font-serif text-4xl leading-[1.05] tracking-[-0.015em] sm:text-[3.4rem]">
                Ele forma os legistas depois da aprovação. Agora prepara você <em className="text-latao-claro">antes dela.</em>
              </h2>
              <p className="mt-7 text-lg leading-relaxed text-osso/70">
                O Miguel é instrutor titular do Curso de Formação de Médico Legista da Academia de Polícia de
                Pernambuco, nas turmas de 2021 e 2026 — a etapa em que os aprovados aprendem o ofício antes
                de assumir o cargo.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-osso/70">
                Ele sabe o que a perícia exige no dia a dia. Por isso sabe o que a banca vai cobrar de você.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────── O mentor ───────────── */}
        <section className="px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <figure className="relative">
              <div className="relative aspect-[4/5] overflow-hidden bg-cinza-foto">
                <Image
                  src={fotoPerfil}
                  alt="Dr. Miguel Souza sentado, com as mãos entrelaçadas"
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover object-[50%_25%]"
                />
              </div>
              <figcaption className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-tinta/50">
                <span>Fig. 2 — O mentor</span>
                <span>Pernambuco</span>
              </figcaption>
            </figure>

            <div>
              <Secao n="06" nome="Quem vai te acompanhar" />
              <h2 className="mt-8 font-serif text-5xl leading-none tracking-[-0.02em] sm:text-7xl">
                Dr. Miguel Souza
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinta/70">
                Médico legista de carreira, pesquisador e professor. Passou anos ensinando Medicina Legal
                para turmas grandes e viu de perto o que separa quem passa de quem quase passa. Agora, pela
                primeira vez, coloca essa experiência inteira a serviço de um aluno de cada vez.
              </p>

              <dl className="mt-12 border-t border-tinta/15">
                {TRAJETORIA.map(([rotulo, valor]) => (
                  <div key={rotulo} className="grid gap-1 border-b border-tinta/15 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-latao sm:pt-1">{rotulo}</dt>
                    <dd className="text-[17px] text-tinta">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ───────────── Grupo de casos ───────────── */}
        <section className="px-4 pb-24 sm:px-8 sm:pb-32">
          <div className="grao relative mx-auto max-w-7xl overflow-hidden bg-floresta px-6 py-14 text-osso sm:px-14 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-16 select-none font-serif text-[16rem] italic leading-none text-white/[0.04] sm:text-[22rem]"
            >
              §
            </div>
            <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <Secao n="07" nome="Comunidade" claro />
                <h2 className="mt-8 font-serif text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">
                  Grupo de Discussão de Casos Forenses
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-osso/70">
                  Um caso de cada vez, comentado pelo Miguel, com médicos que também miram a perícia. Achados,
                  lesões, nexo causal — e a pergunta que a banca faria sobre cada um deles.
                </p>
              </div>
              <div className="lg:text-right">
                {LINK_GRUPO_CASOS ? (
                  <a
                    href={LINK_GRUPO_CASOS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-6 border border-latao-claro/60 px-7 py-4 text-[17px] text-latao-claro transition hover:bg-latao-claro hover:text-tinta"
                  >
                    Quero participar do grupo
                    <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                  </a>
                ) : (
                  <a
                    href="#agendar"
                    className="group inline-flex items-center gap-6 border border-latao-claro/60 px-7 py-4 text-[17px] text-latao-claro transition hover:bg-latao-claro hover:text-tinta"
                  >
                    Receber o convite
                    <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Para quem é ───────────── */}
        <section className="border-y border-tinta/10 bg-white/40 px-4 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <Secao n="08" nome="Para quem é" />
            <div className="mt-10 grid gap-px bg-tinta/10 md:grid-cols-3">
              {[
                {
                  t: "Médicos que decidiram ser legistas",
                  d: "Você já tem o diploma e quer a aprovação com método, sem perder anos tentando sozinho.",
                },
                {
                  t: "Estudantes na reta final",
                  d: "Você ainda está se formando e quer chegar ao concurso com a base de Medicina Legal pronta.",
                },
                {
                  t: "Quem já tentou e quase passou",
                  d: "Você conhece o conteúdo, mas falta rota, revisão e alguém apontando onde estão os pontos perdidos.",
                },
              ].map((c) => (
                <div key={c.t} className="bg-osso p-8">
                  <h3 className="font-serif text-2xl leading-snug">{c.t}</h3>
                  <p className="mt-3 leading-relaxed text-tinta/65">{c.d}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-2xl text-tinta/60">
              <span className="font-semibold text-tinta">Não é para quem procura mais um curso gravado.</span> É para
              quem quer ser acompanhado de perto e está disposto a estudar com constância.
            </p>
          </div>
        </section>

        {/* ───────────── Agendar ───────────── */}
        <section id="agendar" className="grao bg-tinta px-4 py-24 text-osso sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <Secao n="09" nome="Agendamento" claro />
              <h2 className="mt-8 font-serif text-4xl leading-[1.05] tracking-[-0.015em] sm:text-6xl">
                Agende sua reunião <em className="text-latao-claro">com o Miguel.</em>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-osso/70">
                Uma conversa individual pelo Google Meet para entender seu momento, sua prova-alvo e sua
                rotina — e desenhar a rota até a aprovação.
              </p>
              <ul className="mt-8 space-y-3 text-osso/80">
                {[
                  "Escolha o dia e o horário a partir de amanhã",
                  "O Miguel confirma com você pelo WhatsApp",
                  "Primeiro encontro da mentoria em até 7 dias",
                ].map((t, i) => (
                  <li key={t} className="flex gap-4">
                    <span className="font-mono text-xs leading-7 text-latao-claro">0{i + 1}</span>
                    <span className="leading-7">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-12 hidden items-center gap-5 lg:flex">
                <div className="relative size-20 overflow-hidden rounded-full bg-cinza-foto">
                  <Image
                    src={fotoSorrindo}
                    alt="Dr. Miguel Souza sorrindo"
                    fill
                    sizes="80px"
                    className="scale-[2.2] object-cover object-[50%_14%]"
                  />
                </div>
                <p className="font-serif text-lg leading-snug text-osso/80">
                  Atendimento feito pessoalmente pelo Miguel,
                  <br />
                  <em className="text-latao-claro">um aluno de cada vez.</em>
                </p>
              </div>
            </div>
            <Agendamento />
          </div>
        </section>

        {/* ───────────── Perguntas ───────────── */}
        <section className="px-4 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Secao n="10" nome="Perguntas frequentes" />
              <h2 className="mt-8 font-serif text-4xl leading-[1.05] tracking-[-0.015em] sm:text-5xl">
                Antes de agendar.
              </h2>
            </div>
            <Perguntas />
          </div>
        </section>
      </main>

      <footer className="bg-tinta px-4 pb-24 pt-12 text-osso/50 sm:px-8 md:pb-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-serif text-base text-osso">Miguel Souza</span>
            <span className="mx-2 text-osso/30">|</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Medicina Forensis</span>
          </p>
          <p>Mentoria individualizada em Medicina Legal para concursos.</p>
        </div>
      </footer>

      <BarraFixa />
    </>
  );
}
