import type { Metadata } from "next";
import Image from "next/image";

import {
  AUTORA,
  BARREIRAS,
  BONUS,
  CHECKOUT_URL,
  CONTATO,
  DEPOIMENTOS,
  ENTREGAS,
  FAQ,
  GARANTIA,
  HERO,
  MARCA,
  MODULOS,
  OFERTA,
  OPORTUNIDADE,
  PERFIS,
  PILARES,
  PRECO,
  PROJETOS,
  SELOS,
  SOZINHO,
} from "./conteudo";

// Página de vendas: nada aqui depende de requisição, então ela é estática e
// serve do cache do CDN — o que importa numa página que recebe tráfego pago.
export const metadata: Metadata = {
  title: "MEAP — Método Estruturas de Alto Padrão | Queren Costa",
  description:
    "Aprenda a projetar, captar clientes e faturar com Projetos Estruturais de Alto Padrão.",
};

/**
 * CTA. Sobre as faixas pêssego o botão inverte para navy — é a mesma troca que
 * a página de captura faz, e é o que mantém o contraste em qualquer fundo.
 */
function Cta({
  children,
  variante = "peach",
  className = "",
}: {
  children: React.ReactNode;
  variante?: "peach" | "navy";
  className?: string;
}) {
  return (
    <a
      href={CHECKOUT_URL}
      className={`${
        variante === "peach" ? "btn-peach" : "btn-navy"
      } inline-flex items-center justify-center px-8 py-4 text-center text-sm leading-tight sm:text-base ${className}`}
    >
      {children}
    </a>
  );
}

/**
 * Ícones desenhados à mão em SVG, para não trazer uma biblioteca inteira nem
 * depender de arquivo externo. Todos usam o mesmo traço de 1,7px para ficarem
 * visualmente irmãos.
 */
const DESENHOS = {
  livro: "M4 5a2 2 0 0 1 2-2h9v18H6a2 2 0 0 1-2-2zM15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3",
  capelo: "M12 4 2 9l10 5 10-5zM6 12v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V12",
  dinheiro:
    "M2 7h20v10H2zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M5.5 7v.01M18.5 17v.01",
  maleta:
    "M3 8h18v11H3zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18",
  capacete:
    "M3 16a9 9 0 0 1 18 0zM9 16V7.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 7.5V16M2 19h20",
  moedas:
    "M4 7c0-1.1 3.1-2 7-2s7 .9 7 2-3.1 2-7 2-7-.9-7-2M4 7v5c0 1.1 3.1 2 7 2s7-.9 7-2V7M4 12v5c0 1.1 3.1 2 7 2s7-.9 7-2v-5",
  escudo: "M12 3 4 6v6c0 4.4 3.4 7.9 8 9 4.6-1.1 8-4.6 8-9V6zM9 12l2.2 2.2L15 10.5",
  trofeu:
    "M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1.5A3.5 3.5 0 0 0 7 11M17 6h3v1.5A3.5 3.5 0 0 1 17 11M10 19h4M12 14v5M8 21h8",
  cadeado:
    "M5 11h14v9H5zM8 11V7.5a4 4 0 0 1 8 0V11M12 15v2",
} as const;

function Icone({
  nome,
  className = "",
}: {
  nome: keyof typeof DESENHOS;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d={DESENHOS[nome]} />
    </svg>
  );
}

