"use client";

// O card da oferta — onde a decisão acontece.
//
// MONTADO COMO O DA REFERÊNCIA (Código Viral): nome da oferta, o que vem
// dentro em ícones, a imagem do pacote e, por último, o preço entrando em
// cena. A entrada é a única animação do card e só acontece quando ele chega à
// tela: primeiro o "de" riscado, depois a parcela crescendo, por fim o à
// vista e o botão. Com `prefers-reduced-motion`, tudo aparece de uma vez.
//
// O PREÇO VEM DO RELÓGIO, E NÃO DO HTML. É o mesmo gancho do contador: o lote
// que vale é função da hora, então o valor é calculado no navegador e muda
// sozinho quando o prazo vira.
//
// A ÂNCORA É CONTADA, NÃO INVENTADA: quantos editais estão inclusos hoje,
// vezes o preço de um preparatório avulso.

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { LOTES, PRECO_POR_EDITAL, reais, reaisComCentavos } from "./oferta";
import { useLote } from "./Contador";

export default function CaixaDePreco({
  editaisInclusos,
  id,
}: {
  editaisInclusos: number;
  id?: string;
}) {
  const { lote } = useLote();
  const indice = lote ? LOTES.findIndex((l) => l.nome === lote.nome) : 0;
  const mostrado = lote ?? LOTES[0];
  const avulso = editaisInclusos * PRECO_POR_EDITAL;

  // Liga a entrada do preço quando o card aparece. A troca de estado acontece
  // no aviso do observador, não no corpo do efeito.
  const precoRef = useRef<HTMLDivElement>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const alvo = precoRef.current;
    if (!alvo) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(alvo);
    return () => obs.disconnect();
  }, []);

  const entra = `motion-safe:transition-all motion-safe:duration-700 ${
    visto
      ? ""
      : "motion-safe:translate-y-3 motion-safe:scale-95 motion-safe:opacity-0"
  }`;
  const atraso = (ms: number) => ({ transitionDelay: `${ms}ms` });

  return (
    <div
      id={id}
      className="relative overflow-hidden rounded-[28px] border border-[#ffcd07]/40 bg-gradient-to-b from-[#17171c] via-[#101014] to-[#0b0b0d] shadow-[0_40px_120px_-30px_rgba(255,205,7,0.35)]"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full bg-[#ffcd07]/15 blur-3xl" />

      <div className="relative px-6 pb-8 pt-8 text-center sm:px-10">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ffcd07]">
          oferta única
        </p>
        <p className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">
          Black <span className="text-[#ffcd07]">Vitalícia</span> do Clube
          Forense
        </p>
        <p className="mt-1 text-base font-semibold text-white/60">
          + todos os editais autorizados até 2028
        </p>

        <Image
          src="/black/recursos.webp"
          alt="Aulas, questões, cronograma, mapas mentais, eBooks, flashcards, mini-jogos, edital verticalizado e painel pericial"
          width={1200}
          height={405}
          sizes="(max-width: 640px) 90vw, 520px"
          className="mx-auto mt-7 h-auto w-full max-w-[520px] opacity-90"
        />

        <Image
          src="/black/pacote-black.webp"
          alt="Os preparatórios de todos os estados inclusos na Black"
          width={1100}
          height={697}
          sizes="(max-width: 640px) 92vw, 560px"
          className="mx-auto -mb-2 mt-6 h-auto w-full max-w-[560px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
        />

        {/* Os lotes como escada: onde a pessoa está e o que acontece se ela
            voltar amanhã. */}
        <div className="mx-auto mt-6 flex max-w-sm items-center gap-1.5">
          {LOTES.map((l, i) => {
            const passou = lote ? i < indice : false;
            const atual = lote ? i === indice : i === 0;
            return (
              <div key={l.nome} className="flex-1">
                <div
                  className={`h-1 rounded-full ${
                    atual
                      ? "bg-[#ffcd07]"
                      : passou
                        ? "bg-white/25"
                        : "bg-white/10"
                  }`}
                />
                <p
                  className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    atual ? "text-[#ffcd07]" : "text-white/35"
                  }`}
                >
                  {l.nome}
                  {passou && " · esgotado"}
                </p>
              </div>
            );
          })}
        </div>

        <div ref={precoRef} className="mt-6">
          <p
            className={`text-lg font-bold text-white/45 ${entra}`}
            style={atraso(0)}
          >
            De{" "}
            <span className="line-through decoration-[#ff4d4d]/80 decoration-2">
              {reais(avulso)}
            </span>
          </p>
          <p
            className={`mt-2 text-sm font-bold uppercase tracking-[0.15em] text-white/70 ${entra}`}
            style={atraso(250)}
          >
            Por apenas {mostrado.parcelas}x de
          </p>
          <p
            className={`mt-1 text-6xl font-black tracking-tight text-[#ffcd07] drop-shadow-[0_0_30px_rgba(255,205,7,0.35)] sm:text-7xl ${entra}`}
            style={atraso(450)}
          >
            {reaisComCentavos(mostrado.valorParcela)}
          </p>
          <p
            className={`mt-2 text-lg text-white/70 ${entra}`}
            style={atraso(700)}
          >
            ou{" "}
            <strong className="font-black text-white">
              {reais(mostrado.avista)}
            </strong>{" "}
            à vista
          </p>
        </div>

        <a
          href={mostrado.checkout}
          className={`mt-8 block w-full rounded-2xl bg-[#ffcd07] px-6 py-5 text-center text-base font-black uppercase tracking-wide text-gray-900 shadow-[0_12px_40px_-10px_rgba(255,205,7,0.7)] transition hover:brightness-110 sm:text-lg ${entra}`}
          style={atraso(900)}
        >
          Quero a Black Vitalícia
        </a>

        <p className="mt-5 text-sm leading-relaxed text-white/60">
          Acesso <strong className="font-black text-white">VITALÍCIO</strong> à
          plataforma e ao material pré e pós-edital de todos os concursos
          autorizados até 2028
        </p>
        <p className="mt-3 text-xs text-white/40">
          {mostrado.nome} · compra segura pela Eduzz · cartão, Pix ou boleto
        </p>
      </div>
    </div>
  );
}
