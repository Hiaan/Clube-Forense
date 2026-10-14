import { umaLinha } from "@/lib/painel/db";
import { verificarLeadsNovos } from "@/lib/painel/meta";
import { enviarLead, enviarLeadsDeHoje, enviarTeste, numeroLegivel } from "@/lib/painel/whatsapp";
import { chamadaAutorizada } from "../../autorizacao";

/**
 * Manda a mensagem de teste para os números de um cliente (?empresa=slug), ou, com &lead=ultimo,
 * o lead de formulário mais recente no formato do aviso automático; com &lead=hoje, todos os leads
 * de hoje que ainda não saíram. Protegida pelo CRON_SECRET.
 */
export async function POST(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  const slug = new URL(request.url).searchParams.get("empresa") ?? "";
  const empresa = await umaLinha<{ id: number; nome: string; whatsapp_leads: string | null }>(
    "select id, nome, whatsapp_leads from empresas where slug = $1",
    [slug],
  );
  if (!empresa) return Response.json({ ok: false, erro: "cliente não encontrado" }, { status: 404 });
  const modo = new URL(request.url).searchParams.get("lead");
  if (modo === "hoje") {
    // Traz da Meta os leads desde a meia-noite (com folga) e manda os que ainda não saíram.
    const busca = await verificarLeadsNovos(30, empresa.id);
    const r = await enviarLeadsDeHoje(empresa);
    return Response.json({ ok: !r.erros.length, cliente: empresa.nome, numeros: r.numeros.map(numeroLegivel), busca, enviados: r.enviados, erros: r.erros });
  }
  if (modo === "ultimo") {
    const r = await enviarLead(empresa);
    return Response.json({ ok: Boolean(r.lead) && r.numeros.length > 0 && !r.erros.length, cliente: empresa.nome, numeros: r.numeros.map(numeroLegivel), lead: r.lead, erros: r.erros });
  }
  const { numeros, erros } = await enviarTeste(empresa);
  return Response.json({ ok: numeros.length > 0 && !erros.length, cliente: empresa.nome, numeros: numeros.map(numeroLegivel), erros });
}