/** Selos de compra segura, logo abaixo dos botões. */
function Selos({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-x-7 gap-y-3 ${className}`}
    >
      {SELOS.map((s) => (
        <li key={s.linha1} className="flex items-center gap-2">
          <Icone nome={s.icone} className="h-7 w-7 text-white/45" />
          <span className="text-[0.7rem] font-semibold uppercase leading-tight tracking-wide text-white/55">
            {s.linha1}
            <span className="block font-normal">{s.linha2}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Moldura de notebook. A tela recebe o print da área de membros quando houver;
 * sem ele, mostra um mosaico de blocos que sugere a grade de módulos sem
 * fingir uma captura que não existe.
 */
function Notebook({ imagem }: { imagem: string }) {
  return (
    <div className="mx-auto w-full max-w-xl">
      {/* A tampa é um pouco mais estreita que a base — é isso que dá o volume
          do aparelho. Alargar a base para além do container criava rolagem
          horizontal na página inteira. */}
      <div className="mx-auto w-[94%] rounded-xl border-[6px] border-[#0b1220] bg-[#0b1220] shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-16/10 overflow-hidden rounded-md bg-[#0f1626]">
          {imagem ? (
            <Image
              src={imagem}
              alt="Área de membros do MEAP"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div aria-hidden className="grid h-full grid-cols-4 gap-1.5 p-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm bg-linear-to-br from-[#2c375b] to-[#141c2e]"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto h-2.5 w-full rounded-b-xl bg-[#0b1220]" />
    </div>
  );
}

/** Moldura de celular com a conversa do grupo. */
function Celular({
  imagem,
  grupo,
  conversa,
}: {
  imagem: string;
  grupo: string;
  conversa: { de: "aluno" | "queren"; texto: string }[];
}) {
  return (
    <div className="mx-auto w-full max-w-[16rem]">
      <div className="rounded-[2.2rem] border-[10px] border-[#1e2637] bg-[#1e2637] shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
        <div className="relative aspect-9/19 overflow-hidden rounded-[1.5rem] bg-[#0b1220]">
          {imagem ? (
            <Image
              src={imagem}
              alt={`Conversa do ${grupo}`}
              fill
              sizes="256px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 bg-[#141c2e] px-3 py-3">
                <span className="h-6 w-6 shrink-0 rounded-full bg-[#25d366]/80" />
                <span className="truncate text-[0.6rem] font-semibold text-white/85">
                  {grupo}
                </span>
              </div>
              {/* As mensagens encostam embaixo, como em conversa de verdade —
                  senão o aparelho fica com um vazio no pé da tela. */}
              <div className="flex flex-1 flex-col justify-end gap-2 p-2.5">
                {conversa.map((m) => (
                  <p
                    key={m.texto}
                    className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-[0.58rem] leading-snug ${
                      m.de === "queren"
                        ? "self-end bg-[#25d366]/20 text-white/85"
                        : "self-start bg-white/10 text-white/75"
                    }`}
                  >
                    {m.texto}
                  </p>
                ))}
                <div className="mt-1.5 h-6 rounded-full bg-white/[0.07]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Rótulo curto acima do título da seção. */
function Eyebrow({
  children,
  sobrePeach = false,
}: {
  children: React.ReactNode;
  sobrePeach?: boolean;
}) {
  return (
    <p className={`eyebrow ${sobrePeach ? "eyebrow-on-peach" : ""}`}>
      {children}
    </p>
  );
}

