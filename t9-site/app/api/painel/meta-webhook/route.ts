import { after } from "next/server";
import { assinaturaMetaValida, receberLeadDoWebhook, tokenDoWebhook } from "@/lib/painel/meta";
import { avisarLeadsNovos } from "@/lib/painel/whatsapp";

// Webhook da Meta para leads de formulário em tempo real (campo "leadgen" das Páginas).
// Cada lead novo entra na aba Leads e vai na hora para o WhatsApp do cliente.
export const maxDuration = 120;

/** A Meta confere o endereço com um desafio antes de ligar o webhook. */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  if (p.get("hub.mode") === "subscribe" && process.env.META_APP_SECRET && p.get("hub.verify_token") === tokenDoWebhook()) {
    return new Response(p.get("hub.challenge") ?? "", { headers: { "content-type": "text/plain" } });
  }
  return new Response("Não autorizado", { status: 403 });
}

type Aviso = { object?: string; entry?: { changes?: { field?: string; value?: { leadgen_id?: string | number; ad_id?: string | number } }[] }[] };

export async function POST(request: Request) {
  const corpo = await request.text();
  if (!assinaturaMetaValida(corpo, request.headers.get("x-hub-signature-256"))) return new Response("Assinatura inválida", { status: 401 });
  let aviso: Aviso;
  try {
    aviso = JSON.parse(corpo) as Aviso;
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
  const novos = (aviso.entry ?? [])
    .flatMap((e) => e.changes ?? [])
    .filter((c) => c.field === "leadgen" && c.value?.leadgen_id)
    .map((c) => ({ lead: String(c.value!.leadgen_id), anuncio: c.value!.ad_id ? String(c.value!.ad_id) : undefined }));

  // Responde já (a Meta reenvia se demorar) e trabalha depois.
  after(async () => {
    const empresas = new Set<number>();
    for (const n of novos) {
      try {
        for (const id of (await receberLeadDoWebhook(n.lead, n.anuncio)) ?? []) empresas.add(id);
      } catch (erro) {
        console.error("[meta-webhook] lead", n.lead, erro instanceof Error ? erro.message : erro);
      }
    }
    for (const id of empresas) await avisarLeadsNovos(id).catch((erro) => console.error("[meta-webhook] whatsapp", id, erro));
  });
  return Response.json({ ok: true, recebidos: novos.length });
}
