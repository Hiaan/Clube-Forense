"use client";

// O contador do lote.
//
// POR QUE ELE NÃO É DESENHADO NO SERVIDOR. O tempo que falta muda a cada
// segundo; o HTML gerado no servidor é de alguns segundos atrás. Renderizar os
// números dos dois lados dá divergência de hidratação — o React reclama e, pior,
// o visitante vê o número pular. Então o servidor manda a casca e os números só
// aparecem depois que o componente monta no navegador.
//
// O RELÓGIO É UMA FONTE EXTERNA, E É ASSIM QUE O REACT QUER LER ISSO. A versão
// anterior guardava a hora num `useState` e mexia nele dentro de um `useEffect`
// — o lint do projeto barra, e com razão: estado tocado em efeito dispara
// renderização em cascata. `useSyncExternalStore` existe exatamente para o
// caso "há algo lá fora que muda sozinho e o componente precisa acompanhar".
// O servidor recebe `null` (a casca) e o navegador recebe o segundo corrente.
//
// O CONTADOR SABE VIRAR O LOTE. Quando o prazo chega a zero ele não congela em
// 00:00:00: o próprio relógio faz a página recalcular qual lote passou a valer,
// e preço e texto trocam sem recarregar. Contador que zera deixando o preço
// antigo na tela é a forma mais rápida de perder quem estava decidindo comprar.

import { useSyncExternalStore } from "react";

import { loteAtual, type Lote } from "./oferta";

export interface Restante {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  acabou: boolean;
}

/** Quanto falta até `quando`. Zera tudo quando a data já passou. */
export function restanteAte(quando: string, agora: number): Restante {
  const falta = new Date(quando).getTime() - agora;
  if (!Number.isFinite(falta) || falta <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, acabou: true };
  }
  const s = Math.floor(falta / 1000);
  return {
    dias: Math.floor(s / 86_400),
    horas: Math.floor((s % 86_400) / 3_600),
    minutos: Math.floor((s % 3_600) / 60),
    segundos: s % 60,
    acabou: false,
  };
}

/** Avisa a cada segundo. Um intervalo por assinante, encerrado na saída. */
function assinarRelogio(aoMudar: () => void): () => void {
  const id = setInterval(aoMudar, 1000);
  return () => clearInterval(id);
}

/**
 * O segundo corrente, arredondado.
 *
 * Arredondar não é detalhe: `useSyncExternalStore` compara o valor devolvido a
 * cada verificação e re-renderiza quando ele muda. Devolvendo `Date.now()` cru,
 * o valor muda a cada milissegundo e o componente entraria em laço.
 */
function segundoAtual(): number {
  return Math.floor(Date.now() / 1000);
}

/** No servidor não há relógio: a casca é desenhada e os números vêm depois. */
function semRelogio(): null {
  return null;
}

/** O lote que vale agora e quanto falta para ele fechar. */
export function useLote(): { lote: Lote | null; falta: Restante | null } {
  const segundo = useSyncExternalStore(
    assinarRelogio,
    segundoAtual,
    semRelogio,
  );

  if (segundo === null) return { lote: null, falta: null };

  const agora = segundo * 1000;
  const atual = loteAtual(new Date(agora));
  if (!atual) return { lote: null, falta: null };

  return { lote: atual.lote, falta: restanteAte(atual.lote.fecha, agora) };
}

/** Quanto falta para um prazo fixo; `null` no servidor ou sem prazo. */
function usePrazo(ate?: string): Restante | null {
  const segundo = useSyncExternalStore(
    assinarRelogio,
    segundoAtual,
    semRelogio,
  );
  if (!ate || segundo === null) return null;
  return restanteAte(ate, segundo * 1000);
}

function Casa({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[2.6rem] rounded-lg bg-white/10 px-2 py-1.5 text-center font-mono text-xl font-black tabular-nums text-white sm:text-2xl">
        {String(valor).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
        {rotulo}
      </span>
    </div>
  );
}

/**
 * O contador visível, com os quatro blocos.
 *
 * `compacto` tira os dias e encolhe tudo: é a versão que cabe na barra fixa do
 * rodapé, onde o espaço é do botão.
 */
export default function Contador({
  compacto = false,
  ate,
}: {
  compacto?: boolean;
  /**
   * Prazo fixo, no lugar do fechamento do lote da Black (ISO com fuso). É o
   * que a página dos alunos usa, com o lote dela. Passado o prazo, o
   * contador some em vez de ficar parado em zero.
   */
  ate?: string;
}) {
  const doLote = useLote();
  const prazo = usePrazo(ate);
  const { lote, falta } = ate
    ? { lote: prazo ? true : null, falta: prazo }
    : doLote;
  if (ate && prazo?.acabou) return null;

  if (!lote || !falta) {
    // Casca do mesmo tamanho, para a página não dar um salto quando os números
    // chegarem um instante depois.
    return (
      <span
        aria-hidden
        className={
          compacto
            ? "inline-block h-4 w-20 rounded bg-white/10 align-middle"
            : "inline-block h-14 w-64 rounded-lg bg-white/5"
        }
      />
    );
  }

  if (compacto) {
    return (
      <span className="font-mono text-sm font-black tabular-nums text-[#ffcd07]">
        {falta.dias > 0 && `${falta.dias}d `}
        {String(falta.horas).padStart(2, "0")}:
        {String(falta.minutos).padStart(2, "0")}:
        {String(falta.segundos).padStart(2, "0")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2" role="timer">
      <Casa valor={falta.dias} rotulo="dias" />
      <Casa valor={falta.horas} rotulo="horas" />
      <Casa valor={falta.minutos} rotulo="min" />
      <Casa valor={falta.segundos} rotulo="seg" />
    </div>
  );
}
