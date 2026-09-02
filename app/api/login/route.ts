// Entrada de quem já tem conta.
//
// O QUE ESTE ENDPOINT FAZ, E O QUE DEPENDE DE VOCÊ
// A plataforma de alunos nos deu, até agora, só o webhook de cadastro
// (`external-register`). Não há endereço público para conferir uma senha. Então
// este endpoint trabalha em dois modos:
//
//   1. COM CLUBE_FORENSE_LOGIN_URL definida — login de verdade: manda e-mail e
//      senha para a plataforma e só abre a sessão se ela confirmar. É o modo
//      que se quer; basta apontar a variável para o endpoint quando ele
//      existir.
//
//   2. SEM a variável — modo reconhecimento: a senha não tem contra o que ser
//      conferida, então o que abre a sessão é o e-mail já constar entre os
//      cadastros feitos aqui. Quem nunca se cadastrou é mandado para o
//      cadastro, e não entra.
//
// O segundo modo é aceitável porque o que está atrás desta porta é informação
// pública sobre concursos, e a porta existe para trocar esse detalhe por um
// contato — não para guardar segredo (ver o cabeçalho de lib/sessao.ts). Ainda
// assim é o modo pior, e existe só enquanto o primeiro não puder ser ligado.

import { marcarRetornoLead } from "../../lib/leadsRepo";
import { criarSessao } from "../../lib/sessao";

export const dynamic = "force-dynamic";

interface Corpo {
  email?: string;
  senha?: string;
  /** Estado que a pessoa tentou abrir quando a tela apareceu. */
  uf?: string;
}

function erro(mensagem: string, status: number, extra: object = {}) {
  return Response.json({ ok: false, mensagem, ...extra }, { status });
}

function abrirSessao(email: string) {
  // O e-mail vai dentro do cookie: o ranking precisa saber de quem é cada
  // cartão-resposta, e este é o único momento em que sabemos.
  const sessao = criarSessao(email);
  return Response.json(
    { ok: true, mensagem: "Acesso liberado." },
    {
      headers: {
        "Set-Cookie":
          `${sessao.nome}=${sessao.valor}; Path=/; Max-Age=${sessao.maxAge}; ` +
          `HttpOnly; SameSite=Lax; Secure`,
      },
    },
  );
}

/**
 * Modo 1: pergunta à plataforma. Devolve `null` quando a plataforma não pôde
 * responder (fora do ar, timeout) — aí não dá para afirmar nem que entrou nem
 * que a senha está errada.
 */
async function conferirNaPlataforma(
  url: string,
  email: string,
  senha: string,
): Promise<boolean | null> {
  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), 15_000);
  try {
    const resp = await fetch(url, {
      method: "POST",
      signal: controlador.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        password: senha,
        token: process.env.CLUBE_FORENSE_TOKEN,
      }),
    });
    if (resp.ok) return true;
    // 401/403/422 é credencial errada — resposta legítima, e não falha nossa.
    if ([400, 401, 403, 404, 422].includes(resp.status)) return false;
    console.error(`Login respondeu ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
    return null;
  } catch (e) {
    console.error(`Falha ao chamar o login: ${e instanceof Error ? e.message : e}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let corpo: Corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro("Não consegui ler os dados enviados.", 400);
  }

  const email = (corpo.email ?? "").trim().toLowerCase();
  const senha = corpo.senha ?? "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erro("E-mail inválido.", 400);
  if (!senha) return erro("Informe sua senha.", 400);

  const ufBruta = String(corpo.uf ?? "").trim().toUpperCase();
  const uf = /^[A-Z]{2}$/.test(ufBruta) ? ufBruta : null;

  const url = process.env.CLUBE_FORENSE_LOGIN_URL;
  if (url) {
    const confere = await conferirNaPlataforma(url, email, senha);
    if (confere === null) {
      return erro("O login não respondeu. Tente novamente em instantes.", 504);
    }
    if (!confere) return erro("E-mail ou senha incorretos.", 401);

    await marcarRetornoLead(email, uf);
    return abrirSessao(email);
  }

  // Modo 2. `precisaCadastro` diz ao front para já abrir o formulário completo
  // com o e-mail preenchido, em vez de deixar a pessoa num beco.
  const conhecido = await marcarRetornoLead(email, uf);
  if (!conhecido) {
    return erro("Não encontrei esse e-mail. Crie sua conta — leva um minuto.", 404, {
      precisaCadastro: true,
    });
  }

  return abrirSessao(email);
}
