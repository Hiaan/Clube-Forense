// Junta faturamento e gasto com anúncios no mesmo corte de tempo.
//
// A junção acontece aqui, em memória, e não num `join` no banco: as duas metades
// vêm de fontes diferentes (Eduzz e Meta), cada uma com o próprio atraso e a
// própria falha, e um join faria o período sumir do relatório quando só um dos
// lados tivesse dado. Aqui um lado ausente vira zero explícito, que é o que
// permite ver "gastei e não vendi" — exatamente o caso que interessa.

import {
  gastosPorPeriodo,
  truncDe,
  type FiltroAds,
  type Granularidade,
} from "./adsRepo";
import { vendasPorPeriodo, type Filtro } from "./vendasRepo";

export interface LinhaRoi {
  /** Primeiro dia do período, em AAAA-MM-DD. */
  inicio: string;
  faturamento: number;
  gasto: number;
  vendas: number;
  /** Faturamento menos gasto. */
  lucro: number;
  /**
   * Retorno sobre o investimento, em porcentagem: (faturamento − gasto) / gasto.
   * `null` quando não houve gasto — dividir por zero daria infinito, e "vendi
   * sem gastar" não é um ROI melhor, é uma conta que não existe.
   */
  roi: number | null;
  /** Faturamento dividido pelo gasto (ROAS). `null` pelo mesmo motivo. */
  roas: number | null;
  /** Custo de aquisição: gasto dividido pelas vendas do período. */
  cac: number | null;
}

export function calcularRoi(faturamento: number, gasto: number, vendas: number): LinhaRoi {
  return {
    inicio: "",
    faturamento,
    gasto,
    vendas,
    lucro: faturamento - gasto,
    roi: gasto > 0 ? ((faturamento - gasto) / gasto) * 100 : null,
    roas: gasto > 0 ? faturamento / gasto : null,
    cac: vendas > 0 ? gasto / vendas : null,
  };
}

/**
 * Série de ROI por dia, semana ou mês, do mais recente para o mais antigo — a
 * tabela é lida de cima, e o que interessa primeiro é o período em curso.
 *
 * `null` só quando nenhum dos dois lados respondeu; se um deles falhar, o
 * relatório sai com aquela metade zerada em vez de sumir inteiro.
 */
export async function serieRoi(
  granularidade: Granularidade,
  filtroVendas: Filtro,
  filtroAds: FiltroAds,
): Promise<LinhaRoi[] | null> {
  const [vendas, gastos] = await Promise.all([
    vendasPorPeriodo(truncDe(granularidade), filtroVendas),
    gastosPorPeriodo(granularidade, filtroAds),
  ]);

  if (vendas === null && gastos === null) return null;

  const periodos = new Map<string, { faturamento: number; gasto: number; vendas: number }>();
  const linha = (chave: string) => {
    const atual = periodos.get(chave) ?? { faturamento: 0, gasto: 0, vendas: 0 };
    periodos.set(chave, atual);
    return atual;
  };

  for (const v of vendas ?? []) {
    const l = linha(v.inicio);
    l.faturamento += v.faturamento;
    l.vendas += v.vendas;
  }
  for (const g of gastos ?? []) {
    linha(g.inicio).gasto += g.gasto;
  }

  return [...periodos.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([inicio, l]) => ({ ...calcularRoi(l.faturamento, l.gasto, l.vendas), inicio }));
}
