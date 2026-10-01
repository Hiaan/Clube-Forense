import "server-only";
import { empresaPermitida, usuarioAtual } from "@/lib/painel/auth";
import type { Idioma } from "@/lib/i18n";

/** Usuário e empresa da URL, conferindo o acesso. */
export async function acessoExportacao(params: Promise<{ empresa: string }>) {
  const usuario = await usuarioAtual();
  if (!usuario) return null;
  const empresa = await empresaPermitida(usuario, (await params).empresa);
  return empresa ? { usuario, empresa } : null;
}

/** CSV que abre certo no Excel: BOM, ";" e vírgula decimal (ponto em inglês). */
export function respostaCsv(nome: string, cabecalho: string[], linhas: (string | number | null)[][], idioma: Idioma) {
  const celula = (v: string | number | null) => {
    if (v == null) return "";
    if (typeof v === "number") return idioma === "en" ? String(v) : String(v).replace(".", ",");
    // Evita que o Excel interprete o texto como fórmula.
    const texto = /^[=+\-@]/.test(v) ? `'${v}` : v;
    return /[;"\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const corpo = [cabecalho, ...linhas].map((l) => l.map(celula).join(";")).join("\r\n");
  return new Response("﻿" + corpo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
