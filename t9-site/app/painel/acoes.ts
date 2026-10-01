"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  MINUTOS_LINK,
  criarTokenLogin,
  empresaPermitidaPorId,
  encerrarSessao,
  entrarComToken,
  ehEquipe,
  usuarioAtual,
} from "@/lib/painel/auth";
import { consulta, registrar, umaLinha } from "@/lib/painel/db";
import { emailComBotao, enviarEmail } from "@/lib/painel/email";
import { linkDeAcesso } from "@/lib/painel/links";
import { ETAPAS_LEAD, STATUS_PLANO, TEXTOS_PAINEL, type EtapaLead, type StatusPlano } from "@/lib/painel/textos";
import { IDIOMAS, fmt, type Idioma } from "@/lib/i18n";

const lerIdioma = (v: FormDataEntryValue | null): Idioma => (IDIOMAS.includes(v as Idioma) ? (v as Idioma) : "pt");

export type EstadoLogin = { estado: "inicio" | "enviado" | "limite" | "email" | "erro" };

export async function pedirLink(_anterior: EstadoLogin, formulario: FormData): Promise<EstadoLogin> {
  const idioma = lerIdioma(formulario.get("idioma"));
  const t = TEXTOS_PAINEL[idioma].login;
  try {
    const resultado = await criarTokenLogin(String(formulario.get("email") ?? ""));
    if (!resultado.ok) {
      if (resultado.motivo === "email") return { estado: "email" };
      if (resultado.motivo === "limite") return { estado: "limite" };
      // Sem acesso: responde igual a "enviado" para não revelar quem tem conta.
      return { estado: "enviado" };
    }
    const link = await linkDeAcesso(resultado.token);
    const texto = fmt(t.emailTexto, { minutos: MINUTOS_LINK });
    await enviarEmail({
      para: resultado.email,
      assunto: t.emailAssunto,
      texto: `${texto}\n\n${link}\n\n${t.emailRodape}`,
      html: emailComBotao({ titulo: t.emailTitulo, texto, botao: t.emailBotao, link, rodape: t.emailRodape }),
    });
    return { estado: "enviado" };
  } catch (erro) {
    console.error("[painel] falha ao enviar link de acesso", erro);
    return { estado: "erro" };
  }
}

export async function confirmarLogin(formulario: FormData) {
  const token = String(formulario.get("token") ?? "");
  const ok = await entrarComToken(token);
  if (!ok) redirect("/painel/entrar?erro=link");
  redirect("/painel");
}

export async function sair() {
  await encerrarSessao();
  redirect("/painel/entrar");
}

export async function mudarIdioma(formulario: FormData) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/painel/entrar");
  await consulta("update usuarios set idioma = $1 where id = $2", [lerIdioma(formulario.get("idioma")), usuario.id]);
  revalidatePath("/painel", "layout");
}

/** Cliente e equipe podem mover o lead no funil, desde que tenham acesso à empresa dele. */
export async function mudarEtapaLead(formulario: FormData) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/painel/entrar");
  const id = Number(formulario.get("lead"));
  const etapa = String(formulario.get("etapa")) as EtapaLead;
  if (!Number.isInteger(id) || !ETAPAS_LEAD.includes(etapa)) return;

  const lead = await umaLinha<{ empresa_id: number }>("select empresa_id from leads where id = $1", [id]);
  if (!lead || !(await empresaPermitidaPorId(usuario, lead.empresa_id))) return;

  await consulta("update leads set etapa = $1, atualizado_em = now() where id = $2", [etapa, id]);
  await registrar(usuario.id, lead.empresa_id, "lead.etapa", `${id} → ${etapa}`);
  revalidatePath("/painel", "layout");
}

/** Só a equipe da T9 muda o andamento do plano. */
export async function mudarStatusPlano(formulario: FormData) {
  const usuario = await usuarioAtual();
  if (!usuario || !ehEquipe(usuario)) return;
  const id = Number(formulario.get("item"));
  const status = String(formulario.get("status")) as StatusPlano;
  if (!Number.isInteger(id) || !STATUS_PLANO.includes(status)) return;

  const item = await umaLinha<{ empresa_id: number }>("select empresa_id from plano where id = $1", [id]);
  if (!item || !(await empresaPermitidaPorId(usuario, item.empresa_id))) return;

  await consulta("update plano set status = $1 where id = $2", [status, id]);
  await registrar(usuario.id, item.empresa_id, "plano.status", `${id} → ${status}`);
  revalidatePath("/painel", "layout");
}
