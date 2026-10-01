import { chaveValida } from "@/lib/acessoLeads";
import { listarLeads } from "@/lib/leads";

const celula = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  const chave = new URL(request.url).searchParams.get("chave");
  if (!chaveValida(chave)) return new Response("Não autorizado", { status: 401 });

  const leads = await listarLeads(5000);
  const linhas = [
    ["Recebido em", "Etapa", "Nome", "E-mail", "WhatsApp", "Faturamento", "Reunião", "Idioma", "Origem"],
    ...leads.map((l) => [
      new Date(l.recebidoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      l.etapa === "agendamento" ? "Agendou" : "Só dados",
      l.nome,
      l.email,
      l.whatsappFormatado,
      l.faturamento ?? "",
      l.reuniao?.descricao ?? "",
      (l.idioma ?? "pt").toUpperCase(),
      l.origem ?? "",
    ]),
  ];
  // BOM no início para o Excel abrir os acentos corretamente.
  const csv = "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-t9-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
