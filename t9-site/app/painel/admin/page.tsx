import Link from "next/link";
import { exigirEquipe } from "@/lib/painel/auth";
import { alertasDe, carteira } from "@/lib/painel/dados";
import { dinheiro, numero, razao } from "@/lib/painel/formato";
import { recriarDemo } from "../acoes-conteudo";
import { BotaoEnviar } from "../_ui/Botoes";

export default async function Carteira() {
  const usuario = await exigirEquipe();
  const linhas = (await carteira(usuario)).map((e) => ({ ...e, alertas: alertasDe(e) }));
  // Quem tem alerta grave aparece primeiro.
  linhas.sort((a, b) => b.alertas.filter((x) => x.nivel === "alto").length - a.alertas.filter((x) => x.nivel === "alto").length || b.alertas.length - a.alertas.length);
  const comAlerta = linhas.filter((l) => l.alertas.length).length;
  const totalPorMoeda = new Map<string, number>();
  for (const l of linhas) totalPorMoeda.set(l.moeda, (totalPorMoeda.get(l.moeda) ?? 0) + l.gm);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Carteira</h1>
          <p className="mt-1 text-white/55">
            {linhas.length} {linhas.length === 1 ? "cliente" : "clientes"} · {comAlerta} com pontos de atenção
          </p>
        </div>
        {usuario.perfil === "admin" && (
          <div className="flex flex-wrap gap-2">
            <form action={recriarDemo}>
              <BotaoEnviar
                enviando="Gerando..."
                className="botao-painel botao-painel-sec"
                confirmar="Recriar o cliente de demonstração? Os dados fictícios dele serão gerados de novo."
              >
                Recriar demonstração
              </BotaoEnviar>
            </form>
            <Link href="/painel/admin/nova" className="botao-painel">
              + Novo cliente
            </Link>
          </div>
        )}
      </div>

      {totalPorMoeda.size > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...totalPorMoeda].map(([moeda, total]) => (
            <div key={moeda} className="painel-cartao p-4">
              <p className="text-xs tracking-wide text-white/55 uppercase">Investido no mês ({moeda})</p>
              <p className="mt-2 font-display text-2xl font-extrabold">{dinheiro(total, moeda, "pt", true)}</p>
            </div>
          ))}
        </div>
      )}

      {linhas.length === 0 ? (
        <p className="painel-cartao mt-6 p-6 text-center text-white/60">
          Nenhum cliente {usuario.perfil === "admin" ? "cadastrado ainda." : "atribuído a você ainda."}
        </p>
      ) : (
        <div className="painel-cartao mt-6 overflow-x-auto">
          <table className="painel-tabela w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr>
                <th>Cliente</th>
                <th className="text-right">Invest. 7d</th>
                <th className="text-right">Resultado 7d</th>
                <th className="text-right">Custo / ROAS 7d</th>
                <th className="text-right">Mês vs meta</th>
                <th>Atenção</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {linhas.map((e) => {
                const $ = (v: number | null) => dinheiro(v, e.moeda, "pt");
                const ecommerce = e.tipo === "ecommerce";
                return (
                  <tr key={e.id} className="align-top">
                    <td>
                      <Link href={`/painel/admin/${e.slug}`} className="font-medium hover:underline">
                        {e.nome}
                      </Link>
                      <span className="block text-xs text-white/45">
                        {ecommerce ? "E-commerce" : "Geração de leads"} · {e.pais} · {e.moeda}
                      </span>
                    </td>
                    <td className="text-right tabular-nums">
                      {$(e.g7)}
                      <Variacao atual={e.g7} anterior={e.g7ant} />
                    </td>
                    <td className="text-right tabular-nums">
                      {ecommerce ? `${numero(e.c7, "pt")} vendas` : `${numero(e.l7, "pt")} leads`}
                      {!ecommerce && <Variacao atual={e.l7} anterior={e.l7ant} />}
                    </td>
                    <td className="text-right tabular-nums">
                      {ecommerce
                        ? razao(e.r7, e.g7) == null
                          ? "—"
                          : `${numero(razao(e.r7, e.g7), "pt", 2)}x`
                        : $(razao(e.g7, e.l7))}
                      {!ecommerce && e.meta_cpl ? <span className="block text-xs text-white/40">meta {$(e.meta_cpl)}</span> : null}
                    </td>
                    <td className="text-right tabular-nums">
                      {$(e.gm)}
                      {e.meta_investimento ? <span className="block text-xs text-white/40">de {$(e.meta_investimento)}</span> : null}
                    </td>
                    <td>
                      {e.alertas.length === 0 ? (
                        <span className="text-xs text-emerald-300">Tudo certo</span>
                      ) : (
                        <ul className="grid gap-1">
                          {e.alertas.map((a) => (
                            <li
                              key={a.texto}
                              className={`w-fit rounded-full px-2.5 py-0.5 text-xs ${a.nivel === "alto" ? "bg-[#ff2d38]/15 text-[#ff9aa0]" : "bg-amber-400/15 text-amber-200"}`}
                            >
                              {a.texto}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <Link href={`/painel/${e.slug}`} className="text-xs text-white/55 hover:text-white">
                        Ver painel →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  if (!anterior) return null;
  const v = atual / anterior - 1;
  return (
    <span className={`block text-xs ${v >= 0 ? "text-white/45" : "text-white/45"}`}>
      {v >= 0 ? "▲" : "▼"} {Math.abs(Math.round(v * 100))}% vs 7d ant.
    </span>
  );
}
