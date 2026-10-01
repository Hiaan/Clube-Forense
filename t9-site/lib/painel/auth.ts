import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { consulta, umaLinha } from "./db";
import type { Idioma } from "@/lib/i18n";

// Login sem senha: a pessoa recebe um link de uso único por e-mail. O banco só
// guarda o hash dos tokens, nunca o valor que vai no link ou no cookie.

export type Perfil = "admin" | "gestor" | "cliente";
export type Usuario = { id: number; email: string; nome: string | null; perfil: Perfil; idioma: Idioma };
export type Empresa = {
  id: number;
  slug: string;
  nome: string;
  tipo: "leads" | "ecommerce";
  pais: string;
  moeda: string;
  idioma: Idioma;
  meta_investimento: number | null;
  meta_leads: number | null;
  meta_cpl: number | null;
  meta_receita: number | null;
  comentario: string | null;
  comentario_em: string | null;
};

export const COOKIE_SESSAO = "t9_sessao";
const DIAS_SESSAO = 30;
export const MINUTOS_LINK = 15;
const TENTATIVAS_POR_JANELA = 5;

const hash = (valor: string) => createHash("sha256").update(valor).digest("hex");
const novoToken = () => randomBytes(32).toString("base64url");

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normalizarEmail = (email: string) => email.trim().toLowerCase().slice(0, 160);

/** E-mails em PAINEL_ADMINS (separados por vírgula) entram como admin mesmo antes de existir usuário. */
function adminsIniciais() {
  return (process.env.PAINEL_ADMINS ?? "")
    .split(",")
    .map(normalizarEmail)
    .filter(Boolean);
}

/**
 * Cria um link de acesso para o e-mail, se ele puder entrar.
 * Devolve o token (para montar o link) ou o motivo de não ter criado.
 */
export async function criarTokenLogin(emailBruto: string, validadeMinutos = MINUTOS_LINK) {
  const email = normalizarEmail(emailBruto);
  if (!EMAIL_VALIDO.test(email)) return { ok: false as const, motivo: "email" as const };

  let usuario = await umaLinha<{ id: number }>("select id from usuarios where email = $1", [email]);
  if (!usuario && adminsIniciais().includes(email)) {
    usuario = await umaLinha<{ id: number }>(
      "insert into usuarios (email, perfil) values ($1, 'admin') on conflict (email) do update set email = excluded.email returning id",
      [email],
    );
  }
  if (!usuario) return { ok: false as const, motivo: "sem-acesso" as const };

  const recentes = await umaLinha<{ total: number }>(
    "select count(*)::int as total from tokens_login where email = $1 and criado_em > now() - interval '15 minutes'",
    [email],
  );
  if ((recentes?.total ?? 0) >= TENTATIVAS_POR_JANELA) return { ok: false as const, motivo: "limite" as const };

  const token = novoToken();
  await consulta("insert into tokens_login (hash, email, expira_em) values ($1, $2, now() + make_interval(mins => $3))", [
    hash(token),
    email,
    validadeMinutos,
  ]);
  // Limpeza oportunista de tokens velhos.
  await consulta("delete from tokens_login where expira_em < now() - interval '1 day'");
  return { ok: true as const, token, email };
}

/** Confere se o token ainda vale, sem gastá-lo (para mostrar a tela de confirmação). */
export async function tokenValido(token: string) {
  if (!token || token.length > 100) return false;
  const linha = await umaLinha("select 1 from tokens_login where hash = $1 and usado_em is null and expira_em > now()", [
    hash(token),
  ]);
  return Boolean(linha);
}

