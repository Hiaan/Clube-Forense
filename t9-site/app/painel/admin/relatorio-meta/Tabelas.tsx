"use client";

import { useEffect, useMemo, useState } from "react";
import type { LinhaRelatorioMeta } from "@/lib/painel/meta";

// Tabelas do Relatório Meta com colunas configuráveis: escolher, reordenar (arrastar ou setas) e
// ordenar as campanhas clicando no título. A arrumação vale para todas as tabelas e para o PDF,
// e fica guardada neste navegador.

type Linha = LinhaRelatorioMeta;
type Metrica = { id: string; nome: string; valor: (l: Linha) => number | null; tipo: "dinheiro" | "inteiro" | "pct" | "decimal"; menorMelhor?: boolean };

const div = (a: number, b: number) => (b > 0 ? a / b : null);

export const METRICAS: Metrica[] = [
  { id: "gasto", nome: "Investido", valor: (l) => l.gasto, tipo: "dinheiro" },
  { id: "alcance", nome: "Alcance", valor: (l) => l.alcance, tipo: "inteiro" },
  { id: "impressoes", nome: "Impressões", valor: (l) => l.impressoes, tipo: "inteiro" },
  { id: "frequencia", nome: "Frequência", valor: (l) => div(l.impressoes, l.alcance), tipo: "decimal" },
  { id: "cliques", nome: "Cliques", valor: (l) => l.cliques, tipo: "inteiro" },
  { id: "ctr", nome: "CTR", valor: (l) => div(l.cliques * 100, l.impressoes), tipo: "pct" },
  { id: "cpc", nome: "Custo por clique", valor: (l) => div(l.gasto, l.cliques), tipo: "dinheiro", menorMelhor: true },
  { id: "cpm", nome: "CPM", valor: (l) => div(l.gasto * 1000, l.impressoes), tipo: "dinheiro", menorMelhor: true },
  { id: "leads", nome: "Leads", valor: (l) => l.leads, tipo: "inteiro" },
  { id: "cadastros", nome: "Cadastros", valor: (l) => l.cadastros, tipo: "inteiro" },
  { id: "conversas", nome: "Conversas", valor: (l) => l.conversas, tipo: "inteiro" },
  { id: "cpl", nome: "Custo por lead", valor: (l) => div(l.gasto, l.leads), tipo: "dinheiro", menorMelhor: true },
  { id: "conversao", nome: "Conversão (leads ÷ cliques)", valor: (l) => div(l.leads * 100, l.cliques), tipo: "pct" },
];
const PADRAO = ["gasto", "alcance", "impressoes", "leads", "cpl"];
const CHAVE = "t9-relatorio-meta-colunas";

export type Secao = { titulo: string; tipo: "resumo" | "campanhas"; linhas: (Linha & { rotulo: string; detalhe?: string; destaque?: boolean })[] };

