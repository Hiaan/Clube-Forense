import "server-only";
import { timingSafeEqual } from "node:crypto";
import { q, uma, type Agencia } from "./banco";
import { planoPorId, type IdPlano } from "./conta";

// Cobrança do Placar pelo Asaas: uma assinatura mensal por agência. O cliente escolhe na
// fatura como pagar (PIX, boleto ou cartão). O webhook do Asaas libera o acesso quando o
// pagamento cai. Variáveis: ASAAS_API_KEY, ASAAS_AMBIENTE ("producao" ou "sandbox") e
// ASAAS_WEBHOOK_TOKEN (o mesmo texto cadastrado no webhook, dentro do Asaas).

export const asaasConfigurado = () => Boolean(process.env.ASAAS_API_KEY);
const base = () =>
  process.env.ASAAS_URL ?? (process.env.ASAAS_AMBIENTE === "producao" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3");

async function asaas<T>(caminho: string, metodo: "GET" | "POST" | "PUT" | "DELETE" = "GET", corpo?: unknown): Promise<T> {
  const chave = process.env.ASAAS_API_KEY;
  if (!chave) throw new Error("A cobrança ainda não está configurada.");
  const r = await fetch(`${base()}${caminho}`, {
    method: metodo,
    headers: { access_token: chave, "content-type": "application/json", "user-agent": "placar" },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const json = (await r.json().catch(() => ({}))) as T & { errors?: { description?: string }[] };
  if (!r.ok) throw new Error(json.errors?.map((e) => e.description).join("; ") || `Asaas respondeu ${r.status}`);
  return json;
}

const hojeBrasil = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

/**
 * Assina (ou troca de plano). Devolve o link da fatura para pagar agora. Quem ainda está no teste
 * paga a primeira mensalidade quando o teste acabar; quem já passou do teste paga hoje.
 */
export async function assinar(a: Agencia, plano: IdPlano, dados: { documento: string; email: string }) {
  const p = planoPorId(plano)!;
  let cliente = a.asaas_cliente;
  if (!cliente) {
    const c = await asaas<{ id: string }>("/customers", "POST", {
      name: a.nome,
      cpfCnpj: dados.documento,
      email: dados.email,
      mobilePhone: a.telefone?.replace(/\D/g, "").replace(/^55/, "") || undefined,
      externalReference: `agencia-${a.id}`,
    });
    cliente = c.id;
  }
  if (a.asaas_assinatura) {
    await asaas(`/subscriptions/${a.asaas_assinatura}`, "PUT", { value: p.preco, description: `Placar ${p.nome}`, updatePendingPayments: true });
    await q("update placar.agencias set plano = $2, documento = $3 where id = $1", [a.id, plano, dados.documento]);
  } else {
    const fimTeste = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(a.teste_ate));
    const vencimento = fimTeste > hojeBrasil() ? fimTeste : hojeBrasil();
    const s = await asaas<{ id: string }>("/subscriptions", "POST", {
      customer: cliente,
      billingType: "UNDEFINED",
      value: p.preco,
      nextDueDate: vencimento,
      cycle: "MONTHLY",
      description: `Placar ${p.nome}`,
      externalReference: `agencia-${a.id}`,
    });
    await q("update placar.agencias set asaas_cliente = $2, asaas_assinatura = $3, plano = $4, documento = $5 where id = $1", [a.id, cliente, s.id, plano, dados.documento]);
    a.asaas_assinatura = s.id;
  }
  return faturaEmAberto(a.asaas_assinatura!);
}

/** Link da próxima fatura não paga da assinatura (ou null). */
export async function faturaEmAberto(assinatura: string) {
  const r = await asaas<{ data: { id: string; status: string; invoiceUrl: string; dueDate: string; value: number }[] }>(`/subscriptions/${assinatura}/payments`);
  const aberta = r.data.filter((p) => ["PENDING", "OVERDUE"].includes(p.status)).sort((x, y) => x.dueDate.localeCompare(y.dueDate))[0];
  return aberta ? { link: aberta.invoiceUrl, vencimento: aberta.dueDate, valor: aberta.value } : null;
}

export async function cancelarAssinatura(a: Agencia) {
  if (a.asaas_assinatura) await asaas(`/subscriptions/${a.asaas_assinatura}`, "DELETE");
  await q("update placar.agencias set status = 'cancelada', asaas_assinatura = null where id = $1", [a.id]);
}

export function webhookAutorizado(request: Request) {
  const certo = Buffer.from(process.env.ASAAS_WEBHOOK_TOKEN ?? "");
  const recebido = Buffer.from(request.headers.get("asaas-access-token") ?? "");
  return certo.length >= 16 && certo.length === recebido.length && timingSafeEqual(certo, recebido);
}

type Evento = {
  id: string;
  event: string;
  payment?: { id: string; subscription?: string; status: string; value: number; dueDate: string; invoiceUrl?: string; externalReference?: string };
  subscription?: { id: string; externalReference?: string; status?: string };
};

const somarMes = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(a, m, d, 23, 59));
  if (data.getUTCMonth() !== m % 12) data.setUTCDate(0);
  return data.toISOString();
};

/** Processa um evento do Asaas (cada evento uma vez só). */
export async function processarEvento(e: Evento) {
  const ref = e.payment?.externalReference ?? e.subscription?.externalReference ?? "";
  const assinatura = e.payment?.subscription ?? e.subscription?.id ?? null;
  const agencia =
    (ref.startsWith("agencia-") ? await uma<Agencia>("select * from placar.agencias where id = $1", [Number(ref.slice(8))]) : null) ??
    (assinatura ? await uma<Agencia>("select * from placar.agencias where asaas_assinatura = $1", [assinatura]) : null);
  const novo = await uma(
    `insert into placar.pagamentos (evento_id, agencia_id, evento, pagamento_id, valor, status, vencimento, link)
     values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (evento_id) do nothing returning evento_id`,
    [e.id, agencia?.id ?? null, e.event, e.payment?.id ?? null, e.payment?.value ?? null, e.payment?.status ?? null, e.payment?.dueDate ?? null, e.payment?.invoiceUrl ?? null],
  );
  if (!novo || !agencia) return;

  if ((e.event === "PAYMENT_CONFIRMED" || e.event === "PAYMENT_RECEIVED") && e.payment) {
    // Paga até um mês depois do vencimento desta fatura (nunca diminui o que já estava pago).
    await q("update placar.agencias set status = 'ativa', pago_ate = greatest(coalesce(pago_ate, now()), $2::timestamptz) where id = $1", [
      agencia.id,
      somarMes(e.payment.dueDate),
    ]);
  } else if (e.event === "PAYMENT_OVERDUE") {
    await q("update placar.agencias set status = 'atrasada' where id = $1 and status <> 'cancelada'", [agencia.id]);
  } else if (e.event === "SUBSCRIPTION_DELETED" || e.event === "SUBSCRIPTION_INACTIVATED") {
    await q("update placar.agencias set status = 'cancelada' where id = $1", [agencia.id]);
  }
}
