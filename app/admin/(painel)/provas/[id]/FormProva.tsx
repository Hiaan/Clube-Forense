"use client";

// Edição de uma prova do ranking.

import Link from "next/link";
import { useActionState } from "react";

import EditorMaterias from "./EditorMaterias";
import { salvarProvaAcao, type Resultado } from "../../../acoes";
import { enviarSemLimpar } from "../../../enviarSemLimpar";
import type { ProvaCompleta } from "../../../../lib/provasRepo";
import { ESTILO_LABEL, type EstiloProva } from "../../../../lib/ranking";

const ESTILOS: EstiloProva[] = ["abcde", "abcd", "ce"];

const campo =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none " +
  "focus:border-gray-900 focus:ring-1 focus:ring-gray-900";
const rotulo = "text-xs font-semibold uppercase tracking-wide text-gray-500";

function Campo({
  nome,
  label,
  dica,
  children,
}: {
  nome: string;
  label: string;
  dica?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1" htmlFor={nome}>
      <span className={rotulo}>{label}</span>
      {children}
      {dica && <span className="text-xs text-gray-400">{dica}</span>}
    </label>
  );
}

export default function FormProva({
  prova,
  estados,
}: {
  prova: ProvaCompleta;
  estados: { uf: string; nome: string }[];
}) {
  const [resultado, acao, salvando] = useActionState<Resultado | null, FormData>(
    salvarProvaAcao,
    null,
  );

  const v = (x: string | number | null | undefined) => (x == null ? "" : String(x));

  return (
    <form onSubmit={enviarSemLimpar(acao)} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={prova.id} />

      {/* ---------- Identificação ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-gray-900">A prova</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="uf" label="Estado">
            <select id="uf" name="uf" className={campo} defaultValue={prova.uf}>
              {estados.map((e) => (
                <option key={e.uf} value={e.uf}>
                  {e.uf} — {e.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo nome="dataProva" label="Data da prova">
            <input
              id="dataProva"
              name="dataProva"
              type="date"
              className={campo}
              defaultValue={v(prova.dataProva)}
            />
          </Campo>
        </div>

        <div className="mt-4">
          <Campo nome="titulo" label="Nome da prova">
            <input id="titulo" name="titulo" className={campo} defaultValue={prova.titulo} />
          </Campo>
        </div>

        <label className="mt-4 flex items-start gap-3 rounded-xl bg-gray-50 p-3">
          <input
            type="checkbox"
            name="aberta"
            defaultChecked={prova.aberta}
            className="mt-0.5 h-4 w-4"
          />
          <span className="text-sm text-gray-700">
            <strong>Prova acontecendo</strong> — é isto que faz o botão “Participar
            do ranking” aparecer no mapa e no card do estado. Desmarcar não apaga
            nada: o ranking continua acessível, só para de receber cartão novo.
          </span>
        </label>
      </section>

      {/* ---------- Como se responde ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-bold text-gray-900">Como se responde</h2>
        <p className="mb-4 text-sm text-gray-500">
          Define as alternativas do cartão e a conta da nota. Mudar aqui recorrige
          todos os cartões já enviados.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="estilo" label="Alternativas">
            <select id="estilo" name="estilo" className={campo} defaultValue={prova.estilo}>
              {ESTILOS.map((e) => (
                <option key={e} value={e}>
                  {ESTILO_LABEL[e]}
                </option>
              ))}
            </select>
          </Campo>
          <Campo
            nome="tipos"
            label="Tipos de caderno"
            dica="Separados por vírgula. Ex.: “Tipo 1, Tipo 2”. Deixe vazio se a prova é única — cada tipo tem o seu gabarito."
          >
            <input
              id="tipos"
              name="tipos"
              className={campo}
              defaultValue={prova.tipos.join(", ")}
              placeholder="Tipo 1, Tipo 2"
            />
          </Campo>
        </div>

        <label className="mt-4 flex items-start gap-3 rounded-xl bg-gray-50 p-3">
          <input
            type="checkbox"
            name="penalidade"
            defaultChecked={prova.penalidade}
            className="mt-0.5 h-4 w-4"
          />
          <span className="text-sm text-gray-700">
            <strong>Errada anula certa</strong> — o modelo do Cebraspe. Sem isto,
            a nota é a soma dos acertos e deixar em branco custa o mesmo que
            errar.
          </span>
        </label>
      </section>

      {/* ---------- Matérias ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-bold text-gray-900">Matérias</h2>
        <p className="mb-4 text-sm text-gray-500">
          A faixa de questões de cada uma. É daqui que sai o cartão-resposta que o
          candidato preenche e a nota por matéria que ele recebe de volta.
        </p>
        <EditorMaterias inicial={prova.materias} />
      </section>

      {/* ---------- Estimativa de corte ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-bold text-gray-900">Para estimar a nota de corte</h2>
        <p className="mb-4 text-sm text-gray-500">
          Com vagas e inscritos, o sistema projeta o corte sobre o total de
          candidatos. Sem os dois, ele mostra apenas como foi entre quem respondeu
          aqui — que é uma afirmação bem menor, e a tela diz isso.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="vagas" label="Vagas do edital" dica="Ampla concorrência + reservas.">
            <input
              id="vagas"
              name="vagas"
              type="number"
              min={1}
              className={campo}
              defaultValue={v(prova.vagas)}
            />
          </Campo>
          <Campo
            nome="inscritos"
            label="Inscritos"
            dica="O número que a banca divulga. É o denominador da projeção."
          >
            <input
              id="inscritos"
              name="inscritos"
              type="number"
              min={1}
              className={campo}
              defaultValue={v(prova.inscritos)}
            />
          </Campo>
        </div>
      </section>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-[#f8f9fb]/95 py-4 backdrop-blur">
        <div className="min-h-[20px]">
          {resultado && (
            <p
              role="status"
              className={`text-sm font-medium ${resultado.ok ? "text-green-700" : "text-red-700"}`}
            >
              {resultado.mensagem}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/provas"
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Voltar
          </Link>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Salvar prova"}
          </button>
        </div>
      </div>
    </form>
  );
}
