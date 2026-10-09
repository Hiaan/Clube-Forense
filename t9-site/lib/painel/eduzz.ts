import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { consulta, transacao, umaLinha } from "./db";
import { FUSO } from "./formato";
import type { Empresa } from "./auth";

// Vendas da Eduzz chegam por webhook (Developer Hub da Eduzz → Webhooks).
// Cada fatura é guardada com o último status; o painel conta só as pagas, então
// reembolso, chargeback e cancelamento tiram a venda da conta automaticamente.
// Documentação: https://developers.eduzz.com/reference/webhook/myeduzz-invoice-paid

export const ORIGEM_EDUZZ = "eduzz";
export const PLATAFORMA_EDUZZ = "Eduzz";

/** A Eduzz assina o corpo com HMAC-SHA256 usando a chave secreta criada na tela de Segurança (cabeçalho x-signature). */
export function assinaturaValida(corpo: string, assinatura: string | null, segredo: string) {
  if (!assinatura) return false;
  const hmac = createHmac("sha256", segredo).update(corpo);
  const digest = hmac.digest();
  const recebida = assinatura.trim().replace(/^sha256=/i, "");
  // A documentação não fixa a codificação: aceita hexadecimal ou base64.
  for (const esperada of [digest.toString("hex"), digest.toString("base64")]) {
    const a = Buffer.from(recebida);
    const b = Buffer.from(esperada);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

type Valor = { value?: number | string; currency?: string } | null | undefined;
type EventoEduzz = {
  id?: string;
  event?: string;
  sentDate?: string;
  data?: {
    id?: string | number;
    status?: string;
    paidAt?: string | null;
    createdAt?: string;
    price?: Valor;
    paid?: Valor;
    items?: { name?: string; isBump?: boolean }[];
    utm?: { source?: string | null; campaign?: string | null; content?: string | null } | null;
  };
};

/** Data (AAAA-MM-DD) no horário de Brasília. */
const diaEmBrasilia = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

const numero = (v: number | string | undefined) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Registra um evento de fatura. Devolve o que foi feito, para o log.
 * Eventos fora de ordem (mais antigos que o último recebido para a fatura) são ignorados.
 */
export async function processarEvento(empresa: Pick<Empresa, "id">, evento: EventoEduzz) {
  const nome = evento.event ?? "";
  const d = evento.data;
  if (!nome.startsWith("myeduzz.invoice_") || !d?.id) return { ignorado: `evento ${nome || "desconhecido"}` };

  const status = (d.status ?? nome.replace("myeduzz.invoice_", "")).toLowerCase();
  const pagoEm = d.paidAt ?? (status === "paid" ? (evento.sentDate ?? new Date().toISOString()) : null);
  const valor = numero((d.paid?.value != null && numero(d.paid.value) > 0 ? d.paid : d.price)?.value);
  const moeda = d.paid?.currency ?? d.price?.currency ?? "BRL";
  const principal = d.items?.find((i) => !i.isBump) ?? d.items?.[0];
  const eventoEm = evento.sentDate ?? new Date().toISOString();

  const anterior = await umaLinha<{ data: string | null; evento_em: string | null }>(
    "select data, evento_em from vendas where empresa_id = $1 and origem = $2 and externo_id = $3",
    [empresa.id, ORIGEM_EDUZZ, String(d.id)],
  );
  if (anterior?.evento_em && new Date(anterior.evento_em) > new Date(eventoEm)) return { ignorado: "evento mais antigo que o já registrado" };

  // A data que conta é a do pagamento; uma fatura que nunca foi paga fica sem data.
  const data = pagoEm ? diaEmBrasilia(pagoEm) : (anterior?.data ?? null);
  await consulta(
    `insert into vendas (empresa_id, origem, externo_id, status, valor, moeda, produto, pago_em, data, utm_source, utm_campaign, utm_content, evento_em)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     on conflict (empresa_id, origem, externo_id) do update set
       status = excluded.status, valor = case when excluded.valor > 0 then excluded.valor else vendas.valor end,
       moeda = excluded.moeda, produto = coalesce(excluded.produto, vendas.produto),
       pago_em = coalesce(excluded.pago_em, vendas.pago_em), data = coalesce(excluded.data, vendas.data),
       utm_source = coalesce(excluded.utm_source, vendas.utm_source), utm_campaign = coalesce(excluded.utm_campaign, vendas.utm_campaign),
       utm_content = coalesce(excluded.utm_content, vendas.utm_content), evento_em = excluded.evento_em, atualizado_em = now()`,
    [
      empresa.id,
      ORIGEM_EDUZZ,
      String(d.id),
      status.slice(0, 40),
      valor,
      moeda.slice(0, 3).toUpperCase(),
      principal?.name?.slice(0, 200) ?? null,
      pagoEm,
      data,
      d.utm?.source?.slice(0, 200) || null,
      d.utm?.campaign?.slice(0, 200) || null,
      d.utm?.content?.slice(0, 200) || null,
      eventoEm,
    ],
  );
  await consulta("update empresas set eduzz_ultimo_evento = now() where id = $1", [empresa.id]);

  const dias = [...new Set([data, anterior?.data].filter((x): x is string => Boolean(x)))];
  for (const dia of dias) await recalcularDia(empresa.id, dia);
  return { fatura: String(d.id), status, valor, data };
}

/**
 * Refaz as linhas de métricas da Eduzz de um dia a partir das vendas pagas,
 * agrupadas pela campanha da UTM. Assim reembolsos e cancelamentos se corrigem sozinhos.
 */
export async function recalcularDia(empresaId: number, dia: string) {
  await transacao(async (q) => {
    await q("delete from metricas where empresa_id = $1 and origem = $2 and data = $3", [empresaId, ORIGEM_EDUZZ, dia]);
    await q(
      `insert into metricas (empresa_id, data, plataforma, campanha, conversoes, receita, origem)
       select $1, $3, $4, coalesce(nullif(utm_campaign, ''), '(sem UTM)'), count(*), sum(valor), $2
         from vendas where empresa_id = $1 and origem = $2 and data = $3 and status = 'paid'
        group by 4
       on conflict (empresa_id, data, plataforma, campanha) do update set
         conversoes = excluded.conversoes, receita = excluded.receita, origem = excluded.origem`,
      [empresaId, ORIGEM_EDUZZ, dia, PLATAFORMA_EDUZZ],
    );
  });
}

export type VendaRecente = { produto: string | null; valor: number; moeda: string; pago_em: string; utm_source: string | null; utm_campaign: string | null };

export async function vendasRecentes(empresaId: number, limite = 8) {
  return consulta<VendaRecente>(
    `select produto, valor, moeda, pago_em, utm_source, utm_campaign from vendas
      where empresa_id = $1 and status = 'paid' and pago_em is not null order by pago_em desc limit $2`,
    [empresaId, limite],
  );
}

/** Vendas pagas por anúncio no período, pela UTM utm_content (que deve levar o {{ad.id}} da Meta). */
export async function vendasPorAnuncio(empresaId: number, inicio: string, fim: string) {
  const linhas = await consulta<{ utm_content: string; vendas: number; receita: number }>(
    `select utm_content, count(*)::int as vendas, sum(valor) as receita from vendas
      where empresa_id = $1 and status = 'paid' and data between $2 and $3 and utm_content is not null
      group by utm_content`,
    [empresaId, inicio, fim],
  );
  return new Map(linhas.map((l) => [l.utm_content, l]));
}
