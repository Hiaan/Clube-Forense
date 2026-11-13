import { processarEvento, webhookAutorizado } from "@/lib/placar/asaas";

// Webhook do Asaas (configurado no painel do Asaas com o token ASAAS_WEBHOOK_TOKEN).
export async function POST(request: Request) {
  if (!webhookAutorizado(request)) return new Response("Não autorizado", { status: 401 });
  const evento = await request.json().catch(() => null);
  if (!evento?.id || !evento?.event) return Response.json({ ok: false }, { status: 400 });
  await processarEvento(evento);
  return Response.json({ ok: true });
}
