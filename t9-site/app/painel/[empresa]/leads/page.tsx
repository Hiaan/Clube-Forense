import Link from "next/link";
import { contagemPorEtapa, listarLeads } from "@/lib/painel/dados";
import { dataHora, dinheiro, numero } from "@/lib/painel/formato";
import { ETAPAS_LEAD, type EtapaLead } from "@/lib/painel/textos";
import { fmt } from "@/lib/i18n";
import { mudarEtapaLead } from "../../acoes";
import { SelectAutoEnvio } from "../../_ui/Botoes";
import { contextoEmpresa } from "../contexto";
import { mostrarEdicao } from "@/lib/painel/auth";
import { numerosDe } from "@/lib/painel/whatsapp";
import { enviarLeadManual, importarCsvLeads } from "../../acoes-whatsapp";
import FormComEstado from "../../_ui/FormComEstado";
import { BotaoEnviar } from "../../_ui/Botoes";
import EnviarLeadWhatsapp from "../../_ui/EnviarLeadWhatsapp";

const soDigitos = (s: string) => s.replace(/\D/g, "");

export default async function Leads({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<{ etapa?: string }>;
}) {
  const { usuario, empresa, idioma, t } = await contextoEmpresa(params);
  // Envio manual para o WhatsApp do cliente: só a equipe, e só com o número dele cadastrado.
  const equipe = await mostrarEdicao(usuario);
  const whatsapp = equipe && numerosDe(empresa.whatsapp_leads).length > 0;
  const filtro = (await searchParams).etapa;
  const etapa = ETAPAS_LEAD.includes(filtro as EtapaLead) ? (filtro as EtapaLead) : undefined;
  const [leads, contagem] = await Promise.all([listarLeads(empresa.id, etapa), contagemPorEtapa(empresa.id)]);
  const total = Object.values(contagem).reduce((a, b) => a + (b ?? 0), 0);
  const base = `/painel/${empresa.slug}/leads`;
  const maior = Math.max(1, ...ETAPAS_LEAD.map((e) => contagem[e] ?? 0));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.leads.titulo}</h1>
          <p className="mt-1 text-white/55">{t.leads.subtitulo}</p>
        </div>
        {total > 0 && (
          <a href={`/painel/${empresa.slug}/exportar/leads`} download className="botao-painel botao-painel-sec">
            ↓ {t.extra.baixarCsv}
          </a>
        )}
      </div>

      <section className="painel-cartao mt-6 p-5">
        <h2 className="text-xs font-medium tracking-wide text-white/55 uppercase">{t.leads.funil}</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {ETAPAS_LEAD.map((e) => {
            const qtd = contagem[e] ?? 0;
            return (
              <Link
                key={e}
                href={etapa === e ? base : `${base}?etapa=${e}`}
                aria-current={etapa === e ? "true" : undefined}
                className={`rounded-2xl border p-3 transition-colors ${
                  etapa === e ? "border-[#ff2d38]/60 bg-[#ff2d38]/10" : "border-white/8 hover:border-white/20"
                }`}
              >
                <span className="block text-xs text-white/55">{t.leads.etapas[e]}</span>
                <span className="mt-1 block font-display text-2xl font-extrabold">{numero(qtd, idioma)}</span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/8">
                  <span
                    className={`block h-full rounded-full ${e === "perdido" ? "bg-white/30" : "bg-[#ff3540]"}`}
                    style={{ width: `${(qtd / maior) * 100}%` }}
                  />
                </span>
              </Link>
            );
          })}
        </div>
        {etapa && (
          <Link href={base} className="mt-4 inline-block text-sm text-[#ff8a90] hover:underline">
            ← {t.leads.todos} ({numero(total, idioma)})
          </Link>
        )}
      </section>

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
              {leads.map((l) => (
                <tr key={l.id} className="align-top">
                  <td>
                    <span className="font-medium">{l.nome ?? "—"}</span>
                    {l.valor != null && <span className="block text-xs text-white/45">{dinheiro(l.valor, empresa.moeda, idioma)}</span>}
                    <RespostasFormulario dados={l.dados} />
                  </td>
                  <td>
                    {l.whatsapp && (
                      <a href={`https://wa.me/${soDigitos(l.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="block text-emerald-300 hover:underline">
                        {l.whatsapp}
                      </a>
                    )}
                    {l.email && (
                      <a href={`mailto:${l.email}`} className="block text-white/60 hover:underline">
                        {l.email}
                      </a>
                    )}
                  </td>
                  <td className="text-white/60">
                    {[l.origem, l.campanha].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="whitespace-nowrap text-white/60">{dataHora(l.recebido_em, idioma)}</td>
                  <td>
                    <form action={mudarEtapaLead}>
                      <input type="hidden" name="lead" value={l.id} />
                      <SelectAutoEnvio
                        name="etapa"
                        valor={l.etapa}
                        rotulo={fmt(t.leads.alterarEtapa, { nome: l.nome ?? l.email ?? "" })}
                        opcoes={ETAPAS_LEAD.map((e) => ({ valor: e, rotulo: t.leads.etapas[e] }))}
                      />
                    </form>
                  </td>
                  {whatsapp && (
                    <td>
                      <EnviarLeadWhatsapp acao={enviarLeadManual} lead={l.id} enviadoEm={l.whatsapp_enviado_em ? dataHora(l.whatsapp_enviado_em, idioma) : null} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/** Respostas extras do formulário da Meta (além de nome, e-mail e telefone). */
function RespostasFormulario({ dados }: { dados: Record<string, unknown> | null }) {
  const respostas = (dados?.respostas ?? null) as Record<string, string> | null;
  if (!respostas) return null;
  const basicos = new Set(["full_name", "first_name", "last_name", "email", "phone_number", "nome", "telefone", "whatsapp"]);
  const extras = Object.entries(respostas).filter(([k, v]) => !basicos.has(k) && v);
  if (!extras.length) return null;
  return (
    <details className="mt-1 text-xs text-white/55">
      <summary className="cursor-pointer hover:text-white">Formulário ({extras.length})</summary>
      <dl className="mt-1 grid gap-1">
        {extras.map(([k, v]) => (
          <div key={k}>
            <dt className="text-white/40">{k.replace(/_/g, " ")}</dt>
            <dd className="text-white/75">{v}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
