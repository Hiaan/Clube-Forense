import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { propostaPorToken, propostaVencida, servicoPorId, valorFormatado, type Servico } from "@/lib/painel/comercial";
import { PLANO_PADRAO } from "@/lib/painel/textos";
import { aceitarProposta } from "../../acoes-comercial";
import FormComEstado from "../../_ui/FormComEstado";
import BotaoImprimir from "../../_ui/BotaoImprimir";
import { BotaoEnviar } from "../../_ui/Botoes";
import { Papel } from "../../_ui/Documento";

export const metadata: Metadata = { title: "Proposta | T9 ADS Company", robots: { index: false, follow: false } };

const data = (v: string | Date) => new Date(v).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
const dataIso = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

export default async function PropostaPublica({ params }: { params: Promise<{ token: string }> }) {
  const p = await propostaPorToken((await params).token);
  if (!p) notFound();
  const servicos = p.servicos.map(servicoPorId).filter((s): s is Servico => Boolean(s));
  const validaAte = new Date(new Date(p.criado_em).getTime() + p.validade_dias * 86_400_000);
  const vencida = propostaVencida(p);
  const podeAceitar = p.status !== "aceita" && p.status !== "recusada" && !vencida;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12 print:max-w-none print:p-0">
      <div className="nao-imprimir mb-4 flex justify-end">
        <BotaoImprimir rotulo="Salvar em PDF" />
      </div>
      <Papel>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#c8101a] uppercase">Proposta comercial</p>
        <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
          {p.titulo || `Mais clientes para a ${p.cliente_nome}`}
        </h1>
        <p className="mt-3 text-sm text-black/60">
          Preparada para {p.cliente_responsavel ? `${p.cliente_responsavel}, ` : ""}
          {p.cliente_nome} · {data(p.criado_em)} · válida até {data(validaAte)}
        </p>

        {p.objetivo && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-extrabold">O objetivo</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-black/80">{p.objetivo}</p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="font-display text-lg font-extrabold">O que a T9 vai fazer</h2>
          <div className="mt-3 space-y-3">
            {servicos.map((s) => (
              <div key={s.id} className="break-inside-avoid rounded-xl border border-black/10 p-4">
                <h3 className="font-semibold">{s.nome}</h3>
                <p className="mt-1 text-sm text-black/70">{s.descricao}</p>
                <ul className="mt-2 grid gap-1 text-sm text-black/75 sm:grid-cols-2">
                  {s.entregas.map((e) => (
                    <li key={e} className="flex gap-2">
                      <span className="text-[#c8101a]">✓</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-lg font-extrabold">Como começamos: o primeiro mês</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {PLANO_PADRAO.pt.map((itens, i) => (
              <div key={i} className="rounded-xl bg-black/[0.04] p-4">
                <p className="text-xs font-semibold tracking-wider text-[#c8101a] uppercase">Semana {i + 1}</p>
                <ul className="mt-2 space-y-1 text-sm text-black/75">
                  {itens.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-lg font-extrabold">Investimento</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-black/10">
            <div className="flex items-baseline justify-between gap-4 bg-[#161616] px-5 py-4 text-white">
              <span className="text-sm">Mensalidade</span>
              <span className="font-display text-2xl font-extrabold">{valorFormatado(p.valor_mensal, p.moeda)}</span>
            </div>
            <dl className="divide-y divide-black/10 text-sm">
              {p.implantacao ? (
                <div className="flex justify-between gap-4 px-5 py-3">
                  <dt className="text-black/60">Implantação (uma vez)</dt>
                  <dd className="font-semibold">{valorFormatado(p.implantacao, p.moeda)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-black/60">Permanência mínima</dt>
                <dd className="font-semibold">{p.prazo_minimo} {p.prazo_minimo === 1 ? "mês" : "meses"}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-black/60">Vencimento</dt>
                <dd className="font-semibold">todo dia {p.vencimento_dia}</dd>
              </div>
              {p.inicio && (
                <div className="flex justify-between gap-4 px-5 py-3">
                  <dt className="text-black/60">Início previsto</dt>
                  <dd className="font-semibold">{dataIso(p.inicio)}</dd>
                </div>
              )}
            </dl>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-black/55">
            A verba dos anúncios é paga pela empresa direto às plataformas (Meta, Google) e não está incluída na mensalidade. Depois da permanência
            mínima, o serviço segue mês a mês e pode ser encerrado com 30 dias de aviso.
            {p.observacoes ? ` ${p.observacoes}` : ""}
          </p>
        </section>

        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-lg font-extrabold">Próximos passos</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-black/75">
            <li>Aceite esta proposta (aqui embaixo).</li>
            <li>Você recebe o contrato para assinar pelo celular.</li>
            <li>Marcamos a reunião de diagnóstico e começamos a semana 1.</li>
          </ol>
        </section>

        {p.status === "aceita" && (
          <p className="mt-8 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Proposta aceita por {p.aceite_nome} em {p.aceite_em ? data(p.aceite_em) : "-"}.
          </p>
        )}
      </Papel>

      <div className="nao-imprimir mt-6">
        {podeAceitar ? (
          <section className="painel-cartao p-5 sm:p-6">
            <h2 className="font-display text-xl font-extrabold">Aceitar a proposta</h2>
            <FormComEstado acao={aceitarProposta} className="mt-4">
              <input type="hidden" name="token" value={p.token} />
              <label className="block">
                <span className="painel-rotulo">Seu nome completo</span>
                <input name="nome" required autoComplete="name" className="painel-campo" defaultValue={p.cliente_responsavel ?? ""} />
              </label>
              <label className="mt-4 flex items-start gap-3 text-sm text-white/75">
                <input type="checkbox" name="concordo" required className="mt-1 accent-[#ff2d38]" />
                Li a proposta e quero seguir com a T9 nestas condições.
              </label>
              <div className="mt-5">
                <BotaoEnviar enviando="Enviando...">Aceitar proposta</BotaoEnviar>
              </div>
            </FormComEstado>
          </section>
        ) : p.status === "aceita" ? (
          <p className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-emerald-100">
            Proposta aceita! Obrigado pela confiança. Em breve você recebe o contrato para assinar pelo celular.
          </p>
        ) : vencida ? (
          <p className="painel-cartao p-5 text-white/70">Esta proposta passou da validade. Fale com a T9 para receber uma atualizada.</p>
        ) : null}
      </div>
    </main>
  );
}
