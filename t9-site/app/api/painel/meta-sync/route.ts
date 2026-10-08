import { bancoConfigurado } from "@/lib/painel/db";
import { metaConfigurado, sincronizarTodas } from "@/lib/painel/meta";
import { chamadaAutorizada } from "../autorizacao";

// Disparado pelo Cron da Vercel (vercel.json) todo dia de madrugada.
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  if (!bancoConfigurado() || !metaConfigurado()) return Response.json({ ok: false, erro: "banco ou token da Meta não configurado" }, { status: 503 });
  const resultado = await sincronizarTodas();
  console.info("[painel] sincronização Meta", JSON.stringify(resultado));
  return Response.json({ ok: true, resultado });
}
