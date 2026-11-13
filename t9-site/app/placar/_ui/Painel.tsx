import Link from "next/link";
import { dinheiro, numero } from "@/lib/painel/formato";
import { hoje, somarDias, type Totais } from "@/lib/painel/dados";
import { comentarioPorRegras } from "@/lib/painel/relatorioWhatsapp";
import type { Cliente } from "@/lib/placar/banco";
import { campanhasDoCliente, serieDoCliente, totaisDoCliente } from "@/lib/placar/relatorio";
import { cartao } from "./estilo";

export const PERIODOS = { "7": "7 dias", "30": "30 dias", mes: "Este mês" } as const;
export type ChavePeriodo = keyof typeof PERIODOS;

function intervalo(chave: ChavePeriodo) {
  const fim = somarDias(hoje(), -1);
  if (chave === "mes") {
    const inicio = `${hoje().slice(0, 7)}-01`;
    const dias = Math.max(1, Math.round((Date.parse(hoje()) - Date.parse(inicio)) / 86_400_000));
    return { inicio: inicio > fim ? fim : inicio, fim, antInicio: somarDias(inicio, -dias), antFim: somarDias(inicio, -1) };
  }
  const n = Number(chave);
  return { inicio: somarDias(fim, -(n - 1)), fim, antInicio: somarDias(fim, -(2 * n - 1)), antFim: somarDias(fim, -n) };
}

const variacao = (a: number, b: number, menorMelhor = false) => {
  if (!(b > 0) || !Number.isFinite(a)) return null;
  const v = Math.round((a / b - 1) * 100);
  const bom = menorMelhor ? v < 0 : v > 0;
  return { texto: v === 0 ? "igual ao período anterior" : `${v > 0 ? "↑" : "↓"} ${Math.abs(v)}% vs. período anterior`, cor: v === 0 ? "text-gray-500" : bom ? "text-green-700" : "text-amber-700" };
};