export default function Tabelas({ secoes, moeda, nota }: { secoes: Secao[]; moeda: string; nota: string }) {
  const [colunas, setColunas] = useState<string[]>(PADRAO);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<{ id: string; desc: boolean } | null>(null);
  const [aberto, setAberto] = useState(false);

  // Volta a arrumação guardada (depois de montar, para o servidor e o navegador desenharem igual).
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
      if (Array.isArray(salvo) && salvo.length) {
        const validos = salvo.filter((id: string) => METRICAS.some((m) => m.id === id));
        // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única do que o navegador guardou
        if (validos.length) setColunas(validos);
      }
    } catch {}
  }, []);
  const mudar = (novas: string[]) => {
    setColunas(novas);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novas));
    } catch {}
  };

  const fmt = useMemo(() => {
    const dinheiro = new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda });
    const inteiro = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
    const dec = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (m: Metrica, v: number | null) =>
      v === null ? "–" : m.tipo === "dinheiro" ? dinheiro.format(v) : m.tipo === "pct" ? `${dec.format(v)}%` : m.tipo === "decimal" ? dec.format(v) : inteiro.format(v);
  }, [moeda]);

  const ativas = colunas.map((id) => METRICAS.find((m) => m.id === id)!).filter(Boolean);
  const inativas = METRICAS.filter((m) => !colunas.includes(m.id));
  const mover = (id: string, passo: number) => {
    const i = colunas.indexOf(id);
    const j = i + passo;
    if (i < 0 || j < 0 || j >= colunas.length) return;
    const novas = [...colunas];
    [novas[i], novas[j]] = [novas[j], novas[i]];
    mudar(novas);
  };
  const soltarEm = (alvo: string) => {
    if (!arrastando || arrastando === alvo) return;
    const novas = colunas.filter((c) => c !== arrastando);
    novas.splice(novas.indexOf(alvo), 0, arrastando);
    mudar(novas);
    setArrastando(null);
  };
  const ordenar = (id: string) => setOrdem((o) => (o?.id === id ? { id, desc: !o.desc } : { id, desc: true }));

  return (
    <div className="space-y-6">
      <section className="painel-cartao nao-imprimir p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-white/70">
            <span className="font-semibold text-white">Colunas:</span> {ativas.map((m) => m.nome).join(" · ")}
          </p>
          <button type="button" onClick={() => setAberto((a) => !a)} aria-expanded={aberto} className="botao-painel botao-painel-sec !min-h-[38px]">
            {aberto ? "Fechar" : "Escolher e ordenar métricas"}
          </button>
        </div>
        {aberto && (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <p className="painel-rotulo">No relatório (arraste para mudar a ordem)</p>
              <ol className="space-y-1.5">
                {ativas.map((m, i) => (
                  <li
                    key={m.id}
                    draggable
                    onDragStart={() => setArrastando(m.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => soltarEm(m.id)}
                    onDragEnd={() => setArrastando(null)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${arrastando === m.id ? "border-[#ff2d38] bg-[#ff2d38]/10" : "border-white/12 bg-white/5"}`}
                  >
                    <span className="cursor-grab text-white/40 select-none" aria-hidden="true">
                      ⋮⋮
                    </span>
                    <span className="flex-1">{m.nome}</span>
                    <button type="button" onClick={() => mover(m.id, -1)} disabled={i === 0} aria-label={`Mover ${m.nome} para a esquerda`} className="px-1.5 text-white/60 hover:text-white disabled:opacity-30">
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(m.id, 1)}
                      disabled={i === ativas.length - 1}
                      aria-label={`Mover ${m.nome} para a direita`}
                      className="px-1.5 text-white/60 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => colunas.length > 1 && mudar(colunas.filter((c) => c !== m.id))}
                      disabled={colunas.length === 1}
                      aria-label={`Tirar ${m.nome}`}
                      className="px-1.5 text-white/60 hover:text-[#ff8a90] disabled:opacity-30"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="painel-rotulo">Adicionar</p>
              <div className="flex flex-wrap gap-2">
                {inativas.map((m) => (
                  <button key={m.id} type="button" onClick={() => mudar([...colunas, m.id])} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/75 hover:border-white/35 hover:text-white">
                    + {m.nome}
                  </button>
                ))}
                {!inativas.length && <p className="text-sm text-white/45">Todas as métricas já estão no relatório.</p>}
              </div>
              <button type="button" onClick={() => mudar(PADRAO)} className="mt-4 text-sm text-white/55 underline underline-offset-2 hover:text-white">
                Voltar ao padrão
              </button>
            </div>
          </div>
        )}
      </section>

      {secoes.map((s) => {
        const linhas =
          s.tipo === "campanhas" && ordem
            ? [...s.linhas].sort((a, b) => {
                const m = METRICAS.find((x) => x.id === ordem.id)!;
                const va = m.valor(a) ?? -Infinity;
                const vb = m.valor(b) ?? -Infinity;
                return ordem.desc ? vb - va : va - vb;
              })
            : s.linhas;
        return (
          <section key={s.titulo} className="painel-cartao overflow-x-auto p-5">
            <h2 className={`font-display font-extrabold ${s.tipo === "resumo" ? "text-xl" : "text-lg"}`}>{s.titulo}</h2>
            {linhas.length ? (
              <table className="painel-tabela mt-3 w-full text-left text-sm" style={{ minWidth: 200 + ativas.length * 120 }}>
                <thead>
                  <tr>
                    <th>{s.tipo === "resumo" ? "Mês" : "Campanha"}</th>
                    {ativas.map((m) => (
                      <th key={m.id} className="text-right" aria-sort={s.tipo === "campanhas" && ordem?.id === m.id ? (ordem.desc ? "descending" : "ascending") : undefined}>
                        {s.tipo === "campanhas" ? (
                          <button type="button" onClick={() => ordenar(m.id)} className="uppercase hover:text-white">
                            {m.nome}
                            {ordem?.id === m.id ? (ordem.desc ? " ↓" : " ↑") : ""}
                          </button>
                        ) : (
                          m.nome
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l, i) => (
                    <tr key={`${l.rotulo}-${i}`} className={l.destaque ? "font-semibold" : ""}>
                      <td>
                        {l.rotulo}
                        {l.detalhe && <span className="block text-xs font-normal text-white/45">{l.detalhe}</span>}
                      </td>
                      {ativas.map((m) => (
                        <td key={m.id} className="text-right">
                          {fmt(m, m.valor(l))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-2 text-sm text-white/55">Sem campanhas com investimento neste mês.</p>
            )}
            {s.tipo === "resumo" && <p className="mt-3 text-xs text-white/45">{nota}</p>}
          </section>
        );
      })}
    </div>
  );
}
