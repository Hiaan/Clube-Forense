// Carga da base de alunos por máquina, para quando a planilha é enviada pela
// equipe técnica e não pela tela do painel.
//
// Fechada por padrão: só existe enquanto a variável ALUNOS_BASE_TOKEN estiver
// definida na Vercel, e só aceita quem manda exatamente esse token. Removida a
// variável, a rota responde 404 — é assim que ela é "desligada" depois do uso.
// Recebe o mesmo formato do envio pelo painel (CPF, código e nome do produto)
// e grava pelo mesmo caminho: só o HMAC do CPF.

import { timingSafeEqual } from "node:crypto";

import { cpfValido, gravarBase, limparCpf } from "../../../lib/alunoClubeRepo";

export const dynamic = "force-dynamic";

function autorizado(req: Request): boolean {
  const esperado = process.env.ALUNOS_BASE_TOKEN;
  const recebido = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!esperado || esperado.length < 32) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recebido);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!autorizado(req)) return new Response("Not found", { status: 404 });

  let corpo: { linhas?: unknown; primeiroLote?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return Response.json({ ok: false, erro: "json inválido" }, { status: 400 });
  }
  if (!Array.isArray(corpo.linhas) || corpo.linhas.length > 5000) {
    return Response.json({ ok: false, erro: "lote inválido" }, { status: 400 });
  }

  const boas: { cpf: string; produtoId: number | null; produto: string | null }[] = [];
  let invalidas = 0;
  for (const l of corpo.linhas as unknown[]) {
    const [cpfBruto, produtoId, produto] = Array.isArray(l) ? l : [];
    const cpf = limparCpf(String(cpfBruto ?? ""));
    if (!cpfValido(cpf)) {
      invalidas++;
      continue;
    }
    const id = Number(produtoId);
    boas.push({
      cpf,
      produtoId: produtoId != null && Number.isFinite(id) ? id : null,
      produto: produto ? String(produto).slice(0, 300) : null,
    });
  }

  try {
    const gravadas = await gravarBase(boas, corpo.primeiroLote === true);
    return Response.json({ ok: true, gravadas, invalidas });
  } catch (erro) {
    console.error("[alunos-base] carga falhou:", erro);
    return Response.json({ ok: false, erro: "falha ao gravar" }, { status: 500 });
  }
}
