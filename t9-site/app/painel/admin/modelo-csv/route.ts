import { usuarioAtual, ehEquipe } from "@/lib/painel/auth";
import { CABECALHO_MODELO } from "@/lib/painel/csv";

/** Planilha modelo para importar métricas (abre direto no Excel/Google Planilhas). */
export async function GET() {
  const usuario = await usuarioAtual();
  if (!usuario || !ehEquipe(usuario)) return new Response("Não autorizado", { status: 401 });
  const exemplo = [
    CABECALHO_MODELO,
    "2026-09-29;Meta Ads;Campanha Leads - Público frio;350,00;42000;610;18;0;0",
    "2026-09-29;Google Ads;Pesquisa - Marca;120,50;3100;240;9;0;0",
  ].join("\r\n");
  return new Response("﻿" + exemplo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modelo-metricas-t9.csv"',
    },
  });
}
