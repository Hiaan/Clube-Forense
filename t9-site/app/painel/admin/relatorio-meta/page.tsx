import { exigirAdmin } from "@/lib/painel/auth";
import { hoje, somarDias } from "@/lib/painel/dados";
import { listarContasDeAnuncio, metaConfigurado, normalizarConta, relatorioDaConta } from "@/lib/painel/meta";
import BotaoImprimir from "../../_ui/BotaoImprimir";
import Tabelas from "./Tabelas";

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

/** Explica em português os recusas mais comuns da Meta ao ler uma conta. */
function explicarErro(mensagem: string) {
  if (/NOT grant ads_management or ads_read/i.test(mensagem))
    return "A conta é de outro Business (do cliente) e o app T9 Painel ainda só tem o acesso de teste da Meta, que lê apenas contas do próprio Business da T9. Para ler contas de clientes é preciso o Acesso avançado de ads_read (revisão do app na Meta).";
  if (/does not exist|cannot be loaded due to missing permissions|Unsupported get request|\(código 100\)/i.test(mensagem))
    return "O usuário do sistema da T9 não tem acesso a essa conta. Ela precisa ser compartilhada com o Business da T9 e atribuída ao usuário do sistema.";
  return mensagem;
}

export default async function RelatorioMeta({ searchParams }: { searchParams: Promise<{ conta?: string; manual?: string; meses?: string | string[]; modo?: string; de?: string; ate?: string }> }) {
  await exigirAdmin();
  const ref = hoje();
  const opcoes = ultimosMeses(ref.slice(0, 7), 12);
  const sp = await searchParams;
  // Conta digitada (número, act_123 ou link do Gerenciador) vale mais que a escolhida na lista.
  const manual = sp.manual?.trim() ? normalizarConta(sp.manual) : null;
  const conta = manual ?? (sp.conta && /^act_\d+$/.test(sp.conta) ? sp.conta : "");
  const meses = ([] as string[])
    .concat(sp.meses ?? opcoes.slice(0, 3))
    .filter((m) => opcoes.includes(m))
    .sort();

  // Datas escolhidas (de/até): valem quando o modo é "datas" e o intervalo faz sentido.
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const modoDatas = sp.modo === "datas";
  const de = sp.de && iso.test(sp.de) ? sp.de : `${ref.slice(0, 7)}-01`;
  const ate = sp.ate && iso.test(sp.ate) ? (sp.ate > ref ? ref : sp.ate) : ref;
  const datasValidas = de <= ate && de >= somarDias(ref, -36 * 31);
  const dias = Math.round((Date.parse(ate) - Date.parse(de)) / 86_400_000) + 1;
  const br = (d: string) => d.split("-").reverse().join("/");

  let contas: Awaited<ReturnType<typeof listarContasDeAnuncio>> = [];
  let erro: string | null = null;
  if (metaConfigurado()) contas = await listarContasDeAnuncio().catch((e) => ((erro = e instanceof Error ? e.message : String(e)), []));
  const escolhida = contas.find((c) => c.id === conta);
  const moeda = escolhida?.moeda ?? "BRL";

  let porMes: { mes: string; inicio: string; fim: string; dados: Awaited<ReturnType<typeof relatorioDaConta>> }[] = [];
  let geral: Awaited<ReturnType<typeof relatorioDaConta>> | null = null;
  let periodo: { atual: Awaited<ReturnType<typeof relatorioDaConta>>; anterior: Awaited<ReturnType<typeof relatorioDaConta>>; antDe: string; antAte: string } | null = null;
  if (conta && modoDatas && datasValidas && !erro) {
    try {
      const antAte = somarDias(de, -1);
      const antDe = somarDias(antAte, -(dias - 1));
      const [atual, anterior] = await Promise.all([relatorioDaConta(conta, de, ate), relatorioDaConta(conta, antDe, antAte)]);
      periodo = { atual, anterior, antDe, antAte };
    } catch (e) {
      erro = e instanceof Error ? e.message : String(e);
    }
  }
  if (conta && !modoDatas && meses.length && !erro) {
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
        {(porMes.length > 0 || periodo) && <BotaoImprimir rotulo="Salvar em PDF" />}
      </div>

      <form className="painel-cartao nao-imprimir mt-6 grid gap-4 p-5 lg:grid-cols-[1fr_auto]" action="/painel/admin/relatorio-meta">
        <div className="grid gap-4">
          <label>
            <span className="painel-rotulo">Conta de anúncio</span>
            <select name="conta" defaultValue={manual ? "" : conta} className="painel-campo">
              <option value="">Escolha a conta</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.id.replace("act_", "")})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="painel-rotulo">Ou digite o número da conta (se ela não aparecer na lista)</span>
            <input name="manual" defaultValue={manual ? manual.replace("act_", "") : ""} inputMode="numeric" placeholder="Ex.: 1234567890 ou o link do Gerenciador" className="painel-campo" />
          </label>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="painel-rotulo">Período</legend>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm has-[:checked]:border-[#ff2d38] has-[:checked]:bg-[#ff2d38]/15">
              <input type="radio" name="modo" value="meses" defaultChecked={!modoDatas} className="accent-[#ff2d38]" />
              Mês a mês
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm has-[:checked]:border-[#ff2d38] has-[:checked]:bg-[#ff2d38]/15">
              <input type="radio" name="modo" value="datas" defaultChecked={modoDatas} className="accent-[#ff2d38]" />
              Escolher datas
            </label>
          </fieldset>
          <div className="grid max-w-md grid-cols-2 gap-3">
            <label>
              <span className="painel-rotulo">De (escolher datas)</span>
              <input type="date" name="de" defaultValue={de} max={ref} className="painel-campo" />
            </label>
            <label>
              <span className="painel-rotulo">Até</span>
              <input type="date" name="ate" defaultValue={ate} max={ref} className="painel-campo" />
            </label>
          </div>
          <fieldset>
            <legend className="painel-rotulo">Meses (mês a mês)</legend>
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

      {sp.manual?.trim() && !manual && <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">Não reconheci o número da conta. Copie o número que aparece depois de &quot;act=&quot; no endereço do Gerenciador de Anúncios.</p>}
      {erro && <p className="mt-4 rounded-xl border border-[#ff2d38]/30 bg-[#ff2d38]/10 px-4 py-3 text-sm text-[#ffb3b7]">Não deu para ler a Meta: {explicarErro(erro)}</p>}
      {!metaConfigurado() && <p className="mt-4 text-white/55">Falta o token da Meta na Vercel.</p>}

      {modoDatas && !datasValidas && (
        <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">Confira as datas: o início precisa ser antes do fim (a Meta guarda até 37 meses).</p>
      )}

      {periodo && (
        <div className="mt-8">
          <Tabelas
            moeda={moeda}
            nota="Período anterior = os mesmos dias imediatamente antes, para comparar. Alcance = pessoas diferentes que viram os anúncios. Leads = cadastros (formulário e site) + conversas iniciadas no WhatsApp, Direct ou Messenger."
            secoes={[
              {
                titulo: `${escolhida?.nome ?? conta}: ${br(de)} a ${br(ate)}`,
                tipo: "resumo",
                rotuloLinhas: "Período",
                linhas: [
                  { ...periodo.atual.total, rotulo: `${br(de)} a ${br(ate)}`, detalhe: `${dias} ${dias === 1 ? "dia" : "dias"}`, destaque: true },
                  { ...periodo.anterior.total, rotulo: "Período anterior", detalhe: `${br(periodo.antDe)} a ${br(periodo.antAte)}` },
                ],
              },
              {
                titulo: `Campanhas de ${br(de)} a ${br(ate)}`,
                tipo: "campanhas",
                linhas: periodo.atual.campanhas.map((c) => ({ ...c, rotulo: c.campanha || "—" })),
              },
            ]}
          />
        </div>
      )}

      {!modoDatas && porMes.length > 0 && (
        <div className="mt-8">
          <Tabelas
            moeda={moeda}
            nota="Alcance = pessoas diferentes que viram os anúncios; no período todo, quem viu em mais de um mês conta uma vez só. Leads = cadastros (formulário e site) + conversas iniciadas no WhatsApp, Direct ou Messenger."
            secoes={[
              {
                titulo: `${escolhida?.nome ?? conta}: resumo por mês`,
                tipo: "resumo",
                linhas: [
                  ...porMes.map(({ mes, fim, dados: { total } }) => ({
                    ...total,
                    rotulo: rotuloMes(mes),
                    detalhe: fim.slice(0, 7) === ref.slice(0, 7) ? `até ${fim.split("-").reverse().join("/")}` : undefined,
                  })),
                  ...(geral ? [{ ...geral.total, rotulo: "Período todo", destaque: true }] : []),
                ],
              },
              ...porMes.map(({ mes, dados }) => ({
                titulo: `Campanhas de ${rotuloMes(mes).toLowerCase()}`,
                tipo: "campanhas" as const,
                linhas: dados.campanhas.map((c) => ({ ...c, rotulo: c.campanha || "—" })),
              })),
            ]}
          />
        </div>
      )}
    </>
  );
}
