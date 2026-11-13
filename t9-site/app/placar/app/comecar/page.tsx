import Link from "next/link";
import type { Metadata } from "next";
import { uma } from "@/lib/placar/banco";
import { exigirAcesso } from "@/lib/placar/conta";
import { tokenDaAgencia } from "@/lib/placar/meta";
import { ConexaoMeta, ConexaoWhatsapp } from "../Conexoes";
import { botao, cartao } from "../../_ui/estilo";

export const metadata: Metadata = { title: "Primeiros passos" };

export default async function Comecar({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { agencia } = await exigirAcesso();
  const { erro } = await searchParams;
  const temCliente = Boolean(await uma("select 1 from placar.clientes where agencia_id = $1", [agencia.id]));
  const meta = Boolean(tokenDaAgencia(agencia));
  const wa = Boolean(agencia.wa_numero);
  const feitos = [meta, wa, temCliente].filter(Boolean).length;
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 pb-16">
      <h1 className="text-3xl font-bold tracking-tight">Vamos deixar tudo pronto</h1>
      <p className="mt-2 text-gray-600">São 3 passos e leva uns 5 minutos.</p>
      <div role="progressbar" aria-label="Progresso da configuração" aria-valuemin={0} aria-valuemax={3} aria-valuenow={feitos} className="mt-5 h-2 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-[#2F5BEA] transition-all" style={{ width: `${(feitos / 3) * 100}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-600">{feitos} de 3 concluído</p>

      <ol className="mt-6 space-y-3">
        <li className={`${cartao} p-5 ${!meta ? "border-2 border-[#2F5BEA]" : ""}`}>
          <ConexaoMeta agencia={agencia} passo={1} erro={erro} />
        </li>
        <li className={`${cartao} p-5 ${meta && !wa ? "border-2 border-[#2F5BEA]" : ""}`}>
          <ConexaoWhatsapp agencia={agencia} passo={2} />
        </li>
        <li className={`${cartao} flex flex-wrap items-start gap-4 p-5 ${meta && wa && !temCliente ? "border-2 border-[#2F5BEA]" : ""}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600" aria-hidden="true">
            3
          </span>
          <div className="min-w-0 flex-[1_1_300px]">
            <h2 className="text-base font-semibold">Adicionar o primeiro cliente</h2>
            <p className="mt-0.5 text-sm text-gray-600">Escolha a conta de anúncio e o WhatsApp dele. Depois é só ligar o relatório.</p>
          </div>
          <Link href="/placar/app/clientes/novo" className={botao}>
            Adicionar cliente
          </Link>
        </li>
      </ol>
      {feitos === 3 && (
        <p className="mt-6">
          <Link href="/placar/app" className={botao}>
            Tudo pronto: ir para os clientes
          </Link>
        </p>
      )}
    </main>
  );
}
