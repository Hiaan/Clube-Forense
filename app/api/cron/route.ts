// Endpoint acionado pelo agendador (Vercel Cron diário + GitHub Action horário;
// config em vercel.json e .github/workflows/atualizar-monitor.yml).
// Refaz a coleta e revalida a página /monitor para servir dados frescos.

import { revalidatePath } from "next/cache";

import { registrarColeta } from "../../lib/sistemaRepo";
import { coletar } from "../../monitor/lib/coletor";
import { dispararColetaInstagram } from "../../monitor/lib/instagram";

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

  // Dispara (assíncrono) um novo scrape do Instagram no Apify. A função tem
  // trava interna de ~1 disparo/dia, então é seguro chamar o cron de hora em
  // hora. A coleta abaixo lê o resultado do último run já concluído.
  const instagram = await dispararColetaInstagram();

  const relatorio = await coletar();
  const estadosComNovidade = relatorio.estados.filter((e) => e.nivel !== "sem").length;

  // Fica gravado para o painel poder dizer quando o sistema checou por último —
  // separado da conferência humana, que é outra data.
  await registrarColeta({
    em: relatorio.atualizadoEm,
    estadosComNovidade,
    fonteIndisponivel: relatorio.fonteIndisponivel,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/monitor");
  revalidatePath("/api/monitor");

  return Response.json({
    ok: true,
    atualizadoEm: relatorio.atualizadoEm,
    estadosComNovidade,
    fonteIndisponivel: relatorio.fonteIndisponivel,
    instagram,
  });
}
