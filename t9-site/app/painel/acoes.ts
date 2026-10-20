"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  MINUTOS_LINK,
  criarTokenLogin,
  empresaPermitidaPorId,
  encerrarSessao,
  encerrarOutrasSessoes,
  entrarComSenha,
  entrarComToken,
  ehEquipe,
  usuarioAtual,
} from "@/lib/painel/auth";
import { consulta, registrar, umaLinha } from "@/lib/painel/db";
import { emailComBotao, enviarEmail } from "@/lib/painel/email";
import { linkDeAcesso } from "@/lib/painel/links";
import { hashSenha, problemaNaSenha } from "@/lib/painel/senha";
import { STATUS_PLANO, TEXTOS_PAINEL, type StatusPlano } from "@/lib/painel/textos";
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

/** `email` volta preenchido depois de um erro (o React limpa o formulário após a ação). */
export type EstadoSenha = { estado: "inicio" | "invalido" | "limite" | "erro"; email?: string; vez?: number };

export async function entrarSenha(_anterior: EstadoSenha, formulario: FormData): Promise<EstadoSenha> {
  const email = String(formulario.get("email") ?? "").slice(0, 160);
  let resultado: Awaited<ReturnType<typeof entrarComSenha>>;
  try {
    resultado = await entrarComSenha(email, String(formulario.get("senha") ?? ""));
  } catch (erro) {
    console.error("[painel] falha no login com senha", erro);
    return { estado: "erro", email, vez: Date.now() };
  }
  if (!resultado.ok) return { estado: resultado.motivo, email, vez: Date.now() };
  redirect("/painel");
}

export type EstadoMinhaSenha = { ok?: boolean; mensagem?: string; vez?: number };

/** A própria pessoa define ou troca a senha. Encerra as outras sessões dela. */
export async function definirMinhaSenha(_anterior: EstadoMinhaSenha, formulario: FormData): Promise<EstadoMinhaSenha> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/painel/entrar");
  const t = TEXTOS_PAINEL[usuario.idioma].conta;
  const senha = String(formulario.get("senha") ?? "");
  if (senha !== String(formulario.get("confirmar") ?? "")) return { ok: false, mensagem: t.senhaDiferente, vez: Date.now() };
  if (problemaNaSenha(senha)) return { ok: false, mensagem: t.senhaCurta, vez: Date.now() };
  await consulta("update usuarios set senha_hash = $2, senha_em = now() where id = $1", [usuario.id, await hashSenha(senha)]);
  await encerrarOutrasSessoes(usuario.id);
  await registrar(usuario.id, null, "senha.definir");
  revalidatePath("/painel/conta");
  return { ok: true, mensagem: t.senhaSalva, vez: Date.now() };
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
