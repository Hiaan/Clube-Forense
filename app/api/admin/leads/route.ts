// Exportação dos leads em CSV.
//
// Rota própria, e não um botão que monta o arquivo no navegador, porque assim o
// download é um link comum: funciona no celular, dá para reabrir e não depende
// de a lista já ter sido carregada na tela.

import { cookies } from "next/headers";

import { NOME_COOKIE_ADMIN, sessaoAdminValida } from "../../../lib/admin";
import { listarLeads } from "../../../lib/leadsRepo";

export const dynamic = "force-dynamic";

const COLUNAS = ["nome", "email", "celular", "estado", "cadastro", "visitas", "ultima_visita"];

/** Escapa um campo para CSV. Separador `;` — é o que o Excel em pt-BR espera. */
function campo(v: string | number | null): string {
  const s = v == null ? "" : String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function dataBr(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export async function GET(): Promise<Response> {
  const jar = await cookies();
  if (!sessaoAdminValida(jar.get(NOME_COOKIE_ADMIN)?.value)) {
    return new Response("Não autorizado", { status: 401 });
  }

  const leads = await listarLeads(10_000);
  if (leads === null) {
    return new Response("Banco indisponível", { status: 503 });
  }

  const linhas = leads.map((l) =>
    [
      l.nome,
      l.email,
      l.celular,
      l.ufInteresse,
      dataBr(l.criadoEm),
      l.vezes,
      dataBr(l.vistoEm),
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
      "content-disposition": `attachment; filename="leads-clube-forense-${hoje}.csv"`,
      "cache-control": "no-store",
    },
  });
}
