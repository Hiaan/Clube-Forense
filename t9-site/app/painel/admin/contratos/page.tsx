import Link from "next/link";
import { exigirAdmin } from "@/lib/painel/auth";
import { dadosDaContratada, listarContratos, valorFormatado } from "@/lib/painel/comercial";
import { dataHora } from "@/lib/painel/formato";
import { criarContrato, salvarDadosContratada } from "../../acoes-comercial";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";
import Detalhes from "../../_ui/Detalhes";
import CamposComerciais from "../CamposComerciais";
import { COR_STATUS, ROTULO_CONTRATO } from "../statusComercial";

export default async function Contratos() {
  await exigirAdmin();
  const [contratos, t9] = await Promise.all([listarContratos(), dadosDaContratada()]);
  const t9Incompleta = !t9.documento || !t9.endereco || !t9.representante;

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Contratos</h1>
      <p className="mt-1 text-white/55">
        Contrato de prestação de serviços gerado com os dados do cliente, o valor e a permanência mínima. Revise, envie o link e o cliente assina
        eletronicamente (nome, CPF, data e hora ficam registrados).
      </p>

      {t9Incompleta && (
        <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Preencha os dados da T9 (CNPJ, endereço e quem assina) em &quot;Dados da T9 no contrato&quot; logo abaixo. Sem eles o contrato sai com
          espaços em branco.
        </p>
      )}

      <Detalhes className="painel-cartao mt-6 p-5" inicialAberto={contratos.length === 0 && !t9Incompleta} resumo="+ Novo contrato">
        <p className="mt-2 text-sm text-white/55">
          Se o cliente aceitou uma proposta, o contrato já foi criado com os dados dela. Use este formulário para quem fechou sem proposta.
        </p>
        <FormComEstado acao={criarContrato} className="mt-5 max-w-3xl">
          <CamposComerciais />
          <div className="mt-6">
            <BotaoEnviar enviando="Gerando...">Gerar contrato</BotaoEnviar>
          </div>
        </FormComEstado>
      </Detalhes>

      <Detalhes className="painel-cartao mt-4 p-5" inicialAberto={t9Incompleta} resumo="Dados da T9 no contrato (contratada)">
        <FormComEstado acao={salvarDadosContratada} className="mt-5 max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="painel-rotulo">Razão social</span>
              <input name="razao_social" defaultValue={t9.razao_social} className="painel-campo" />
            </label>
            <label>
              <span className="painel-rotulo">CNPJ</span>
              <input name="documento" defaultValue={t9.documento} className="painel-campo" />
            </label>
            <label className="sm:col-span-2">
              <span className="painel-rotulo">Endereço</span>
              <input name="endereco" defaultValue={t9.endereco} className="painel-campo" />
            </label>
            <label>
              <span className="painel-rotulo">Representante (quem assina pela T9)</span>
              <input name="representante" defaultValue={t9.representante} className="painel-campo" />
            </label>
            <label>
              <span className="painel-rotulo">Foro (cidade/UF)</span>
              <input name="foro" defaultValue={t9.foro} className="painel-campo" placeholder="Ex.: Goiânia/GO" />
            </label>
          </div>
          <div className="mt-5">
            <BotaoEnviar enviando="Salvando...">Salvar dados da T9</BotaoEnviar>
          </div>
        </FormComEstado>
      </Detalhes>

      <div className="painel-cartao mt-4 overflow-x-auto p-2">
        {contratos.length === 0 ? (
          <p className="p-4 text-white/55">Nenhum contrato ainda.</p>
        ) : (
          <table className="painel-tabela w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor mensal</th>
                <th>Permanência</th>
                <th>Situação</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/painel/admin/contratos/${c.id}`} className="font-semibold hover:underline">
                      {c.cliente_nome}
                    </Link>
                  </td>
                  <td>{valorFormatado(c.valor_mensal, c.moeda)}</td>
                  <td>{c.prazo_minimo} meses</td>
                  <td>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${COR_STATUS[c.status]}`}>{ROTULO_CONTRATO[c.status]}</span>
                  </td>
                  <td className="text-white/55">{dataHora(c.criado_em, "pt")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
