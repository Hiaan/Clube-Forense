"use client";

// Os eventos de venda da Black, com o preço do lote que vale agora.

import EventosDeVenda from "../components/EventosDeVenda";
import { LOTES, loteAtual } from "./oferta";

export default function EventosBlack() {
  const valor = (loteAtual()?.lote ?? LOTES[0]).avista;
  return (
    <EventosDeVenda
      produto="Black Forense 2026 — Black Vitalícia"
      valor={valor}
    />
  );
}
