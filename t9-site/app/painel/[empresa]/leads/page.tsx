import Link from "next/link";
import { contagemPorEtapa, listarLeads } from "@/lib/painel/dados";
import { dataHora, dinheiro, numero } from "@/lib/painel/formato";
import { ETAPAS_LEAD, type EtapaLead } from "@/lib/painel/textos";
import { fmt } from "@/lib/i18n";
import { mudarEtapaLead } from "../../acoes";
import { SelectAutoEnvio } from "../../_ui/Botoes";
import { contextoEmpresa } from "../contexto";

const soDigitos = (s: string) => s.replace(/\D/g, "");

export default async function Leads({
  params,
  searchParams,
}: {
  params: Promise<{ empresa: string }>;
  searchParams: Promise<{ etapa?: string }>;
}) {
  const { empresa, idioma, t } = await contextoEmpresa(params);
  const filtro = (await searchParams).etapa;
  const etapa = ETAPAS_LEAD.includes(filtro as EtapaLead) ? (filtro as EtapaLead) : undefined;
  const [leads, contagem] = await Promise.all([listarLeads(empresa.id, etapa), contagemPorEtapa(empresa.id)]);
  const total = Object.values(contagem).reduce((a, b) => a + (b ?? 0), 0);
  const base = `/painel/${empresa.slug}/leads`;
  const maior = Math.max(1, ...ETAPAS_LEAD.map((e) => contagem[e] ?? 0));

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.leads.titulo}</h1>
      <p className="mt-1 text-white/55">{t.leads.subtitulo}</p>

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
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="align-top">
                  <td>
                    <span className="font-medium">{l.nome ?? "—"}</span>
                    {l.valor != null && <span className="block text-xs text-white/45">{dinheiro(l.valor, empresa.moeda, idioma)}</span>}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
