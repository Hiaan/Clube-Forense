import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { q, uma, type Agencia, type Usuario } from "./banco";

// Contas do Placar: cada agência tem seus usuários; login por e-mail e senha.
// Sessão em cookie próprio ("placar_sessao"), sem nada em comum com o painel da T9.

export const NOME_APP = "Placar";
export const COOKIE = "placar_sessao";
const DIAS_SESSAO = 30;
export const DIAS_TESTE = 7;
/** Dias de tolerância depois do vencimento antes de bloquear (boleto e PIX levam um tempo para compensar). */
const TOLERANCIA_DIAS = 3;

// ---------- Planos ----------

export const PLANOS = [
  { id: "essencial", nome: "Essencial", preco: 97, clientes: 10, resumo: "Até 10 clientes" },
  { id: "profissional", nome: "Profissional", preco: 197, clientes: 30, resumo: "Até 30 clientes" },
  { id: "ilimitado", nome: "Ilimitado", preco: 397, clientes: Infinity, resumo: "Clientes ilimitados" },
] as const;
export type IdPlano = (typeof PLANOS)[number]["id"];
export const planoPorId = (id: string) => PLANOS.find((p) => p.id === id);
/** Durante o teste, o limite é o do plano do meio. */
export const limiteDeClientes = (a: Pick<Agencia, "plano">) => planoPorId(a.plano)?.clientes ?? 30;

export type Acesso = { liberado: boolean; motivo: "teste" | "pago" | "tolerancia" | "teste-acabou" | "vencido"; diasRestantes: number };

/** Pode usar o app agora? Teste em dia, assinatura paga ou dentro da tolerância. */
export function acessoDe(a: Pick<Agencia, "status" | "teste_ate" | "pago_ate">, agora = Date.now()): Acesso {
  const dias = (ate: number) => Math.max(0, Math.ceil((ate - agora) / 86_400_000));
  const pago = a.pago_ate ? new Date(a.pago_ate).getTime() : 0;
  if (pago > agora) return { liberado: true, motivo: "pago", diasRestantes: dias(pago) };
  if (pago && pago + TOLERANCIA_DIAS * 86_400_000 > agora) return { liberado: true, motivo: "tolerancia", diasRestantes: dias(pago + TOLERANCIA_DIAS * 86_400_000) };
  const teste = new Date(a.teste_ate).getTime();
  if (teste > agora) return { liberado: true, motivo: "teste", diasRestantes: dias(teste) };
  return { liberado: false, motivo: pago ? "vencido" : "teste-acabou", diasRestantes: 0 };
}

// ---------- Sessão ----------

const hash = (valor: string) => createHash("sha256").update(valor).digest("hex");

export async function iniciarSessao(usuarioId: number) {
  const token = randomBytes(32).toString("base64url");
  await q("insert into placar.sessoes (hash, usuario_id, expira_em) values ($1, $2, now() + make_interval(days => $3))", [hash(token), usuarioId, DIAS_SESSAO]);
  await q("update placar.usuarios set ultimo_acesso = now() where id = $1", [usuarioId]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_SESSAO * 86_400,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await q("delete from placar.sessoes where hash = $1", [hash(token)]);
  jar.delete(COOKIE);
}

export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return uma<Usuario>(
    `select u.id, u.agencia_id, u.email, u.nome from placar.sessoes s join placar.usuarios u on u.id = s.usuario_id
      where s.hash = $1 and s.expira_em > now()`,
    [hash(token)],
  );
});

export const agenciaDe = cache((id: number) => uma<Agencia>("select * from placar.agencias where id = $1", [id]));

/** Usuário logado e a agência dele; sem sessão, vai para o login. */
export async function exigirConta() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/placar/entrar");
  const agencia = await agenciaDe(usuario.agencia_id);
  if (!agencia) redirect("/placar/entrar");
  return { usuario, agencia, acesso: acessoDe(agencia) };
}

/** Como exigirConta, mas sem acesso liberado (teste acabou, sem pagamento) manda escolher o plano. */
export async function exigirAcesso() {
  const conta = await exigirConta();
  if (!conta.acesso.liberado) redirect("/placar/app/plano");
  return conta;
}

// ---------- Tokens de uso único (redefinir senha) ----------

export async function criarToken(usuarioId: number, tipo: string, minutos: number) {
  const token = randomBytes(32).toString("base64url");
  await q("insert into placar.tokens (hash, usuario_id, tipo, expira_em) values ($1, $2, $3, now() + make_interval(mins => $4))", [hash(token), usuarioId, tipo, minutos]);
  return token;
}

export async function usarToken(token: string, tipo: string) {
  const linha = await uma<{ usuario_id: number }>(
    "update placar.tokens set usado_em = now() where hash = $1 and tipo = $2 and usado_em is null and expira_em > now() returning usuario_id",
    [hash(token), tipo],
  );
  return linha?.usuario_id ?? null;
}

// ---------- Cofre (token da Meta guardado cifrado) ----------

function chave() {
  const base = process.env.PLACAR_CHAVE || process.env.META_APP_SECRET;
  if (!base) throw new Error("Defina PLACAR_CHAVE (ou META_APP_SECRET) para guardar os tokens.");
  return createHash("sha256").update(`placar-cofre:${base}`).digest();
}

export function cifrar(texto: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", chave(), iv);
  const dados = Buffer.concat([c.update(texto, "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), dados.toString("base64url")].join(".");
}

export function decifrar(guardado: string) {
  const [v, iv, tag, dados] = guardado.split(".");
  if (v !== "v1") throw new Error("formato desconhecido");
  const d = createDecipheriv("aes-256-gcm", chave(), Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(dados, "base64url")), d.final()]).toString("utf8");
}

export const endereco = () => (process.env.PLACAR_URL ?? `${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://t9company.com.br").replace(/\/$/, "")}/placar`).replace(/\/$/, "");
