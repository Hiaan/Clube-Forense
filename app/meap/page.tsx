import type { Metadata } from "next";
import Image from "next/image";

import {
  AUTORA,
  BARREIRAS,
  BLOCOS,
  CHECKOUT_URL,
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

/** Botão de compra. Repetido ao longo da página, sempre com o mesmo destino. */
function Cta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={CHECKOUT_URL}
      className={`btn-yellow inline-flex items-center justify-center px-8 py-4 text-sm sm:text-base ${className}`}
    >
      {children}
    </a>
  );
}

export default function MeapPage() {
  return (
    <>
      {/* Barra fixa: em página de vendas longa, o CTA nunca pode ficar fora
          de alcance. No celular ela vira só a marca — o CTA fixo do rodapé
          cobre esse caso sem espremer o topo. */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <p className="text-lg font-black tracking-tight text-white">
            ME<span className="text-[#ffcd07]">AP</span>
          </p>
          <a
            href={CHECKOUT_URL}
            className="btn-yellow hidden px-5 py-2.5 text-xs sm:inline-flex"
          >
            Quero entrar para o MEAP
          </a>
        </div>
      </header>

      <main className="pb-24 sm:pb-0">
        {/* ---------------------------------------------------------------- */}
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0b0b0d]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ffcd07] opacity-10 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
            <p className="section-label">Método de Engenharia Aplicada a Projetos</p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Transforme projetos estruturais em uma nova fonte de faturamento{" "}
              <span className="text-[#ffcd07]">dentro da engenharia</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
              A formação que une as duas pontas que faltam ao engenheiro:{" "}
              <strong className="text-white">segurança técnica</strong> para
              projetar e assinar, e{" "}
              <strong className="text-white">método comercial</strong> para
              conquistar clientes de alto padrão.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3">
              <Cta className="w-full sm:w-auto">Quero entrar para o MEAP</Cta>
              <p className="text-xs text-gray-400">
                {PRECO.aVista} à vista ou {PRECO.parcelado} · 7 dias de garantia
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* A oportunidade */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
            <p className="section-label">A oportunidade</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-gray-900 sm:text-3xl">
              {OPORTUNIDADE.titulo}
            </h2>
            {OPORTUNIDADE.paragrafos.map((p) => (
              <p key={p} className="mt-5 leading-relaxed text-gray-600">
                {p}
              </p>
            ))}

            <div className="mt-8 rounded-2xl border border-[#ffcd07] bg-[#fff9db] p-6 sm:flex sm:items-center sm:gap-6">
              <p className="whitespace-nowrap text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                {OPORTUNIDADE.meta.valor}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700 sm:mt-0">
                {OPORTUNIDADE.meta.texto}
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Barreiras */}
        <section className="bg-[#f8f9fb] border-y border-gray-200">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <p className="section-label">O que está te impedindo hoje</p>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Não é falta de vontade. São quatro travas — e todas têm solução.
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {BARREIRAS.map((b) => (
                <div key={b.titulo} className="card-white p-6">
                  <h3 className="text-base font-bold text-gray-900">
                    {b.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {b.texto}
                  </p>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center text-lg font-bold leading-snug text-gray-900">
              Foi para resolver essas duas pontas — a{" "}
              <span className="border-b-4 border-[#ffcd07]">técnica</span> e o{" "}
              <span className="border-b-4 border-[#ffcd07]">mercado</span> — que
              nasceu o MEAP.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Os 3 pilares */}
        <section className="bg-[#0b0b0d]">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <div className="text-center">
              <p className="section-label">O Método MEAP</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Três pilares, na ordem em que a carreira acontece
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {PILARES.map((p) => (
                <div
                  key={p.nome}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-[#ffcd07]"
                >
                  <p className="text-3xl font-black text-[#ffcd07]">
                    {p.numero}
                  </p>
                  <h3 className="mt-3 text-xl font-bold text-white">{p.nome}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {p.resumo}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-gray-300">
                    {p.texto}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Cta>Quero entrar para o MEAP</Cta>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* O que você vai aprender */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <p className="section-label">O que você vai aprender</p>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Do primeiro lançamento estrutural ao contrato assinado
            </h2>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2">
              {BLOCOS.map((b, i) => (
                <li key={b.titulo} className="card-white flex gap-4 p-6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffcd07] text-sm font-black text-gray-900">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {b.titulo}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
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
          <section className="border-y border-gray-200 bg-[#f8f9fb]">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
              <p className="section-label">Projetos e resultados</p>
              <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                O que sai das mãos de quem faz o MEAP
              </h2>

              {PROJETOS.length > 0 && (
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {PROJETOS.map((p) => (
                    <div
                      key={p.src}
                      className="relative aspect-4/3 overflow-hidden rounded-2xl border border-gray-200 bg-white"
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
                    <figure key={d.nome} className="card-white p-6">
                      <blockquote className="text-sm leading-relaxed text-gray-700">
                        “{d.texto}”
                      </blockquote>
                      <figcaption className="mt-4 text-sm font-bold text-gray-900">
                        {d.nome}
                        <span className="block text-xs font-medium text-gray-500">
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
        {/* Quem é Queren Costa */}
        <section className="bg-white">
          {/* Sem foto, a coluna da esquerda sumiria e deixaria o texto espremido
              em metade da largura — daí o layout cair para uma coluna só. */}
          <div
            className={`mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:py-20 ${
              AUTORA.foto ? "sm:grid-cols-[minmax(0,320px)_1fr]" : "max-w-3xl"
            }`}
          >
            {AUTORA.foto ? (
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl border border-gray-200">
                <Image
                  src={AUTORA.foto}
                  alt={AUTORA.nome}
                  fill
                  sizes="(min-width: 640px) 320px, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div>
              <p className="section-label">Quem ensina</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {AUTORA.nome}
              </h2>
              <p className="mt-2 font-medium text-gray-700">{AUTORA.chamada}</p>
              {AUTORA.paragrafos.map((p) => (
                <p key={p} className="mt-4 leading-relaxed text-gray-600">
                  {p}
                </p>
              ))}

              {AUTORA.numeros.length > 0 && (
                <div className="mt-7 grid grid-cols-3 gap-3">
                  {AUTORA.numeros.map((n) => (
                    <div
                      key={n.rotulo}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <p className="text-2xl font-black text-gray-900">
                        {n.valor}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{n.rotulo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Oferta */}
        <section id="oferta" className="bg-[#0b0b0d]">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
            <div className="text-center">
              <p className="section-label">A oferta</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Tudo que você recebe ao entrar para o MEAP
              </h2>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <ul className="grid gap-px bg-white/10 sm:grid-cols-2">
                {ENTREGAS.map((e) => (
                  <li
                    key={e}
                    className="flex gap-3 bg-[#101014] p-5 text-sm leading-relaxed text-gray-200"
                  >
                    <span aria-hidden className="font-black text-[#ffcd07]">
                      ✓
                    </span>
                    {e}
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/10 p-8 text-center">
                <p className="text-sm text-gray-400">
                  De <s>{PRECO.ancora}</s> por
                </p>
                <p className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {PRECO.parcelado}
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  ou {PRECO.aVista} à vista
                </p>

                <Cta className="mt-7 w-full sm:w-auto">
                  Quero fazer parte do MEAP
                </Cta>

                <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-gray-400">
                  <strong className="text-gray-200">
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
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
            <p className="section-label">Dúvidas frequentes</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              O que costumam perguntar antes de entrar
            </h2>

            <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
              {FAQ.map((f) => (
                <details key={f.pergunta} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-gray-900">
                    {f.pergunta}
                    <span
                      aria-hidden
                      className="shrink-0 text-xl text-[#e6b800] transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {f.resposta}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-[#f8f9fb] p-8 text-center">
              <h2 className="text-xl font-bold leading-snug tracking-tight text-gray-900 sm:text-2xl">
                A obra do seu cliente já existe. Falta o engenheiro que assina a
                estrutura.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-gray-600">
                {PRECO.aVista} à vista ou {PRECO.parcelado}, com 7 dias de
                garantia.
              </p>
              <Cta className="mt-6 w-full sm:w-auto">
                Quero fazer parte do MEAP
              </Cta>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 text-xs leading-relaxed text-gray-400">
            <p>
              MEAP — Método de Engenharia Aplicada a Projetos · {AUTORA.nome}.
              Os resultados citados dependem do empenho e do contexto de cada
              aluno e não representam promessa de faturamento.
            </p>
          </div>
        </footer>
      </main>

      {/* CTA fixo no celular, onde a barra do topo não comporta o botão. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 backdrop-blur sm:hidden">
        <Cta className="w-full py-3.5">Quero entrar para o MEAP</Cta>
      </div>
    </>
  );
}
