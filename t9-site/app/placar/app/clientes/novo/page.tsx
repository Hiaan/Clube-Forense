import Link from "next/link";
import type { Metadata } from "next";
import { exigirAcesso } from "@/lib/placar/conta";
import { contasDaAgencia, tokenDaAgencia } from "@/lib/placar/meta";
import { criarCliente } from "../../../acoes";
import Form from "../../../_ui/Form";
import Enviar from "../../../_ui/Enviar";
import { campo, cartao, link, rotulo } from "../../../_ui/estilo";

export const metadata: Metadata = { title: "Novo cliente" };

export default async function NovoCliente() {
  const { agencia } = await exigirAcesso();
  const conectado = Boolean(tokenDaAgencia(agencia));
  const contas = conectado ? await contasDaAgencia(agencia).catch(() => []) : [];
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 pb-16">
      <Link href="/placar/app" className="text-sm text-gray-600 hover:text-gray-900">
        ← Clientes
      </Link>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight">Novo cliente</h1>
      <Form acao={criarCliente} className={`${cartao} mt-6 space-y-5 p-6`}>
        <label className="block">
          <span className={rotulo}>Nome do cliente</span>
          <input name="nome" required className={campo} placeholder="Ex.: Imobiliária Vieira" />
        </label>
        <label className="block">
          <span className={rotulo}>Conta de anúncio</span>
          {conectado ? (
            <select name="conta" className={campo} defaultValue="">
              <option value="">Escolher depois</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.id.replace("act_", "")}){c.ativa ? "" : " · inativa"}
                </option>
              ))}
            </select>
          ) : (
            <span className="block rounded-[10px] bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
              Conecte o Facebook em{" "}
              <Link href="/placar/app/config" className={link}>
                Configurações
              </Link>{" "}
              para escolher a conta.
            </span>
          )}
        </label>
        <fieldset>
          <legend className={rotulo}>O que o cliente busca nos anúncios</legend>
          <div className="flex flex-wrap gap-3">
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border border-gray-300 px-4 has-[:checked]:border-2 has-[:checked]:border-[#2F5BEA] has-[:checked]:bg-[#EEF2FF]">
              <input type="radio" name="tipo" value="leads" defaultChecked className="accent-[#2F5BEA]" />
              Contatos (leads, mensagens)
            </label>
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border border-gray-300 px-4 has-[:checked]:border-2 has-[:checked]:border-[#2F5BEA] has-[:checked]:bg-[#EEF2FF]">
              <input type="radio" name="tipo" value="ecommerce" className="accent-[#2F5BEA]" />
              Vendas (loja virtual)
            </label>
          </div>
        </fieldset>
        <label className="block">
          <span className={rotulo}>WhatsApp do cliente (quem recebe o relatório)</span>
          <input name="whatsapp" inputMode="tel" className={campo} placeholder="(83) 99999-9999" />
        </label>
        <Enviar enviando="Adicionando...">Adicionar cliente</Enviar>
      </Form>
    </main>
  );
}
