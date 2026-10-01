import Link from "next/link";
import { exigirAdmin } from "@/lib/painel/auth";
import { consulta } from "@/lib/painel/db";
import { hoje, somarDias } from "@/lib/painel/dados";
import { cobrancasDaCarteira, situacaoDe, somarPorMoeda, type CobrancaComEmpresa } from "@/lib/painel/financeiro";
import { dataLonga, dinheiro } from "@/lib/painel/formato";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import { AcoesCobranca, FormCobranca, SeloSituacao } from "../../_ui/Financeiro";

const tf = TEXTOS_PAINEL.pt.financeiro;

export default async function FinanceiroAdmin() {
  const usuario = await exigirAdmin();
  const [cobrancas, empresas] = await Promise.all([
    cobrancasDaCarteira(usuario),
    consulta<{ id: number; nome: string }>("select id, nome from empresas order by nome"),
  ]);
  const ref = hoje();
  const mes = ref.slice(0, 7);
  const abertas = cobrancas.filter((c) => !c.pago_em);
  const atrasadas = abertas.filter((c) => c.vencimento < ref);
  const proximos7 = abertas.filter((c) => c.vencimento >= ref && c.vencimento <= somarDias(ref, 7));
  const aReceberMes = abertas.filter((c) => c.vencimento.startsWith(mes));
  const recebidoMes = cobrancas.filter((c) => c.pago_em?.startsWith(mes));
  const recentes = cobrancas
    .filter((c) => c.pago_em)
    .sort((a, b) => b.pago_em!.localeCompare(a.pago_em!))
    .slice(0, 15);

  const total = (lista: CobrancaComEmpresa[]) => {
    const t = somarPorMoeda(lista);
    return t.length ? t.map(([m, v]) => dinheiro(v, m, "pt")).join(" + ") : dinheiro(0, "BRL", "pt");
  };
  const cartoes = [
    { rotulo: "Em atraso", valor: total(atrasadas), qtd: atrasadas.length, destaque: atrasadas.length > 0 },
    { rotulo: "Vence nos próximos 7 dias", valor: total(proximos7), qtd: proximos7.length, destaque: false },
    { rotulo: "A receber neste mês", valor: total(aReceberMes), qtd: aReceberMes.length, destaque: false },
    { rotulo: "Recebido neste mês", valor: total(recebidoMes), qtd: recebidoMes.length, destaque: false },
  ];

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Financeiro</h1>
      <p className="mt-1 text-white/55">Cobranças de todos os clientes. Dê baixa quando o pagamento cair: o cliente para de receber os avisos na hora.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cartoes.map((c) => (
          <div key={c.rotulo} className={`painel-cartao p-4 sm:p-5 ${c.destaque ? "border-amber-400/40" : ""}`}>
            <p className="text-xs font-medium tracking-wide text-white/55 uppercase">{c.rotulo}</p>
            <p className={`mt-2 font-display text-xl font-extrabold sm:text-2xl ${c.destaque ? "text-amber-200" : ""}`}>{c.valor}</p>
            <p className="mt-1 text-sm text-white/45">{c.qtd} cobrança(s)</p>
          </div>
        ))}
      </div>

      {empresas.length > 0 && (
        <details className="painel-cartao mt-4 p-5">
          <summary className="cursor-pointer font-display font-extrabold">+ Nova cobrança</summary>
          <div className="mt-4 max-w-2xl">
            <FormCobranca empresas={empresas} />
          </div>
        </details>
      )}

      <section className="painel-cartao mt-4 overflow-x-auto">
        <h2 className="px-5 pt-5 font-display text-lg font-extrabold">Em aberto</h2>
        {abertas.length === 0 ? (
          <p className="px-5 pt-2 pb-5 text-sm text-white/50">Nenhuma cobrança em aberto.</p>
        ) : (
          <table className="painel-tabela mt-2 w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Cliente</th>
                <th>Descrição</th>
                <th className="text-right">Valor</th>
                <th>Situação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {abertas.map((c) => (
                <tr key={c.id} className={situacaoDe(c, ref).tipo === "atrasada" ? "bg-amber-400/[0.04]" : ""}>
                  <td className="whitespace-nowrap">{dataLonga(c.vencimento, "pt")}</td>
                  <td>
                    <Link href={`/painel/${c.empresa_slug}/financeiro`} className="font-medium hover:underline">
                      {c.empresa_nome}
                    </Link>
                  </td>
                  <td>{c.descricao}</td>
                  <td className="text-right whitespace-nowrap tabular-nums">{dinheiro(c.valor, c.moeda, "pt")}</td>
                  <td>
                    <SeloSituacao c={c} t={tf} idioma="pt" />
                  </td>
                  <td>
                    <AcoesCobranca c={c} empresas={empresas} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {recentes.length > 0 && (
        <section className="painel-cartao mt-4 overflow-x-auto">
          <h2 className="px-5 pt-5 font-display text-lg font-extrabold">Baixas recentes</h2>
          <table className="painel-tabela mt-2 w-full min-w-[760px] text-left text-sm">
            <tbody>
              {recentes.map((c) => (
                <tr key={c.id} className="text-white/70">
                  <td className="whitespace-nowrap">{dataLonga(c.vencimento, "pt")}</td>
                  <td>{c.empresa_nome}</td>
                  <td>{c.descricao}</td>
                  <td className="text-right whitespace-nowrap tabular-nums">{dinheiro(c.valor, c.moeda, "pt")}</td>
                  <td>
                    <SeloSituacao c={c} t={tf} idioma="pt" />
                  </td>
                  <td>
                    <AcoesCobranca c={c} empresas={empresas} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
