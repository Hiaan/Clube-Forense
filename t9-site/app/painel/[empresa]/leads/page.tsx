import Link from "next/link";
import { contagemPorEtapa, listarLeads, type Lead } from "@/lib/painel/dados";
import { dataHora, dinheiro, fusoDe, numero, respostaNoFuso } from "@/lib/painel/formato";
import { etapaDoLead, etapasDaEmpresa, type Etapa } from "@/lib/painel/crm";
import { fmt } from "@/lib/i18n";
import { SelectAutoEnvio } from "../../_ui/Botoes";
import { contextoEmpresa } from "../contexto";
import { mostrarEdicao } from "@/lib/painel/auth";
import { numerosDe } from "@/lib/painel/whatsapp";
import { enviarLeadManual, importarCsvLeads } from "../../acoes-whatsapp";
import { criarEtapa, excluirEtapa, moverLeadForm, reordenarEtapa, salvarEtapa } from "../../acoes-crm";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";
import EnviarLeadWhatsapp from "../../_ui/EnviarLeadWhatsapp";
import QuadroCrm, { type CartaoLead } from "../../_ui/QuadroCrm";

const soDigitos = (s: string) => s.replace(/\D/g, "");
const BASICOS = new Set(["full_name", "first_name", "last_name", "email", "phone_number", "nome", "telefone", "whatsapp"]);

/** Respostas extras do formulário da Meta (além de nome, e-mail e telefone). */
function respostasExtras(dados: Lead["dados"], fuso: string): [string, string][] {
  const respostas = (dados?.respostas ?? null) as Record<string, string> | null;
  if (!respostas) return [];
  return Object.entries(respostas)
    .filter(([k, v]) => !BASICOS.has(k) && v)
    .map(([k, v]) => [k.replace(/_/g, " "), respostaNoFuso(String(v), fuso)]);
}