/** Gasta o token e abre a sessão (grava o cookie). Só pode rodar em Server Action ou Route Handler. */
export async function entrarComToken(token: string) {
  if (!token || token.length > 100) return false;
  const usado = await umaLinha<{ email: string }>(
    "update tokens_login set usado_em = now() where hash = $1 and usado_em is null and expira_em > now() returning email",
    [hash(token)],
  );
  if (!usado) return false;

  const usuario = await umaLinha<{ id: number }>(
    "update usuarios set ultimo_acesso = now() where email = $1 returning id",
    [usado.email],
  );
  if (!usuario) return false;

  const sessao = novoToken();
  await consulta(
    "insert into sessoes (hash, usuario_id, expira_em) values ($1, $2, now() + make_interval(days => $3))",
    [hash(sessao), usuario.id, DIAS_SESSAO],
  );
  await consulta("delete from sessoes where expira_em < now()");

  const loja = await cookies();
  loja.set(COOKIE_SESSAO, sessao, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_SESSAO * 24 * 60 * 60,
  });
  return true;
}

export async function encerrarSessao() {
  const loja = await cookies();
  const valor = loja.get(COOKIE_SESSAO)?.value;
  if (valor) await consulta("delete from sessoes where hash = $1", [hash(valor)]);
  loja.delete(COOKIE_SESSAO);
}

/** Usuário da sessão atual (uma consulta por requisição). */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const valor = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!valor || valor.length > 100) return null;
  return umaLinha<Usuario>(
    `select u.id, u.email, u.nome, u.perfil, u.idioma
       from sessoes s join usuarios u on u.id = s.usuario_id
      where s.hash = $1 and s.expira_em > now()`,
    [hash(valor)],
  );
});

export async function exigirUsuario() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/painel/entrar");
  return usuario;
}

export const ehEquipe = (u: Usuario) => u.perfil === "admin" || u.perfil === "gestor";

/** Equipe da T9 (admin ou gestor). */
export async function exigirEquipe() {
  const usuario = await exigirUsuario();
  if (!ehEquipe(usuario)) redirect("/painel");
  return usuario;
}

export async function exigirAdmin() {
  const usuario = await exigirUsuario();
  if (usuario.perfil !== "admin") redirect("/painel");
  return usuario;
}

/** Empresas que o usuário pode ver: o admin vê todas; os demais, as liberadas em "acessos". */
export const empresasDoUsuario = cache(async (usuario: Usuario) => {
  if (usuario.perfil === "admin") return consulta<Empresa>("select * from empresas order by nome");
  return consulta<Empresa>(
    "select e.* from empresas e join acessos a on a.empresa_id = e.id where a.usuario_id = $1 order by e.nome",
    [usuario.id],
  );
});

/** Empresa pelo slug, só se o usuário tiver acesso a ela. Sem acesso, é como se não existisse. */
export const empresaPermitida = cache(async (usuario: Usuario, slug: string) => {
  if (usuario.perfil === "admin") return umaLinha<Empresa>("select * from empresas where slug = $1", [slug]);
  return umaLinha<Empresa>(
    "select e.* from empresas e join acessos a on a.empresa_id = e.id where e.slug = $1 and a.usuario_id = $2",
    [slug, usuario.id],
  );
});

/** Mesma checagem, pelo id (usado nas Server Actions, que recebem ids do formulário). */
export async function empresaPermitidaPorId(usuario: Usuario, id: number) {
  if (!Number.isInteger(id) || id <= 0) return null;
  if (usuario.perfil === "admin") return umaLinha<Empresa>("select * from empresas where id = $1", [id]);
  return umaLinha<Empresa>(
    "select e.* from empresas e join acessos a on a.empresa_id = e.id where e.id = $1 and a.usuario_id = $2",
    [id, usuario.id],
  );
}

// ---------- "Ver como cliente" ----------
// A equipe pode navegar pelo painel de um cliente sem os controles de edição,
// para ver exatamente o que ele vê. É só um cookie de preferência: não muda permissões.

export const COOKIE_MODO_CLIENTE = "t9_ver_como_cliente";

export async function modoCliente() {
  return (await cookies()).get(COOKIE_MODO_CLIENTE)?.value === "1";
}

/** Mostra os controles de edição da equipe nesta tela? */
export async function mostrarEdicao(usuario: Usuario) {
  return ehEquipe(usuario) && !(await modoCliente());
}
