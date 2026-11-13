import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { numeroLegivel, numerosDe } from "@/lib/painel/whatsapp";
import { DIAS_SEMANA, FREQUENCIAS, FUSOS, METRICAS, metricasDe } from "@/lib/painel/relatorioWhatsapp";
import { uma, type Cliente } from "@/lib/placar/banco";
import { exigirAcesso } from "@/lib/placar/conta";
import { contasDaAgencia, tokenDaAgencia } from "@/lib/placar/meta";
import { enviosDoCliente, linkDoPainel, montarRelatorio } from "@/lib/placar/relatorio";
import { atualizarAgora, enviarRelatorioAgora, excluirCliente, salvarCliente, salvarRelatorio } from "../../../acoes";
import Painel, { PERIODOS, type ChavePeriodo } from "../../../_ui/Painel";
import Form from "../../../_ui/Form";
import Enviar from "../../../_ui/Enviar";
import CopiarLink from "../../../_ui/CopiarLink";
import { botao, botaoSec, campo, cartao, link, rotulo } from "../../../_ui/estilo";

export const metadata: Metadata = { title: "Cliente" };

const chip =
  "flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border border-gray-300 bg-white px-4 text-[15px] has-[:checked]:border-2 has-[:checked]:border-[#2F5BEA] has-[:checked]:bg-[#EEF2FF] has-[:checked]:font-semibold has-[:checked]:text-[#1E40C4] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-[#2F5BEA]/30";
const pilula =
  "flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 text-sm text-gray-700 has-[:checked]:border-2 has-[:checked]:border-[#2F5BEA] has-[:checked]:bg-[#EEF2FF] has-[:checked]:font-semibold has-[:checked]:text-[#1E40C4] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-[#2F5BEA]/30";
const Passo = ({ n, titulo }: { n: number; titulo: string }) => (
  <h3 className="flex items-center gap-2.5 text-base font-bold">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2F5BEA] text-[13px] text-white" aria-hidden="true">
      {n}
    </span>
    {titulo}
  </h3>
);

