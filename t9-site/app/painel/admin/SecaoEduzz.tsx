import type { Empresa } from "@/lib/painel/auth";
import { umaLinha } from "@/lib/painel/db";
import { dataHora } from "@/lib/painel/formato";
import { enderecoBase } from "@/lib/painel/links";
import { salvarEduzz, trocarTokenEduzz } from "../acoes-eduzz";
import FormComEstado from "../_ui/FormComEstado";
import { BotaoEnviar } from "../_ui/Botoes";

/** Vendas pela Eduzz (webhook): liga/desliga, endereço para colar na Eduzz e chave secreta. */
export default async function SecaoEduzz({ empresa }: { empresa: Empresa }) {
  const ativo = empresa.vendas_fonte === "eduzz";
  const url = empresa.eduzz_token ? `${await enderecoBase()}/api/painel/eduzz/${empresa.eduzz_token}` : null;
  const resumo = ativo
    ? await umaLinha<{ pagas: number; hoje: number }>(
        `select count(*) filter (where status = 'paid')::int as pagas,
                count(*) filter (where status = 'paid' and data = (now() at time zone 'America/Sao_Paulo')::date)::int as hoje
           from vendas where empresa_id = $1`,
        [empresa.id],
      )
    : null;

  return (
    <section className="painel-cartao mt-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">Vendas pela Eduzz</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ativo ? (empresa.eduzz_ultimo_evento ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-200") : "bg-white/8 text-white/55"}`}>
          {ativo ? (empresa.eduzz_ultimo_evento ? "Recebendo vendas" : "Aguardando a primeira venda") : "Desligado"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Para quem vende pela Eduzz: cada venda paga entra no painel na hora, e reembolsos, chargebacks e cancelamentos saem da conta. Com isso ligado,
        vendas e receita passam a vir da Eduzz (não do pixel da Meta), e o painel calcula ROI e ROAS com o investimento real dos anúncios.
      </p>

      <FormComEstado acao={salvarEduzz} className="mt-4">
        <input type="hidden" name="empresa" value={empresa.id} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="ativo" defaultChecked={ativo} className="h-4 w-4 accent-[#e3121c]" />
          As vendas deste cliente acontecem na Eduzz
        </label>
        <label className="mt-3 block max-w-xl">
          <span className="painel-rotulo">Chave secreta do webhook (Eduzz → Segurança)</span>
          <input
            name="segredo"
            type="password"
            autoComplete="off"
            placeholder={empresa.eduzz_segredo ? "•••••• configurada (deixe vazio para manter)" : "Cole aqui a chave secreta gerada na Eduzz"}
            className="painel-campo"
          />
        </label>
        {empresa.eduzz_segredo && (
          <label className="mt-2 flex items-center gap-2 text-xs text-white/55">
            <input type="checkbox" name="remover_segredo" className="h-3.5 w-3.5 accent-[#e3121c]" />
            Remover a chave secreta
          </label>
        )}
        <BotaoEnviar enviando="Salvando..." className="botao-painel mt-4">
          Salvar
        </BotaoEnviar>
      </FormComEstado>

      {ativo && url && (
        <div className="mt-5 border-t border-white/6 pt-4 text-sm">
          <p className="painel-rotulo">Endereço do webhook (cole na Eduzz)</p>
          <input readOnly value={url} className="painel-campo !text-xs" />
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-white/60">
            <li>No Developer Hub da Eduzz, crie um webhook com esse endereço.</li>
            <li>
              Marque os eventos de fatura: <strong className="text-white/80">Paga, Reembolsada, Chargeback, Cancelada</strong> (e, se quiser, Aguardando
              reembolso).
            </li>
            <li>Na tela de Segurança da Eduzz, gere uma chave secreta e cole no campo acima.</li>
            <li>
              Nos anúncios da Meta, use os parâmetros de URL{" "}
              <code className="rounded bg-white/8 px-1 text-xs">utm_source=meta&amp;utm_campaign={"{{campaign.name}}"}&amp;utm_content={"{{ad.id}}"}</code> para
              saber qual criativo vendeu.
            </li>
          </ol>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-white/55">
            <p>
              {resumo?.pagas ?? 0} venda(s) paga(s) registrada(s) · {resumo?.hoje ?? 0} hoje
              {empresa.eduzz_ultimo_evento ? ` · último aviso da Eduzz em ${dataHora(empresa.eduzz_ultimo_evento, "pt")}` : ""}
              {empresa.eduzz_segredo ? " · assinatura conferida" : " · sem chave secreta (recomendado configurar)"}
            </p>
            <form action={trocarTokenEduzz}>
              <input type="hidden" name="empresa" value={empresa.id} />
              <BotaoEnviar className="text-xs text-white/45 hover:text-[#ff8a90]" confirmar="Gerar um endereço novo? O antigo para de funcionar e precisa ser trocado na Eduzz.">
                Gerar endereço novo
              </BotaoEnviar>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
