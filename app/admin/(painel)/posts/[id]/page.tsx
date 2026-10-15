// Edição de um post. O id "novo" abre a tela em branco.
//
// Uma rota só para os dois casos porque o formulário é o mesmo — separar em
// /posts/novo e /posts/[id] duplicaria a tela inteira para mudar um valor
// inicial, e as duas cópias divergiriam no primeiro campo novo.

import { notFound } from "next/navigation";

import FormPost from "./FormPost";
import { lerPorId } from "../../../../lib/postsRepo";

export const dynamic = "force-dynamic";

export default async function PaginaPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "novo") return <FormPost inicial={null} />;

  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) notFound();

  const post = await lerPorId(numero);
  if (!post) notFound();

  return <FormPost inicial={post} />;
}
