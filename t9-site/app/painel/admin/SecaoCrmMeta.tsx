import type { Empresa } from "@/lib/painel/auth";
import { dataHora } from "@/lib/painel/formato";
import { etapasDaEmpresa, resumoEnvios } from "@/lib/painel/crm";
import { listarConjuntosDeDados, metaConfigurado } from "@/lib/painel/meta";
import { enviarPendentesAgora, salvarConjuntoDeDados } from "../acoes-crm";
import FormComEstado from "../_ui/FormComEstado";
import { BotaoEnviar } from "../_ui/Botoes";

/** Liga o CRM do cliente à Meta: cada mudança de etapa vira um evento no conjunto de dados (pixel). */
export default async function SecaoCrmMeta({ empresa }: { empresa: Empresa }) {
  const [etapas, resumo] = await Promise.all([etapasDaEmpresa(empresa.id, empresa.idioma), resumoEnvios(empresa.id)]);
  let conjuntos: { id: string; nome: string }[] = [];
  if (metaConfigurado() && empresa.meta_conta) {
    conjuntos = await listarConjuntosDeDados(empresa.meta_conta).catch(() => []);
  }
  const comMeta = etapas.filter((e) => e.evento_meta);
  const ligado = Boolean(empresa.meta_dataset);

  return (
    <section className="painel-cartao mt-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">CRM → Meta (leads qualificados)</h2>
        {ligado ? (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${empresa.meta_dataset_erro ? "bg-[#ff2d38]/15 text-[#ff9aa0]" : "bg-emerald-400/15 text-emerald-300"}`}>
            {empresa.meta_dataset_erro ? "Erro no envio" : "Enviando"}
          </span>
        ) : (
          <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-white/55">Desligado</span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Quando o cliente move um lead no quadro (aba Leads) para uma etapa marcada com &quot;Meta&quot;, o painel avisa a Meta pela API de Conversões, com o
        nome da etapa. Depois, no Gerenciador de Eventos, dá para usar essas etapas para otimizar a campanha por lead qualificado (ex.: &quot;Visita
        agendada&quot; ou &quot;Vendeu&quot;) e criar públicos de quem comprou. Leads do formulário da Meta são reconhecidos pelo id; os outros, por e-mail e
        telefone (enviados com hash).
      </p>
      <p className="mt-2 text-sm text-white/55">
        Etapas que avisam a Meta:{" "}
        <span className="text-white">{comMeta.length ? comMeta.map((e) => `${e.nome} (evento "${e.evento_meta}")`).join(", ") : "nenhuma"}</span>
      </p>

      <FormComEstado acao={salvarConjuntoDeDados} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="empresa" value={empresa.id} />
        <label>
          <span className="painel-rotulo">Conjunto de dados (pixel)</span>
          <input
            name="dataset"
            list={`conjuntos-${empresa.id}`}
            defaultValue={empresa.meta_dataset ?? ""}
            placeholder="ID do conjunto de dados"
            className="painel-campo"
            autoComplete="off"
            inputMode="numeric"
          />
          {conjuntos.length > 0 && (
            <datalist id={`conjuntos-${empresa.id}`}>
              {conjuntos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </datalist>
          )}
          <span className="mt-1 block text-xs text-white/40">
            {conjuntos.length ? `${conjuntos.length} conjunto(s) na conta de anúncio. ` : ""}Deixe vazio e salve para desligar.
          </span>
        </label>
        <label>
          <span className="painel-rotulo">Token do conjunto de dados (opcional)</span>
          <input
            name="token"
            type="password"
            autoComplete="off"
            placeholder={empresa.meta_dataset_token ? "Token salvo (cole outro para trocar)" : "Vazio = usa o token da T9"}
            className="painel-campo"
          />
          <span className="mt-1 block text-xs text-white/40">
            Só se o pixel não estiver atribuído ao usuário do sistema da T9. Gere em Gerenciador de Eventos → Configurações → API de Conversões.
          </span>
          {empresa.meta_dataset_token && (
            <span className="mt-2 flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" name="apagar_token" className="size-4 accent-[#ff2d38]" /> Apagar o token salvo e usar o da T9
            </span>
          )}
        </label>
        <div className="sm:col-span-2">
          <BotaoEnviar enviando="Conferindo com a Meta..." className="botao-painel">
            {ligado ? "Salvar" : "Ligar"}
          </BotaoEnviar>
        </div>
      </FormComEstado>

      {ligado && (
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-white/6 pt-4 text-sm">
          <div className="text-white/60">
            <p>
              Enviados nos últimos 7 dias: <span className="text-white">{resumo.enviados7d}</span> · aguardando: {resumo.pendentes} · sem envio: {resumo.falhas}
            </p>
            <p className="mt-0.5">Último envio: {resumo.ultimoEnvio ? dataHora(resumo.ultimoEnvio, "pt") : "ainda nenhum"}</p>
            {empresa.meta_dataset_erro && <p className="mt-1 text-[#ff9aa0]">Último erro: {empresa.meta_dataset_erro}</p>}
            {!empresa.meta_dataset_erro && resumo.ultimoErro && <p className="mt-1 text-amber-200">{resumo.ultimoErro}</p>}
          </div>
          <FormComEstado acao={enviarPendentesAgora} className="max-w-md">
            <input type="hidden" name="empresa" value={empresa.id} />
            <BotaoEnviar enviando="Enviando..." className="botao-painel botao-painel-sec">
              Enviar pendentes agora
            </BotaoEnviar>
          </FormComEstado>
        </div>
      )}
    </section>
  );
}
