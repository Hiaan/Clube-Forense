// Exportação das vendas em CSV, no mesmo recorte da tela.
//
// Mesma escolha da exportação de leads: rota própria, para o download ser um
// link comum. A diferença é que aqui o link carrega o filtro — baixar "o que
// está na tela" só é verdade se a rota souber qual é a tela.

import { cookies } from "next/headers";

import { NOME_COOKIE_ADMIN, sessaoAdminValida } from "../../../lib/admin";
import { listarVendas } from "../../../lib/vendasRepo";

export const dynamic = "force-dynamic";

const COLUNAS = [
  "fatura",
  "produto",
  "cliente",
  "email",
  "status",
  "paga",
  "valor_liquido",
  "valor_bruto",
  "criada_em",
  "paga_em",
];

/** Escapa um campo para CSV. Separador `;` — é o que o Excel em pt-BR espera. */
function campo(v: string | number | null): string {
  const s = v == null ? "" : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function dataBr(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString("pt-BR") : "";
}

/** Dinheiro com vírgula decimal: com ponto, o Excel em pt-BR lê 12,90 como 1290. */
function valor(v: number | null): string {
  return v == null ? "" : v.toFixed(2).replace(".", ",");
}

function dataValida(v: string | null): string | null {
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

export async function GET(request: Request): Promise<Response> {
  const jar = await cookies();
  if (!sessaoAdminValida(jar.get(NOME_COOKIE_ADMIN)?.value)) {
    return new Response("Não autorizado", { status: 401 });
  }

  const busca = new URL(request.url).searchParams;
  const vendas = await listarVendas(
    {
      de: dataValida(busca.get("de")),
      ate: dataValida(busca.get("ate")),
      produtoId: Number(busca.get("produto")) || null,
      // O CSV leva também as faturas não pagas: quem exporta está conferindo
      // contra o extrato da Eduzz, e aí o boleto em aberto faz falta.
      somentePagas: false,
    },
    10_000,
  );

  if (vendas === null) {
    return new Response("Banco indisponível", { status: 503 });
  }

  const linhas = vendas.map((v) =>
    [
      v.id,
      v.produto,
      v.clienteNome,
      v.clienteEmail,
      v.statusNome || String(v.status),
      v.paga ? "sim" : "não",
      valor(v.valorLiquido),
      valor(v.valorBruto),
      dataBr(v.criadaEm),
      dataBr(v.pagaEm),
    ]
      .map(campo)
      .join(";"),
  );

  // O BOM faz o Excel reconhecer o UTF-8; sem ele, "José" abre como "JosÃ©".
  const csv = "﻿" + [COLUNAS.join(";"), ...linhas].join("\r\n") + "\r\n";
  const hoje = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="vendas-clube-forense-${hoje}.csv"`,
      "cache-control": "no-store",
    },
  });
}