export default async function Leads({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<{ etapa?: string; ver?: string }>;
}) {
  const { usuario, empresa, idioma, t } = await contextoEmpresa(params);
  const tc = t.leads.crm;
  // Horários no fuso do cliente (um cliente na Flórida vê a hora da Flórida).
  const fuso = fusoDe(empresa);
  // Envio manual para o WhatsApp do cliente e importação de CSV: só a equipe.
  const equipe = await mostrarEdicao(usuario);
  const whatsapp = equipe && numerosDe(empresa.whatsapp_leads).length > 0;
  const busca = await searchParams;
  const lista = busca.ver === "lista";
  const base = `/painel/${empresa.slug}/leads`;

  const etapas = await etapasDaEmpresa(empresa.id, empresa.idioma);
  const filtro = lista ? etapas.find((e) => e.id === Number(busca.etapa)) : undefined;
  const [leads, contagem] = await Promise.all([
    listarLeads(empresa.id, filtro ? { id: filtro.id, primeira: filtro.id === etapas[0]?.id } : undefined, lista ? 300 : 1500),
    contagemPorEtapa(empresa.id),
  ]);
  const totalDa = (e: Etapa) => (contagem.get(e.id) ?? 0) + (e.id === etapas[0]?.id ? (contagem.get(null) ?? 0) : 0);
  const total = [...contagem.values()].reduce((a, b) => a + b, 0);
  const algumaMeta = etapas.some((e) => e.evento_meta);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.leads.titulo}</h1>
          <p className="mt-1 text-white/55">{tc.subtitulo}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label={t.leads.titulo} className="flex rounded-full border border-white/10 p-1 text-sm">
            {[
              { href: base, rotulo: tc.quadro, ativo: !lista },
              { href: `${base}?ver=lista`, rotulo: tc.lista, ativo: lista },
            ].map((v) => (
              <Link
                key={v.rotulo}
                href={v.href}
                aria-current={v.ativo ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 ${v.ativo ? "bg-white/12 font-medium text-white" : "text-white/55 hover:text-white"}`}
              >
                {v.rotulo}
              </Link>
            ))}
          </nav>
          {total > 0 && (
            <a href={`/painel/${empresa.slug}/exportar/leads`} download className="botao-painel botao-painel-sec">
              ↓ {t.extra.baixarCsv}
            </a>
          )}
        </div>
      </div>

      {algumaMeta && !empresa.meta_dataset && <p className="mt-4 text-xs text-white/40">{tc.metaDesligada}</p>}

      {equipe && (
        <details className="painel-cartao mt-4 p-5">
          <summary className="cursor-pointer text-sm font-medium text-white/75 hover:text-white">Importar leads do CSV da Meta</summary>
          <p className="mt-2 text-sm text-white/55">
            Para quando a Meta não libera os contatos para o painel: baixe o CSV na Central de leads (ou nos formulários) da Página e importe aqui. Leads
            que já estão no painel não se repetem.
          </p>
          <FormComEstado acao={importarCsvLeads} className="mt-3" limparAoSalvar>
            <input type="hidden" name="empresa" value={empresa.id} />
            <input name="arquivo" type="file" accept=".csv,text/csv" className="block text-sm text-white/70" />
            {whatsapp && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" name="enviar" defaultChecked className="h-4 w-4 accent-[#e3121c]" />
                Enviar os leads novos para o WhatsApp do cliente
              </label>
            )}
            <BotaoEnviar enviando="Importando..." className="botao-painel mt-3">
              Importar
            </BotaoEnviar>
          </FormComEstado>
        </details>
      )}

      {!lista ? (
        <QuadroCrm
          base={base}
          t={tc}
          etapas={etapas.map((e) => ({ id: e.id, nome: e.nome, tipo: e.tipo, meta: Boolean(e.evento_meta), total: totalDa(e) }))}
          leads={leads.map(
            (l): CartaoLead => ({
              id: l.id,
              etapaId: etapaDoLead(l.etapa_id, etapas)!.id,
              nome: l.nome ?? l.email ?? l.whatsapp ?? "—",
              whatsapp: l.whatsapp,
              email: l.email,
              origem: [l.origem, l.campanha].filter(Boolean).join(" · "),
              recebido: dataHora(l.recebido_em, idioma, fuso),
              valor: l.valor != null ? dinheiro(l.valor, empresa.moeda, idioma) : null,
              valorBruto: l.valor,
              respostas: respostasExtras(l.dados, fuso),
            }),
          )}
        />
      ) : (
        <>
          <nav aria-label={t.leads.funil} className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`${base}?ver=lista`}
              aria-current={!filtro ? "true" : undefined}
              className={`rounded-full border px-3 py-1.5 text-sm ${!filtro ? "border-[#ff2d38]/60 bg-[#ff2d38]/10" : "border-white/10 text-white/65 hover:border-white/25"}`}
            >
              {t.leads.todos} · {numero(total, idioma)}
            </Link>
            {etapas.map((e) => (
              <Link
                key={e.id}
                href={`${base}?ver=lista&etapa=${e.id}`}
                aria-current={filtro?.id === e.id ? "true" : undefined}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  filtro?.id === e.id ? "border-[#ff2d38]/60 bg-[#ff2d38]/10" : "border-white/10 text-white/65 hover:border-white/25"
                }`}
              >
                {e.nome} · {numero(totalDa(e), idioma)}
              </Link>
            ))}
          </nav>

          {leads.length === 0 ? (
            <p className="painel-cartao mt-4 p-6 text-center text-white/60">{t.leads.nenhum}</p>
          ) : (
            <div className="painel-cartao mt-4 overflow-x-auto">
              <table className="painel-tabela w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr>
                    <th>{t.leads.nome}</th>
                    <th>{t.leads.contato}</th>
                    <th>{t.leads.origem}</th>
                    <th>{t.leads.recebido}</th>
                    <th>{t.leads.etapa}</th>
                    {whatsapp && <th>WhatsApp</th>}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => {
                    const extras = respostasExtras(l.dados, fuso);
                    return (
                      <tr key={l.id} className="align-top">
                        <td>
                          <span className="font-medium">{l.nome ?? "—"}</span>
                          {l.valor != null && <span className="block text-xs text-white/45">{dinheiro(l.valor, empresa.moeda, idioma)}</span>}
                          {extras.length > 0 && (
                            <details className="mt-1 text-xs text-white/55">
                              <summary className="cursor-pointer hover:text-white">Formulário ({extras.length})</summary>
                              <dl className="mt-1 grid gap-1">
                                {extras.map(([k, v]) => (
                                  <div key={k}>
                                    <dt className="text-white/40">{k}</dt>
                                    <dd className="text-white/75">{v}</dd>
                                  </div>
                                ))}
                              </dl>
                            </details>
                          )}
                        </td>
                        <td>
                          {l.whatsapp && (
                            <a
                              href={`https://wa.me/${soDigitos(l.whatsapp)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-emerald-300 hover:underline"
                            >
                              {l.whatsapp}
                            </a>
                          )}
                          {l.email && (
                            <a href={`mailto:${l.email}`} className="block text-white/60 hover:underline">
                              {l.email}
                            </a>
                          )}
                        </td>
                        <td className="text-white/60">{[l.origem, l.campanha].filter(Boolean).join(" · ") || "—"}</td>
                        <td className="whitespace-nowrap text-white/60">{dataHora(l.recebido_em, idioma, fuso)}</td>
                        <td>
                          <form action={moverLeadForm}>
                            <input type="hidden" name="lead" value={l.id} />
                            <SelectAutoEnvio
                              name="etapa"
                              valor={String(etapaDoLead(l.etapa_id, etapas)?.id ?? "")}
                              rotulo={fmt(t.leads.alterarEtapa, { nome: l.nome ?? l.email ?? "" })}
                              opcoes={etapas.map((e) => ({ valor: String(e.id), rotulo: e.nome }))}
                            />
                          </form>
                        </td>
                        {whatsapp && (
                          <td>
                            <EnviarLeadWhatsapp
                              acao={enviarLeadManual}
                              lead={l.id}
                              enviadoEm={l.whatsapp_enviado_em ? dataHora(l.whatsapp_enviado_em, idioma, fuso) : null}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <GerenciarEtapas empresaId={empresa.id} etapas={etapas} contagem={totalDa} t={tc} />
    </>
  );
}

/** Criar, renomear, reordenar e excluir as etapas do quadro. */
function GerenciarEtapas({
  empresaId,
  etapas,
  contagem,
  t,
}: {
  empresaId: number;
  etapas: Etapa[];
  contagem: (e: Etapa) => number;
  t: Awaited<ReturnType<typeof contextoEmpresa>>["t"]["leads"]["crm"];
}) {
  const tipos = (["aberta", "ganho", "perdido"] as const).map((v) => ({ v, rotulo: t.tipos[v] }));
  return (
    <details className="painel-cartao mt-6 p-5">
      <summary className="cursor-pointer font-display text-lg font-extrabold">{t.organizar}</summary>
      <p className="mt-1 text-sm text-white/55">{t.organizarDica}</p>
      <p className="mt-1 text-xs text-white/40">{t.avisarMetaDica}</p>

      <ol className="mt-4 divide-y divide-white/6">
        {etapas.map((e, i) => (
          <li key={e.id} className="py-4">
            <div className="flex flex-wrap items-end gap-3">
              <FormComEstado acao={salvarEtapa} className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
                <input type="hidden" name="empresa" value={empresaId} />
                <input type="hidden" name="etapa" value={e.id} />
                <label className="min-w-[180px] flex-1">
                  <span className="painel-rotulo">
                    {i + 1}. {t.nome} · {contagem(e)} lead(s)
                  </span>
                  <input name="nome" defaultValue={e.nome} required maxLength={40} className="painel-campo" />
                </label>
                <label>
                  <span className="painel-rotulo">{t.tipo}</span>
                  <select name="tipo" defaultValue={e.tipo} className="painel-campo !w-auto">
                    {tipos.map((x) => (
                      <option key={x.v} value={x.v}>
                        {x.rotulo}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-h-[44px] items-center gap-2 text-sm text-white/75">
                  <input type="checkbox" name="meta" defaultChecked={Boolean(e.evento_meta)} className="size-4 accent-[#ff2d38]" />
                  {t.avisarMeta}
                </label>
                <BotaoEnviar className="botao-painel botao-painel-sec">{t.salvar}</BotaoEnviar>
              </FormComEstado>
              <div className="flex items-center gap-1">
                {(["subir", "descer"] as const).map((d) => (
                  <form key={d} action={reordenarEtapa}>
                    <input type="hidden" name="empresa" value={empresaId} />
                    <input type="hidden" name="etapa" value={e.id} />
                    <input type="hidden" name="direcao" value={d} />
                    <button
                      type="submit"
                      disabled={d === "subir" ? i === 0 : i === etapas.length - 1}
                      aria-label={fmt(d === "subir" ? t.subir : t.descer, { nome: e.nome })}
                      className="grid size-10 place-items-center rounded-full border border-white/10 text-white/70 hover:border-white/30 hover:text-white disabled:opacity-25"
                    >
                      {d === "subir" ? "↑" : "↓"}
                    </button>
                  </form>
                ))}
              </div>
            </div>
            {etapas.length > 2 && (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-xs text-[#ff8a90] hover:underline">{t.excluir}</summary>
                <FormComEstado acao={excluirEtapa} className="mt-2 flex flex-wrap items-end gap-3">
                  <input type="hidden" name="empresa" value={empresaId} />
                  <input type="hidden" name="etapa" value={e.id} />
                  <label>
                    <span className="painel-rotulo">{t.leadsVaoPara}</span>
                    <select name="destino" className="painel-campo !w-auto" defaultValue={etapas[i === 0 ? 1 : i - 1].id}>
                      {etapas
                        .filter((x) => x.id !== e.id)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.nome}
                          </option>
                        ))}
                    </select>
                  </label>
                  <BotaoEnviar className="botao-painel botao-painel-sec !text-[#ff8a90]" confirmar={fmt(t.excluirPergunta, { nome: e.nome })}>
                    {t.excluir}
                  </BotaoEnviar>
                </FormComEstado>
              </details>
            )}
          </li>
        ))}
      </ol>

      <FormComEstado acao={criarEtapa} limparAoSalvar className="mt-2 border-t border-white/6 pt-5">
        <h3 className="font-medium">{t.novaEtapa}</h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="empresa" value={empresaId} />
          <label className="min-w-[180px] flex-1">
            <span className="painel-rotulo">{t.nome}</span>
            <input name="nome" required maxLength={40} className="painel-campo" placeholder={t.exemploEtapa} />
          </label>
          <label>
            <span className="painel-rotulo">{t.tipo}</span>
            <select name="tipo" defaultValue="aberta" className="painel-campo !w-auto">
              {tipos.map((x) => (
                <option key={x.v} value={x.v}>
                  {x.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-[44px] items-center gap-2 text-sm text-white/75">
            <input type="checkbox" name="meta" defaultChecked className="size-4 accent-[#ff2d38]" />
            {t.avisarMeta}
          </label>
          <BotaoEnviar enviando="..." className="botao-painel">
            {t.criar}
          </BotaoEnviar>
        </div>
      </FormComEstado>
    </details>
  );
}
