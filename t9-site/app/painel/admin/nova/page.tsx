import { exigirAdmin } from "@/lib/painel/auth";
import { criarEmpresa } from "../acoes";
import CamposEmpresa from "../CamposEmpresa";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";

export default async function NovoCliente() {
  await exigirAdmin();
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Novo cliente</h1>
      <p className="mt-1 text-white/55">O plano de 4 semanas é criado com os itens padrão, no idioma escolhido. Dá para editar depois.</p>
      <FormComEstado acao={criarEmpresa} className="painel-cartao mt-6 p-6">
        <CamposEmpresa />
        <BotaoEnviar enviando="Criando..." className="botao-painel mt-6">
          Criar cliente
        </BotaoEnviar>
      </FormComEstado>
    </div>
  );
}
