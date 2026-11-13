import type { Metadata } from "next";
import { q } from "@/lib/placar/banco";
import { PLANOS, exigirConta, planoPorId } from "@/lib/placar/conta";
import { asaasConfigurado, faturaEmAberto } from "@/lib/placar/asaas";
import { assinarPlano, cancelarPlano } from "../../acoes";
import Form from "../../_ui/Form";
import Enviar from "../../_ui/Enviar";
import { botao, campo, cartao, rotulo } from "../../_ui/estilo";

export const metadata: Metadata = { title: "Plano" };

const data = (v: string) => new Date(v).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "numeric", month: "long" });

export default async function Plano() {
  const { agencia, acesso } = await exigirConta();
  const [usados, fatura] = await Promise.all([
    q<{ n: number }>("select count(*)::int as n from placar.clientes where agencia_id = $1", [agencia.id]),
    agencia.asaas_assinatura && asaasConfigurado() ? faturaEmAberto(agencia.asaas_assinatura).catch(() => null) : Promise.resolve(null),
  ]);
  const atual = planoPorId(agencia.plano);
  const assinante = Boolean(agencia.asaas_assinatura);
  const situacao =
    acesso.motivo === "teste"
      ? `Teste grátis até ${data(agencia.teste_ate)}.`
      : acesso.motivo === "pago"
        ? `Plano ${atual?.nome} ativo, pago até ${data(agencia.pago_ate!)}.`
        : acesso.motivo === "tolerancia"
          ? "A mensalidade venceu. Pague a fatura para não perder o acesso."
          : acesso.motivo === "teste-acabou"
            ? "Seu teste grátis acabou. Escolha um plano para continuar."
            : "Sua assinatura venceu. Pague a fatura para voltar a usar.";

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 pb-16">
      <h1 className="text-[28px] font-bold tracking-tight">Plano</h1>
      <p className={`mt-2 inline-block rounded-[10px] px-4 py-2.5 text-[15px] ${acesso.liberado ? "bg-white text-gray-700 ring-1 ring-gray-200" : "bg-amber-50 text-amber-900"}`}>
        {situacao} Você tem {usados[0]?.n ?? 0} {usados[0]?.n === 1 ? "cliente" : "clientes"}.
      </p>

      {fatura && (
        <div className={`${cartao} mt-4 flex flex-wrap items-center justify-between gap-3 p-5`}>
          <p className="text-[15px]">
            Fatura de R$ {fatura.valor.toFixed(2).replace(".", ",")} com vencimento em {data(`${fatura.vencimento}T12:00:00Z`)}.
          </p>
          <a href={fatura.link} target="_blank" rel="noopener" className={botao}>
            Pagar agora (PIX, boleto ou cartão)
          </a>
        </div>
      )}

      <Form acao={assinarPlano} className="mt-6">
        <fieldset>
          <legend className="text-lg font-bold">{assinante ? "Trocar de plano" : "Escolha o seu plano"}</legend>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {PLANOS.map((p) => (
              <label
                key={p.id}
                className={`${cartao} block cursor-pointer p-5 has-[:checked]:border-2 has-[:checked]:border-[#2F5BEA] has-[:checked]:bg-[#F5F7FF] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-[#2F5BEA]/30`}
              >
                <input type="radio" name="plano" value={p.id} defaultChecked={agencia.plano === p.id || (!atual && p.id === "profissional")} className="sr-only" />
                <span className="block text-lg font-semibold">{p.nome}</span>
                <span className="block text-gray-600">{p.resumo}</span>
                <span className="mt-4 block text-3xl font-bold tracking-tight">
                  R$ {p.preco}
                  <span className="text-base font-medium text-gray-500">/mês</span>
                </span>
                {agencia.plano === p.id && assinante && <span className="mt-2 block text-sm font-semibold text-[#2F5BEA]">Seu plano atual</span>}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <label className="w-full max-w-xs">
            <span className={rotulo}>CPF ou CNPJ de quem paga</span>
            <input name="documento" inputMode="numeric" defaultValue={agencia.documento ?? ""} required={!agencia.documento} className={campo} />
          </label>
          <Enviar enviando="Preparando...">{assinante ? "Trocar de plano" : acesso.motivo === "teste" ? "Assinar (cobra só no fim do teste)" : "Assinar e pagar"}</Enviar>
        </div>
        <p className="mt-2 text-[13px] text-gray-500">Você paga pela fatura do Asaas, por PIX, boleto ou cartão. Mensal, sem fidelidade.</p>
      </Form>

      {assinante && agencia.status !== "cancelada" && (
        <form action={cancelarPlano} className="mt-10 border-t border-gray-200 pt-5">
          <Enviar className="text-sm font-medium text-red-700 hover:text-red-900" confirmar="Cancelar a assinatura? Você usa até o fim do período pago.">
            Cancelar assinatura
          </Enviar>
        </form>
      )}
    </main>
  );
}
