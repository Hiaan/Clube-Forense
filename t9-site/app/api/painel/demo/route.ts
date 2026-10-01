import { semearDemo } from "@/lib/painel/demo";
import { registrar } from "@/lib/painel/db";
import { chamadaAutorizada } from "../autorizacao";

/** (Re)cria o cliente de demonstração. Protegido pelo CRON_SECRET. Pelo painel: Carteira → "Recriar demonstração". */
export async function POST(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  const slug = await semearDemo();
  await registrar(null, null, "demo.recriar", `${slug} (api)`);
  return Response.json({ ok: true, slug });
}
