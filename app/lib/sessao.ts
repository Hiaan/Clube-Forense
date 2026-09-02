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
 *
 * O ranking mudou o peso disso: agora o cookie diz QUEM é a pessoa, e forjá-lo
 * significa enviar respostas no nome de outra. Continua não sendo segredo (a
 * nota de um simulado não é), mas é mais um motivo para definir SESSAO_SEGREDO
 * em produção.
 */
function segredo(): string {
  return process.env.SESSAO_SEGREDO ?? "clube-forense-mapa-sem-segredo-configurado";
}

function assinar(dados: string): string {
  return createHmac("sha256", segredo()).update(dados).digest("base64url");
}

/**
 * O e-mail viaja no cookie codificado em base64url — sem isso, um e-mail com
 * ponto (que é a esmagadora maioria) quebraria a separação por ".".
 */
function embalar(email: string): string {
  return Buffer.from(email, "utf8").toString("base64url");
}

function desembalar(pedaco: string): string | null {
  try {
    const email = Buffer.from(pedaco, "base64url").toString("utf8");
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  } catch {
    return null;
  }
}

/**
 * Gera o valor do cookie: validade, quem é, e a assinatura das duas coisas.
 *
 * O e-mail entra a partir do ranking. Antes dele a sessão era anônima — servia
 * só para responder "pode ver o detalhe?", e para isso o nome de quem vê é
 * irrelevante. O ranking precisa saber de quem é cada cartão-resposta, e o
 * cookie é o único lugar onde essa resposta já existe no momento do envio.
 *
 * Sem e-mail (chamada antiga) o formato é o de antes, o que mantém válidos os
 * cookies emitidos até aqui — nenhum visitante é deslogado pelo deploy.
 */
export function criarSessao(email?: string | null): {
  nome: string;
  valor: string;
  maxAge: number;
} {
  const expiraEm = String(Date.now() + DURACAO_DIAS * 86_400_000);
  const limpo = (email ?? "").trim().toLowerCase();
  const miolo = limpo ? `${expiraEm}.${embalar(limpo)}` : expiraEm;
  return {
    nome: COOKIE,
    valor: `${miolo}.${assinar(miolo)}`,
    maxAge: DURACAO_DIAS * 86_400,
  };
}

/** Separa o cookie em miolo e assinatura, conferindo a assinatura. */
function abrir(valor: string | undefined): { expiraEm: string; email: string | null } | null {
  if (!valor) return null;

  const separador = valor.lastIndexOf(".");
  if (separador <= 0) return null;

  const miolo = valor.slice(0, separador);
  const assinatura = valor.slice(separador + 1);

  const esperada = Buffer.from(assinar(miolo));
  const recebida = Buffer.from(assinatura);
  // Comprimentos diferentes fariam timingSafeEqual lançar.
  if (esperada.length !== recebida.length) return null;
  if (!timingSafeEqual(esperada, recebida)) return null;

  const [expiraEm, embalado] = miolo.split(".");
  const prazo = Number(expiraEm);
  if (!Number.isFinite(prazo) || prazo <= Date.now()) return null;

  return { expiraEm, email: embalado ? desembalar(embalado) : null };
}

/** True se o cookie é válido e não expirou. Nunca lança. */
export function sessaoValida(valor: string | undefined): boolean {
  return abrir(valor) !== null;
}

/**
 * De quem é a sessão. `null` para cookie inválido, expirado — ou válido e
 * anônimo, que é o caso de quem entrou antes do ranking existir.
 *
 * Quem chama precisa tratar o `null` como "ainda não sei quem é", e não como
 * "não pode entrar": o acesso ao mapa continua liberado nesse caso.
 */
export function emailDaSessao(valor: string | undefined): string | null {
  return abrir(valor)?.email ?? null;
}

export const NOME_COOKIE = COOKIE;
