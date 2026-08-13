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

/**
 * Recorte pedido pela tela: período e, opcionalmente, um produto.
 *
 * Datas em AAAA-MM-DD, interpretadas no fuso de Brasília e com as duas pontas
 * incluídas — quem digita "01/08 a 31/08" espera o dia 31 inteiro, não até a
 * meia-noite dele. `null` em qualquer ponta significa "sem limite desse lado",
 * que é como "todo o histórico" se escreve.
 */
export interface Filtro {
  de?: string | null;
  ate?: string | null;
  produtoId?: number | null;
  /** Quando true, ignora as faturas não pagas. É o padrão dos relatórios de dinheiro. */
  somentePagas?: boolean;
}

/**
 * Monta o `where` e a lista de parâmetros a partir do filtro.
 *
 * A data considerada é a do pagamento, caindo para a de criação quando não há
 * pagamento: é o dia em que o dinheiro entrou, que é o que o relatório mede. E
 * a conversão para o fuso de Brasília acontece aqui, uma vez, para nenhuma
 * consulta desta casa poder discordar de outra sobre em que dia a venda caiu.
 */
function recorte(f: Filtro, comecaEm = 1): { where: string; params: unknown[] } {
  const partes: string[] = [];
  const params: unknown[] = [];
  const dia = "((coalesce(v.paga_em, v.criada_em) at time zone 'America/Sao_Paulo')::date)";

  if (f.somentePagas !== false) partes.push("v.paga");
  if (f.de) {
    params.push(f.de);
    partes.push(`${dia} >= $${comecaEm + params.length - 1}::date`);
  }
  if (f.ate) {
    params.push(f.ate);
    partes.push(`${dia} <= $${comecaEm + params.length - 1}::date`);
  }
  if (f.produtoId != null) {
    params.push(f.produtoId);
    partes.push(`v.produto_id = $${comecaEm + params.length - 1}`);
  }

  return { where: partes.length ? `where ${partes.join(" and ")}` : "", params };
}

