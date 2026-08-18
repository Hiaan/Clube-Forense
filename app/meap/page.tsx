import type { Metadata } from "next";
import Image from "next/image";

import { CarrosselModulos } from "./carrossel-modulos";

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
  MENTORIA,
  OFERTA,
  OPORTUNIDADE,
  PERFIS,
  PILARES,
  PRECO,
  PROJETOS,
  SELOS,
  SOZINHO,
  URGENCIA,
  WHATSAPP,
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
 * Área de membros.
 *
 * Se `imagem` for preenchida, ela é exibida sozinha: a arte da área de membros
 * já vem com os aparelhos desenhados, então enquadrá-la num notebook de CSS
 * daria tela dentro de tela. Sem imagem, o notebook desenhado aqui segura o
 * lugar com um mosaico, sem fingir uma captura que não existe.
 */
function AreaDeMembros({ imagem }: { imagem: string }) {
  if (imagem) {
    // A arte é quadrada, mas os aparelhos ocupam só a faixa central: o
    // enquadramento em 16/10 corta o transparente de cima e de baixo, senão
    // sobraria quase metade da altura vazia.
    return (
      <div className="relative mx-auto aspect-16/10 w-full max-w-2xl">
        <Image
          src={imagem}
          alt="Área de membros do MEAP"
          fill
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* A tampa é um pouco mais estreita que a base — é isso que dá o volume
          do aparelho. Alargar a base para além do container criava rolagem
          horizontal na página inteira. */}
      <div className="mx-auto w-[94%] rounded-xl border-[6px] border-[#0b1220] bg-[#0b1220] shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-16/10 overflow-hidden rounded-md bg-[#0f1626]">
          <div aria-hidden className="grid h-full grid-cols-4 gap-1.5 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm bg-linear-to-br from-[#2c375b] to-[#141c2e]"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto h-2.5 w-full rounded-b-xl bg-[#0b1220]" />
    </div>
  );
}

/**
 * Mockup da mentoria: o print do notebook com as etiquetas em volta.
 *
 * O PNG é 1080x1080 com fundo transparente e o notebook ocupa só o miolo, então
 * as etiquetas se encaixam no vazio dos cantos sem cobrir a tela. As posições
 * são em porcentagem justamente por isso: acompanham a imagem em qualquer
 * largura, em vez de descolarem dela.
 */
function MockupMentoria() {
  const [vagas, aoVivo, cadencia] = MENTORIA.etiquetas;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <Image
        src={MENTORIA.imagem}
        alt={MENTORIA.imagemAlt}
        width={1080}
        height={1080}
        sizes="(min-width: 1024px) 36rem, 100vw"
        className="h-auto w-full"
      />

      <Etiqueta className="left-0 top-[16%]">
        <span
          aria-hidden
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff5f57]"
        />
        {aoVivo}
      </Etiqueta>

      <Etiqueta className="right-[2%] top-[8%]">{vagas}</Etiqueta>

      <Etiqueta className="bottom-[24%] left-[3%]">{cadencia}</Etiqueta>

      {/* O selo fica sobre o teclado, que é a área do PNG sem informação. */}
      <div className="absolute bottom-[8%] right-0 rounded-xl border border-white/12 bg-[#1b243a] px-4 py-3 text-center shadow-[0_14px_30px_rgba(0,0,0,0.5)]">
        <p className="font-sora text-[0.55rem] font-bold uppercase tracking-wider text-[#ffc781]">
          {MENTORIA.selo.rotulo}
        </p>
        <p className="mt-1 font-sora text-sm font-bold text-white/50 line-through">
          {MENTORIA.selo.de}
        </p>
        <p className="font-sora text-base font-extrabold text-[#ffc781]">
          {MENTORIA.selo.por}
        </p>
      </div>
    </div>
  );
}

