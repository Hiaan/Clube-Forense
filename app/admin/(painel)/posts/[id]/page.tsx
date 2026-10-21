// Edição de um post. O id "novo" abre a tela em branco.
//
// Uma rota só para os dois casos porque o formulário é o mesmo — separar em
// /posts/novo e /posts/[id] duplicaria a tela inteira para mudar um valor
// inicial, e as duas cópias divergiriam no primeiro campo novo.

import { notFound } from "next/navigation";

import FormPost from "./FormPost";
import { lerPorId } from "../../../../lib/postsRepo";

export const dynamic = "force-dynamic";

/**
 * Teto de tempo da função, e ele é o motivo de "clico e não acontece nada".
 *
 * As server actions desta tela rodam na função desta rota, e uma delas — a
 * reescrita da matéria — faz duas chamadas a um modelo de linguagem. Sem este
 * valor vale o padrão da plataforma, curto demais para isso: a função é morta
 * no meio, a resposta nunca chega, e a tela fica exatamente como estava, sem
 * texto e sem erro. A página dos estados já precisou do mesmo ajuste quando
 * ganhou o botão de coletar.
 *
 * 300 é o máximo do plano; os prazos internos de cada chamada são bem menores
 * (ver ia.ts), para falharmos com mensagem antes de a plataforma desligar a luz.
 */
export const maxDuration = 300;

export default async function PaginaPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "novo") return <FormPost inicial={null} />;

  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const post = await lerPorId(numero);
  if (!post) notFound();

  return <FormPost inicial={post} />;
}
