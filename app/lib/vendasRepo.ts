// As vendas da Eduzz do lado de cá: normalização e leitura para o painel.
//
// Duas portas escrevem aqui — o webhook, que a Eduzz chama a cada mudança de
// status, e a sincronização, que varre a API por período. As duas passam pela
// mesma normalização e pelo mesmo upsert, porque a diferença entre elas é só
// quando o dado chega, não o que ele é.
//
// Como em leadsRepo, nada aqui lança: devolve `null` ou `false` e registra o
// motivo. Um erro de banco não pode fazer a Eduzz achar que o webhook falhou e
// ficar reenviando a mesma notificação.

import { bancoConfigurado, garantirEsquema, sql } from "./db";
import type { FaturaEduzz } from "./eduzzApi";

export interface Venda {
  id: number;
  produtoId: number | null;
  produto: string | null;
  clienteNome: string | null;
  clienteEmail: string | null;
  status: number;
  statusNome: string;
  paga: boolean;
  valorLiquido: number;
  valorBruto: number | null;
  criadaEm: string | null;
  pagaEm: string | null;
  fonte: string;
}

/**
 * Código de status "Paga" na Eduzz. O nome também é conferido porque contas
 * antigas devolvem códigos fora dessa tabela, e um faturamento que ignora venda
 * paga é pior que um que conta uma a mais.
 */
const STATUS_PAGA = 3;
const NOME_PAGA = /pag[ao]|aprovad|conclu[ií]/i;
const NOME_NAO_PAGA = /cancel|estorn|reembols|chargeback|devolv|recus|expirad/i;

function ehPaga(status: number, nome: string): boolean {
  if (NOME_NAO_PAGA.test(nome)) return false;
  return status === STATUS_PAGA || NOME_PAGA.test(nome);
}

/** Número a partir de "1.234,56", "1234.56", 1234.56 ou nada. */
function dinheiro(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  // Formato brasileiro: vírgula é decimal e ponto é milhar. Trocar cegamente
  // vírgula por ponto transformaria "1.234,56" em 1.23456.
  const texto = String(v).trim().replace(/\s/g, "");
  const normal = /,\d{1,2}$/.test(texto)
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto.replace(/,/g, "");
  const n = Number(normal);
  return Number.isFinite(n) ? n : null;
}

