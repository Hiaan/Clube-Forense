import Link from "next/link";
import type { Empresa } from "@/lib/painel/auth";
import { umaLinha } from "@/lib/painel/db";
import { dataHora } from "@/lib/painel/formato";
import { numeroLegivel, numerosDe, ponteConfigurada } from "@/lib/painel/whatsapp";
import { salvarWhatsapp, testarWhatsapp } from "../acoes-whatsapp";
import FormComEstado from "../_ui/FormComEstado";
import { BotaoEnviar } from "../_ui/Botoes";

/** Para quais números do cliente vai cada lead novo de formulário, pelo WhatsApp da T9. */
export default async function SecaoWhatsapp({ empresa }: { empresa: Empresa }) {
  const numeros = numerosDe(empresa.whatsapp_leads);
  const ultimo = numeros.length
    ? await umaLinha<{ criado_em: string; ok: boolean; erro: string | null }>(
        "select criado_em, ok, erro from whatsapp_envios where empresa_id = $1 order by criado_em desc limit 1",
        [empresa.id],
      )
    : null;

  return (
    <section className="painel-cartao mt-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">Leads no WhatsApp do cliente</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${numeros.length ? "bg-emerald-400/15 text-emerald-300" : "bg-white/8 text-white/55"}`}>
          {numeros.length ? "Ligado" : "Desligado"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Cada lead novo dos formulários dos anúncios chega na hora no WhatsApp do cliente, enviado pelo número da T9, com nome, contato, respostas e um
        botão para chamar a pessoa. Ao ligar, os leads que já estão no painel não são reenviados.
      </p>
      {!ponteConfigurada() && (
        <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
          O WhatsApp da T9 ainda não está configurado. Veja em <Link href="/painel/admin/whatsapp" className="underline">WhatsApp</Link>.
        </p>
      )}

      <FormComEstado acao={salvarWhatsapp} className="mt-4">
        <input type="hidden" name="empresa" value={empresa.id} />
        <label className="block max-w-xl">
          <span className="painel-rotulo">WhatsApp que recebe os leads (separe vários por vírgula)</span>
          <input
            name="numeros"
            defaultValue={numeros.map(numeroLegivel).join(", ")}
            placeholder="(83) 99999-9999"
            inputMode="tel"
            autoComplete="off"
            className="painel-campo"
          />
        </label>
        <BotaoEnviar enviando="Salvando..." className="botao-painel mt-4">
          Salvar
        </BotaoEnviar>
      </FormComEstado>

      {numeros.length > 0 && (
        <div className="mt-5 flex flex-wrap items-start justify-between gap-3 border-t border-white/6 pt-4 text-sm text-white/55">
          <p>
            {ultimo
              ? `Último envio em ${dataHora(ultimo.criado_em, "pt")}${ultimo.ok ? "" : ` (falhou: ${ultimo.erro})`}`
              : "Nenhuma mensagem enviada ainda."}
          </p>
          <FormComEstado acao={testarWhatsapp}>
            <input type="hidden" name="empresa" value={empresa.id} />
            <BotaoEnviar enviando="Enviando..." className="botao-painel-sec">
              Enviar mensagem de teste
            </BotaoEnviar>
          </FormComEstado>
        </div>
      )}
    </section>
  );
}
