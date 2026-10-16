import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Senhas do painel: scrypt com sal aleatório. O banco guarda só "scrypt$N$r$p$sal$hash".

const N = 16384;
const R = 8;
const P = 1;
const TAMANHO = 64;
export const SENHA_MINIMA = 8;

const derivar = (senha: string, sal: Buffer, n: number, r: number, p: number) =>
  new Promise<Buffer>((ok, falha) =>
    scrypt(senha.normalize("NFKC"), sal, TAMANHO, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (erro, chave) => (erro ? falha(erro) : ok(chave))),
  );

export async function hashSenha(senha: string) {
  const sal = randomBytes(16);
  const chave = await derivar(senha, sal, N, R, P);
  return `scrypt$${N}$${R}$${P}$${sal.toString("base64url")}$${chave.toString("base64url")}`;
}

// Hash de uma senha qualquer, para gastar o mesmo tempo quando o e-mail não existe.
let hashFicticio: Promise<string> | undefined;

/** Confere a senha com o hash guardado. Sem hash, faz a mesma conta e devolve false. */
export async function conferirSenha(senha: string, guardado: string | null) {
  hashFicticio ??= hashSenha(randomBytes(12).toString("hex"));
  const partes = (guardado ?? (await hashFicticio)).split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;
  const [, n, r, p, sal, chave] = partes;
  const esperado = Buffer.from(chave, "base64url");
  const calculado = await derivar(senha, Buffer.from(sal, "base64url"), Number(n), Number(r), Number(p));
  return Boolean(guardado) && esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

/** Motivo para recusar a senha nova, ou null se ela serve. */
export function problemaNaSenha(senha: string) {
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (senha.length > 200) return "Senha longa demais.";
  return null;
}
