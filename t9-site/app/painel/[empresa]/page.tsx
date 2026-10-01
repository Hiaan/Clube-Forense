import Link from "next/link";
import { carregarVisao } from "./visao";
import { contextoEmpresa } from "./contexto";
import { periodo } from "@/lib/painel/dados";
import { dataHora, dataLonga, diaCurto, dinheiro, numero, porcentagem, razao } from "@/lib/painel/formato";
import { fmt } from "@/lib/i18n";
import Kpi from "../_ui/Kpi";
import GraficoBarras from "../_ui/Grafico";
import SeletorPeriodo from "./SeletorPeriodo";

export default async function VisaoGeral({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { empresa, idioma, t } = await contextoEmpresa(params);
  const p = periodo((await searchParams).periodo);
  const { atual, anterior, serie, plataformas, ultima, mes, leads } = await carregarVisao(empresa, p);

  const $ = (v: number | null, compacto = false) => dinheiro(v, empresa.moeda, idioma, compacto);
  const n = (v: number | null) => numero(v, idioma);
  const ecommerce = empresa.tipo === "ecommerce";
  const comparacao = t.periodo.comparacao;
  const kpi = (rotulo: string, valor: string, a: number | null, b: number | null, melhor: "subir" | "descer" | "neutro" = "subir", destaque = false) => (
    <Kpi key={rotulo} rotulo={rotulo} valor={valor} atual={a} anterior={b} melhor={melhor} idioma={idioma} destaque={destaque} legenda={comparacao} />
  );

  const ctr = razao(atual.cliques, atual.impressoes);
  const ctrAnt = razao(anterior.cliques, anterior.impressoes);
  const cpc = razao(atual.gasto, atual.cliques);
  const cpcAnt = razao(anterior.gasto, anterior.cliques);

  const indicadores = ecommerce
    ? [
        kpi(t.kpi.investimento, $(atual.gasto), atual.gasto, anterior.gasto, "neutro"),
        kpi(t.kpi.receita, $(atual.receita), atual.receita, anterior.receita, "subir", true),
        kpi(t.kpi.roas, fmtRoas(razao(atual.receita, atual.gasto), idioma), razao(atual.receita, atual.gasto), razao(anterior.receita, anterior.gasto), "subir", true),
        kpi(t.kpi.conversoes, n(atual.conversoes), atual.conversoes, anterior.conversoes),
        kpi(t.kpi.ticket, $(razao(atual.receita, atual.conversoes)), razao(atual.receita, atual.conversoes), razao(anterior.receita, anterior.conversoes)),
        kpi(t.kpi.cpa, $(razao(atual.gasto, atual.conversoes)), razao(atual.gasto, atual.conversoes), razao(anterior.gasto, anterior.conversoes), "descer"),
        kpi(t.kpi.ctr, porcentagem(ctr, idioma), ctr, ctrAnt),
        kpi(t.kpi.cliques, n(atual.cliques), atual.cliques, anterior.cliques),
      ]
    : [
        kpi(t.kpi.investimento, $(atual.gasto), atual.gasto, anterior.gasto, "neutro"),
        kpi(t.kpi.leads, n(atual.leads), atual.leads, anterior.leads, "subir", true),
        kpi(t.kpi.cpl, $(razao(atual.gasto, atual.leads)), razao(atual.gasto, atual.leads), razao(anterior.gasto, anterior.leads), "descer", true),
        kpi(t.kpi.ctr, porcentagem(ctr, idioma), ctr, ctrAnt),
        kpi(t.kpi.cliques, n(atual.cliques), atual.cliques, anterior.cliques),
        kpi(t.kpi.cpc, $(cpc), cpc, cpcAnt, "descer"),
        kpi(t.kpi.impressoes, n(atual.impressoes), atual.impressoes, anterior.impressoes),
        kpi(t.kpi.cpm, $(razao(atual.gasto * 1000, atual.impressoes)), razao(atual.gasto * 1000, atual.impressoes), razao(anterior.gasto * 1000, anterior.impressoes), "descer"),
      ];

  const semDados = atual.gasto === 0 && atual.impressoes === 0 && atual.leads === 0 && atual.conversoes === 0;
  const base = `/painel/${empresa.slug}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.visao.titulo}</h1>
          <p className="mt-1 text-sm text-white/50">
            {ultima ? fmt(t.periodo.dadosAte, { data: dataLonga(ultima, idioma) }) : t.periodo.semDadosAinda}
          </p>
        </div>
        <SeletorPeriodo atual={p.chave} base={base} t={t.periodo} />
      </div>

      {empresa.comentario && (
        <section className="painel-cartao mt-6 border-l-4 !border-l-[#ff2d38] p-5">
          <h2 className="text-xs font-medium tracking-wide text-[#ff8a90] uppercase">{t.visao.comentario}</h2>
          <p className="mt-2 leading-relaxed whitespace-pre-line text-white/85">{empresa.comentario}</p>
          {empresa.comentario_em && (
            <p className="mt-2 text-xs text-white/40">{fmt(t.visao.comentarioEm, { data: dataHora(empresa.comentario_em, idioma) })}</p>
          )}
        </section>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{indicadores}</div>

      {semDados && <p className="painel-cartao mt-4 p-5 text-center text-sm text-white/60">{t.visao.semDados}</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GraficoBarras
          titulo={t.visao.investimentoDia}
          total={$(atual.gasto)}
          pontos={serie.map((d) => ({ rotulo: diaCurto(d.data, idioma), valor: d.gasto, dica: `${diaCurto(d.data, idioma)}: ${$(d.gasto)}` }))}
        />
        {ecommerce ? (
          <GraficoBarras
            titulo={t.visao.conversoesDia}
            total={n(atual.conversoes)}
            pontos={serie.map((d) => ({ rotulo: diaCurto(d.data, idioma), valor: d.conversoes, dica: `${diaCurto(d.data, idioma)}: ${n(d.conversoes)} · ${$(d.receita)}` }))}
          />
        ) : (
          <GraficoBarras
            titulo={t.visao.leadsDia}
            total={n(atual.leads)}
            pontos={serie.map((d) => ({ rotulo: diaCurto(d.data, idioma), valor: d.leads, dica: `${diaCurto(d.data, idioma)}: ${n(d.leads)}` }))}
          />
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="painel-cartao p-5">
          <h2 className="font-display text-lg font-extrabold">{t.visao.metas}</h2>
          <Metas empresa={empresa} mes={mes} idioma={idioma} t={t} />
        </section>

        <section className="painel-cartao overflow-hidden">
          <h2 className="px-5 pt-5 font-display text-lg font-extrabold">{t.visao.plataformas}</h2>
          {plataformas.length === 0 ? (
            <p className="px-5 pt-3 pb-5 text-sm text-white/50">{t.visao.semDados}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="painel-tabela mt-2 w-full text-left text-sm">
                <thead>
                  <tr>
                    <th>{t.campanhas.plataforma}</th>
                    <th className="text-right">{t.kpi.investimento}</th>
                    <th className="text-right">{ecommerce ? t.kpi.receita : t.kpi.leads}</th>
                    <th className="text-right">{ecommerce ? t.kpi.roas : t.kpi.cpl}</th>
                  </tr>
                </thead>
                <tbody>
                  {plataformas.map((pl) => (
                    <tr key={pl.plataforma}>
                      <td className="font-medium">{pl.plataforma}</td>
                      <td className="text-right tabular-nums">{$(pl.gasto)}</td>
                      <td className="text-right tabular-nums">{ecommerce ? $(pl.receita) : n(pl.leads)}</td>
                      <td className="text-right tabular-nums">
                        {ecommerce ? fmtRoas(razao(pl.receita, pl.gasto), idioma) : $(razao(pl.gasto, pl.leads))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {leads.length > 0 && (
        <section className="painel-cartao mt-4 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="font-display text-lg font-extrabold">{t.visao.ultimosLeads}</h2>
            <Link href={`${base}/leads`} className="text-sm text-[#ff8a90] hover:underline">
              {t.visao.verTodos} →
            </Link>
          </div>
          <ul className="mt-2">
            {leads.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 border-t border-white/6 px-5 py-3 text-sm">
                <span className="min-w-0 truncate font-medium">{l.nome ?? l.email ?? l.whatsapp}</span>
                <span className="shrink-0 text-white/50">
                  {t.leads.etapas[l.etapa]} · {dataHora(l.recebido_em, idioma)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function fmtRoas(v: number | null, idioma: Parameters<typeof numero>[1]) {
  return v == null ? "—" : `${numero(v, idioma, 2)}x`;
}

function Metas({
  empresa,
  mes,
  idioma,
  t,
}: Pick<Awaited<ReturnType<typeof contextoEmpresa>>, "empresa" | "idioma" | "t"> & { mes: Awaited<ReturnType<typeof carregarVisao>>["mes"] }) {
  const $ = (v: number | null) => dinheiro(v, empresa.moeda, idioma);
  const barras: { rotulo: string; feito: number; meta: number; valor: string; detalhe: string; inverter?: boolean }[] = [];

  if (empresa.meta_investimento) {
    barras.push({
      rotulo: t.kpi.investimento,
      feito: mes.realizado.gasto,
      meta: empresa.meta_investimento,
      valor: `${$(mes.realizado.gasto)} ${fmt(t.visao.metaDe, { meta: $(empresa.meta_investimento) })}`,
      detalhe: fmt(t.visao.ritmo, { valor: $(mes.projecao.gasto) }),
    });
  }
  if (empresa.tipo === "leads" && empresa.meta_leads) {
    barras.push({
      rotulo: t.kpi.leads,
      feito: mes.realizado.leads,
      meta: empresa.meta_leads,
      valor: `${numero(mes.realizado.leads, idioma)} ${fmt(t.visao.metaDe, { meta: numero(empresa.meta_leads, idioma) })}`,
      detalhe: fmt(t.visao.ritmo, { valor: numero(Math.round(mes.projecao.leads), idioma) }),
    });
  }
  if (empresa.tipo === "ecommerce" && empresa.meta_receita) {
    barras.push({
      rotulo: t.kpi.receita,
      feito: mes.realizado.receita,
      meta: empresa.meta_receita,
      valor: `${$(mes.realizado.receita)} ${fmt(t.visao.metaDe, { meta: $(empresa.meta_receita) })}`,
      detalhe: fmt(t.visao.ritmo, { valor: $(mes.projecao.receita) }),
    });
  }
  const cplMes = razao(mes.realizado.gasto, mes.realizado.leads);
  if (empresa.tipo === "leads" && empresa.meta_cpl) {
    barras.push({
      rotulo: t.kpi.cpl,
      feito: cplMes ?? 0,
      meta: empresa.meta_cpl,
      valor: $(cplMes),
      detalhe: fmt(t.visao.metaCpl, { meta: $(empresa.meta_cpl) }),
      inverter: true,
    });
  }

  if (!barras.length) return <p className="mt-3 text-sm text-white/50">{t.visao.semMetas}</p>;

  return (
    <ul className="mt-4 grid gap-5">
      {barras.map((b) => {
        const fracao = Math.min(1, b.meta > 0 ? b.feito / b.meta : 0);
        // No CPL, passar da meta é ruim; nas demais, ficar atrás do ritmo do mês (a partir do 4º dia) é que preocupa.
        const ruim = b.inverter ? b.feito > b.meta : mes.fracaoDoMes > 0.1 && fracao < mes.fracaoDoMes * 0.8;
        return (
          <li key={b.rotulo}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-white/60">{b.rotulo}</span>
              <span className="text-right font-medium tabular-nums">{b.valor}</span>
            </div>
            <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
              <div
                className={`h-full rounded-full ${ruim ? "bg-gradient-to-r from-amber-500 to-amber-300" : "bg-gradient-to-r from-[#a80d14] to-[#ff3540]"}`}
                style={{ width: `${Math.max(fracao * 100, b.feito > 0 ? 2 : 0)}%` }}
              />
              {!b.inverter && (
                <span className="absolute top-0 h-full w-0.5 bg-white/50" style={{ left: `${mes.fracaoDoMes * 100}%` }} aria-hidden="true" />
              )}
            </div>
            <p className="mt-1.5 text-xs text-white/45">{b.detalhe}</p>
          </li>
        );
      })}
    </ul>
  );
}
