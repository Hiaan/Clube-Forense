import type { Metadata } from "next";
import Image from "next/image";

import {
  AUTORA,
  BARREIRAS,
  BLOCOS,
  CHECKOUT_URL,
  CONTATO,
  DEPOIMENTOS,
  ENTREGAS,
  FAQ,
  HERO,
  MARCA,
  OPORTUNIDADE,
  PILARES,
  PRECO,
  PROJETOS,
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
            <div className="text-center">
              <Eyebrow sobrePeach>A oportunidade</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight sm:text-4xl">
                {OPORTUNIDADE.titulo}
              </h2>
            </div>
            {OPORTUNIDADE.paragrafos.map((p) => (
              <p
                key={p}
                className="mt-5 text-base leading-relaxed text-[#2c375b]/90 sm:text-lg"
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
        {/* O que você vai aprender */}
        <section className="bg-[#1b243a]">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <Eyebrow>O que você vai aprender</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-snug tracking-tight text-white sm:text-4xl">
              Do primeiro lançamento estrutural ao contrato assinado
            </h2>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2">
              {BLOCOS.map((b, i) => (
                <li key={b.titulo} className="card-dark flex gap-4 p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffc781] font-sora text-sm font-extrabold text-[#1b243a]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {b.titulo}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">
                      {b.texto}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Prova: projetos + depoimentos. A seção só aparece quando existe
            material real para mostrar — prova social vazia derruba a página
            inteira. */}
        {(PROJETOS.length > 0 || DEPOIMENTOS.length > 0) && (
          <section className="bg-[#2c375b]">
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
        {/* Quem é Queren Costa — navy escuro e nome em pêssego, como na captura */}
        <section className="bg-[#0f1626]">
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
        {/* Oferta — a segunda faixa pêssego, onde está o preço */}
        {/* `scroll-mt` compensa a barra fixa: sem isso o link #oferta para com
            o título escondido atrás dela. */}
        <section
          id="oferta"
          className="scroll-mt-16 bg-[#ffc781] text-[#2c375b]"
        >
          <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
            <div className="text-center">
              <Eyebrow sobrePeach>A oferta</Eyebrow>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
                Tudo que você recebe ao entrar para o MEAP
              </h2>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl bg-[#0f1626] text-white shadow-[0_24px_60px_rgba(15,22,38,0.28)]">
              <ul className="grid gap-px bg-white/10 sm:grid-cols-2">
                {ENTREGAS.map((e) => (
                  <li
                    key={e}
                    className="flex gap-3 bg-[#0f1626] p-5 text-sm leading-relaxed text-white/85"
                  >
                    <span aria-hidden className="font-bold text-[#daa520]">
                      ✓
                    </span>
                    {e}
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/10 p-8 text-center">
                <p className="text-sm text-white/55">
                  De <s>{PRECO.ancora}</s> por
                </p>
                <p className="mt-2 font-sora text-4xl font-extrabold tracking-tight text-[#ffc781] sm:text-5xl">
                  {PRECO.parcelado}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  ou {PRECO.aVista} à vista
                </p>

                <Cta className="mt-7 w-full sm:w-auto">{HERO.cta}</Cta>

                <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-white/60">
                  <strong className="font-semibold text-white/90">
                    Garantia incondicional de 7 dias.
                  </strong>{" "}
                  Entre, assista às aulas e, se concluir que o MEAP não é para
                  você, peça o reembolso dentro desse prazo e devolvemos 100% do
                  valor.
                </p>
              </div>
            </div>
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