export default function MeapPage() {
  return (
    <>
      <main className="pb-24 sm:pb-0">
        {/* ---------------------------------------------------------------- */}
        {/* Hero — duas colunas: texto à esquerda, retrato à direita sobre um
            painel mais escuro com o grafismo geométrico. */}
        <section className="relative overflow-hidden bg-[#1b243a]">
          {/* O painel escuro da direita e o brilho diagonal são desenhados no
              fundo da seção para que, no celular (uma coluna só), eles
              simplesmente não apareçam. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden lg:block"
          >
            <div className="absolute inset-y-0 right-0 w-[35%] bg-[#0f1626]" />
            <div className="absolute -top-32 left-[15%] h-[34rem] w-[34rem] rounded-full bg-[#2c375b] opacity-40 blur-3xl" />
            {/* Grafismo: quadrado vazado atrás do retrato, como na arte. */}
            <div className="absolute right-[14%] top-1/2 h-[27rem] w-[27rem] -translate-y-1/2 rotate-12 rounded-[2rem] border-[10px] border-white/[0.05]" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-16 lg:grid-cols-[1fr_minmax(0,36%)] lg:gap-8 lg:py-20">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element --
                  A logo vem do Wix já dimensionada; passar pelo otimizador do
                  next/image não traria ganho e adicionaria um domínio remoto a
                  mais para configurar. */}
              <img
                src={MARCA.logo}
                alt={MARCA.logoAlt}
                className="h-12 w-auto sm:h-14"
              />

              <p className="eyebrow mt-7">{HERO.eyebrow}</p>

              <h1 className="mt-3 max-w-xl font-sora text-3xl leading-[1.15] text-white sm:text-4xl lg:text-[2.6rem]">
                Aprenda a{" "}
                <strong className="font-bold">
                  projetar, captar clientes e faturar
                </strong>{" "}
                com{" "}
                <em className="font-bold italic">
                  Projetos Estruturais de Alto Padrão.
                </em>
              </h1>

              <p className="mt-5 max-w-xl leading-relaxed text-white/80">
                Conquiste a{" "}
                <em className="font-semibold italic text-white">
                  segurança técnica
                </em>{" "}
                e o{" "}
                <em className="font-semibold italic text-white">
                  método comercial
                </em>{" "}
                {HERO.sub}
              </p>

              <ul className="mt-6 grid max-w-xl gap-x-6 gap-y-2 text-sm font-medium text-white sm:grid-cols-2">
                {HERO.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span aria-hidden className="text-[#daa520]">
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8 max-w-md">
                <Cta className="w-full">{HERO.cta}</Cta>
                <p className="mt-3 text-center text-xs font-medium text-white/75">
                  {HERO.escassez}
                </p>
                <Selos className="mt-5" />
              </div>
            </div>

            {/* O retrato encosta na base da seção no desktop, como na arte. */}
            <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none lg:self-end">
              <Image
                src={HERO.foto}
                alt={HERO.fotoAlt}
                width={942}
                height={1134}
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* A oportunidade — faixa pêssego, como na captura */}
        <section className="bg-[#ffc781] text-[#2c375b]">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
            <Eyebrow sobrePeach>A oportunidade</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              {OPORTUNIDADE.titulo}
            </h2>
            {OPORTUNIDADE.paragrafos.map((p) => (
              <p
                key={p}
                className="mt-5 max-w-3xl text-base leading-relaxed text-[#2c375b]/90 sm:text-lg"
              >
                {p}
              </p>
            ))}

            <div className="mt-9 rounded-2xl bg-[#2c375b] p-6 text-white sm:flex sm:items-center sm:gap-6 sm:p-7">
              <p className="whitespace-nowrap font-sora text-3xl font-extrabold tracking-tight text-[#ffc781] sm:text-4xl">
                {OPORTUNIDADE.meta.valor}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/85 sm:mt-0 sm:text-base">
                {OPORTUNIDADE.meta.texto}
              </p>
            </div>

            {/* Sobre o pêssego o botão inverte para navy, senão sumiria. */}
            <Cta variante="navy" className="mt-8">
              {HERO.cta}
            </Cta>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Você se encaixa em algum perfil? */}
        <section className="bg-[#0f1626]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="font-sora text-2xl font-bold tracking-tight text-white sm:text-4xl">
                {PERFIS.titulo}{" "}
                <em className="font-bold italic text-[#ffc781]">
                  {PERFIS.tituloDestaque}
                </em>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-white/70">
                {PERFIS.chamada}
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PERFIS.itens.map((p) => (
                <div key={p.titulo} className="card-dark p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffc781] text-[#1b243a]">
                    <Icone nome={p.icone} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-sora text-lg font-bold leading-snug text-white">
                    {p.titulo}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {p.texto}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Cta>{HERO.cta}</Cta>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Barreiras — navy médio */}
        <section className="bg-[#2c375b]">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <Eyebrow>O que está te impedindo hoje</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-snug tracking-tight text-white sm:text-4xl">
              Não é falta de vontade. São quatro travas — e todas têm solução.
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {BARREIRAS.map((b) => (
                <div key={b.titulo} className="card-dark p-6">
                  <h3 className="text-lg font-bold text-[#ffc781]">
                    {b.titulo}
                  </h3>
                  <p className="mt-2 leading-relaxed text-white/75">{b.texto}</p>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center font-sora text-lg font-bold leading-snug text-white sm:text-xl">
              Foi para resolver essas duas pontas — a{" "}
              <span className="border-b-4 border-[#ffc781]">técnica</span> e o{" "}
              <span className="border-b-4 border-[#ffc781]">mercado</span> — que
              nasceu o MEAP.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Os 3 pilares — navy mais escuro */}
        <section className="bg-[#0f1626]">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <div className="text-center">
              <Eyebrow>O Método MEAP</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">
                Três pilares, na ordem em que a carreira acontece
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {PILARES.map((p) => (
                <div key={p.nome} className="card-dark p-7">
                  <p className="font-sora text-3xl font-extrabold text-[#ffc781]">
                    {p.numero}
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-white">{p.nome}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#daa520]">
                    {p.resumo}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">
                    {p.texto}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-11 text-center">
              <Cta>{HERO.cta}</Cta>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Módulos — capas com o título vazado sobre a imagem */}
        <section className="bg-[#1b243a]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="text-center">
              <Eyebrow>O que você vai aprender</Eyebrow>
              <h2 className="mt-3 font-sora text-2xl font-bold tracking-tight text-white sm:text-4xl">
                Do primeiro lançamento estrutural ao{" "}
                <em className="font-bold italic text-[#ffc781]">
                  contrato assinado
                </em>
              </h2>
            </div>

            {/* Três colunas fecham as duas linhas com os seis módulos; com
                quatro, a última linha ficaria pela metade. */}
            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MODULOS.map((m) => (
                <li
                  key={m.numero}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0f1626] transition hover:border-[#ffc781]"
                >
                  <div className="relative aspect-3/4 overflow-hidden">
                    {m.imagem ? (
                      <Image
                        src={m.imagem}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      // Sem capa ainda: um grafismo do próprio sistema segura o
                      // lugar sem parecer imagem quebrada.
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-linear-to-br from-[#2c375b] to-[#0f1626]"
                      >
                        <div className="absolute -right-10 top-10 h-40 w-40 rotate-12 rounded-2xl border-[8px] border-white/[0.06]" />
                        <div className="absolute -left-8 bottom-8 h-28 w-28 rotate-12 rounded-xl border-[8px] border-white/[0.04]" />
                      </div>
                    )}

                    {/* Escurece a base para o título vazado ter contraste
                        qualquer que seja a foto colocada depois. */}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-t from-[#0f1626] via-[#0f1626]/40 to-transparent"
                    />

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-sora text-xl font-extrabold uppercase leading-[0.95] tracking-tight text-white/85">
                        {m.linha1}
                      </p>
                      <p className="font-sora text-xl font-extrabold uppercase leading-[0.95] tracking-tight text-[#ffc781]">
                        {m.linha2}
                      </p>
                      <span className="mt-3 inline-flex rounded-md bg-[#ffc781] px-2.5 py-1 font-sora text-[0.65rem] font-bold uppercase tracking-wider text-[#1b243a]">
                        Módulo {m.numero}
                      </span>
                    </div>
                  </div>

                  <p className="p-5 text-sm leading-relaxed text-white/70">
                    {m.texto}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Quebra de objeção — texto à esquerda, área de membros à direita */}
        <section className="bg-[#0f1626]">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1fr_minmax(0,44%)]">
            <div>
              <h2 className="font-sora text-2xl font-bold uppercase leading-tight tracking-tight text-[#ffc781] sm:text-3xl">
                {SOZINHO.titulo}
              </h2>
              {SOZINHO.paragrafos.map((p) => (
                <p
                  key={p}
                  className="mt-4 max-w-2xl leading-relaxed text-white/75"
                >
                  {p}
                </p>
              ))}
              <Cta className="mt-9 w-full sm:w-auto">{HERO.cta}</Cta>
            </div>

            <Notebook imagem={SOZINHO.imagem} />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Bônus — grupo de alunos */}
        <section className="bg-[#1b243a]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="font-sora text-2xl font-bold tracking-tight text-white sm:text-3xl">
                <span className="text-[#ffc781]">{BONUS.chamada}</span>{" "}
                {BONUS.titulo}{" "}
                <em className="font-bold italic text-[#ffc781]">
                  {BONUS.tituloDestaque}
                </em>
              </h2>
            </div>

            <div className="card-dark mt-12 grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_minmax(0,20rem)]">
              <div>
                <span className="inline-flex rounded-md border border-[#ffc781]/50 px-2.5 py-1 font-sora text-[0.65rem] font-bold uppercase tracking-wider text-[#ffc781]">
                  {BONUS.etiqueta}
                </span>
                <h3 className="mt-5 font-sora text-xl font-bold leading-snug text-white sm:text-2xl">
                  {BONUS.headline}
                </h3>
                <p className="mt-4 max-w-xl leading-relaxed text-white/70">
                  {BONUS.texto}
                </p>
              </div>

              <Celular
                imagem={BONUS.imagem}
                grupo={BONUS.grupo}
                conversa={BONUS.conversa}
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Prova: projetos + depoimentos. A seção só aparece quando existe
            material real para mostrar — prova social vazia derruba a página
            inteira. */}
        {(PROJETOS.length > 0 || DEPOIMENTOS.length > 0) && (
          <section className="bg-[#0f1626]">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
              <Eyebrow>Projetos e resultados</Eyebrow>
              <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-4xl">
                O que sai das mãos de quem faz o MEAP
              </h2>

              {PROJETOS.length > 0 && (
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {PROJETOS.map((p) => (
                    <div
                      key={p.src}
                      className="relative aspect-4/3 overflow-hidden rounded-2xl border border-white/10"
                    >
                      <Image
                        src={p.src}
                        alt={p.alt}
                        fill
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {DEPOIMENTOS.length > 0 && (
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {DEPOIMENTOS.map((d) => (
                    <figure key={d.nome} className="card-dark p-6">
                      <blockquote className="leading-relaxed text-white/85">
                        “{d.texto}”
                      </blockquote>
                      <figcaption className="mt-4 font-sora text-sm font-bold text-[#ffc781]">
                        {d.nome}
                        <span className="block font-sans text-xs font-medium text-white/60">
                          {d.papel}
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Quem é Queren Costa — nome em pêssego, como na captura */}
        <section className="bg-[#2c375b]">
          {/* Sem foto, a coluna da esquerda sumiria e deixaria o texto espremido
              em metade da largura — daí o layout cair para uma coluna só. */}
          <div
            className={`mx-auto grid items-center gap-10 px-4 py-16 sm:py-20 ${
              AUTORA.foto
                ? "max-w-5xl sm:grid-cols-[minmax(0,380px)_1fr]"
                : "max-w-3xl"
            }`}
          >
            {AUTORA.foto ? (
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={AUTORA.foto}
                  alt={AUTORA.nome}
                  fill
                  sizes="(min-width: 640px) 380px, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div>
              <Eyebrow>Quem ensina</Eyebrow>
              <h2 className="mt-3 font-sora text-3xl font-bold tracking-tight text-[#ffc781] sm:text-5xl">
                {AUTORA.nome}
              </h2>
              <p className="mt-3 text-lg font-semibold text-white">
                {AUTORA.chamada}
              </p>
              {AUTORA.paragrafos.map((p) => (
                <p key={p} className="mt-4 leading-relaxed text-white/75">
                  {p}
                </p>
              ))}

              {AUTORA.numeros.length > 0 && (
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {AUTORA.numeros.map((n) => (
                    <div key={n.rotulo} className="card-dark p-4">
                      <p className="font-sora text-2xl font-extrabold text-[#ffc781]">
                        {n.valor}
                      </p>
                      <p className="mt-1 text-xs text-white/60">{n.rotulo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Oferta — a pergunta à esquerda, o cartão do preço no meio e o que
            está incluso à direita. */}
        <section id="oferta" className="scroll-mt-8 bg-[#0f1626]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,19rem)] lg:gap-8">
            <div>
              <h2 className="font-sora text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {OFERTA.titulo}
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/65">
                {OFERTA.apoio}
              </p>
            </div>

            <div className="rounded-2xl border border-[#ffc781]/40 bg-[#141c2e] p-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-9">
              <p className="font-sora text-xl font-bold leading-tight text-white">
                {OFERTA.produto}
              </p>
              <p className="mt-1 text-sm text-white/60">{OFERTA.produtoLinha2}</p>

              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="text-xs uppercase tracking-wider text-white/50">
                  De <s className="text-[#ffc781]/70">{PRECO.ancora}</s>{" "}
                  {OFERTA.antes}
                </p>
                <p className="mt-3 font-sora text-4xl font-extrabold leading-none tracking-tight text-[#ffc781] sm:text-5xl">
                  {PRECO.parcelado}
                </p>
                <p className="mt-2 font-sora text-xl font-bold text-white sm:text-2xl">
                  ou {PRECO.aVista} à vista
                </p>
              </div>

              <Cta className="mt-7 w-full">{OFERTA.ctaCartao}</Cta>

              <p className="mt-4 text-xs leading-relaxed text-white/55">
                <strong className="font-semibold text-white/85">
                  Garantia incondicional de 7 dias.
                </strong>{" "}
                Se concluir que o MEAP não é para você, peça o reembolso dentro
                desse prazo e devolvemos 100% do valor.
              </p>

              <div className="mt-6 border-t border-white/10 pt-6">
                <Selos />
              </div>
            </div>

            <ul className="space-y-3">
              {ENTREGAS.map((e) => (
                <li
                  key={e}
                  className="flex gap-3 text-sm leading-relaxed text-white/80"
                >
                  <span aria-hidden className="font-bold text-[#ffc781]">
                    ✓
                  </span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Garantia — logo depois do preço, que é onde o medo aparece */}
        <section className="bg-[#ffc781] text-[#2c375b]">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2c375b] text-[#ffc781]">
              <Icone nome="escudo" className="h-8 w-8" />
            </span>
            <p className="eyebrow eyebrow-on-peach mt-6">{GARANTIA.etiqueta}</p>
            <h2 className="mt-3 font-sora text-2xl font-bold tracking-tight sm:text-4xl">
              {GARANTIA.titulo}
            </h2>
            <p className="mt-3 font-sora text-lg font-bold sm:text-xl">
              {GARANTIA.chamada}
            </p>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-[#2c375b]/90">
              {GARANTIA.texto}
            </p>
            <Cta variante="navy" className="mt-9 w-full sm:w-auto">
              {HERO.cta}
            </Cta>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ. <details> nativo mantém a página inteira como componente de
            servidor — nenhum JavaScript é enviado ao navegador por causa dela. */}
        <section className="bg-[#1b243a]">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
            <Eyebrow>Dúvidas frequentes</Eyebrow>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              O que costumam perguntar antes de entrar
            </h2>

            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {FAQ.map((f) => (
                <details key={f.pergunta} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sora text-base font-bold text-white">
                    {f.pergunta}
                    <span
                      aria-hidden
                      className="shrink-0 text-xl text-[#ffc781] transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-white/70">
                    {f.resposta}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-[#0f1626]">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
            <h2 className="text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl">
              A obra do seu cliente já existe. Falta o engenheiro que{" "}
              <span className="text-[#ffc781]">assina a estrutura</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/70">
              {PRECO.aVista} à vista ou {PRECO.parcelado}, com 7 dias de
              garantia.
            </p>
            <Cta className="mt-7 w-full sm:w-auto">{HERO.cta}</Cta>
          </div>
        </section>

        <footer className="bg-black">
          <div className="mx-auto max-w-5xl px-4 py-9 text-center text-xs leading-relaxed text-white/45">
            <p className="text-white/70">
              Queren Costa Engenharia — Todos os Direitos Reservados
            </p>
            <p className="mt-1">{CONTATO}</p>
            <p className="mx-auto mt-4 max-w-2xl">
              MEAP — Método Estruturas de Alto Padrão. Os resultados
              citados dependem do empenho e do contexto de cada aluno e não
              representam promessa de faturamento.
            </p>
          </div>
        </footer>
      </main>

      {/* CTA fixo no celular, onde a barra do topo não comporta o botão. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f1626]/95 p-3 backdrop-blur sm:hidden">
        <Cta className="w-full py-3.5">{HERO.cta}</Cta>
      </div>
    </>
  );
}
