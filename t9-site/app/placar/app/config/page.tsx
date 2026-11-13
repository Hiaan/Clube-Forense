import type { Metadata } from "next";
import { numeroLegivel, numerosDe } from "@/lib/painel/whatsapp";
import { exigirAcesso } from "@/lib/placar/conta";
import { salvarAgencia } from "../../acoes";
import { ConexaoMeta, ConexaoWhatsapp } from "../Conexoes";
import Form from "../../_ui/Form";
import Enviar from "../../_ui/Enviar";
import { campo, cartao, rotulo } from "../../_ui/estilo";

export const metadata: Metadata = { title: "Configurações" };

export default async function Config() {
  const { agencia } = await exigirAcesso();
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-5 py-8 pb-16">
      <h1 className="text-[28px] font-bold tracking-tight">Configurações</h1>
      <section className={`${cartao} p-5`}>
        <ConexaoMeta agencia={agencia} />
      </section>
      <section className={`${cartao} p-5`}>
        <ConexaoWhatsapp agencia={agencia} />
      </section>
      <section aria-labelledby="marca" className={`${cartao} p-5`}>
        <h2 id="marca" className="text-base font-semibold">
          Sua marca e os alertas
        </h2>
        <p className="mt-0.5 text-sm text-gray-600">O nome, o logo e a cor aparecem no painel que o seu cliente abre.</p>
        <Form acao={salvarAgencia} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={rotulo}>Nome da agência</span>
            <input name="nome" required defaultValue={agencia.nome} className={campo} />
          </label>
          <label>
            <span className={rotulo}>Logo (PNG, JPG ou WEBP, até 1 MB)</span>
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" className={`${campo} py-2`} />
          </label>
          <label>
            <span className={rotulo}>Cor da marca</span>
            <input name="cor" type="color" defaultValue={agencia.cor} className="h-11 w-full cursor-pointer rounded-[10px] border border-gray-300 bg-white p-1" />
          </label>
          {agencia.logo && (
            // eslint-disable-next-line @next/next/no-img-element -- logo servido pela rota da agência
            <img src={`/placar/marca/${agencia.id}`} alt={`Logo atual de ${agencia.nome}`} className="h-12 w-auto self-center rounded sm:col-span-2" />
          )}
          <label className="sm:col-span-2">
            <span className={rotulo}>WhatsApp da equipe que recebe os alertas (vírgula entre vários)</span>
            <input
              name="alertas"
              defaultValue={numerosDe(agencia.alertas_numeros).map(numeroLegivel).join(", ")}
              inputMode="tel"
              placeholder="Vazio: os alertas vão para o seu e-mail"
              className={campo}
            />
          </label>
          <div className="sm:col-span-2">
            <Enviar enviando="Salvando...">Salvar</Enviar>
          </div>
        </Form>
      </section>
    </main>
  );
}
