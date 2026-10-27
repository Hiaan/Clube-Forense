// A conferência de aluno da página /alunoclube.
//
// O CPF NUNCA SAI DO SERVIDOR E NUNCA É GRAVADO. Chega pela ação, é limpo,
// conferido contra as vendas pagas e descartado; o que fica gravado é o HMAC,
// para o Clube poder conferir depois, num pedido de reembolso, se aquele CPF
// passou pela página. A resposta ao navegador diz só se há cupom — nunca o
// nome de quem comprou, nem o quê.
//
// ONDE O CPF MORA NA VENDA. A tabela `vendas` guarda a resposta crua da Eduzz
// em `bruto`, e as duas portas de entrada dão nomes diferentes ao documento:
// a API de consulta e o webhook nunca foram uniformizados. Em vez de apostar
// num nome, a busca olha toda chave que pareça documento (doc, cpf, tax) no
// primeiro nível e um nível abaixo, comparando só os dígitos.

import { createHmac } from "node:crypto";

import { bancoConfigurado, garantirEsquema, sql } from "./db";

/** Só os dígitos. */
export function limparCpf(v: string): string {
  return v.replace(/\D/g, "");
}

/** CPF com os dois dígitos verificadores certos. */
export function cpfValido(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const dv = (base: string, peso: number) => {
    let soma = 0;
    for (const c of base) soma += Number(c) * peso--;
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(cpf.slice(0, 9), 10) === Number(cpf[9]) && dv(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

function segredo(): string {
  return process.env.SESSAO_SEGREDO ?? "clube-forense-mapa-sem-segredo-configurado";
}

/** HMAC do CPF (ou do IP): o mesmo valor entra, o mesmo sai, e não se desfaz. */
export function hashDe(valor: string, rotulo: string): string {
  return createHmac("sha256", segredo()).update(`${rotulo}:${valor}`).digest("base64url");
}

/** Os códigos de produto que este CPF comprou e pagou. `null` = banco fora. */
export async function produtosDoCpf(cpf: string): Promise<number[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select distinct v.produto_id
         from vendas v
        where v.paga
          and v.produto_id is not null
          and jsonb_typeof(v.bruto) = 'object'
          and exists (
            select 1
              from jsonb_each(v.bruto) a
              left join lateral jsonb_each(
                case when jsonb_typeof(a.value) = 'object' then a.value else '{}'::jsonb end
              ) b on true
             where (a.key ~* '(doc|cpf|tax)'
                    and jsonb_typeof(a.value) in ('string', 'number')
                    and regexp_replace(a.value #>> '{}', '\\D', '', 'g') = $1)
                or (b.key ~* '(doc|cpf|tax)'
                    and jsonb_typeof(b.value) in ('string', 'number')
                    and regexp_replace(b.value #>> '{}', '\\D', '', 'g') = $1)
          )`,
      [cpf],
    )) as { produto_id: string | number }[];
    return linhas.map((l) => Number(l.produto_id));
  } catch (erro) {
    console.error("[alunoclube] busca do CPF falhou:", erro);
    return null;
  }
}

/** Quantas tentativas este IP fez na última hora. */
export async function tentativasRecentes(ipHash: string): Promise<number> {
  if (!bancoConfigurado()) return 0;
  try {
    await garantirEsquema();
    const [l] = (await sql().query(
      `select count(*)::int as n from alunoclube_tentativas
        where ip_hash = $1 and em > now() - interval '1 hour'`,
      [ipHash],
    )) as { n: number }[];
    return l?.n ?? 0;
  } catch {
    return 0;
  }
}

export async function registrarTentativa(ipHash: string, achou: boolean): Promise<void> {
  if (!bancoConfigurado()) return;
  try {
    await sql().query(`insert into alunoclube_tentativas (ip_hash, achou) values ($1, $2)`, [ipHash, achou]);
  } catch (erro) {
    console.error("[alunoclube] tentativa não registrada:", erro);
  }
}

export async function registrarValidacao(cpfHash: string, cupom: string, produto: string): Promise<void> {
  if (!bancoConfigurado()) return;
  try {
    await sql().query(
      `insert into alunoclube_validacoes (cpf_hash, cupom, produto) values ($1, $2, $3)`,
      [cpfHash, cupom, produto],
    );
  } catch (erro) {
    console.error("[alunoclube] validação não registrada:", erro);
  }
}

/** Para o painel: cada produto pago, quantos compradores e quantos com CPF. */
export async function resumoPorProduto(): Promise<
  { produtoId: number; produto: string; compradores: number; comCpf: number }[] | null
> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select v.produto_id,
              max(v.produto) as produto,
              count(distinct coalesce(v.cliente_email, v.id::text))::int as compradores,
              count(distinct coalesce(v.cliente_email, v.id::text)) filter (where exists (
                select 1 from jsonb_each(case when jsonb_typeof(v.bruto) = 'object' then v.bruto else '{}'::jsonb end) a
                 left join lateral jsonb_each(case when jsonb_typeof(a.value) = 'object' then a.value else '{}'::jsonb end) b on true
                 where (a.key ~* '(doc|cpf|tax)' and length(regexp_replace(a.value #>> '{}', '\\D', '', 'g')) = 11)
                    or (b.key ~* '(doc|cpf|tax)' and length(regexp_replace(b.value #>> '{}', '\\D', '', 'g')) = 11)
              ))::int as com_cpf
         from vendas v
        where v.paga and v.produto_id is not null
        group by v.produto_id
        order by compradores desc`,
    )) as { produto_id: string; produto: string | null; compradores: number; com_cpf: number }[];
    return linhas.map((l) => ({
      produtoId: Number(l.produto_id),
      produto: l.produto ?? "(sem nome)",
      compradores: l.compradores,
      comCpf: l.com_cpf,
    }));
  } catch (erro) {
    console.error("[alunoclube] resumo falhou:", erro);
    return null;
  }
}

/** Para o painel: quantos CPFs liberaram cupom, por cupom. */
export async function validacoesPorCupom(): Promise<{ cupom: string; cpfs: number; ultima: string }[] | null> {
  if (!bancoConfigurado()) return null;
  try {
    await garantirEsquema();
    const linhas = (await sql().query(
      `select cupom, count(distinct cpf_hash)::int as cpfs, max(em) as ultima
         from alunoclube_validacoes group by cupom order by cpfs desc`,
    )) as { cupom: string; cpfs: number; ultima: string }[];
    return linhas;
  } catch {
    return null;
  }
}

/**
 * O passe do aluno validado, que vai num cookie: o cupom e a validade,
 * assinados. Não leva o CPF. Assinado para ninguém fabricar o passe de um
 * cupom melhor só editando o cookie.
 */
export function assinarPasse(cupom: string, dias = 7): string {
  const ate = Date.now() + dias * 86_400_000;
  const corpo = Buffer.from(JSON.stringify({ c: cupom, a: ate })).toString("base64url");
  return `${corpo}.${hashDe(corpo, "passe")}`;
}

/** O cupom do passe, ou `null` se ele não confere ou venceu. */
export function lerPasse(valor: string | undefined): string | null {
  if (!valor) return null;
  const [corpo, assinatura] = valor.split(".");
  if (!corpo || !assinatura || hashDe(corpo, "passe") !== assinatura) return null;
  try {
    const { c, a } = JSON.parse(Buffer.from(corpo, "base64url").toString()) as { c: string; a: number };
    return typeof c === "string" && a > Date.now() ? c : null;
  } catch {
    return null;
  }
}
