import type { Empresa } from "@/lib/painel/auth";
import { dataHora } from "@/lib/painel/formato";
import { listarContasDeAnuncio, metaConfigurado, type ContaAnuncio } from "@/lib/painel/meta";
import { sincronizarMetaAgora, vincularContaMeta } from "../acoes-meta";
import FormComEstado from "../_ui/FormComEstado";
import { BotaoEnviar } from "../_ui/Botoes";

/** Vínculo do cliente com a conta de anúncio da Meta, status e "atualizar agora". */
export default async function SecaoMeta({ empresa }: { empresa: Empresa }) {
  const configurado = metaConfigurado();
  let contas: ContaAnuncio[] = [];
  let erroContas: string | null = null;
  if (configurado) {
    try {
      contas = await listarContasDeAnuncio();
    } catch (erro) {
      erroContas = erro instanceof Error ? erro.message : String(erro);
    }
  }
  const vinculada = contas.find((c) => c.id === empresa.meta_conta);

  return (
    <section className="painel-cartao mt-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">Meta Ads (automático)</h2>
        {empresa.meta_conta ? (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${empresa.meta_erro ? "bg-[#ff2d38]/15 text-[#ff9aa0]" : "bg-emerald-400/15 text-emerald-300"}`}>
            {empresa.meta_erro ? "Erro na sincronização" : "Conectado"}
          </span>
        ) : (
          <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-white/55">Não conectado</span>
        )}
      </div>

      {!configurado && (
        <p className="mt-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Falta o token da Meta na Vercel (<code>META_ACCESS_TOKEN</code>). Você já pode vincular o ID da conta; os dados começam a entrar assim que o token
          for configurado.
        </p>
      )}
      {erroContas && (
        <p className="mt-2 rounded-xl border border-[#ff2d38]/30 bg-[#ff2d38]/10 px-4 py-3 text-sm text-[#ffb3b7]">
          Não consegui listar as contas de anúncio: {erroContas}
        </p>
      )}

      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Com a conta vinculada, o painel puxa sozinho investimento, impressões, cliques, leads (cadastros + conversas iniciadas no WhatsApp/Direct),
        compras e receita, por dia e campanha, e os anúncios que estão gastando viram cartões na aba Criativos. Atualiza todo dia às 6h (Brasília) e quando
        você clicar em &quot;Atualizar agora&quot;.
      </p>

      <FormComEstado acao={vincularContaMeta} className="mt-4">
        <input type="hidden" name="empresa" value={empresa.id} />
        <label className="block">
          <span className="painel-rotulo">Conta de anúncio</span>
          <div className="flex flex-wrap gap-3">
            <input
              name="conta"
              list={`contas-meta-${empresa.id}`}
              defaultValue={empresa.meta_conta ?? ""}
              placeholder={contas.length ? "Escolha ou digite o ID (act_...)" : "act_123456789"}
              className="painel-campo max-w-md flex-1"
              autoComplete="off"
            />
            <BotaoEnviar enviando="Conectando..." className="botao-painel">
              {empresa.meta_conta ? "Salvar" : "Conectar"}
            </BotaoEnviar>
          </div>
          {contas.length > 0 && (
            <datalist id={`contas-meta-${empresa.id}`}>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} · {c.moeda}
                  {c.ativa ? "" : " (inativa)"}
                </option>
              ))}
            </datalist>
          )}
        </label>
        <p className="mt-2 text-xs text-white/40">
          {contas.length > 0
            ? `${contas.length} conta(s) disponíveis no Business Manager. Deixe vazio e salve para desconectar.`
            : "O ID fica no Gerenciador de Anúncios, no seletor de contas (o número depois de act=). Deixe vazio e salve para desconectar."}
        </p>
      </FormComEstado>

      {empresa.meta_conta && (
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-white/6 pt-4 text-sm">
          <div className="text-white/60">
            <p>
              Conta: <span className="text-white">{vinculada ? `${vinculada.nome} (${empresa.meta_conta})` : empresa.meta_conta}</span>
            </p>
            <p className="mt-0.5">
              Última atualização: {empresa.meta_sincronizado_em ? dataHora(empresa.meta_sincronizado_em, "pt") : "ainda não sincronizou"}
            </p>
            {empresa.meta_erro && <p className="mt-1 text-[#ff9aa0]">Último erro: {empresa.meta_erro}</p>}
            {empresa.meta_leads_aviso && <p className="mt-1 text-amber-200">{empresa.meta_leads_aviso}</p>}
          </div>
          {configurado && (
            <FormComEstado acao={sincronizarMetaAgora} className="max-w-md">
              <input type="hidden" name="empresa" value={empresa.id} />
              <BotaoEnviar enviando="Atualizando..." className="botao-painel botao-painel-sec">
                Atualizar agora
              </BotaoEnviar>
            </FormComEstado>
          )}
        </div>
      )}
    </section>
  );
}
