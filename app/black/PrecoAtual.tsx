"use client";

// O preço do lote vigente, em texto, para ser usado no meio de uma frase.
//
// Existe porque o preço não pode ser escrito no servidor: ele muda quando o
// lote vira, e a página fica aberta. Em vez de repetir a lógica do lote em
// cada lugar que cita o valor, todo mundo usa este pedacinho.

import { LOTES, reais } from "./oferta";
import { useLote } from "./Contador";

export default function PrecoAtual() {
  const { lote } = useLote();
  return <>{reais((lote ?? LOTES[0]).avista)}</>;
}