/** Etiqueta flutuante em volta do mockup da mentoria. */
function Etiqueta({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`absolute inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-sora text-[0.55rem] font-bold uppercase tracking-wider text-[#1b243a] shadow-[0_10px_22px_rgba(27,36,58,0.22)] sm:text-[0.65rem] ${className}`}
    >
      {children}
    </span>
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

/** Moldura de planilha, para o bônus de materiais editáveis. */
function Planilha({
  imagem,
  arquivo,
  colunas,
  linhas,
}: {
  imagem: string;
  arquivo: string;
  colunas: string[];
  linhas: string[][];
}) {
  return (
    <div className="mx-auto w-full max-w-[20rem]">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
        {imagem ? (
          <div className="relative aspect-4/3">
            <Image
              src={imagem}
              alt={arquivo}
              fill
              sizes="320px"
              className="object-cover"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#141c2e] px-3 py-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#ffc781]" />
              <span className="truncate text-[0.6rem] font-semibold text-white/80">
                {arquivo}
              </span>
            </div>
            <table className="w-full text-[0.58rem]">
              <thead>
                <tr className="bg-white/[0.06] text-white/60">
                  {colunas.map((c) => (
                    <th key={c} className="px-3 py-1.5 text-left font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((l, i) => (
                  <tr
                    key={l[0]}
                    className={`border-t border-white/[0.06] ${
                      i === linhas.length - 1
                        ? "font-bold text-[#ffc781]"
                        : "text-white/70"
                    }`}
                  >
                    {l.map((celula, j) => (
                      <td
                        key={j}
                        className={`px-3 py-2 ${j === 0 ? "" : "text-right"}`}
                      >
                        {celula}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Faixa diagonal em movimento, com o gatilho de urgência.
 *
 * Cada trilho leva a lista duplicada porque a animação anda exatamente metade
 * dela — é o que faz o laço voltar ao início sem emenda visível.
 */
function FaixaUrgencia({ para }: { para: string }) {
  const itens = Array.from({ length: URGENCIA.repeticoes }, (_, i) => i);
  const trilho = (
    <div className="faixa-trilho">
      {[0, 1].map((volta) => (
        <div key={volta} className="flex" aria-hidden={volta === 1}>
          {itens.map((i) => (
            <span key={i} className="faixa-item">
              {URGENCIA.frase}
              <span aria-hidden>✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="faixa-urgencia"
      style={{ "--faixa-para": para } as React.CSSProperties}
    >
      <div aria-hidden className="faixa-cunha" />
      <div className="faixa-caixa">
        <div className="faixa faixa--fundo">{trilho}</div>
        <div className="faixa faixa--frente">{trilho}</div>
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
      <main>
        {/* ---------------------------------------------------------------- */}
        {/* Hero — duas colunas: texto à esquerda, retrato à direita sobre um
            painel mais escuro com o grafismo geométrico. */}
        <section className="relative overflow-hidden bg-[#1b243a]">
          {/* Só um brilho difuso atrás do retrato. O painel escuro e o quadrado
              vazado que existiam aqui recortavam um retângulo visível atrás da
              foto, e como o PNG é vazado o resultado era a pessoa flutuando
              dentro de uma caixa. Sem bordas, o fundo fica contínuo. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden lg:block"
          >
            <div className="absolute -top-40 left-[10%] h-[36rem] w-[36rem] rounded-full bg-[#2c375b] opacity-35 blur-3xl" />
            <div className="absolute bottom-0 right-[6%] h-[30rem] w-[30rem] translate-y-1/3 rounded-full bg-[#2c375b] opacity-45 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-[8.5rem] sm:pt-16 sm:pb-[9rem] lg:grid-cols-[1fr_minmax(0,36%)] lg:gap-8 lg:pt-20 lg:pb-[10rem]">
            {/* No celular a coluna vira uma só e o texto centralizado lê melhor;
                a partir de `lg`, com o retrato ao lado, volta para a esquerda. */}
            <div className="text-center lg:text-left">
              {/* eslint-disable-next-line @next/next/no-img-element --
                  A logo vem do Wix já dimensionada; passar pelo otimizador do
                  next/image não traria ganho e adicionaria um domínio remoto a
                  mais para configurar. */}
              <img
                src={MARCA.logo}
                alt={MARCA.logoAlt}
                className="mx-auto h-12 w-auto sm:h-14 lg:mx-0"
              />

              <p className="eyebrow mt-7">{HERO.eyebrow}</p>

              <h1 className="mx-auto mt-3 max-w-xl font-sora lg:mx-0 text-3xl leading-[1.15] text-white sm:text-4xl lg:text-[2.6rem]">
                Aprenda a{" "}
                <strong className="font-bold">
                  projetar, captar clientes e faturar, pelo menos R$ 7.000,00
                  extras,
                </strong>{" "}
                com{" "}
                <em className="font-bold italic">
                  Projetos Estruturais de Alto Padrão.
                </em>
              </h1>

              <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/80 lg:mx-0">
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

              {/* `w-fit` + `mx-auto` centralizam o bloco inteiro mas mantêm os
                  itens alinhados entre si — centralizar cada linha deixaria os
                  ✓ desencontrados. */}
              <ul className="mx-auto mt-6 grid w-fit max-w-xl gap-x-6 gap-y-2 text-left text-sm font-medium text-white sm:grid-cols-2 lg:mx-0">
                {HERO.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span aria-hidden className="text-[#daa520]">
                      ✓
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mx-auto mt-8 max-w-md lg:mx-0">
                <Cta className="w-full">{HERO.cta}</Cta>
                <p className="mt-3 text-center text-xs font-medium text-white/75">
                  {HERO.escassez}
                </p>
                <Selos className="mt-5" />
              </div>
            </div>

            {/* O PNG é 4:5 e a coluna é 9/16, então o `cover` casa pela altura
                e apara ~15% de cada lado. É de propósito: sobra a mesa saindo
                pelas bordas e o grafismo do "QC" cortado atrás dela, que é o
                que dá a sensação de a foto continuar para fora do quadro.

                A margem negativa desce a imagem para fora da área de
                conteúdo, e o pé dela para onde o conteúdo da hero termina, logo
                acima da fita, em vez de flutuar no meio da coluna. Ela é menor
                que o padding de baixo porque parte desse padding é o respiro
                que o bloco da faixa dava quando ainda ocupava altura própria.

                Isso vale só até o `lg`; no desktop, onde a foto vira coluna ao
                lado do texto, ela volta a respeitar o padding e centraliza na
                vertical junto com o bloco de texto.

                `sizes` é maior que a coluna porque, no `cover`, a imagem é
                escalada pela altura e renderiza ~1,4x mais larga que o box —
                pedir a largura do box devolveria um arquivo pequeno demais e a
                foto sairia borrada. */}
            <div className="relative mx-auto -mb-14 aspect-4/5 w-full max-w-[18rem] self-end sm:-mb-16 lg:mb-0 lg:ml-auto lg:mr-0 lg:max-w-[26rem] lg:self-center">
              <Image
                src={HERO.foto}
                alt={HERO.fotoAlt}
                fill
                priority
                sizes="(min-width: 1024px) 26rem, 18rem"
                className="retrato-hero object-cover object-bottom"
              />
            </div>
          </div>
        </section>

        <FaixaUrgencia para="#ffc781" />

        {/* ---------------------------------------------------------------- */}
        {/* A oportunidade — faixa pêssego, como na captura */}
        <section className="bg-[#ffc781] text-[#2c375b]">
          <div className="mx-auto max-w-4xl px-4 pb-16 pt-[9rem] sm:pb-20 sm:pt-[10rem]">
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

            <CarrosselModulos />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Quebra de objeção — texto à esquerda, área de membros à direita.
            Navy médio porque os módulos, logo acima, são navy 800: sem a troca
            as duas seções encostariam sem divisa nenhuma. */}
        <section className="bg-[#2c375b]">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1fr_minmax(0,52%)]">
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

            <AreaDeMembros imagem={SOZINHO.imagem} />
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
        {/* Bônus — um cartão por item, com a moldura trocando de lado */}
        <section className="bg-[#1b243a]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="font-sora text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {BONUS.titulo}{" "}
                <em className="font-bold italic text-[#ffc781]">
                  {BONUS.tituloDestaque}
                </em>{" "}
                {BONUS.tituloFim}
              </h2>
            </div>

            <div className="mt-12 space-y-6">
              {BONUS.itens.map((item, i) => (
                <div
                  key={item.etiqueta}
                  className="card-dark grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_minmax(0,20rem)]"
                >
                  {/* No segundo cartão a moldura troca de lado, senão os dois
                      blocos viram a mesma fileira repetida. */}
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <span className="inline-flex rounded-md border border-[#ffc781]/50 px-2.5 py-1 font-sora text-[0.65rem] font-bold uppercase tracking-wider text-[#ffc781]">
                      {item.etiqueta}
                    </span>
                    <h3 className="mt-5 font-sora text-xl font-bold leading-snug text-white sm:text-2xl">
                      {item.headline}
                    </h3>
                    <p className="mt-4 max-w-xl leading-relaxed text-white/70">
                      {item.texto}
                    </p>
                  </div>

                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    {item.tipo === "celular" ? (
                      // Só o celular vaza o cartão: ele é bem mais alto que o
                      // bloco, e é isso que dá o efeito. A planilha é baixa e
                      // vazar ali só encolheria o cartão.
                      <div className="lg:-my-20">
                        <Celular
                          imagem={item.imagem}
                          grupo={item.grupo}
                          conversa={item.conversa}
                        />
                      </div>
                    ) : (
                      <Planilha
                        imagem={item.imagem}
                        arquivo={item.arquivo}
                        colunas={item.colunas}
                        linhas={item.linhas}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Bônus da mentoria — seção própria em preto. Ela é o gatilho de
            urgência antes do preço, e o preto é a única cor da página que não
            aparece em mais nenhuma seção: é o que a separa das outras duas de
            bônus, que são navy. */}
        <section className="bg-black text-white">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-[9rem] sm:pt-20 sm:pb-[10rem]">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
              <div>
                {/* Vermelho em vez do dourado do resto da página: é a única
                    etiqueta de escassez que existe aqui, e sair da paleta é o
                    que faz ela ser lida como aviso e não como rótulo. O tom é
                    fechado para o texto branco passar em contraste. */}
                <span className="inline-flex rounded-md bg-[#d92d20] px-3 py-1.5 font-sora text-[0.65rem] font-bold uppercase tracking-wider text-white">
                  {MENTORIA.tag}
                </span>

                <h2 className="mt-5 max-w-xl font-sora text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                  {MENTORIA.titulo}
                </h2>

                <p className="mt-4 max-w-xl leading-relaxed text-white/75">
                  {MENTORIA.chamada}
                </p>

                {/* Duas colunas a partir do `sm`: com uma só, a lista de seis
                    itens empurrava o mockup para longe demais do título. */}
                <ul className="mt-8 grid max-w-xl gap-x-6 gap-y-3 text-sm font-medium sm:grid-cols-2">
                  {MENTORIA.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span aria-hidden className="text-[#ffc781]">
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <MockupMentoria />
            </div>

            {/* O rodapé da seção é a última coisa lida antes do preço, então
                ele inverte: pêssego sobre o preto. Uma tarja navy aqui ficaria
                a poucos níveis do fundo e deixaria de ser tarja. */}
            <div className="mt-14 rounded-2xl bg-[#ffc781] px-6 py-9 text-center text-[#2c375b] sm:px-10">
              <p className="mx-auto max-w-2xl font-sora text-sm font-bold leading-relaxed sm:text-base">
                {MENTORIA.aviso}
              </p>
              <Cta variante="navy" className="mt-7 w-full sm:w-auto">
                {MENTORIA.cta}
              </Cta>
            </div>
          </div>
        </section>

        <FaixaUrgencia para="#0f1626" />

        {/* ---------------------------------------------------------------- */}
        {/* Oferta — a pergunta à esquerda, o cartão do preço no meio e o que
            está incluso à direita. */}
        <section id="oferta" className="scroll-mt-8 bg-[#0f1626]">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-[9rem] sm:pb-20 sm:pt-[10rem] lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,19rem)] lg:gap-8">
            <div>
              <h2 className="font-sora text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {OFERTA.titulo}
              </h2>
              <p className="mt-5 max-w-sm font-sora text-lg font-bold leading-snug text-white sm:text-xl">
                {OFERTA.apoio}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Em até 12x no cartão.
              </p>
            </div>

            <div className="rounded-2xl border border-[#ffc781]/40 bg-[#141c2e] p-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-9">
              <p className="font-sora text-xl font-bold leading-tight text-white">
                {OFERTA.produto}
              </p>
              <p className="mt-1 text-sm text-white/60">{OFERTA.produtoLinha2}</p>

              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="text-xs uppercase tracking-wider text-white/50">
                  De
                </p>
                {/* O preço cheio é o contraste que faz o desconto ser lido:
                    grande e em vermelho, riscado. */}
                <p className="font-sora text-3xl font-extrabold leading-none text-[#ff6b6b] line-through sm:text-4xl">
                  {PRECO.ancora}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wider text-white/50">
                  {OFERTA.antes}
                </p>
                <p className="mt-3 font-sora text-4xl font-extrabold leading-none tracking-tight text-[#ffc781] sm:text-5xl">
                  {PRECO.parcelado}
                </p>
                <p className="mt-2 font-sora text-xl font-bold text-white sm:text-2xl">
                  ou {PRECO.aVista} à vista
                </p>
              </div>

              {/* O gatilho fica colado no botão, que é o último ponto antes
                  do clique. O vermelho é o mesmo da etiqueta da seção da
                  mentoria — repetir a cor é o que amarra as duas. */}
              <div className="mt-7 rounded-xl border border-[#d92d20]/55 bg-[#d92d20]/15 p-4 text-left">
                <p className="font-sora text-[0.6rem] font-bold uppercase tracking-wider text-[#ff9d94]">
                  {OFERTA.gatilho.etiqueta}
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-white">
                  {OFERTA.gatilho.texto}
                </p>
              </div>

              <Cta className="mt-5 w-full">{OFERTA.ctaCartao}</Cta>

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

      <BotaoWhatsApp />
    </>
  );
}

/**
 * Botão flutuante do WhatsApp.
 *
 * Fica acima de tudo e fora do fluxo, então acompanha a rolagem da página
 * inteira. O rótulo só aparece no desktop: no celular ele brigaria por largura
 * com o CTA fixo do próprio conteúdo, e o ícone sozinho já é reconhecido.
 */
function BotaoWhatsApp() {
  const href = `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(
    WHATSAPP.mensagem,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar no WhatsApp: ${WHATSAPP.exibicao}`}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-[#25d366] px-4 py-4 font-sora text-sm font-bold text-[#0b1220] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-[#1fb855] sm:px-5"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6 shrink-0"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
      </svg>
      <span className="hidden sm:inline">Falar no WhatsApp</span>
    </a>
  );
}