/** Vendas do recorte, mais recentes primeiro. `null` quando o banco não respondeu. */
export async function listarVendas(filtro: Filtro = {}, limite = 300): Promise<Venda[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const { where, params } = recorte(filtro);
    const linhas = (await sql().query(
      `select v.* from vendas v
        ${where}
        order by coalesce(v.paga_em, v.criada_em) desc nulls last, v.id desc
        limit $${params.length + 1}`,
      [...params, limite],
    )) as Record<string, unknown>[];
    return linhas.map(daLinha);
  } catch (e) {
    console.error("Falha ao listar vendas:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface Produto {
  id: number;
  nome: string;
}

/**
 * Produtos que já apareceram em alguma venda, para a tela poder oferecer o
 * filtro. Sai do próprio espelho, e não de uma consulta ao catálogo da Eduzz:
 * um produto que nunca vendeu não tem o que ser recortado.
 */
export async function listarProdutos(): Promise<Produto[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select produto_id as id, min(produto) as nome
         from vendas where produto_id is not null
        group by produto_id order by nome`,
    )) as Record<string, unknown>[];
    return linhas.map((l) => ({
      id: Number(l.id),
      nome: l.nome == null ? `Produto ${l.id}` : String(l.nome),
    }));
  } catch (e) {
    console.error("Falha ao listar produtos:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface ResumoVendas {
  /** Vendas pagas no recorte. */
  pagas: number;
  /** Faturas do recorte, pagas ou não — o denominador da conversão. */
  faturas: number;
  /** Líquido somado das pagas, em reais. */
  faturamento: number;
  /** Bruto somado, quando a Eduzz informou. Faturamento menos isto é a comissão dela. */
  bruto: number;
  /** Faturamento dividido pelas vendas pagas. Zero quando não houve venda. */
  ticket: number;
  /** Clientes distintos que compraram no recorte. */
  clientes: number;
  /** Quando o espelho foi atualizado pela última vez, para a tela dizer se está fresco. */
  atualizadoEm: string | null;
}

/** Números do topo, para o recorte pedido. */
export async function resumoVendas(filtro: Filtro = {}): Promise<ResumoVendas | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const s = sql();
    const pagas = recorte(filtro);
    // O mesmo recorte, mas sem exigir venda paga: é o total de faturas emitidas,
    // que sozinho não diz nada e ao lado das pagas vira taxa de conversão.
    const todas = recorte({ ...filtro, somentePagas: false });

    const [linhas, emitidas, atualizacao] = await Promise.all([
      s.query(
        `select count(*)::int                                as pagas,
                coalesce(sum(v.valor_liquido), 0)            as faturamento,
                coalesce(sum(v.valor_bruto), 0)              as bruto,
                count(distinct v.cliente_email)::int         as clientes
           from vendas v ${pagas.where}`,
        pagas.params,
      ),
      s.query(`select count(*)::int as n from vendas v ${todas.where}`, todas.params),
      s.query("select max(atualizado_em) as em from vendas"),
    ]);

    const t = (linhas as Record<string, unknown>[])[0] ?? {};
    const n = Number(t.pagas ?? 0);
    const faturamento = Number(t.faturamento ?? 0);
    const em = (atualizacao as Record<string, unknown>[])[0]?.em;

    return {
      pagas: n,
      faturas: Number((emitidas as Record<string, unknown>[])[0]?.n ?? 0),
      faturamento,
      bruto: Number(t.bruto ?? 0),
      ticket: n > 0 ? faturamento / n : 0,
      clientes: Number(t.clientes ?? 0),
      atualizadoEm: em ? new Date(String(em)).toISOString() : null,
    };
  } catch (e) {
    console.error("Falha ao resumir vendas:", e instanceof Error ? e.message : e);
    return null;
  }
}

export interface ProdutoRanqueado {
  produtoId: number | null;
  produto: string;
  vendas: number;
  faturamento: number;
  ticket: number;
  /** Fatia do faturamento do recorte, de 0 a 1. */
  fatia: number;
}

/**
 * Quais produtos venderam mais no recorte, do maior faturamento para o menor.
 *
 * Ordena por dinheiro, e não por quantidade: um produto barato que vende muito
 * lidera a contagem e some do caixa, e é o caixa que decide onde vale investir.
 * A contagem vai junto, na mesma linha, para as duas leituras existirem.
 */
export async function rankingProdutos(filtro: Filtro = {}): Promise<ProdutoRanqueado[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const { where, params } = recorte(filtro);
    const linhas = (await sql().query(
      `select v.produto_id as id,
              coalesce(min(v.produto), 'Sem nome') as produto,
              count(*)::int as n,
              coalesce(sum(v.valor_liquido), 0) as total
         from vendas v ${where}
        group by v.produto_id
        order by total desc`,
      params,
    )) as Record<string, unknown>[];

    const soma = linhas.reduce((acc, l) => acc + Number(l.total ?? 0), 0);
    return linhas.map((l) => {
      const total = Number(l.total ?? 0);
      const n = Number(l.n ?? 0);
      return {
        produtoId: l.id == null ? null : Number(l.id),
        produto: String(l.produto),
        vendas: n,
        faturamento: total,
        ticket: n > 0 ? total / n : 0,
        fatia: soma > 0 ? total / soma : 0,
      };
    });
  } catch (e) {
    console.error("Falha ao ranquear produtos:", e instanceof Error ? e.message : e);
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
 * Faturamento por dia do período, do mais antigo para o mais novo, com os dias
 * sem venda incluídos — igual à série de leads, e pelo mesmo motivo: um gráfico
 * que pula os dias vazios mente sobre o ritmo.
 *
 * A série é gerada a partir das pontas do filtro, e não das datas que
 * apareceram nas vendas: é o que faz um mês inteiro sem venda nenhuma aparecer
 * como um mês vazio, e não como um gráfico em branco.
 *
 * Sem ponta definida, usa a primeira e a última venda do recorte; se nem isso
 * existir, cai nos últimos 30 dias, para a tela ter um eixo.
 */
export async function vendasPorDia(filtro: Filtro = {}): Promise<DiaVendas[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const hoje = "(now() at time zone 'America/Sao_Paulo')::date";
    const dia = "(coalesce(v.paga_em, v.criada_em) at time zone 'America/Sao_Paulo')::date";

    // As pontas do período viram o eixo (os dois primeiros parâmetros); o resto
    // do filtro entra na junção. As datas não precisam aparecer duas vezes: o
    // eixo já recorta o que a junção pode alcançar.
    const params: unknown[] = [filtro.de ?? null, filtro.ate ?? null];
    const condicoes = [`${dia} = d.dia::date`];
    if (filtro.somentePagas !== false) condicoes.push("v.paga");
    if (filtro.produtoId != null) {
      params.push(filtro.produtoId);
      condicoes.push(`v.produto_id = $${params.length}`);
    }

    const linhas = (await sql().query(
      `with periodo as (
         select coalesce(
                  $1::date,
                  (select min((coalesce(paga_em, criada_em) at time zone 'America/Sao_Paulo')::date)
                     from vendas where paga),
                  ${hoje} - 29) as inicio,
                coalesce($2::date, ${hoje}) as fim
       )
       select to_char(d.dia, 'YYYY-MM-DD') as dia,
              count(v.id)::int as n,
              coalesce(sum(v.valor_liquido), 0) as total
         from periodo p,
              generate_series(p.inicio, greatest(p.inicio, p.fim), interval '1 day') as d(dia)
         left join vendas v on ${condicoes.join(" and ")}
        group by d.dia
        order by d.dia`,
      params,
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
