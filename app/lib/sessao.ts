// Sessão de acesso ao detalhe dos estados.
//
// O QUE ISTO É, E O QUE NÃO É
// Isto é um muro de cadastro, não um sistema de autenticação. Ele existe para
// trocar o detalhe de um estado por um e-mail, no momento em que a pessoa
// demonstra interesse. Não protege segredo nenhum — o conteúdo é informação
// pública sobre concursos.
//
// Por isso não há login: a plataforma de alunos só nos deu o endpoint de
// cadastro. Quem já é aluno vai acabar se cadastrando de novo aqui; quando
// houver um endpoint de login, dá para reconhecê-lo de verdade.
//
// O cookie é assinado para não bastar digitar qualquer coisa no navegador.

import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "cf_acesso";
const DURACAO_DIAS = 180;

/**
 * Segredo da assinatura. Sem a variável, cai num valor fixo: a sessão continua
 * funcionando, só deixa de ser difícil de forjar. Para um muro de cadastro isso
 * é aceitável — e evita que uma variável esquecida derrube o site inteiro, que
 * é um problema que já nos custou caro neste projeto.
 */
function segredo(): string {
  return process.env.SESSAO_SEGREDO ?? "clube-forense-mapa-sem-segredo-configurado";
}

function assinar(dados: string): string {
  return createHmac("sha256", segredo()).update(dados).digest("base64url");
}

/** Gera o valor do cookie: validade + assinatura. */
export function criarSessao(): { nome: string; valor: string; maxAge: number } {
  const expiraEm = String(Date.now() + DURACAO_DIAS * 86_400_000);
  return {
    nome: COOKIE,
    valor: `${expiraEm}.${assinar(expiraEm)}`,
    maxAge: DURACAO_DIAS * 86_400,
  };
}

/** True se o cookie é válido e não expirou. Nunca lança. */
export function sessaoValida(valor: string | undefined): boolean {
  if (!valor) return false;

  const separador = valor.lastIndexOf(".");
  if (separador <= 0) return false;

  const expiraEm = valor.slice(0, separador);
  const assinatura = valor.slice(separador + 1);

  const esperada = Buffer.from(assinar(expiraEm));
  const recebida = Buffer.from(assinatura);
  // Comprimentos diferentes fariam timingSafeEqual lançar.
  if (esperada.length !== recebida.length) return false;
  if (!timingSafeEqual(esperada, recebida)) return false;

  const prazo = Number(expiraEm);
  return Number.isFinite(prazo) && prazo > Date.now();
}

export const NOME_COOKIE = COOKIE;
