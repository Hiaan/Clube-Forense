import Link from "next/link";
import { exigirAdmin } from "@/lib/painel/auth";
import { consulta, umaLinha } from "@/lib/painel/db";
import { listarPropostas, propostaVencida, valorFormatado } from "@/lib/painel/comercial";
import { dataHora } from "@/lib/painel/formato";
import { criarProposta } from "../../acoes-comercial";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";
import Detalhes from "../../_ui/Detalhes";
import CamposComerciais from "../CamposComerciais";
import { COR_STATUS, ROTULO_PROPOSTA } from "../statusComercial";

type Empresa = { id: number; nome: string; mensalidade: number | null; mensalidade_moeda: string | null };

export default async function Propostas({ searchParams }: { searchParams: Promise<{ empresa?: string }> }) {
  await exigirAdmin();
  const { empresa: empresaId } = await searchParams;
  const [propostas, empresas, empresa] = await Promise.all([
    listarPropostas(),
    consulta<Empresa>("select id, nome, mensalidade, mensalidade_moeda from empresas order by nome"),
    empresaId ? umaLinha<Empresa>("select id, nome, mensalidade, mensalidade_moeda from empresas where id = $1", [Number(empresaId)]) : null,
  ]);

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Propostas</h1>
      <p className="mt-1 text-white/55">
        Preencha o básico do cliente, o valor e a permanência: a proposta sai pronta, com link para o cliente ler e aceitar. No aceite, o contrato é
        gerado sozinho.
      </p>

      <Detalhes key={empresa?.id ?? "novo"} className="painel-cartao mt-6 p-5" inicialAberto={Boolean(empresa) || propostas.length === 0} resumo="+ Nova proposta">
        {empresas.length > 0 && (
          <form className="mt-4 flex flex-wrap items-end gap-2" action="/painel/admin/propostas">
            <label className="min-w-[220px] flex-1">
              <span className="painel-rotulo">Puxar dados de um cliente do painel (opcional)</span>
              <select name="empresa" defaultValue={empresa?.id ?? ""} className="painel-campo">
                <option value="">Cliente novo</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            </label>
            <button className="botao-painel botao-painel-sec">Preencher</button>
          </form>
        )}
        <FormComEstado acao={criarProposta} className="mt-5 max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="painel-rotulo">Título da proposta (opcional)</span>
              <input name="titulo" className="painel-campo" placeholder="Ex.: Proposta de tráfego e automações para vender mais imóveis" />
            </label>
            <label className="sm:col-span-2">
              <span className="painel-rotulo">Objetivo do cliente (opcional, abre a proposta)</span>
              <textarea
                name="objetivo"
                rows={3}
                className="painel-campo"
                placeholder="Ex.: Gerar contatos qualificados para os lançamentos e responder cada lead em segundos no WhatsApp."
              />
            </label>
            <label>
              <span className="painel-rotulo">Validade da proposta (dias)</span>
              <input name="validade_dias" type="number" min={1} max={90} defaultValue={15} className="painel-campo" />
            </label>
          </div>
          <div className="mt-6">
            <CamposComerciais key={empresa?.id ?? "novo"} empresa={empresa} />
          </div>
          <div className="mt-6">
            <BotaoEnviar enviando="Criando...">Criar proposta</BotaoEnviar>
          </div>
        </FormComEstado>
      </Detalhes>

      <div className="painel-cartao mt-4 overflow-x-auto p-2">
        {propostas.length === 0 ? (
          <p className="p-4 text-white/55">Nenhuma proposta ainda.</p>
        ) : (
          <table className="painel-tabela w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor mensal</th>
                <th>Permanência</th>
                <th>Situação</th>
                <th>Criada em</th>
              </tr>
            </thead>
            <tbody>
              {propostas.map((p) => {
                const situacao = propostaVencida(p) && p.status !== "recusada" ? "vencida" : p.status;
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/painel/admin/propostas/${p.id}`} className="font-semibold hover:underline">
                        {p.cliente_nome}
                      </Link>
                      {p.titulo && <span className="block text-xs text-white/45">{p.titulo}</span>}
                    </td>
                    <td>{valorFormatado(p.valor_mensal, p.moeda)}</td>
                    <td>{p.prazo_minimo} meses</td>
                    <td>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs ${COR_STATUS[situacao]}`}>
                        {situacao === "vencida" ? "Vencida" : ROTULO_PROPOSTA[p.status]}
                      </span>
                    </td>
                    <td className="text-white/55">{dataHora(p.criado_em, "pt")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
