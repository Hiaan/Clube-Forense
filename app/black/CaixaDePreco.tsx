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

/** A oferta já montada de um aluno validado (/alunoclube). */
export interface OfertaAluno {
  /** De que o aluno é aluno ("aluno do Preparatório"). */
  rotulo: string;
  /** O valor à vista dele. */
  preco: number;
  /** O checkout com o cupom dele. */
  link: string;
}

export default function CaixaDePreco({
  editaisInclusos,
  aluno,
  id,
}: {
  editaisInclusos: number;
  /** Presente na página dos alunos: troca os lotes pela oferta do aluno. */
  aluno?: OfertaAluno;
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
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#17171c] via-[#101014] to-[#0b0b0d] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
    >
      <div className="relative px-6 pb-8 pt-8 text-center sm:px-10">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ffcd07]">
          oferta única
        </p>
        {/* O nome da oferta em cima e a marca embaixo, em vez de uma frase só
            ("Black Vitalícia do Clube Forense") que quebrava no meio. */}
        <p className="mt-3 text-3xl font-black leading-none tracking-tight text-white sm:text-4xl">
          Black <span className="text-[#ffcd07]">Vitalícia</span>
        </p>
        <Image
          src="/logo-fundo-escuro.png"
          alt="Clube Forense"
          width={162}
          height={28}
          className="mx-auto mt-3 h-6 w-auto sm:h-7"
        />

        <Image
          src="/black/recursos-v2.webp"
          alt="Aulas, questões, cronograma, mapas mentais, eBooks, flashcards, mini-jogos, edital verticalizado e painel pericial"
          width={1200}
          height={397}
          sizes="(max-width: 640px) 60vw, 280px"
          className="mx-auto mt-6 h-auto w-[65%] max-w-[280px] opacity-80"
        />

        <Image
          src="/black/pacote-black-v2.webp"
          alt="Os preparatórios de todos os estados inclusos na Black"
          width={1100}
          height={615}
          sizes="(max-width: 640px) 75vw, 400px"
          className="mx-auto mt-5 h-auto w-[85%] max-w-[400px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
        />

        {aluno ? (
          <p className="mx-auto mt-6 inline-block rounded-full border border-[#ffcd07]/40 bg-[#ffcd07]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ffcd07]">
            Oferta de {aluno.rotulo}
          </p>
        ) : (
          <>
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
          </>
        )}

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
          {aluno ? (
            <>
              <p
                className={`mt-2 text-sm font-bold uppercase tracking-[0.15em] text-white/70 ${entra}`}
                style={atraso(250)}
              >
                Para você, por
              </p>
              <p
                className={`mt-1 text-6xl font-black tracking-tight text-[#ffcd07] sm:text-7xl ${entra}`}
                style={atraso(450)}
              >
                {reais(aluno.preco)}
              </p>
              <p
                className={`mt-2 text-base text-white/70 ${entra}`}
                style={atraso(700)}
              >
                à vista, ou em até 12x no cartão
              </p>
              <p
                className={`mt-2 text-xs text-white/45 ${entra}`}
                style={atraso(700)}
              >
                Valor calculado a partir do seu cashback total com o Clube.
              </p>
            </>
          ) : (
            <>
              <p
                className={`mt-2 text-sm font-bold uppercase tracking-[0.15em] text-white/70 ${entra}`}
                style={atraso(250)}
              >
                Por apenas {mostrado.parcelas}x de
              </p>
              <p
                className={`mt-1 text-6xl font-black tracking-tight text-[#ffcd07] sm:text-7xl ${entra}`}
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
            </>
          )}
        </div>

        {aluno && (
          <p className="mt-7 rounded-xl border border-red-400/50 bg-[#2a1214] px-4 py-3 text-sm font-semibold leading-snug text-white">
            Exclusivo para alunos do Clube: compras de quem não é aluno, ou
            feitas por link recebido de outra pessoa, serão reembolsadas.
          </p>
        )}
        <a
          href={aluno ? aluno.link : mostrado.checkout}
          data-valor={aluno ? aluno.preco : mostrado.avista}
          className={`mt-8 block w-full rounded-2xl bg-[#ffcd07] px-6 py-5 text-center text-base font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110 sm:text-lg ${entra}`}
          style={atraso(900)}
        >
          {aluno ? "Garantir minha Black de aluno" : "Quero a Black Vitalícia"}
        </a>

        <p className="mt-5 text-sm leading-relaxed text-white/60">
          Acesso <strong className="font-black text-white">VITALÍCIO</strong> à
          plataforma e ao material pré e pós-edital de todos os concursos
          autorizados até agora
        </p>
        <p className="mt-3 text-xs text-white/40">
          {aluno
            ? "Use no pagamento o mesmo CPF que você informou aqui"
            : `${mostrado.nome} · compra segura pela Eduzz`}{" "}
          · cartão, Pix ou boleto
        </p>
      </div>
    </div>
  );
}
