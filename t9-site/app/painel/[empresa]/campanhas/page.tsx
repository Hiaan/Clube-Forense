import { campanhas, periodo, totais } from "@/lib/painel/dados";
import { dinheiro, numero, porcentagem, razao } from "@/lib/painel/formato";
import { contextoEmpresa } from "../contexto";
import SeletorPeriodo from "../SeletorPeriodo";

export default async function Campanhas({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { empresa, idioma, t } = await contextoEmpresa(params);
  const p = periodo((await searchParams).periodo);
  const [linhas, total] = await Promise.all([campanhas(empresa.id, p.inicio, p.fim), totais(empresa.id, p.inicio, p.fim)]);

  const $ = (v: number | null) => dinheiro(v, empresa.moeda, idioma);
  const n = (v: number | null) => numero(v, idioma);
  const ecommerce = empresa.tipo === "ecommerce";
  const colunas = (l: typeof total) => [
    $(l.gasto),
    n(l.impressoes),
    n(l.cliques),
    porcentagem(razao(l.cliques, l.impressoes), idioma),
    $(razao(l.gasto, l.cliques)),
    ...(ecommerce
      ? [n(l.conversoes), $(l.receita), razao(l.receita, l.gasto) == null ? "—" : `${numero(razao(l.receita, l.gasto), idioma, 2)}x`]
      : [n(l.leads), $(razao(l.gasto, l.leads))]),
  ];
  const cabecalho = [
    t.kpi.investimento,
    t.kpi.impressoes,
    t.kpi.cliques,
    t.kpi.ctr,
    t.kpi.cpc,
    ...(ecommerce ? [t.kpi.conversoes, t.kpi.receita, t.kpi.roas] : [t.kpi.leads, t.kpi.cpl]),
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.campanhas.titulo}</h1>
        <SeletorPeriodo atual={p.chave} base={`/painel/${empresa.slug}/campanhas`} t={t.periodo} />
      </div>

      {linhas.length === 0 ? (
        <p className="painel-cartao mt-6 p-6 text-center text-white/60">{t.campanhas.semDados}</p>
      ) : (
        <div className="painel-cartao mt-6 overflow-x-auto">
          <table className="painel-tabela w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr>
                <th>{t.campanhas.campanha}</th>
                {cabecalho.map((c) => (
                  <th key={c} className="text-right">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={`${l.plataforma}|${l.campanha}`}>
                  <td>
                    <span className="block font-medium">{l.campanha || "—"}</span>
                    <span className="text-xs text-white/45">{l.plataforma}</span>
                  </td>
                  {colunas(l).map((v, i) => (
                    <td key={i} className="text-right whitespace-nowrap tabular-nums">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-white/4 font-semibold">
                <td>{t.campanhas.total}</td>
                {colunas(total).map((v, i) => (
                  <td key={i} className="text-right whitespace-nowrap tabular-nums">
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
