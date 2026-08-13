// Sincronização das vendas da Eduzz.
//
// Roda pelo agendador (Vercel Cron) e serve a dois propósitos: fechar os buracos
// deixados por notificações perdidas e trazer o histórico na primeira vez.
//
// A janela padrão é de 30 dias porque status muda depois da venda — boleto que
// vence, cartão que estorna, reembolso dentro da garantia. Reler o mês inteiro
// é barato e mantém o painel honesto. Para o backfill inicial, chame com
// `?dias=730` uma vez, à mão.

import { revalidatePath } from "next/cache";

import { buscarFaturasRecentes, eduzzConfigurada } from "../../../lib/eduzzApi";
import { daFatura, salvarVendas } from "../../../lib/vendasRepo";

export const dynamic = "force-dynamic";

/** Teto da janela, em dias. A Eduzz pagina por período e um pedido gigante estoura o tempo da função. */
const MAX_DIAS = 1095;

export async function GET(request: Request): Promise<Response> {
  // Mesma proteção do cron principal: opcional, mas exigida se CRON_SECRET
  // existir. O Vercel Cron manda esse header sozinho.
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    if (request.headers.get("authorization") !== `Bearer ${segredo}`) {
      return new Response("Não autorizado", { status: 401 });
    }
  }

  if (!eduzzConfigurada()) {
    return Response.json(
      { ok: false, erro: "EDUZZ_PUBLIC_KEY / EDUZZ_API_KEY não configuradas" },
      { status: 503 },
    );
  }

  const pedido = Number(new URL(request.url).searchParams.get("dias"));
  const dias = Number.isFinite(pedido) && pedido > 0 ? Math.min(pedido, MAX_DIAS) : 30;

  const faturas = await buscarFaturasRecentes(dias);
  if (faturas === null) {
    return Response.json({ ok: false, erro: "Eduzz não respondeu" }, { status: 502 });
  }

  const vendas = faturas.map(daFatura).filter((v) => v !== null);
  const gravadas = await salvarVendas(vendas);
  if (gravadas === null) {
    return Response.json({ ok: false, erro: "banco indisponível" }, { status: 503 });
  }

  revalidatePath("/admin/vendas");

  return Response.json({
    ok: true,
    dias,
    recebidas: faturas.length,
    gravadas,
    // Faturas sem id são descartadas na normalização; se aparecerem, é sinal de
    // que a resposta da Eduzz mudou de formato.
    ignoradas: faturas.length - vendas.length,
  });
}
