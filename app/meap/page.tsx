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
  OPORTUNIDADE,
  PILARES,
  PRECO,
  PROJETOS,
} from "./conteudo";

// Página de vendas: nada aqui depende de requisição, então ela é estática e
// serve do cache do CDN — o que importa numa página que recebe tráfego pago.
export const metadata: Metadata = {
  title: "MEAP — Método de Engenharia Aplicada a Projetos | Queren Costa",
  description:
    "Aprenda a desenvolver, precificar e vender projetos estruturais de alto padrão. Segurança técnica e clientes na mesma formação.",
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
      {/* Barra fixa: em página de vendas longa, o CTA nunca pode ficar fora
          de alcance. No celular ela vira só a marca — o CTA fixo do rodapé
          cobre esse caso sem espremer o topo. */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1b243a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="font-sora text-lg font-extrabold tracking-tight text-white">
            ME<span className="text-[#ffc781]">AP</span>
          </p>
          <a
            href={CHECKOUT_URL}
            className="btn-peach hidden px-6 py-2.5 text-xs sm:inline-flex"
          >
            QUERO ENTRAR PARA O MEAP
          </a>
        </div>
      </header>

      <main className="pb-24 sm:pb-0">
        {/* ---------------------------------------------------------------- */}
        {/* Hero — navy do topo da captura */}
        <section className="relative overflow-hidden bg-[#1b243a]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#ffc781] opacity-[0.13] blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
            <Eyebrow>Método de Engenharia Aplicada a Projetos</Eyebrow>
            <h1 className="mt-5 text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl">
              Transforme projetos estruturais em uma nova fonte de faturamento{" "}
              <span className="text-[#ffc781]">dentro da engenharia</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-xl">
              A formação que une as duas pontas que faltam ao engenheiro:{" "}
              <strong className="font-semibold text-white">
                segurança técnica
              </strong>{" "}
              para projetar e assinar, e{" "}
              <strong className="font-semibold text-white">
                método comercial
              </strong>{" "}
              para conquistar clientes de alto padrão.
            </p>

            <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
              {["Projetar", "Posicionar", "Prospectar"].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span aria-hidden className="text-[#daa520]">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col items-center gap-3">
              <Cta className="w-full sm:w-auto">QUERO ENTRAR PARA O MEAP</Cta>
              <p className="text-xs text-white/70">
                {PRECO.aVista} à vista ou {PRECO.parcelado} · 7 dias de garantia
              </p>
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
              <Cta>QUERO ENTRAR PARA O MEAP</Cta>
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

                <Cta className="mt-7 w-full sm:w-auto">
                  QUERO FAZER PARTE DO MEAP
                </Cta>

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
            <Cta className="mt-7 w-full sm:w-auto">QUERO FAZER PARTE DO MEAP</Cta>
          </div>
        </section>

        <footer className="bg-black">
          <div className="mx-auto max-w-5xl px-4 py-9 text-center text-xs leading-relaxed text-white/45">
            <p className="text-white/70">
              Queren Costa Engenharia — Todos os Direitos Reservados
            </p>
            <p className="mt-1">{CONTATO}</p>
            <p className="mx-auto mt-4 max-w-2xl">
              MEAP — Método de Engenharia Aplicada a Projetos. Os resultados
              citados dependem do empenho e do contexto de cada aluno e não
              representam promessa de faturamento.
            </p>
          </div>
        </footer>
      </main>

      {/* CTA fixo no celular, onde a barra do topo não comporta o botão. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f1626]/95 p-3 backdrop-blur sm:hidden">
        <Cta className="w-full py-3.5">QUERO ENTRAR PARA O MEAP</Cta>
      </div>
    </>
  );
}
