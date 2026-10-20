import { bancoConfigurado } from "@/lib/painel/db";
import { gerarMensalidades } from "@/lib/painel/financeiro";
import { enviarPendentes } from "@/lib/painel/crm";
import { metaConfigurado, sincronizarTodas } from "@/lib/painel/meta";
import { chamadaAutorizada } from "../autorizacao";

// Disparado pelo Cron da Vercel (vercel.json) todo dia de madrugada.
// Também lança as mensalidades dos clientes com cobrança automática ligada.
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  if (!bancoConfigurado()) return Response.json({ ok: false, erro: "banco não configurado" }, { status: 503 });
  // Uma falha aqui não impede a sincronização com a Meta.
  const mensalidades = await gerarMensalidades().catch((e) => ({ erro: e instanceof Error ? e.message : String(e) }));
  console.info("[painel] mensalidades automáticas", JSON.stringify(mensalidades));
  // Etapas do CRM que não chegaram à Meta (alguns clientes usam token próprio, sem o da T9).
  const crm = await enviarPendentes().catch((e) => ({ erro: e instanceof Error ? e.message : String(e) }));
  console.info("[painel] etapas do CRM para a Meta", JSON.stringify(crm));
  if (!metaConfigurado()) return Response.json({ ok: false, erro: "token da Meta não configurado", mensalidades, crm }, { status: 503 });
  const resultado = await sincronizarTodas();
  console.info("[painel] sincronização Meta", JSON.stringify(resultado));
  return Response.json({ ok: true, resultado, mensalidades, crm });
}
