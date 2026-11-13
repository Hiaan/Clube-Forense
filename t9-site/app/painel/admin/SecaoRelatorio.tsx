import Link from "next/link";
import type { Empresa } from "@/lib/painel/auth";
import { dataHora } from "@/lib/painel/formato";
import { numeroLegivel, numerosDe, ponteConfigurada } from "@/lib/painel/whatsapp";
import {
  DIAS_SEMANA,
  FREQUENCIAS,
  FUSOS,
  enviosAutomaticos,
  iaDoRelatorioConfigurada,
  montarRelatorio,
  numerosDoRelatorio,
  type EmpresaRelatorio,
} from "@/lib/painel/relatorioWhatsapp";
import { enviarRelatorioAgora, salvarRelatorio } from "../acoes-relatorio";
import FormComEstado from "../_ui/FormComEstado";
import { BotaoEnviar } from "../_ui/Botoes";

/** Relatório agendado no WhatsApp do cliente, com a análise da IA, e os alertas da conta de anúncios. */
export default async function SecaoRelatorio({ empresa }: { empresa: Empresa }) {
  const destino = numerosDoRelatorio(empresa);
  const [previa, envios] = await Promise.all([
    // Prévia sem IA (não gasta nada a cada visita); no envio, a análise é escrita pela IA.
    montarRelatorio(empresa as EmpresaRelatorio, { comIa: false }).catch(() => null),
    enviosAutomaticos(empresa.id, 6),
  ]);
  const ia = iaDoRelatorioConfigurada();

  return (
    <section className="painel-cartao mt-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">Relatório automático no WhatsApp</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${empresa.rel_ativo ? "bg-emerald-400/15 text-emerald-300" : "bg-white/8 text-white/55"}`}>
          {empresa.rel_ativo ? "Ligado" : "Desligado"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        O cliente recebe no WhatsApp, pelo número da T9, o investimento, os resultados e a comparação com o período anterior, com um comentário curto
        da IA explicando o que aconteceu. Os números são atualizados com a Meta na hora do envio.
      </p>
      {!ponteConfigurada() && (
        <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
          O WhatsApp da T9 ainda não está configurado. Veja em <Link href="/painel/admin/whatsapp" className="underline">WhatsApp</Link>.
        </p>
      )}
      {empresa.meta_conta_alerta && (
        <p className="mt-3 rounded-lg border border-[#ff2d38]/30 bg-[#ff2d38]/10 px-3 py-2 text-sm text-[#ffb3b7]">
          <strong>Conta de anúncios:</strong> {empresa.meta_conta_alerta}
        </p>
      )}

      <FormComEstado acao={salvarRelatorio} className="mt-5">
        <input type="hidden" name="empresa" value={empresa.id} />
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="ativo" defaultChecked={empresa.rel_ativo} className="h-4 w-4 accent-[#ff2d38]" />
          Enviar o relatório automaticamente
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="sm:col-span-2">
            <span className="painel-rotulo">Frequência</span>
            <select name="frequencia" defaultValue={empresa.rel_frequencia} className="painel-campo">
              {Object.entries(FREQUENCIAS).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="painel-rotulo">Dia da semana (semanal)</span>
            <select name="dia_semana" defaultValue={empresa.rel_dia_semana} className="painel-campo">
              {DIAS_SEMANA.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="painel-rotulo">Dia do mês (mensal)</span>
            <input name="dia_mes" type="number" min={1} max={28} defaultValue={empresa.rel_dia_mes} className="painel-campo" />
          </label>
          <label>
            <span className="painel-rotulo">Horário</span>
            <select name="hora" defaultValue={empresa.rel_hora} className="painel-campo">
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="painel-rotulo">Fuso do cliente</span>
            <select name="fuso" defaultValue={empresa.rel_fuso} className="painel-campo">
              {FUSOS.map((f) => (
                <option key={f.valor} value={f.valor}>
                  {f.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="painel-rotulo">WhatsApp que recebe (vírgula entre vários)</span>
            <input
              name="numeros"
              defaultValue={numerosDe(empresa.rel_numeros).map(numeroLegivel).join(", ")}
              placeholder={numerosDe(empresa.whatsapp_leads).length ? `Vazio = ${numerosDe(empresa.whatsapp_leads).map(numeroLegivel).join(", ")} (o dos leads)` : "(83) 99999-9999 ou +1 407 555-1234"}
              inputMode="tel"
              autoComplete="off"
              className="painel-campo"
            />
          </label>
        </div>
        <div className="mt-4 space-y-2 text-sm text-white/75">
          <label className="flex items-start gap-3">
            <input type="checkbox" name="ia" defaultChecked={empresa.rel_ia} className="mt-0.5 h-4 w-4 accent-[#ff2d38]" />
            <span>
              Incluir a análise da IA
              {!ia && <span className="block text-xs text-amber-200">A chave da Anthropic ainda não está na Vercel: até lá, vai um comentário automático simples.</span>}
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="alertas_cliente" defaultChecked={empresa.alertas_cliente} className="mt-0.5 h-4 w-4 accent-[#ff2d38]" />
            <span>
              Avisar o cliente também quando o pagamento da conta de anúncios for recusado ou o saldo estiver acabando
              <span className="block text-xs text-white/45">A equipe T9 recebe esses alertas sempre (configure os números em WhatsApp).</span>
            </span>
          </label>
        </div>
        <BotaoEnviar enviando="Salvando..." className="botao-painel mt-5">
          Salvar
        </BotaoEnviar>
      </FormComEstado>

      {previa && (
        <details className="mt-5 border-t border-white/6 pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-white/80">Ver como fica a mensagem</summary>
          <pre className="mt-3 max-w-xl rounded-xl bg-[#0b141a] p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-[#e9edef]">{previa.texto}</pre>
          <p className="mt-2 text-xs text-white/45">Na prévia vai o comentário automático; no envio, a análise é escrita pela IA.</p>
        </details>
      )}

      <div className="mt-5 grid gap-3 border-t border-white/6 pt-4 sm:grid-cols-2">
        <FormComEstado acao={enviarRelatorioAgora}>
          <input type="hidden" name="empresa" value={empresa.id} />
          <input type="hidden" name="destino" value="eu" />
          <span className="painel-rotulo">Testar no seu WhatsApp</span>
          <div className="flex flex-wrap gap-2">
            <input name="meu_numero" placeholder="Seu número" inputMode="tel" autoComplete="tel" className="painel-campo !min-h-[42px] min-w-0 flex-1" />
            <BotaoEnviar enviando="Enviando..." className="botao-painel botao-painel-sec">
              Mandar prévia
            </BotaoEnviar>
          </div>
        </FormComEstado>
        {destino.length > 0 && (
          <FormComEstado acao={enviarRelatorioAgora}>
            <input type="hidden" name="empresa" value={empresa.id} />
            <input type="hidden" name="destino" value="cliente" />
            <span className="painel-rotulo">Mandar agora para o cliente</span>
            <BotaoEnviar
              enviando="Enviando..."
              className="botao-painel botao-painel-sec"
              confirmar={`Enviar o relatório agora para ${destino.map(numeroLegivel).join(", ")}?`}
            >
              Enviar para {destino.map(numeroLegivel).join(", ")}
            </BotaoEnviar>
          </FormComEstado>
        )}
      </div>

      {envios.length > 0 && (
        <div className="mt-5 border-t border-white/6 pt-4">
          <p className="painel-rotulo">Últimos envios automáticos</p>
          <ul className="space-y-1.5 text-sm">
            {envios.map((v) => (
              <li key={v.id} className="flex flex-wrap gap-x-2 text-white/65">
                <span className={v.ok === false ? "text-[#ffb3b7]" : v.ok ? "text-emerald-300" : "text-white/45"}>{v.ok === false ? "✕" : v.ok ? "✓" : "…"}</span>
                <span>{dataHora(v.criado_em, "pt")}</span>
                <span className="text-white/45">
                  {v.tipo === "relatorio" ? "Relatório" : "Alerta"} para {v.destino === "equipe" ? "a equipe" : "o cliente"}
                </span>
                {v.erro && <span className="text-[#ffb3b7]">({v.erro})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
