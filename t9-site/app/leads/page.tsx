import type { Metadata } from "next";
import { chaveValida } from "@/lib/acessoLeads";
import { armazenamentoConfigurado, listarLeads, type LeadSalvo } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Leads | T9",
  robots: { index: false, follow: false },
};

type Pessoa = { ultimo: LeadSalvo; agendamento: LeadSalvo | null; envios: number };

/** Junta os envios da mesma pessoa (mesmo e-mail): o agendamento vale mais que o lead parcial. */
function agruparPorPessoa(leads: LeadSalvo[]) {
  const pessoas = new Map<string, Pessoa>();
  for (const l of leads) {
    const atual = pessoas.get(l.email);
    if (!atual) {
      pessoas.set(l.email, { ultimo: l, agendamento: l.etapa === "agendamento" ? l : null, envios: 1 });
      continue;
    }
    atual.envios += 1;
    if (!atual.agendamento && l.etapa === "agendamento") atual.agendamento = l;
  }
  return [...pessoas.values()];
}

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default async function PaginaLeads({ searchParams }: { searchParams: Promise<{ chave?: string }> }) {
  const { chave } = await searchParams;

  if (!chaveValida(chave)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070102] p-6 text-white">
        <form className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="font-display text-2xl font-extrabold">Leads da T9</h1>
          <p className="mt-2 text-sm text-white/60">Digite a chave de acesso.</p>
          <input name="chave" type="password" className="campo mt-6" placeholder="Chave" autoFocus />
          <button className="botao botao-vermelho mt-4 w-full">Entrar</button>
        </form>
      </main>
    );
  }

  const configurado = armazenamentoConfigurado();
  const pessoas = configurado ? agruparPorPessoa(await listarLeads()) : [];
  const agendaram = pessoas.filter((p) => p.agendamento).length;

  return (
    <main className="min-h-screen bg-[#f6f3f3] px-4 py-10 text-[#0b0b0b] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Leads da T9</h1>
            <p className="mt-1 text-[#5b5353]">
              {pessoas.length} {pessoas.length === 1 ? "pessoa" : "pessoas"} · {agendaram} com reunião agendada
            </p>
          </div>
          {configurado && (
            <a href={`/leads/csv?chave=${encodeURIComponent(chave!)}`} className="botao botao-vermelho !min-h-[46px] text-sm">
              Baixar planilha (CSV)
            </a>
          )}
        </div>

        {!configurado && (
          <p className="mt-8 rounded-xl bg-[#fdecec] px-5 py-4 text-[#a10b0b]">
            O armazenamento ainda não está conectado. Crie um Blob store na Vercel (Storage → Create → Blob) e conecte ao
            projeto t9-ads-company.
          </p>
        )}

        {configurado && pessoas.length === 0 && <p className="mt-8 text-[#5b5353]">Nenhum lead ainda.</p>}

        {pessoas.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-[#eee] text-xs tracking-wide text-[#8a8080] uppercase">
                <tr>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Faturamento</th>
                  <th className="px-4 py-3">Recebido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1ecec]">
                {pessoas.map(({ ultimo, agendamento }) => {
                  const l = agendamento ?? ultimo;
                  return (
                    <tr key={l.email} className="align-top">
                      <td className="px-4 py-3">
                        {agendamento ? (
                          <>
                            <span className="rounded-full bg-[#e3121c] px-2.5 py-1 text-xs font-semibold text-white">Agendou</span>
                            <span className="mt-1.5 block text-xs text-[#5b5353]">{agendamento.reuniao?.descricao}</span>
                          </>
                        ) : (
                          <span className="rounded-full bg-[#f1ecec] px-2.5 py-1 text-xs font-semibold text-[#5b5353]">
                            Só dados
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{l.nome}</td>
                      <td className="px-4 py-3">
                        <a className="text-[#128a33] underline" href={`https://wa.me/${l.whatsapp}`} target="_blank" rel="noopener noreferrer">
                          {l.whatsappFormatado}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <a className="underline" href={`mailto:${l.email}`}>
                          {l.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">{l.faturamento ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[#5b5353]">{dataHora(ultimo.recebidoEm)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
