import "server-only";
import { notFound } from "next/navigation";
import { empresaPermitida, exigirUsuario } from "@/lib/painel/auth";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";

/** Usuário, empresa (só se ele tiver acesso) e textos no idioma dele. */
export async function contextoEmpresa(params: Promise<{ empresa: string }>) {
  const { empresa: slug } = await params;
  const usuario = await exigirUsuario();
  const empresa = await empresaPermitida(usuario, slug);
  if (!empresa) notFound();
  return { usuario, empresa, idioma: usuario.idioma, t: TEXTOS_PAINEL[usuario.idioma] };
}