export default async function PaginaCliente({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ p?: string; novo?: string }> }) {
  const { agencia } = await exigirAcesso();
  const c = await uma<Cliente>("select * from placar.clientes where id = $1 and agencia_id = $2", [Number((await params).id), agencia.id]);
  if (!c) notFound();
  const { p, novo } = await searchParams;
  const periodo = (p && p in PERIODOS ? p : "7") as ChavePeriodo;
  const [previa, envios, contas] = await Promise.all([
    montarRelatorio(c, agencia, { comIa: false }).catch(() => null),
    enviosDoCliente(c.id),
    tokenDaAgencia(agencia) ? contasDaAgencia(agencia).catch(() => []) : Promise.resolve([]),
  ]);
  const escolhidas = new Set(metricasDe(c));
  const numeros = numerosDe(c.whatsapp);
  const base = `/placar/app/clientes/${c.id}`;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 pb-16">
      <Link href="/placar/app" className="text-sm text-gray-600 hover:text-gray-900">
        ← Clientes
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold tracking-tight">{c.nome}</h1>
        <div className="flex flex-wrap gap-2">
          <a href={linkDoPainel(c)} target="_blank" rel="noopener" className={botaoSec}>
            Painel do cliente ↗
          </a>
          {c.meta_conta && (
            <form action={atualizarAgora}>
              <input type="hidden" name="cliente" value={c.id} />
              <Enviar enviando="Atualizando..." className={botaoSec}>
                Atualizar números
              </Enviar>
            </form>
          )}
        </div>
      </div>
      {novo && <p className="mt-4 rounded-[10px] bg-green-50 px-4 py-3 text-sm text-green-800">Cliente adicionado. Agora é só ligar o relatório lá embaixo.</p>}
      {!c.meta_conta && (
        <p className="mt-4 rounded-[10px] bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sem conta de anúncio ligada. Escolha a conta em <a href="#dados" className="font-semibold underline">Dados do cliente</a>.
        </p>
      )}
      {(c.conta_alerta || c.erro_meta) && <p className="mt-4 rounded-[10px] bg-red-50 px-4 py-3 text-sm text-red-800">{c.conta_alerta ?? c.erro_meta}</p>}

      <div className="mt-6">
        <Painel cliente={c} periodo={periodo} base={base} />
      </div>

      <section id="relatorio" aria-labelledby="t-rel" className="mt-10">
        <h2 id="t-rel" className="text-xl font-bold tracking-tight">
          Relatório no WhatsApp
        </h2>
        <p className="mt-1 text-[15px] text-gray-600">Três escolhas e pronto. A prévia ao lado mostra como a mensagem chega.</p>
        <div className="mt-4 flex flex-wrap items-start gap-6">
          <Form acao={salvarRelatorio} className="min-w-0 flex-[999_1_520px] space-y-4">
            <input type="hidden" name="cliente" value={c.id} />
            <div className={`${cartao} p-5`}>
              <Passo n={1} titulo="Quando enviar" />
              <div role="radiogroup" aria-label="Frequência" className="mt-3.5 flex flex-wrap gap-2">
                {Object.entries(FREQUENCIAS).map(([valor, texto]) => (
                  <label key={valor} className={chip}>
                    <input type="radio" name="frequencia" value={valor} defaultChecked={c.rel_frequencia === valor} className="sr-only" />
                    {texto.split(" (")[0]}
                  </label>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <label>
                  <span className={rotulo}>Dia (semanal)</span>
                  <select name="dia_semana" defaultValue={c.rel_dia_semana} className={campo}>
                    {DIAS_SEMANA.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={rotulo}>Dia (mensal)</span>
                  <input name="dia_mes" type="number" min={1} max={28} defaultValue={c.rel_dia_mes} className={campo} />
                </label>
                <label>
                  <span className={rotulo}>Horário</span>
                  <select name="hora" defaultValue={c.rel_hora} className={campo}>
                    {Array.from({ length: 24 }, (_, h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={rotulo}>Fuso</span>
                  <select name="fuso" defaultValue={c.rel_fuso} className={campo}>
                    {FUSOS.map((f) => (
                      <option key={f.valor} value={f.valor}>
                        {f.rotulo}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className={`${cartao} p-5`}>
              <Passo n={2} titulo="Para quem" />
              <p className="mt-3 text-[15px]">
                {numeros.length ? numeros.map(numeroLegivel).join(", ") : "Nenhum WhatsApp cadastrado."}{" "}
                <a href="#dados" className={link}>
                  {numeros.length ? "Trocar" : "Cadastrar"}
                </a>
              </p>
              <p className="mt-1 text-[13px] text-gray-500">
                {agencia.wa_numero ? `Sai do seu número: ${numeroLegivel(agencia.wa_numero)}.` : "Conecte o seu WhatsApp em Configurações para os envios saírem."}
              </p>
            </div>

            <div className={`${cartao} p-5`}>
              <Passo n={3} titulo="O que mostrar" />
              <div className="mt-3.5 flex flex-wrap gap-2">
                {METRICAS.map((m) => (
                  <label key={m.id} className={pilula}>
                    <input type="checkbox" name="metricas" value={m.id} defaultChecked={escolhidas.has(m.id)} className="sr-only" />
                    {m.rotulo}
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-[15px]">
                <label className="flex items-start justify-between gap-4">
                  <span>
                    <span className="font-semibold">Comentário da IA</span>
                    <span className="block text-[13px] text-gray-500">Explica o resultado em linguagem simples.</span>
                  </span>
                  <input type="checkbox" name="ia" defaultChecked={c.rel_ia} className="mt-1 h-5 w-5 accent-[#2F5BEA]" />
                </label>
                <label className="flex items-start justify-between gap-4">
                  <span>
                    <span className="font-semibold">Avisar o cliente sobre pagamento e saldo</span>
                    <span className="block text-[13px] text-gray-500">Quando o cartão for recusado ou o saldo estiver acabando. Você recebe sempre.</span>
                  </span>
                  <input type="checkbox" name="alertas_cliente" defaultChecked={c.alertas_cliente} className="mt-1 h-5 w-5 accent-[#2F5BEA]" />
                </label>
              </div>
              <details className="mt-4 border-t border-gray-100 pt-4">
                <summary className={`${link} cursor-pointer text-[15px]`}>Personalizar textos</summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className={rotulo}>Abertura</span>
                    <textarea name="abertura" rows={3} defaultValue={c.rel_abertura ?? ""} className={`${campo} py-2.5`} placeholder="Bom dia! Segue o resumo da {empresa} de {periodo}:" />
                  </label>
                  <label>
                    <span className={rotulo}>Fechamento</span>
                    <textarea name="fechamento" rows={3} defaultValue={c.rel_fechamento ?? ""} className={`${campo} py-2.5`} placeholder="Qualquer dúvida, me chama aqui." />
                  </label>
                  <label className="sm:col-span-2">
                    <span className={rotulo}>Instrução para a IA (tom, foco)</span>
                    <input name="instrucao" defaultValue={c.rel_instrucao ?? ""} className={campo} placeholder="Ex.: foque no custo por contato e use um tom animado." />
                  </label>
                  <p className="-mt-2 text-[13px] text-gray-500 sm:col-span-2">
                    {"{empresa}"} vira o nome do cliente e {"{periodo}"} as datas do relatório.
                  </p>
                  <label className="flex items-center gap-2.5 text-[15px]">
                    <input type="checkbox" name="destaque" defaultChecked={c.rel_destaque} className="h-4 w-4 accent-[#2F5BEA]" />
                    Mostrar a campanha destaque
                  </label>
                  <label className="flex items-center gap-2.5 text-[15px]">
                    <input type="checkbox" name="link" defaultChecked={c.rel_link} className="h-4 w-4 accent-[#2F5BEA]" />
                    Mostrar o link do painel
                  </label>
                </div>
              </details>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2.5 text-[15px] font-semibold">
                <input type="checkbox" name="ativo" defaultChecked={c.rel_ativo} className="h-5 w-5 accent-[#2F5BEA]" />
                Enviar automaticamente
              </label>
              <Enviar enviando="Salvando...">Salvar relatório</Enviar>
            </div>
          </Form>

          <aside aria-label="Prévia da mensagem" className="w-full flex-[1_1_320px] rounded-[18px] border border-gray-200 bg-[#EFEAE2] p-4 lg:max-w-[400px]">
            <p className="mb-2.5 text-xs font-semibold tracking-wider text-gray-600 uppercase">Prévia no WhatsApp</p>
            <div className="rounded-[10px] bg-white px-3.5 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm">{previa?.texto ?? "Sem dados ainda."}</div>
            <p className="mt-2 text-xs text-gray-600">Na prévia vai o comentário automático; no envio, o da IA. Salve para atualizar.</p>
            <Form acao={enviarRelatorioAgora} className="mt-4 border-t border-black/10 pt-4">
              <input type="hidden" name="cliente" value={c.id} />
              <input type="hidden" name="destino" value="eu" />
              <span className={rotulo}>Testar no seu WhatsApp</span>
              <div className="flex gap-2">
                <input name="meu_numero" inputMode="tel" placeholder="Seu número" aria-label="Seu número" className={`${campo} min-w-0 flex-1`} />
                <Enviar enviando="..." className={botaoSec}>
                  Enviar
                </Enviar>
              </div>
            </Form>
            {numeros.length > 0 && (
              <Form acao={enviarRelatorioAgora} className="mt-3">
                <input type="hidden" name="cliente" value={c.id} />
                <input type="hidden" name="destino" value="cliente" />
                <Enviar enviando="Enviando..." className={`${botao} w-full`} confirmar={`Enviar agora para ${numeros.map(numeroLegivel).join(", ")}?`}>
                  Enviar agora para o cliente
                </Enviar>
              </Form>
            )}
          </aside>
        </div>
      </section>

      <section aria-labelledby="t-link" className={`${cartao} mt-8 p-5`}>
        <h2 id="t-link" className="text-base font-bold">
          Link do painel do cliente
        </h2>
        <p className="mt-0.5 mb-3 text-sm text-gray-600">O cliente abre sem login, com a sua marca. Mande pelo WhatsApp ou deixe na bio.</p>
        <CopiarLink link={linkDoPainel(c)} />
      </section>

      <section id="dados" aria-labelledby="t-dados" className={`${cartao} mt-4 p-5`}>
        <h2 id="t-dados" className="text-base font-bold">
          Dados do cliente
        </h2>
        <Form acao={salvarCliente} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="cliente" value={c.id} />
          <label>
            <span className={rotulo}>Nome</span>
            <input name="nome" required defaultValue={c.nome} className={campo} />
          </label>
          <label>
            <span className={rotulo}>WhatsApp do cliente (vírgula entre vários)</span>
            <input name="whatsapp" defaultValue={numeros.map(numeroLegivel).join(", ")} inputMode="tel" className={campo} />
          </label>
          <label>
            <span className={rotulo}>Conta de anúncio</span>
            <select name="conta" defaultValue={c.meta_conta ?? ""} className={campo}>
              <option value="">Nenhuma</option>
              {c.meta_conta && !contas.some((x) => x.id === c.meta_conta) && <option value={c.meta_conta}>{c.meta_conta}</option>}
              {contas.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nome} ({x.id.replace("act_", "")})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={rotulo}>Tipo</span>
            <select name="tipo" defaultValue={c.tipo} className={campo}>
              <option value="leads">Contatos (leads, mensagens)</option>
              <option value="ecommerce">Vendas (loja virtual)</option>
            </select>
          </label>
          <label>
            <span className={rotulo}>Meta de contatos no mês</span>
            <input name="meta_leads" inputMode="numeric" defaultValue={c.meta_leads ?? ""} className={campo} />
          </label>
          <label>
            <span className={rotulo}>Investimento previsto no mês</span>
            <input name="meta_investimento" inputMode="decimal" defaultValue={c.meta_investimento ?? ""} className={campo} />
          </label>
          <input type="hidden" name="meta_cpl" value={c.meta_cpl ?? ""} />
          <div className="sm:col-span-2">
            <Enviar enviando="Salvando...">Salvar dados</Enviar>
          </div>
        </Form>
        <form action={excluirCliente} className="mt-6 border-t border-gray-100 pt-4">
          <input type="hidden" name="cliente" value={c.id} />
          <Enviar className="text-sm font-medium text-red-700 hover:text-red-900" confirmar={`Excluir ${c.nome}? Os números e os relatórios dele somem.`}>
            Excluir cliente
          </Enviar>
        </form>
      </section>

      {envios.length > 0 && (
        <section aria-labelledby="t-env" className={`${cartao} mt-4 p-5`}>
          <h2 id="t-env" className="text-base font-bold">
            Últimos envios
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {envios.map((v) => (
              <li key={v.id} className="flex flex-wrap gap-x-2 text-gray-700">
                <span className={v.ok === false ? "text-red-700" : v.ok ? "text-green-700" : "text-gray-400"}>{v.ok === false ? "✕" : v.ok ? "✓" : "…"}</span>
                <span>{new Date(v.criado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</span>
                <span className="text-gray-500">
                  {v.tipo === "relatorio" ? "Relatório" : "Alerta"} para {v.destino === "equipe" ? "você" : "o cliente"}
                </span>
                {v.erro && <span className="text-red-700">({v.erro})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
