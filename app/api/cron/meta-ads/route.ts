// Sincronização do gasto com anúncios no Meta.
//
// Janela padrão de 30 dias, e não "ontem", porque o Meta reescreve os números
// dos dias recentes conforme atribui conversões: reler só o último dia
// congelaria o histórico numa versão provisória. Reler o mês é barato.
//
// `?dias=N` amplia a janela para o carregamento inicial.

import { revalidatePath } from "next/cache";

import { salvarGastos } from "../../../lib/adsRepo";
import { buscarGastosRecentes, metaAdsConfigurado } from "../../../lib/metaAdsApi";

export const dynamic = "force-dynamic";

/** Teto da janela, em dias. O Meta limita o período de insights por requisição. */
const MAX_DIAS = 1095;

export async function GET(request: Request): Promise<Response> {
  const segredo = process.env.CRON_SECRET;
  if (segredo && request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  if (!metaAdsConfigurado()) {
    return Response.json(
      { ok: false, erro: "META_ACCESS_TOKEN / META_AD_ACCOUNT_ID não configurados" },
      { status: 503 },
    );
  }

  const pedido = Number(new URL(request.url).searchParams.get("dias"));
  const dias = Number.isFinite(pedido) && pedido > 0 ? Math.min(pedido, MAX_DIAS) : 30;

  const gastos = await buscarGastosRecentes(dias);
  if (gastos === null) {
    return Response.json({ ok: false, erro: "Meta não respondeu" }, { status: 502 });
  }

  const gravados = await salvarGastos(gastos);
  if (gravados === null) {
    return Response.json({ ok: false, erro: "banco indisponível" }, { status: 503 });
  }

  revalidatePath("/admin/vendas");

  return Response.json({
    ok: true,
    dias,
    linhas: gastos.length,
    gasto: gastos.reduce((soma, g) => soma + g.gasto, 0),
  });
}
