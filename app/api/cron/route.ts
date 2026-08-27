// Endpoint acionado pelo agendador (Vercel Cron diário + GitHub Action horário;
// config em vercel.json e .github/workflows/atualizar-monitor.yml).
// Refaz a coleta e revalida a página /monitor para servir dados frescos.

import { revalidatePath } from "next/cache";

import { semearImls } from "../../lib/imlsRepo";
import { semearPlanos } from "../../lib/planoRepo";
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

  // Leva para o banco os planos de carreira que estão no código, nos estados que
  // ainda não têm nenhum. Depois da primeira vez isto não faz nada.
  const planosSemeados = await semearPlanos();

  // Mesma ideia para a distribuição dos IMLs.
  const imlsSemeados = await semearImls();

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

  // A data da menção mais nova é o que responde "está chegando notícia?" —
  // `estadosComNovidade` não responde, porque conta também os estados cujo
  // único sinal é a curadoria, que está sempre lá. Sem esta linha, a única
  // forma de saber era abrir o site e reparar nas datas.
  const maisRecente = relatorio.estados
    .flatMap((e) => e.mencoes)
    .map((m) => m.data)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  return Response.json({
    ok: true,
    atualizadoEm: relatorio.atualizadoEm,
    estadosComNovidade,
    totalMencoes: relatorio.totalMencoes,
    mencaoMaisRecente: maisRecente ?? null,
    fonteIndisponivel: relatorio.fonteIndisponivel,
    instagram,
    planosSemeados,
    imlsSemeados,
  });
}
