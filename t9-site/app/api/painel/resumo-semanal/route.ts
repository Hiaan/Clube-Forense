import { bancoConfigurado } from "@/lib/painel/db";
import { enviarResumoSemanal } from "@/lib/painel/resumoSemanal";
import { chamadaAutorizada } from "../autorizacao";

// Disparado pelo Cron da Vercel (vercel.json) toda segunda-feira.
export async function GET(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  if (!bancoConfigurado()) return Response.json({ ok: false, erro: "banco não configurado" }, { status: 503 });
  const enviados = await enviarResumoSemanal();
  return Response.json({ ok: true, enviados });
}
