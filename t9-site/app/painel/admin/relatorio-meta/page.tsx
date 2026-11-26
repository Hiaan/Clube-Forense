import { exigirAdmin } from "@/lib/painel/auth";
import { hoje } from "@/lib/painel/dados";
import { dinheiro, numero } from "@/lib/painel/formato";
import { listarContasDeAnuncio, metaConfigurado, relatorioDaConta, type LinhaRelatorioMeta } from "@/lib/painel/meta";
import BotaoImprimir from "../../_ui/BotaoImprimir";

// Relatório de uma conta de anúncio por mês, lido na hora da Meta (não precisa ser cliente do painel).

const NOMES_MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const rotuloMes = (m: string) => {
  const nome = NOMES_MES[Number(m.slice(5, 7)) - 1];
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${m.slice(0, 4)}`;
};

function ultimosMeses(ref: string, n: number) {
  const lista: string[] = [];
  let [a, m] = ref.split("-").map(Number);
  for (let i = 0; i < n; i++) {
    lista.push(`${a}-${String(m).padStart(2, "0")}`);
    if (--m === 0) [a, m] = [a - 1, 12];
  }
  return lista;
}

/** Primeiro e último dia do mês; o mês corrente vai até hoje. */
function limites(mes: string, ref: string) {
  const [a, m] = mes.split("-").map(Number);
  const ultimo = `${mes}-${String(new Date(Date.UTC(a, m, 0)).getUTCDate()).padStart(2, "0")}`;
  return { inicio: `${mes}-01`, fim: ultimo > ref ? ref : ultimo };
}

export default async function RelatorioMeta({ searchParams }: { searchParams: Promise<{ conta?: string; meses?: string | string[] }> }) {
  await exigirAdmin();
  const ref = hoje();
  const opcoes = ultimosMeses(ref.slice(0, 7), 12);
  const sp = await searchParams;
  const conta = sp.conta && /^act_\d+$/.test(sp.conta) ? sp.conta : "";
  const meses = ([] as string[])
    .concat(sp.meses ?? opcoes.slice(0, 3))
    .filter((m) => opcoes.includes(m))
    .sort();

  let contas: Awaited<ReturnType<typeof listarContasDeAnuncio>> = [];
  let erro: string | null = null;
  if (metaConfigurado()) contas = await listarContasDeAnuncio().catch((e) => ((erro = e instanceof Error ? e.message : String(e)), []));
  const escolhida = contas.find((c) => c.id === conta);
  const moeda = escolhida?.moeda ?? "BRL";
  const din = (v: number) => dinheiro(v, moeda, "pt");
  const cpl = (l: LinhaRelatorioMeta) => (l.leads ? din(l.gasto / l.leads) : "–");

  let porMes: { mes: string; inicio: string; fim: string; dados: Awaited<ReturnType<typeof relatorioDaConta>> }[] = [];
  let geral: Awaited<ReturnType<typeof relatorioDaConta>> | null = null;
  if (conta && meses.length && !erro) {
    try {
      porMes = await Promise.all(
        meses.map(async (mes) => {
          const { inicio, fim } = limites(mes, ref);
          return { mes, inicio, fim, dados: await relatorioDaConta(conta, inicio, fim) };
        }),
      );
      if (meses.length > 1) geral = await relatorioDaConta(conta, porMes[0].inicio, porMes[porMes.length - 1].fim);
    } catch (e) {
      erro = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Relatório Meta</h1>
          <p className="mt-1 text-white/55">Investimento, alcance e leads de qualquer conta de anúncio, mês a mês. Lido na hora, direto da Meta.</p>
        </div>
        {porMes.length > 0 && <BotaoImprimir rotulo="Salvar em PDF" />}
      </div>

      <form className="painel-cartao nao-imprimir mt-6 grid gap-4 p-5 lg:grid-cols-[1fr_auto]" action="/painel/admin/relatorio-meta">
        <div className="grid gap-4">
          <label>
            <span className="painel-rotulo">Conta de anúncio</span>
            <select name="conta" defaultValue={conta} required className="painel-campo">
              <option value="">Escolha a conta</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.id.replace("act_", "")})
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="painel-rotulo">Meses</legend>
            <div className="flex flex-wrap gap-2">
              {opcoes.map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm has-[:checked]:border-[#ff2d38] has-[:checked]:bg-[#ff2d38]/15">
                  <input type="checkbox" name="meses" value={m} defaultChecked={meses.includes(m)} className="accent-[#ff2d38]" />
                  {rotuloMes(m).replace(" de 20", "/")}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <button className="botao-painel self-end">Gerar relatório</button>
      </form>

      {erro && <p className="mt-4 rounded-xl border border-[#ff2d38]/30 bg-[#ff2d38]/10 px-4 py-3 text-sm text-[#ffb3b7]">Não deu para ler a Meta: {erro}</p>}
      {!metaConfigurado() && <p className="mt-4 text-white/55">Falta o token da Meta na Vercel.</p>}

      {porMes.length > 0 && (
        <div className="mt-8 space-y-6">
          <section className="painel-cartao overflow-x-auto p-5">
            <h2 className="font-display text-xl font-extrabold">{escolhida?.nome ?? conta}: resumo por mês</h2>
            <table className="painel-tabela mt-3 w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th className="text-right">Investido</th>
                  <th className="text-right">Alcance</th>
                  <th className="text-right">Impressões</th>
                  <th className="text-right">Leads</th>
                  <th className="text-right">Custo por lead</th>
                </tr>
              </thead>
              <tbody>
                {porMes.map(({ mes, fim, dados: { total } }) => (
                  <tr key={mes}>
                    <td>
                      {rotuloMes(mes)}
                      {fim.slice(0, 7) === ref.slice(0, 7) && <span className="block text-xs text-white/45">até {fim.split("-").reverse().join("/")}</span>}
                    </td>
                    <td className="text-right">{din(total.gasto)}</td>
                    <td className="text-right">{numero(total.alcance, "pt")}</td>
                    <td className="text-right">{numero(total.impressoes, "pt")}</td>
                    <td className="text-right">
                      {numero(total.leads, "pt")}
                      {total.conversas > 0 && total.cadastros > 0 && (
                        <span className="block text-xs text-white/45">
                          {numero(total.cadastros, "pt")} cadastros + {numero(total.conversas, "pt")} conversas
                        </span>
                      )}
                    </td>
                    <td className="text-right font-semibold">{cpl(total)}</td>
                  </tr>
                ))}
                {geral && (
                  <tr className="font-semibold">
                    <td>Período todo</td>
                    <td className="text-right">{din(geral.total.gasto)}</td>
                    <td className="text-right">{numero(geral.total.alcance, "pt")}</td>
                    <td className="text-right">{numero(geral.total.impressoes, "pt")}</td>
                    <td className="text-right">{numero(geral.total.leads, "pt")}</td>
                    <td className="text-right">{cpl(geral.total)}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-white/45">
              Alcance = pessoas diferentes que viram os anúncios; no período todo, quem viu em mais de um mês conta uma vez só. Leads = cadastros
              (formulário e site) + conversas iniciadas no WhatsApp, Direct ou Messenger.
            </p>
          </section>

          {porMes.map(({ mes, dados }) => (
            <section key={mes} className="painel-cartao overflow-x-auto p-5">
              <h2 className="font-display text-lg font-extrabold">Campanhas de {rotuloMes(mes).toLowerCase()}</h2>
              {dados.campanhas.length ? (
                <table className="painel-tabela mt-3 w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr>
                      <th>Campanha</th>
                      <th className="text-right">Investido</th>
                      <th className="text-right">Alcance</th>
                      <th className="text-right">Leads</th>
                      <th className="text-right">Custo por lead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.campanhas.map((c) => (
                      <tr key={c.campanha}>
                        <td>{c.campanha}</td>
                        <td className="text-right">{din(c.gasto)}</td>
                        <td className="text-right">{numero(c.alcance, "pt")}</td>
                        <td className="text-right">{numero(c.leads, "pt")}</td>
                        <td className="text-right">{cpl(c)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="mt-2 text-sm text-white/55">Sem campanhas com investimento neste mês.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
