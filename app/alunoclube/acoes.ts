"use server";

// A ação que confere o CPF e devolve o link com cupom.
//
// Tudo o que decide fica aqui, no servidor: a lista de produtos, os cupons e a
// consulta às vendas. O navegador manda o CPF e recebe só uma de quatro
// respostas — link liberado, não encontrado, CPF inválido, ou espere.

import { cookies, headers } from "next/headers";

import {
  assinarPasse,
  cpfValido,
  hashDe,
  limparCpf,
  comprasDoCpf,
  registrarTentativa,
  registrarValidacao,
  tentativasRecentes,
} from "../lib/alunoClubeRepo";
import { COOKIE_ALUNO, REGRAS_CUPOM, regraPara } from "./cupons";

export type RespostaAluno =
  | { ok: true }
  | {
      ok: false;
      motivo:
        | "invalido"
        | "nao-encontrado"
        | "limite"
        | "configurando"
        | "erro";
    };

/** Tentativas por conexão, por hora. Folga para errar a digitação algumas vezes. */
const LIMITE_POR_HORA = 8;

export async function validarAluno(
  cpfDigitado: string,
): Promise<RespostaAluno> {
  const cpf = limparCpf(String(cpfDigitado ?? ""));
  if (!cpfValido(cpf)) return { ok: false, motivo: "invalido" };
  if (!REGRAS_CUPOM.some((r) => r.cupom))
    return { ok: false, motivo: "configurando" };

  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "sem-ip";
  const ipHash = hashDe(ip, "ip");

  // O limite existe para a página não virar um oráculo de "este CPF é aluno?"
  // para quem testa números em sequência.
  if ((await tentativasRecentes(ipHash)) >= LIMITE_POR_HORA) {
    return { ok: false, motivo: "limite" };
  }

  const comprados = await comprasDoCpf(cpf);
  if (comprados === null) {
    await registrarTentativa(ipHash, false);
    return { ok: false, motivo: "erro" };
  }

  const regra = regraPara(comprados.ids, comprados.nomes);
  await registrarTentativa(ipHash, Boolean(regra));
  if (!regra) return { ok: false, motivo: "nao-encontrado" };
  // Faixa sem cupom informado ainda: não manda o aluno a um checkout sem desconto.
  if (!regra.cupom) return { ok: false, motivo: "configurando" };

  await registrarValidacao(hashDe(cpf, "cpf"), regra.cupom, regra.rotulo);

  // O passe vai num cookie que só o servidor lê: a página, ao recarregar, monta
  // a oferta deste aluno sem que o link com cupom passe antes pelo navegador.
  (await cookies()).set(COOKIE_ALUNO, assinarPasse(regra.cupom), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/alunoclube",
    maxAge: 7 * 86_400,
  });
  return { ok: true };
}

/** "Não sou eu / usar outro CPF": apaga o passe e volta para a entrada. */
export async function sairAluno(): Promise<void> {
  (await cookies()).delete({ name: COOKIE_ALUNO, path: "/alunoclube" });
}
