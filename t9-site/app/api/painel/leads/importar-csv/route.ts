import { umaLinha } from "@/lib/painel/db";
import { importarLeadsCsv } from "@/lib/painel/leadsCsv";
import { enviarLead } from "@/lib/painel/whatsapp";
import { chamadaAutorizada } from "../../autorizacao";

/** Importa um CSV de leads da Meta para um cliente (?empresa=slug&enviar=1 manda para o WhatsApp). Protegida pelo CRON_SECRET. */
export async function POST(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  const p = new URL(request.url).searchParams;
  const empresa = await umaLinha<{ id: number; nome: string; whatsapp_leads: string | null }>("select id, nome, whatsapp_leads from empresas where slug = $1", [
    p.get("empresa") ?? "",
  ]);
  if (!empresa) return Response.json({ ok: false, erro: "cliente não encontrado" }, { status: 404 });
  try {
    const { inseridos, repetidos } = await importarLeadsCsv(empresa.id, await request.text());
    const envios = [];
    if (p.get("enviar") === "1") {
      for (const l of inseridos) {
        const r = await enviarLead(empresa, l.id);
        envios.push({ lead: l.nome, numeros: r.numeros.length, erros: r.erros });
      }
    }
    return Response.json({ ok: true, cliente: empresa.nome, inseridos: inseridos.map((l) => l.nome), repetidos, envios });
  } catch (erro) {
    return Response.json({ ok: false, erro: erro instanceof Error ? erro.message : String(erro) }, { status: 400 });
  }
}
