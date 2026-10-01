import "server-only";
import { consulta } from "./db";
import { hoje } from "./dados";
import type { Usuario } from "./auth";

// Cobranças da T9 para cada cliente: vencimentos, baixas e os avisos de pagamento.

export type Cobranca = {
  id: number;
  empresa_id: number;
  descricao: string;
  valor: number;
  moeda: string;
  vencimento: string;
  link: string | null;
  pago_em: string | null;
};

export type Situacao =
  | { tipo: "paga"; em: string }
  | { tipo: "aberta"; dias: number } // dias até o vencimento (0 = vence hoje)
  | { tipo: "atrasada"; dias: number }; // dias de atraso (1, 2, 3...)

/** Dias que separam duas datas "AAAA-MM-DD" (b - a). */
const diferenca = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);

export function situacaoDe(c: Pick<Cobranca, "vencimento" | "pago_em">, referencia = hoje()): Situacao {
  if (c.pago_em) return { tipo: "paga", em: c.pago_em };
  const dias = diferenca(referencia, c.vencimento);
  return dias >= 0 ? { tipo: "aberta", dias } : { tipo: "atrasada", dias: -dias };
}

/** Dias em que o pop-up aparece antes do vencimento. */
export const DIAS_LEMBRETE = [7, 3, 1, 0];
/** A partir deste atraso, o aviso diz que as campanhas serão suspensas. */
export const DIAS_SUSPENSAO = 7;

export type Aviso = { cobranca: Cobranca; situacao: Exclude<Situacao, { tipo: "paga" }> };

/**
 * O aviso do dia para o cliente: a cobrança atrasada mais antiga ou, se não houver,
 * a que vence em 7, 3, 1 ou 0 dias. Nos outros dias, nenhum pop-up.
 */
export function avisoDoDia(cobrancas: Cobranca[], referencia = hoje()): Aviso | null {
  const abertas = cobrancas
    .filter((c) => !c.pago_em)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .map((c) => ({ cobranca: c, situacao: situacaoDe(c, referencia) as Aviso["situacao"] }));
  const atrasada = abertas.find((a) => a.situacao.tipo === "atrasada");
  if (atrasada) return atrasada;
  return abertas.find((a) => a.situacao.tipo === "aberta" && DIAS_LEMBRETE.includes(a.situacao.dias)) ?? null;
}

export async function listarCobrancas(empresaId: number) {
  return consulta<Cobranca>(
    "select id, empresa_id, descricao, valor, moeda, vencimento, link, pago_em from cobrancas where empresa_id = $1 order by vencimento desc, id desc",
    [empresaId],
  );
}

export type CobrancaComEmpresa = Cobranca & { empresa_nome: string; empresa_slug: string };

/** Todas as cobranças que a pessoa da equipe pode ver (o admin vê todas). */
export async function cobrancasDaCarteira(usuario: Usuario) {
  return consulta<CobrancaComEmpresa>(
    `select c.id, c.empresa_id, c.descricao, c.valor, c.moeda, c.vencimento, c.link, c.pago_em,
            e.nome as empresa_nome, e.slug as empresa_slug
       from cobrancas c join empresas e on e.id = c.empresa_id
      where $1::boolean or c.empresa_id in (select empresa_id from acessos where usuario_id = $2)
      order by c.vencimento, e.nome`,
    [usuario.perfil === "admin", usuario.id],
  );
}

/** Soma por moeda: { BRL: 4500, USD: 800 }. */
export function somarPorMoeda(cobrancas: Pick<Cobranca, "valor" | "moeda">[]) {
  const total = new Map<string, number>();
  for (const c of cobrancas) total.set(c.moeda, (total.get(c.moeda) ?? 0) + c.valor);
  return [...total];
}

/** Soma meses a uma data, mantendo o dia (31/01 + 1 mês → 28/02). */
export function somarMeses(iso: string, meses: number) {
  const [a, m, d] = iso.split("-").map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimoDia = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimoDia));
  return alvo.toISOString().slice(0, 10);
}
