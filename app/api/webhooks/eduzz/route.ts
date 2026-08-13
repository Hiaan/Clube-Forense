// Notificação de compra da Eduzz.
//
// A URL desta rota é cadastrada no painel da Eduzz (Ferramentas → Notificação
// de compra / webhook). A cada mudança de status de uma fatura — boleto pago,
// cartão recusado, reembolso — a Eduzz chama aqui.
//
// É o caminho de tempo real. A sincronização em /api/cron/eduzz é a rede de
// segurança: se uma notificação se perder (a Eduzz desiste depois de algumas
// tentativas), a varredura por período conserta no dia seguinte.

import { doWebhook, salvarVendas } from "../../../lib/vendasRepo";

export const dynamic = "force-dynamic";

/**
 * Lê o corpo em qualquer um dos dois formatos. A Eduzz manda formulário
 * (`application/x-www-form-urlencoded`) na notificação clássica e JSON na nova,
 * e qual das duas chega depende de como a conta foi configurada — aceitar as
 * duas custa dez linhas e evita um debug de tarde inteira.
 */
async function corpo(req: Request): Promise<Record<string, unknown>> {
  const tipo = req.headers.get("content-type") ?? "";
  if (tipo.includes("json")) {
    return (await req.json()) as Record<string, unknown>;
  }
  return Object.fromEntries(await req.formData());
}

export async function POST(request: Request): Promise<Response> {
  let dados: Record<string, unknown>;
  try {
    dados = await corpo(request);
  } catch {
    return Response.json({ ok: false, erro: "corpo ilegível" }, { status: 400 });
  }

  // Chave de segurança configurada junto com a URL no painel da Eduzz. Ela vem
  // no próprio corpo da notificação. Sem ela definida do nosso lado a rota fica
  // aberta — qualquer um poderia inventar uma venda —, então a ausência é
  // recusa, e não permissão.
  const esperado = process.env.EDUZZ_WEBHOOK_TOKEN;
  if (!esperado) {
    console.error("Eduzz: webhook chamado sem EDUZZ_WEBHOOK_TOKEN configurado");
    return Response.json({ ok: false, erro: "webhook não configurado" }, { status: 503 });
  }
  const recebido = String(dados.api_key ?? dados.token ?? "");
  if (recebido !== esperado) {
    return Response.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const venda = doWebhook(dados);
  if (!venda) {
    return Response.json({ ok: false, erro: "sem identificador de fatura" }, { status: 400 });
  }

  const gravadas = await salvarVendas([venda]);
  if (gravadas === null) {
    // 500 de propósito: a Eduzz reenvia o que falhou, e é exatamente o que
    // queremos quando o banco está fora. Responder 200 aqui perderia a venda.
    return Response.json({ ok: false, erro: "banco indisponível" }, { status: 500 });
  }

  return Response.json({ ok: true, venda: venda.id, status: venda.statusNome });
}
