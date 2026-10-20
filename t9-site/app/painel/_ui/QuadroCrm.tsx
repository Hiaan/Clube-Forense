"use client";

import { useOptimistic, useState, useTransition } from "react";
import { moverLeadCrm, salvarValorLead } from "../acoes-crm";
import type { TextosPainel } from "@/lib/painel/textos";
import { fmt } from "@/lib/i18n";
import { BotaoEnviar } from "./Botoes";

export type EtapaQuadro = { id: number; nome: string; tipo: "aberta" | "ganho" | "perdido"; meta: boolean; total: number };
export type CartaoLead = {
  id: number;
  etapaId: number;
  nome: string;
  whatsapp: string | null;
  email: string | null;
  origem: string;
  recebido: string;
  valor: string | null;
  valorBruto: number | null;
  respostas: [string, string][];
};

/** Quantos cartões cada coluna mostra; o resto fica na lista. */
const POR_COLUNA = 50;
const soDigitos = (s: string) => s.replace(/\D/g, "");

/** Quadro do CRM: arrastar o cartão para outra coluna (ou "Mover para", no celular) muda a etapa. */
export default function QuadroCrm({
  etapas,
  leads,
  t,
  base,
}: {
  etapas: EtapaQuadro[];
  leads: CartaoLead[];
  t: TextosPainel["leads"]["crm"];
  base: string;
}) {
  const [cartoes, mover] = useOptimistic(leads, (atual, m: { id: number; etapaId: number }) =>
    atual.map((l) => (l.id === m.id ? { ...l, etapaId: m.etapaId } : l)),
  );
  const [, iniciar] = useTransition();
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [sobre, setSobre] = useState<number | null>(null);
  const [erro, setErro] = useState(false);

  function moverPara(id: number, etapaId: number) {
    const lead = cartoes.find((l) => l.id === id);
    if (!lead || lead.etapaId === etapaId) return;
    setErro(false);
    iniciar(async () => {
      mover({ id, etapaId });
      const r = await moverLeadCrm(id, etapaId).catch(() => ({ ok: false }));
      if (!r.ok) setErro(true);
    });
  }

  // Total de cada coluna = total do banco, ajustado pelos cartões movidos agora (antes de a página recarregar).
  const total = (etapaId: number) => {
    const etapa = etapas.find((e) => e.id === etapaId)!;
    const antes = leads.filter((l) => l.etapaId === etapaId).length;
    const agora = cartoes.filter((l) => l.etapaId === etapaId).length;
    return etapa.total - antes + agora;
  };

  return (
    <>
      {erro && (
        <p role="alert" className="mt-4 rounded-xl border border-[#ff2d38]/30 bg-[#ff2d38]/10 px-4 py-3 text-sm text-[#ffb3b7]">
          {t.erroMover}
        </p>
      )}
      <div className="-mx-4 mt-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:scroll-px-0 sm:px-0">
        {etapas.map((etapa) => {
          const daColuna = cartoes.filter((l) => l.etapaId === etapa.id);
          const qtd = total(etapa.id);
          return (
            <section
              key={etapa.id}
              aria-label={etapa.nome}
              onDragOver={(e) => {
                if (arrastando == null) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (sobre !== etapa.id) setSobre(etapa.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSobre(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = Number(e.dataTransfer.getData("text/plain"));
                setSobre(null);
                setArrastando(null);
                if (id) moverPara(id, etapa.id);
              }}
              className={`flex w-[272px] shrink-0 snap-start flex-col rounded-2xl border p-2.5 transition-colors ${
                sobre === etapa.id ? "border-[#ff2d38]/60 bg-[#ff2d38]/8" : "border-white/8 bg-white/[0.025]"
              }`}
            >
              <header className="flex items-center justify-between gap-2 px-1.5 pt-1 pb-2.5">
                <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  <span
                    aria-hidden="true"
                    className={`size-2 shrink-0 rounded-full ${etapa.tipo === "ganho" ? "bg-emerald-400" : etapa.tipo === "perdido" ? "bg-white/30" : "bg-[#ff3540]"}`}
                  />
                  <span className="truncate">{etapa.nome}</span>
                </h2>
                <span className="flex shrink-0 items-center gap-1.5">
                  {etapa.meta && (
                    <span title={t.seloMetaDica} className="rounded-full bg-sky-400/12 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">
                      {t.seloMeta}
                    </span>
                  )}
                  <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs tabular-nums text-white/70">{qtd}</span>
                </span>
              </header>

              <ol className="flex min-h-24 flex-col gap-2">
                {daColuna.slice(0, POR_COLUNA).map((l) => (
                  <li
                    key={l.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(l.id));
                      e.dataTransfer.effectAllowed = "move";
                      setArrastando(l.id);
                    }}
                    onDragEnd={() => {
                      setArrastando(null);
                      setSobre(null);
                    }}
                    className={`cursor-grab rounded-xl border border-white/8 bg-[#141414] p-3 text-sm shadow-sm active:cursor-grabbing ${
                      arrastando === l.id ? "opacity-40" : ""
                    }`}
                  >
                    <p className="font-medium break-words">{l.nome}</p>
                    {l.whatsapp && (
                      <a
                        href={`https://wa.me/${soDigitos(l.whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-xs text-emerald-300 hover:underline"
                      >
                        {l.whatsapp}
                      </a>
                    )}
                    {l.email && <p className="truncate text-xs text-white/55">{l.email}</p>}
                    <p className="mt-1.5 text-[11px] leading-snug text-white/40">
                      {l.origem ? `${l.origem} · ` : ""}
                      {l.recebido}
                    </p>
                    {l.valor && <p className="mt-1 text-xs font-medium text-emerald-300">{l.valor}</p>}

                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-white/45 hover:text-white">{t.detalhes}</summary>
                      {l.respostas.length > 0 && (
                        <dl className="mt-2 grid gap-1">
                          {l.respostas.map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-white/40">{k}</dt>
                              <dd className="break-words text-white/75">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      <form action={salvarValorLead} className="mt-2 flex items-end gap-2">
                        <input type="hidden" name="lead" value={l.id} />
                        <label className="min-w-0 flex-1">
                          <span className="mb-1 block text-white/45">{t.valor}</span>
                          <input
                            name="valor"
                            inputMode="decimal"
                            defaultValue={l.valorBruto ?? ""}
                            className="painel-campo !min-h-[34px] !py-1 !text-xs"
                            autoComplete="off"
                          />
                        </label>
                        <BotaoEnviar className="botao-painel botao-painel-sec !min-h-[34px] !px-3 !text-xs">{t.salvar}</BotaoEnviar>
                      </form>
                    </details>

                    <label className="mt-2 flex items-center gap-2 text-[11px] text-white/45">
                      <span className="shrink-0">{t.moverPara}</span>
                      <select
                        value={l.etapaId}
                        onChange={(e) => moverPara(l.id, Number(e.currentTarget.value))}
                        aria-label={`${t.moverPara}: ${l.nome}`}
                        className="painel-campo !min-h-[30px] min-w-0 flex-1 !py-0.5 !text-xs"
                      >
                        {etapas.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nome}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
                {daColuna.length === 0 && (
                  <li className="grid min-h-24 place-items-center rounded-xl border border-dashed border-white/10 px-3 text-center text-xs text-white/35">
                    {t.colunaVazia}
                  </li>
                )}
              </ol>
              {qtd > Math.min(daColuna.length, POR_COLUNA) && (
                <a href={`${base}?ver=lista&etapa=${etapa.id}`} className="mt-2 px-1.5 text-xs text-[#ff8a90] hover:underline">
                  {fmt(t.maisNaLista, { n: qtd })}
                </a>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
