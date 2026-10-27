"use server";

// Recebe a base de alunos (CSV da Eduzz) já lida no navegador, em lotes.
//
// Só quem está logado no painel. O primeiro lote apaga a base anterior da
// planilha — subir de novo é substituir, não somar duplicado.

import { cookies } from "next/headers";

import { NOME_COOKIE_ADMIN, sessaoAdminValida } from "../../../lib/admin";
import { cpfValido, gravarBase, limparCpf } from "../../../lib/alunoClubeRepo";

export type LinhaBase = [
  cpf: string,
  produtoId: number | null,
  produto: string | null,
];

export async function importarBaseAcao(
  linhas: LinhaBase[],
  primeiroLote: boolean,
): Promise<{
  ok: boolean;
  gravadas: number;
  invalidas: number;
  mensagem?: string;
}> {
  if (!sessaoAdminValida((await cookies()).get(NOME_COOKIE_ADMIN)?.value)) {
    return {
      ok: false,
      gravadas: 0,
      invalidas: 0,
      mensagem: "Sessão expirada. Entre novamente.",
    };
  }
  if (!Array.isArray(linhas) || linhas.length > 5000) {
    return { ok: false, gravadas: 0, invalidas: 0, mensagem: "Lote inválido." };
  }

  const boas: {
    cpf: string;
    produtoId: number | null;
    produto: string | null;
  }[] = [];
  let invalidas = 0;
  for (const [cpfBruto, produtoId, produto] of linhas) {
    const cpf = limparCpf(String(cpfBruto ?? ""));
    if (!cpfValido(cpf)) {
      invalidas++;
      continue;
    }
    boas.push({
      cpf,
      produtoId:
        Number.isFinite(Number(produtoId)) && produtoId != null
          ? Number(produtoId)
          : null,
      produto: produto ? String(produto).slice(0, 300) : null,
    });
  }

  try {
    const gravadas = await gravarBase(boas, primeiroLote);
    return { ok: true, gravadas, invalidas };
  } catch (erro) {
    console.error("[alunoclube] importação falhou:", erro);
    return {
      ok: false,
      gravadas: 0,
      invalidas,
      mensagem: "Falha ao gravar no banco.",
    };
  }
}
