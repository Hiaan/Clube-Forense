"use client";

// "Mais informações": a ficha do concurso do estado.
//
// Reúne num lugar só o que hoje está espalhado entre o card, o painel e o
// edital em PDF — estágio, salário, vagas, banca, TAF e o que caiu na prova.
// É a resposta à pergunta que antecede todas as outras: "vale a pena eu
// estudar para este estado?".
//
// Regra que atravessa a tela inteira: campo vazio não aparece. Uma ficha cheia
// de "—" ensina a pessoa a não confiar no que está escrito ali, e o que
// sabemos varia muito de estado para estado.

import { useState } from "react";

import Modal from "./Modal";
import { type FichaConcurso } from "./ficha";

const TEMAS = {
  escuro: "border border-white/15 text-white hover:bg-white/[0.08]",
  claro:
    "border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900",
} as const;

function reais(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function data(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR");
}

/** Faixa salarial: "de X a Y", ou só o que houver. */
function faixa(inicial: number | null, final: number | null): string | null {
  if (inicial != null && final != null) return `${reais(inicial)} a ${reais(final)}`;
  if (inicial != null) return `${reais(inicial)} (inicial)`;
  if (final != null) return `${reais(final)} (final da carreira)`;
  return null;
}

/** Vagas: imediatas e CR são coisas diferentes e a pessoa precisa das duas. */
function vagas(imediatas: number | null, cr: number | null): string | null {
  const partes: string[] = [];
  if (imediatas != null) partes.push(`${imediatas} imediata${imediatas === 1 ? "" : "s"}`);
  if (cr != null) partes.push(`${cr} em cadastro de reserva`);
  return partes.length ? partes.join(" + ") : null;
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-white/5 py-2.5 last:border-b-0">
      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {rotulo}
      </span>
      <span className="text-sm font-semibold text-white">{valor}</span>
    </div>
  );
}

export default function BotaoInfo({
  ficha,
  estado,
  tema = "escuro",
}: {
  ficha: FichaConcurso;
  estado: string;
  tema?: keyof typeof TEMAS;
}) {
  const [aberto, setAberto] = useState(false);

  const linhas: { rotulo: string; valor: string }[] = [];
  const juntar = (rotulo: string, valor: string | null | undefined) => {
    if (valor) linhas.push({ rotulo, valor });
  };

  juntar("Estágio", ficha.estagio);
  juntar("Faixa salarial", faixa(ficha.salarioInicial, ficha.salarioFinal));
  juntar("Vagas", vagas(ficha.vagasImediatas, ficha.vagasCr));
  juntar("Banca", ficha.banca);
  // Só entra quando alguém conferiu: `null` fica de fora em vez de virar "não".
  juntar("TAF", ficha.taf == null ? null : ficha.taf ? "Sim" : "Não");
  juntar("Carga horária", ficha.cargaHoraria ? `${ficha.cargaHoraria}h semanais` : null);
  juntar("Especialidades", ficha.especialidades);
  juntar("Inscrições até", ficha.inscricoesAte ? data(ficha.inscricoesAte) : null);
  juntar("Data da prova", ficha.dataProva ? data(ficha.dataProva) : null);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${TEMAS[tema]}`}
      >
        Mais informações
      </button>

      {aberto && (
        <Modal
          sobretitulo={estado}
          titulo="O concurso"
          aoFechar={() => setAberto(false)}
        >
          {/* O aviso vem ANTES da ficha, e não num rodapé: quem lê "40 vagas" e
              só depois descobre que era de 2019 já tomou a decisão errada. */}
          {ficha.doAnterior && (
            <p className="mt-4 rounded-xl border border-[#ffcd07]/30 bg-[#ffcd07]/10 px-4 py-3 text-xs leading-relaxed text-[#ffcd07]">
              O edital novo ainda não saiu. Estes números são do concurso
              anterior{ficha.anoAnterior ? ` (${ficha.anoAnterior})` : ""} e servem
              de referência — o próximo edital pode mudar qualquer um deles.
            </p>
          )}

          <div className="mt-4">
            {linhas.map((l) => (
              <Linha key={l.rotulo} rotulo={l.rotulo} valor={l.valor} />
            ))}
          </div>

          {ficha.materias && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Matérias para médico-legista
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-300">
                {ficha.materias}
              </p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
