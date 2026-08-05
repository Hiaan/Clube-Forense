// Acesso ao painel administrativo.
//
// Credenciais vêm de ADMIN_EMAIL e ADMIN_SENHA. NÃO há valor padrão de
// propósito: este repositório é público, e uma senha escrita aqui seria um
// convite. Sem as variáveis, ninguém entra — inclusive você — e a tela diz o
// que configurar.
//
// É uma senha única compartilhada, não um sistema de contas. Serve para uma ou
// duas pessoas editarem o conteúdo. Se um dia precisar de vários editores com
// registro de quem mudou o quê, isto precisa virar tabela de usuários.

import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "cf_admin";
const DURACAO_HORAS = 12;

export const NOME_COOKIE_ADMIN = COOKIE;

/** True quando as duas variáveis existem. Sem elas o login recusa qualquer um. */
export function adminConfigurado(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_SENHA);
}

/**
 * Compara sem vazar tempo. Um `===` responde mais rápido quando os primeiros
 * caracteres diferem, o que dá para medir e usar para adivinhar a senha aos
 * poucos.
 */
function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

function segredo(): string {
  // A própria senha serve de chave da assinatura: trocá-la invalida as sessões
  // abertas, que é o comportamento desejado.
  return `${process.env.ADMIN_SENHA ?? ""}|${process.env.SESSAO_SEGREDO ?? "cf"}`;
}

function assinar(dados: string): string {
  return createHmac("sha256", segredo()).update(dados).digest("base64url");
}

export interface Credenciais {
  email: string;
  senha: string;
}

/** Confere as credenciais. False também quando o painel não foi configurado. */
export function credenciaisValidas({ email, senha }: Credenciais): boolean {
  if (!adminConfigurado()) return false;
  const emailOk = iguais(
    email.trim().toLowerCase(),
    (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase(),
  );
  const senhaOk = iguais(senha, process.env.ADMIN_SENHA ?? "");
  // Avalia os dois sempre, para o tempo de resposta não revelar qual errou.
  return emailOk && senhaOk;
}

export function criarSessaoAdmin(): { nome: string; valor: string; maxAge: number } {
  const expiraEm = String(Date.now() + DURACAO_HORAS * 3_600_000);
  return {
    nome: COOKIE,
    valor: `${expiraEm}.${assinar(expiraEm)}`,
    maxAge: DURACAO_HORAS * 3_600,
  };
}

/** True se o cookie é válido, não expirou e o painel está configurado. */
export function sessaoAdminValida(valor: string | undefined): boolean {
  if (!adminConfigurado() || !valor) return false;

  const corte = valor.lastIndexOf(".");
  if (corte <= 0) return false;

  const expiraEm = valor.slice(0, corte);
  const esperada = Buffer.from(assinar(expiraEm));
  const recebida = Buffer.from(valor.slice(corte + 1));
  if (esperada.length !== recebida.length) return false;
  if (!timingSafeEqual(esperada, recebida)) return false;

  const prazo = Number(expiraEm);
  return Number.isFinite(prazo) && prazo > Date.now();
}
