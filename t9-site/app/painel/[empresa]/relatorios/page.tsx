import Link from "next/link";
import { mostrarEdicao } from "@/lib/painel/auth";
import { campanhas, hoje, limitesDoMes, mesesComDados, relatorioDoMes, serieDiaria, totais } from "@/lib/painel/dados";
import { dataLonga, diaCurto, dinheiro, numero, porcentagem, razao } from "@/lib/painel/formato";
import { CONFIG_IDIOMA, fmt, type Idioma } from "@/lib/i18n";
import { salvarRelatorio } from "../../acoes-conteudo";
import { BotaoEnviar } from "../../_ui/Botoes";
import BotaoImprimir from "../../_ui/BotaoImprimir";
import FormComEstado from "../../_ui/FormComEstado";
import GraficoBarras from "../../_ui/Grafico";
import Kpi from "../../_ui/Kpi";
import { contextoEmpresa } from "../contexto";

const nomeDoMes = (mes: string, idioma: Idioma) =>
  new Date(`${mes}-01T12:00:00Z`).toLocaleDateString(CONFIG_IDIOMA[idioma].locale, { month: "long", year: "numeric", timeZone: "UTC" });

export default async function Relatorios({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<{ mes?: string }>;
}) {
  const { usuario, empresa, idioma, t } = await contextoEmpresa(params);
  const meses = await mesesComDados(empresa.id);
  const pedido = (await searchParams).mes;
  // Por padrão, o último mês fechado (ou o atual, se ainda não houver anterior).
  const mes = pedido && meses.includes(pedido) ? pedido : (meses.find((m) => m < hoje().slice(0, 7)) ?? meses[0]);
  const l = limitesDoMes(mes);
  const [atual, anterior, serie, linhas, analise, editavel] = await Promise.all([
    totais(empresa.id, l.inicio, l.fim),
    totais(empresa.id, l.anteriorInicio, l.anteriorFim),
    serieDiaria(empresa.id, l.inicio, l.fim),
    campanhas(empresa.id, l.inicio, l.fim),
    relatorioDoMes(empresa.id, mes),
    mostrarEdicao(usuario),
  ]);
  const tr = t.relatorios;
  const $ = (v: number | null) => dinheiro(v, empresa.moeda, idioma);
  const n = (v: number | null) => numero(v, idioma);
  const ecommerce = empresa.tipo === "ecommerce";
  const leg = tr.vsAnterior;
  const k = (rotulo: string, valor: string, a: number | null, b: number | null, melhor: "subir" | "descer" | "neutro" = "subir") => (
    <Kpi key={rotulo} rotulo={rotulo} valor={valor} atual={a} anterior={b} melhor={melhor} idioma={idioma} legenda={leg} />
  );
  const roas = (r: number, g: number) => (razao(r, g) == null ? "—" : `${numero(razao(r, g), idioma, 2)}x`);
  const mostrarAnalise = analise && (analise.publicado || editavel);

  return (
    <>
      <div className="nao-imprimir flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{tr.titulo}</h1>
          <p className="mt-1 text-white/55">{tr.subtitulo}</p>
        </div>
        <BotaoImprimir rotulo={tr.imprimir} />
      </div>

      <nav aria-label={tr.mes} className="nao-imprimir sem-barra mt-6 flex gap-1 overflow-x-auto">
        {meses.map((m) => (
          <Link
            key={m}
            href={`/painel/${empresa.slug}/relatorios?mes=${m}`}
            aria-current={m === mes ? "true" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap first-letter:uppercase ${
              m === mes ? "border-[#ff2d38] bg-[#e3121c] text-white" : "border-white/10 text-white/60 hover:text-white"
            }`}
          >
            {nomeDoMes(m, idioma)}
          </Link>
        ))}
      </nav>

      <article className="mt-6">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-extrabold first-letter:uppercase sm:text-3xl">
            {fmt(tr.relatorioDe, { mes: nomeDoMes(mes, idioma) })}
          </h2>
          <p className="text-white/55">{empresa.nome}</p>
        </header>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {ecommerce
            ? [
                k(t.kpi.investimento, $(atual.gasto), atual.gasto, anterior.gasto, "neutro"),
                k(t.kpi.receita, $(atual.receita), atual.receita, anterior.receita),
                k(t.kpi.roas, roas(atual.receita, atual.gasto), razao(atual.receita, atual.gasto), razao(anterior.receita, anterior.gasto)),
                k(t.kpi.conversoes, n(atual.conversoes), atual.conversoes, anterior.conversoes),
              ]
            : [
                k(t.kpi.investimento, $(atual.gasto), atual.gasto, anterior.gasto, "neutro"),
                k(t.kpi.leads, n(atual.leads), atual.leads, anterior.leads),
                k(t.kpi.cpl, $(razao(atual.gasto, atual.leads)), razao(atual.gasto, atual.leads), razao(anterior.gasto, anterior.leads), "descer"),
                k(t.kpi.ctr, porcentagem(razao(atual.cliques, atual.impressoes), idioma), razao(atual.cliques, atual.impressoes), razao(anterior.cliques, anterior.impressoes)),
              ]}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <GraficoBarras
            titulo={t.visao.investimentoDia}
            total={$(atual.gasto)}
            pontos={serie.map((d) => ({ rotulo: diaCurto(d.data, idioma), valor: d.gasto, dica: `${diaCurto(d.data, idioma)}: ${$(d.gasto)}` }))}
          />
          <GraficoBarras
            titulo={ecommerce ? t.visao.conversoesDia : t.visao.leadsDia}
            total={n(ecommerce ? atual.conversoes : atual.leads)}
            pontos={serie.map((d) => ({
              rotulo: diaCurto(d.data, idioma),
              valor: ecommerce ? d.conversoes : d.leads,
              dica: `${diaCurto(d.data, idioma)}: ${n(ecommerce ? d.conversoes : d.leads)}`,
            }))}
          />
        </div>

        {mostrarAnalise ? (
          <section className="painel-cartao mt-4 p-6">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-lg font-extrabold">{tr.analise}</h3>
              {!analise.publicado && <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs text-amber-200">Rascunho: o cliente ainda não vê</span>}
            </div>
            {analise.resumo && <p className="mt-3 leading-relaxed whitespace-pre-line text-white/85">{analise.resumo}</p>}
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {analise.destaques && (
                <div>
                  <p className="text-xs font-medium tracking-wide text-white/45 uppercase">{tr.destaques}</p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-white/80">{analise.destaques}</p>
                </div>
              )}
              {analise.proximos_passos && (
                <div>
                  <p className="text-xs font-medium tracking-wide text-white/45 uppercase">{tr.proximos}</p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-white/80">{analise.proximos_passos}</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <p className="painel-cartao mt-4 p-5 text-sm text-white/55">{tr.semAnalise}</p>
        )}

        {linhas.length > 0 && (
          <section className="painel-cartao mt-4 overflow-x-auto">
            <h3 className="px-5 pt-5 font-display text-lg font-extrabold">{tr.melhores}</h3>
            <table className="painel-tabela mt-2 w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr>
                  <th>{t.campanhas.campanha}</th>
                  <th className="text-right">{t.kpi.investimento}</th>
                  <th className="text-right">{ecommerce ? t.kpi.receita : t.kpi.leads}</th>
                  <th className="text-right">{ecommerce ? t.kpi.roas : t.kpi.cpl}</th>
                </tr>
              </thead>
              <tbody>
                {linhas.slice(0, 10).map((c) => (
                  <tr key={`${c.plataforma}|${c.campanha}`}>
                    <td>
                      <span className="block font-medium">{c.campanha || "—"}</span>
                      <span className="text-xs text-white/45">{c.plataforma}</span>
                    </td>
                    <td className="text-right tabular-nums">{$(c.gasto)}</td>
                    <td className="text-right tabular-nums">{ecommerce ? $(c.receita) : n(c.leads)}</td>
                    <td className="text-right tabular-nums">{ecommerce ? roas(c.receita, c.gasto) : $(razao(c.gasto, c.leads))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <p className="mt-6 text-center text-xs text-white/35">{fmt(tr.geradoEm, { data: dataLonga(hoje(), idioma) })}</p>
      </article>

      {editavel && (
        <FormComEstado acao={salvarRelatorio} className="painel-cartao nao-imprimir mt-6 p-6">
          <h2 className="font-display text-lg font-extrabold">Análise da equipe para este mês</h2>
          <p className="mt-1 text-sm text-white/50">Os números acima são calculados sozinhos. Aqui vai a leitura da equipe. Só aparece para o cliente depois de publicada.</p>
          <input type="hidden" name="empresa" value={empresa.id} />
          <input type="hidden" name="mes" value={mes} />
          <div className="mt-4 grid gap-3">
            <label>
              <span className="painel-rotulo">{tr.analise}</span>
              <textarea name="resumo" rows={4} defaultValue={analise?.resumo ?? ""} className="painel-campo" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label>
                <span className="painel-rotulo">{tr.destaques}</span>
                <textarea name="destaques" rows={4} defaultValue={analise?.destaques ?? ""} className="painel-campo" placeholder="• Um destaque por linha" />
              </label>
              <label>
                <span className="painel-rotulo">{tr.proximos}</span>
                <textarea name="proximos_passos" rows={4} defaultValue={analise?.proximos_passos ?? ""} className="painel-campo" placeholder="• Um passo por linha" />
              </label>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" name="publicado" defaultChecked={analise?.publicado ?? false} className="h-4 w-4 accent-[#e3121c]" />
            Publicar para o cliente
          </label>
          <BotaoEnviar enviando="Salvando..." className="botao-painel mt-4">
            Salvar análise
          </BotaoEnviar>
        </FormComEstado>
      )}
    </>
  );
}
