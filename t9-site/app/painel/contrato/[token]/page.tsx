import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contratoPorToken } from "@/lib/painel/comercial";
import { assinarContrato } from "../../acoes-comercial";
import FormComEstado from "../../_ui/FormComEstado";
import BotaoImprimir from "../../_ui/BotaoImprimir";
import { BotaoEnviar } from "../../_ui/Botoes";
import { Papel, TextoContrato } from "../../_ui/Documento";

export const metadata: Metadata = { title: "Contrato | T9 ADS Company", robots: { index: false, follow: false } };

const dataHoraBR = (v: string | Date) =>
  new Date(v).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function ContratoPublico({ params }: { params: Promise<{ token: string }> }) {
  const c = await contratoPorToken((await params).token);
  if (!c) notFound();
  const assinado = c.status === "assinado";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12 print:max-w-none print:p-0">
      <div className="nao-imprimir mb-4 flex justify-end">
        <BotaoImprimir rotulo="Salvar em PDF" />
      </div>
      <Papel>
        <TextoContrato texto={c.texto} />
        {assinado ? (
          <div className="mt-10 rounded-xl border border-black/15 p-5 text-sm break-inside-avoid">
            <p className="font-display font-extrabold">Assinatura eletrônica</p>
            <p className="mt-2 text-black/75">
              Assinado por <strong>{c.aceite_nome}</strong> (documento {c.aceite_documento}), pela CONTRATANTE, em {c.aceite_em ? dataHoraBR(c.aceite_em) : "-"}
              {" "}(horário de Brasília), por meio do link exclusivo deste contrato. Código do documento: {c.token.slice(0, 10).toUpperCase()}.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 pt-6 text-center text-sm sm:grid-cols-2">
            <div className="border-t border-black/40 pt-2">CONTRATANTE</div>
            <div className="border-t border-black/40 pt-2">CONTRATADA</div>
          </div>
        )}
      </Papel>

      <div className="nao-imprimir mt-6">
        {c.status === "cancelado" ? (
          <p className="painel-cartao p-5 text-white/70">Este contrato foi cancelado. Fale com a T9.</p>
        ) : !assinado ? (
          <section className="painel-cartao p-5 sm:p-6">
            <h2 className="font-display text-xl font-extrabold">Assinar o contrato</h2>
            <p className="mt-1 text-sm text-white/55">
              A assinatura eletrônica registra seu nome, documento, a data e a hora. Depois você pode salvar uma cópia em PDF nesta mesma página.
            </p>
            <FormComEstado acao={assinarContrato} className="mt-4">
              <input type="hidden" name="token" value={c.token} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="painel-rotulo">Nome completo</span>
                  <input name="nome" required autoComplete="name" className="painel-campo" defaultValue={c.cliente_responsavel ?? ""} />
                </label>
                <label>
                  <span className="painel-rotulo">CPF (ou CNPJ)</span>
                  <input name="documento" required inputMode="numeric" className="painel-campo" />
                </label>
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm text-white/75">
                <input type="checkbox" name="concordo" required className="mt-1 accent-[#ff2d38]" />
                Li o contrato inteiro e concordo com todas as cláusulas, assinando-o eletronicamente.
              </label>
              <div className="mt-5">
                <BotaoEnviar enviando="Assinando...">Assinar contrato</BotaoEnviar>
              </div>
            </FormComEstado>
          </section>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-4 text-emerald-100">
            <p>Contrato assinado. Obrigado! Guarde uma cópia: toque em &quot;Salvar em PDF&quot;.</p>
            <BotaoImprimir rotulo="Salvar em PDF" />
          </div>
        )}
      </div>
    </main>
  );
}
