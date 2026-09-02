"use server";

// Envio do cartão-resposta.
//
// É a única ação do site que grava algo em nome de uma pessoa, e por isso a
// única que precisa saber quem ela é. A conferência acontece AQUI DENTRO, e não
// só na página que mostra o formulário: uma Server Action é um endpoint POST
// como outro qualquer, alcançável sem passar pela nossa tela.

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { lerProva, salvarResposta } from "../lib/provasRepo";
import { ALTERNATIVAS, type Cartao } from "../lib/ranking";
import { emailDaSessao, NOME_COOKIE } from "../lib/sessao";

export interface ResultadoEnvio {
  ok: boolean;
  mensagem: string;
}

/** Limite de tamanho do apelido no ranking. */
const MAX_APELIDO = 28;

export async function enviarCartaoAcao(
  _anterior: ResultadoEnvio | null,
  dados: FormData,
): Promise<ResultadoEnvio> {
  try {
    const jar = await cookies();
    const email = emailDaSessao(jar.get(NOME_COOKIE)?.value);
    if (!email) {
      return {
        ok: false,
        mensagem: "Entre com seu e-mail para participar do ranking.",
      };
    }

    const provaId = Number(String(dados.get("provaId") ?? ""));
    if (!Number.isInteger(provaId) || provaId <= 0) {
      return { ok: false, mensagem: "Prova inválida." };
    }

    const prova = await lerProva(provaId);
    if (!prova) return { ok: false, mensagem: "Prova não encontrada." };
    if (!prova.aberta) {
      return {
        ok: false,
        mensagem: "Esta prova não está mais recebendo cartões.",
      };
    }

    const apelido = String(dados.get("apelido") ?? "").trim().slice(0, MAX_APELIDO);
    if (apelido.length < 2) {
      return { ok: false, mensagem: "Escolha como quer aparecer no ranking." };
    }

    // Tipo tem de ser um dos cadastrados. Aceitar qualquer texto criaria um
    // "tipo" fantasma, sem gabarito, e o cartão nunca receberia nota.
    const tipo = String(dados.get("tipo") ?? "").trim();
    if (prova.tipos.length > 0 && !prova.tipos.includes(tipo)) {
      return { ok: false, mensagem: "Escolha o tipo do seu caderno de prova." };
    }
    if (prova.tipos.length === 0 && tipo) {
      return { ok: false, mensagem: "Esta prova tem caderno único." };
    }

    // Só entram questões que existem em alguma matéria e alternativas que o
    // estilo da prova permite. O cartão vem do navegador; tudo o que ele diz é
    // conferido contra o que a prova declara.
    const permitidas = new Set(ALTERNATIVAS[prova.estilo]);
    const dentroDaProva = (q: number) =>
      prova.materias.some((m) => q >= m.questaoDe && q <= m.questaoAte);

    let cru: unknown;
    try {
      cru = JSON.parse(String(dados.get("respostas") ?? "{}"));
    } catch {
      return { ok: false, mensagem: "Não consegui ler o cartão. Tente de novo." };
    }
    if (!cru || typeof cru !== "object" || Array.isArray(cru)) {
      return { ok: false, mensagem: "Não consegui ler o cartão. Tente de novo." };
    }

    const cartao: Cartao = {};
    for (const [chave, valor] of Object.entries(cru as Record<string, unknown>)) {
      const q = Number(chave);
      const alt = String(valor ?? "").toUpperCase();
      if (!Number.isInteger(q) || !dentroDaProva(q)) continue;
      if (!permitidas.has(alt)) continue;
      cartao[q] = alt;
    }

    if (Object.keys(cartao).length === 0) {
      return { ok: false, mensagem: "Marque ao menos uma questão." };
    }

    await salvarResposta(prova, email, apelido, tipo, cartao);

    revalidatePath(`/ranking/${prova.uf}`);
    revalidatePath("/ranking");

    const temGabarito = Object.keys(prova.gabaritos[tipo] ?? {}).length > 0;
    return {
      ok: true,
      mensagem: temGabarito
        ? "Cartão enviado e corrigido. Sua posição está logo abaixo."
        : "Cartão guardado. O gabarito ainda não saiu — assim que ele entrar aqui, sua nota aparece sozinha.",
    };
  } catch (e) {
    console.error("Falha ao gravar o cartão:", e instanceof Error ? e.message : e);
    return { ok: false, mensagem: "Não consegui gravar seu cartão. Tente de novo." };
  }
}