/** Resumo, números, gráfico por dia e campanhas de um cliente. `base`: endereço da página (para os links de período). */
export default async function Painel({ cliente: c, periodo, base }: { cliente: Cliente; periodo: ChavePeriodo; base: string }) {
  const p = intervalo(periodo);
  const [atual, anterior, serie, lista] = await Promise.all([
    totaisDoCliente(c.id, p.inicio, p.fim),
    totaisDoCliente(c.id, p.antInicio, p.antFim),
    serieDoCliente(c.id, p.inicio, p.fim),
    campanhasDoCliente(c.id, p.inicio, p.fim),
  ]);
  const ecommerce = c.tipo === "ecommerce";
  const din = (v: number) => dinheiro(v, c.moeda, "pt");
  const div = (a: number, b: number) => (b > 0 ? a / b : 0);
  const kpis = [
    { rotulo: "Investido", valor: din(atual.gasto), v: variacao(atual.gasto, anterior.gasto), neutro: true },
    ecommerce
      ? { rotulo: "Vendas", valor: numero(atual.conversoes, "pt"), v: variacao(atual.conversoes, anterior.conversoes) }
      : { rotulo: "Contatos", valor: numero(atual.leads, "pt"), v: variacao(atual.leads, anterior.leads) },
    ecommerce
      ? { rotulo: "Faturamento", valor: din(atual.receita), v: variacao(atual.receita, anterior.receita) }
      : { rotulo: "Custo por contato", valor: atual.leads ? din(atual.gasto / atual.leads) : "–", v: variacao(div(atual.gasto, atual.leads), div(anterior.gasto, anterior.leads), true) },
    ecommerce
      ? { rotulo: "Retorno (ROAS)", valor: atual.gasto ? div(atual.receita, atual.gasto).toFixed(2).replace(".", ",") : "–", v: variacao(div(atual.receita, atual.gasto), div(anterior.receita, anterior.gasto)) }
      : { rotulo: "Cliques", valor: numero(atual.cliques, "pt"), v: variacao(atual.cliques, anterior.cliques) },
  ];
  const resumo = comentarioPorRegras(c, { periodo: { ...p }, atual, anterior, campanhas: [], mes: atual });

  // Gráfico: um ponto por dia do período (dias sem dado contam zero).
  const porDia = new Map(serie.map((d) => [d.data, d]));
  const dias: { data: string; valor: number }[] = [];
  for (let d = p.inicio; d <= p.fim; d = somarDias(d, 1)) dias.push({ data: d, valor: Number((porDia.get(d) as Totais | undefined)?.[ecommerce ? "conversoes" : "leads"] ?? 0) });
  const maximo = Math.max(1, ...dias.map((d) => d.valor));
  const largura = 700;
  const passo = dias.length > 1 ? (largura - 40) / (dias.length - 1) : 0;
  const pontos = dias.map((d, i) => `${20 + i * passo},${170 - (d.valor / maximo) * 140}`).join(" ");
  const rotulos = dias.length <= 10 ? dias : dias.filter((_, i) => i % Math.ceil(dias.length / 8) === 0);

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Período" className="flex w-fit gap-1 rounded-[10px] bg-gray-200/70 p-1">
        {(Object.keys(PERIODOS) as ChavePeriodo[]).map((k) => (
          <Link
            key={k}
            href={`${base}?p=${k}`}
            scroll={false}
            aria-current={k === periodo ? "true" : undefined}
            className={`rounded-lg px-3.5 py-1.5 text-sm ${k === periodo ? "bg-white font-semibold shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
          >
            {PERIODOS[k]}
          </Link>
        ))}
      </div>

      <section aria-label="Resumo" className={`${cartao} flex gap-3.5 p-5`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF2FF]" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F5BEA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        </span>
        <div>
          <p className="text-[13px] font-semibold text-gray-500">Resumo</p>
          <p className="mt-1 text-base leading-relaxed">{resumo}</p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.rotulo} className={`${cartao} p-5`}>
            <p className="text-[13px] text-gray-500">{k.rotulo}</p>
            <p className="mt-1.5 text-[28px] font-bold tracking-tight">{k.valor}</p>
            {k.v && <p className={`mt-1 text-[13px] font-medium ${"neutro" in k ? "text-gray-500" : k.v.cor}`}>{k.v.texto}</p>}
          </div>
        ))}
      </div>

      <section aria-labelledby="g" className={`${cartao} p-5`}>
        <h2 id="g" className="text-base font-bold">
          {ecommerce ? "Vendas" : "Contatos"} por dia
        </h2>
        <svg viewBox={`0 0 ${largura} 200`} width="100%" height="200" role="img" aria-label={`Gráfico de ${ecommerce ? "vendas" : "contatos"} por dia, máximo de ${maximo} em um dia`} className="mt-3 block">
          <line x1="0" y1="170" x2={largura} y2="170" stroke="#E5E7EB" />
          <line x1="0" y1="100" x2={largura} y2="100" stroke="#F0F1F3" />
          <line x1="0" y1="30" x2={largura} y2="30" stroke="#F0F1F3" />
          {dias.length > 1 && (
            <>
              <polygon points={`20,170 ${pontos} ${20 + (dias.length - 1) * passo},170`} fill="#2F5BEA" fillOpacity="0.08" />
              <polyline points={pontos} fill="none" stroke="#2F5BEA" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            </>
          )}
          {rotulos.map((d) => {
            const i = dias.indexOf(d);
            return (
              <text key={d.data} x={20 + i * passo} y="192" textAnchor="middle" fontSize="12" fill="#6B7280">
                {d.data.slice(8, 10)}/{d.data.slice(5, 7)}
              </text>
            );
          })}
        </svg>
      </section>

      <section aria-labelledby="camp" className={`${cartao} overflow-hidden`}>
        <h2 id="camp" className="px-5 pt-5 pb-3 text-base font-bold">
          Campanhas
        </h2>
        {lista.filter((x) => x.gasto > 0).length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wide text-gray-500 uppercase">
                  <th className="px-5 py-2.5 font-semibold">Campanha</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Investido</th>
                  <th className="px-5 py-2.5 text-right font-semibold">{ecommerce ? "Vendas" : "Contatos"}</th>
                  <th className="px-5 py-2.5 text-right font-semibold">{ecommerce ? "Faturamento" : "Custo por contato"}</th>
                </tr>
              </thead>
              <tbody>
                {lista
                  .filter((x) => x.gasto > 0)
                  .map((x) => (
                    <tr key={x.campanha} className="border-t border-gray-100">
                      <td className="px-5 py-3 font-medium">{x.campanha || "—"}</td>
                      <td className="px-5 py-3 text-right">{din(x.gasto)}</td>
                      <td className="px-5 py-3 text-right">{numero(ecommerce ? x.conversoes : x.leads, "pt")}</td>
                      <td className="px-5 py-3 text-right">{ecommerce ? din(x.receita) : x.leads ? din(x.gasto / x.leads) : "–"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 pb-5 text-sm text-gray-500">Nenhuma campanha com investimento no período.</p>
        )}
      </section>
    </div>
  );
}