/** Data ISO a partir do que a Eduzz mandar, ou `null` se for vazio/inválido. */
function data(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function inteiro(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** Uma venda pronta para gravar, venha ela da API ou do webhook. */
export interface VendaNormalizada extends Omit<Venda, "fonte"> {
  fonte: "api" | "webhook";
  bruto: unknown;
}

/** Converte uma fatura da API. `null` quando nem o id veio — sem chave não há linha. */
export function daFatura(f: FaturaEduzz): VendaNormalizada | null {
  const id = inteiro(f.sale_id);
  if (id == null) return null;

  const status = inteiro(f.sale_status) ?? 0;
  const statusNome = String(f.sale_status_name ?? "");

  return {
    id,
    produtoId: inteiro(f.product_id),
    produto: f.product_name ? String(f.product_name) : null,
    clienteNome: f.client_name ? String(f.client_name) : null,
    clienteEmail: f.client_email ? String(f.client_email).toLowerCase() : null,
    status,
    statusNome,
    paga: ehPaga(status, statusNome),
    valorLiquido: dinheiro(f.sale_amount_win) ?? 0,
    valorBruto: dinheiro(f.sale_amount),
    criadaEm: data(f.date_create),
    pagaEm: data(f.date_payment),
    fonte: "api",
    bruto: f,
  };
}

/**
 * Converte a notificação de compra (webhook). Os nomes dos campos são outros —
 * é uma API mais velha que a de consulta, e a Eduzz nunca as uniformizou.
 */
export function doWebhook(c: Record<string, unknown>): VendaNormalizada | null {
  const id = inteiro(c.trans_cod ?? c.sale_id);
  if (id == null) return null;

  const status = inteiro(c.trans_status ?? c.sale_status) ?? 0;
  const statusNome = String(c.trans_status_name ?? c.sale_status_name ?? "");

  return {
    id,
    produtoId: inteiro(c.product_cod ?? c.product_id),
    produto: c.product_name ? String(c.product_name) : null,
    clienteNome: c.cus_name ? String(c.cus_name) : null,
    clienteEmail: c.cus_email ? String(c.cus_email).toLowerCase() : null,
    status,
    statusNome,
    paga: ehPaga(status, statusNome),
    valorLiquido: dinheiro(c.trans_value ?? c.sale_amount_win) ?? 0,
    valorBruto: dinheiro(c.trans_paid_value ?? c.sale_amount),
    criadaEm: data(c.trans_createdate ?? c.date_create),
    pagaEm: data(c.trans_paiddate ?? c.date_payment),
    fonte: "webhook",
    bruto: c,
  };
}

/**
 * Grava as vendas, atualizando as que já existem. Devolve quantas entraram, ou
 * `null` se o banco não respondeu.
 *
 * O upsert protege o que já se sabe: campo que chega vazio não apaga o que
 * estava lá (`coalesce`), porque o webhook manda menos coisa que a API e uma
 * notificação de "pago" não pode zerar o nome do produto. O status e o valor,
 * esses sim, sempre vencem: são exatamente o que mudou.
 */
export async function salvarVendas(vendas: VendaNormalizada[]): Promise<number | null> {
  if (!bancoConfigurado()) return null;
  if (vendas.length === 0) return 0;

  try {
    await garantirEsquema();
    const s = sql();

    for (const v of vendas) {
      await s.query(
        `insert into vendas (
           id, produto_id, produto, cliente_nome, cliente_email,
           status, status_nome, paga, valor_liquido, valor_bruto,
           criada_em, paga_em, fonte, bruto, atualizado_em
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now())
         on conflict (id) do update set
           produto_id    = coalesce(excluded.produto_id, vendas.produto_id),
           produto       = coalesce(excluded.produto, vendas.produto),
           cliente_nome  = coalesce(excluded.cliente_nome, vendas.cliente_nome),
           cliente_email = coalesce(excluded.cliente_email, vendas.cliente_email),
           status        = excluded.status,
           status_nome   = excluded.status_nome,
           paga          = excluded.paga,
           valor_liquido = excluded.valor_liquido,
           valor_bruto   = coalesce(excluded.valor_bruto, vendas.valor_bruto),
           criada_em     = coalesce(excluded.criada_em, vendas.criada_em),
           paga_em       = coalesce(excluded.paga_em, vendas.paga_em),
           fonte         = excluded.fonte,
           bruto         = excluded.bruto,
           atualizado_em = now()`,
        [
          v.id,
          v.produtoId,
          v.produto,
          v.clienteNome,
          v.clienteEmail,
          v.status,
          v.statusNome,
          v.paga,
          v.valorLiquido,
          v.valorBruto,
          v.criadaEm,
          v.pagaEm,
          v.fonte,
          JSON.stringify(v.bruto ?? null),
        ],
      );
    }

    return vendas.length;
  } catch (e) {
    console.error("Falha ao salvar vendas:", e instanceof Error ? e.message : e);
    return null;
  }
}

function daLinha(l: Record<string, unknown>): Venda {
  return {
    id: Number(l.id),
    produtoId: l.produto_id == null ? null : Number(l.produto_id),
    produto: l.produto == null ? null : String(l.produto),
    clienteNome: l.cliente_nome == null ? null : String(l.cliente_nome),
    clienteEmail: l.cliente_email == null ? null : String(l.cliente_email),
    status: Number(l.status ?? 0),
    statusNome: String(l.status_nome ?? ""),
    paga: Boolean(l.paga),
    valorLiquido: Number(l.valor_liquido ?? 0),
    valorBruto: l.valor_bruto == null ? null : Number(l.valor_bruto),
    criadaEm: l.criada_em == null ? null : new Date(String(l.criada_em)).toISOString(),
    pagaEm: l.paga_em == null ? null : new Date(String(l.paga_em)).toISOString(),
    fonte: String(l.fonte ?? "api"),
  };
}

/** Vendas mais recentes primeiro. `null` quando o banco não respondeu. */
export async function listarVendas(limite = 300): Promise<Venda[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select * from vendas
        order by coalesce(paga_em, criada_em) desc nulls last, id desc
        limit $1`,
      [limite],
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao listar vendas:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface ResumoVendas {
  /** Faturas pagas, no total. */
  pagas: number;
  /** Faturas registradas, pagas ou não. */
  total: number;
  /** Líquido somado das pagas, em reais. */
  faturamento: number;
  /** Líquido das pagas nos últimos 30 dias. */
  faturamento30: number;
  /** Ranking por produto, do que mais faturou para o que menos faturou. */
  porProduto: { produto: string; vendas: number; faturamento: number }[];
  /** Quando o último registro foi atualizado, para a tela dizer se está fresco. */
  atualizadoEm: string | null;
}

/** Números do topo da aba de vendas. */
export async function resumoVendas(): Promise<ResumoVendas | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const s = sql();
    const [totais, porProduto] = await Promise.all([
      s.query(
        `select
           count(*) filter (where paga)::int                            as pagas,
           count(*)::int                                                as total,
           coalesce(sum(valor_liquido) filter (where paga), 0)          as faturamento,
           coalesce(sum(valor_liquido) filter (
             where paga and coalesce(paga_em, criada_em) > now() - interval '30 days'
           ), 0)                                                        as faturamento30,
           max(atualizado_em)                                           as atualizado_em
         from vendas`,
      ),
      s.query(
        `select coalesce(produto, 'Sem nome') as produto,
                count(*)::int as n,
                coalesce(sum(valor_liquido), 0) as total
           from vendas where paga
          group by 1 order by total desc`,
      ),
    ]);

    const t = (totais as Record<string, unknown>[])[0] ?? {};
    return {
      pagas: Number(t.pagas ?? 0),
      total: Number(t.total ?? 0),
      faturamento: Number(t.faturamento ?? 0),
      faturamento30: Number(t.faturamento30 ?? 0),
      porProduto: (porProduto as Record<string, unknown>[]).map((l) => ({
        produto: String(l.produto),
        vendas: Number(l.n),
        faturamento: Number(l.total),
      })),
      atualizadoEm: t.atualizado_em ? new Date(String(t.atualizado_em)).toISOString() : null,
    };
  } catch (e) {
    console.error("Falha ao resumir vendas:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface DiaVendas {
  /** Data no formato AAAA-MM-DD. */
  dia: string;
  vendas: number;
  faturamento: number;
}

/**
 * Faturamento por dia, do mais antigo para o mais novo, com os dias sem venda
 * incluídos — igual à série de leads, e pelo mesmo motivo: um gráfico que pula
 * os dias vazios mente sobre o ritmo.
 *
 * O dia é o de Brasília, e a data considerada é a do pagamento (caindo para a
 * de criação quando não há pagamento): é o dia em que o dinheiro entrou.
 */
export async function vendasPorDia(dias = 30): Promise<DiaVendas[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select to_char(d.dia, 'YYYY-MM-DD') as dia,
              count(v.id)::int as n,
              coalesce(sum(v.valor_liquido), 0) as total
         from generate_series(
                (now() at time zone 'America/Sao_Paulo')::date - ($1::int - 1),
                (now() at time zone 'America/Sao_Paulo')::date,
                interval '1 day') as d(dia)
         left join vendas v
           on v.paga
          and (coalesce(v.paga_em, v.criada_em) at time zone 'America/Sao_Paulo')::date = d.dia::date
        group by d.dia
        order by d.dia`,
      [dias],
    )) as Record<string, unknown>[];
    return linhas.map((l) => ({
      dia: String(l.dia),
      vendas: Number(l.n),
      faturamento: Number(l.total),
    }));
  } catch (e) {
    console.error("Falha ao agrupar vendas por dia:", e instanceof Error ? e.message : e);
    return null;
  }
}
