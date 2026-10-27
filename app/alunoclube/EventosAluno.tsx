"use client";

// Os eventos de venda do pixel na Black dos alunos, com o valor do aluno.

import EventosDeVenda from "../components/EventosDeVenda";

export default function EventosAluno({ valor }: { valor: number }) {
  return <EventosDeVenda produto="Black Vitalícia — Alunos" valor={valor} />;
}
