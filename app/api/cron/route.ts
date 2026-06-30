// Endpoint acionado pelo Vercel Cron (config em vercel.json) a cada hora.
// Refaz a coleta e revalida a página /monitor para servir dados frescos.

import { revalidatePath } from "next/cache";
import { coletar } from "../../monitor/lib/coletor";

// Sempre executa no servidor, sem cache estático.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Proteção opcional: se CRON_SECRET estiver definido, exige o header.
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${segredo}`) {
      return new Response("Não autorizado", { status: 401 });
    }
  }

  const relatorio = await coletar();
  revalidatePath("/monitor");
  revalidatePath("/api/monitor");

  return Response.json({
    ok: true,
    atualizadoEm: relatorio.atualizadoEm,
    estadosComNovidade: relatorio.estados.filter((e) => e.nivel !== "sem").length,
    fonteIndisponivel: relatorio.fonteIndisponivel,
  });
}
