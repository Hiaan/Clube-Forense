"use client";

// O cartão-resposta: a pessoa marca o que marcou na prova, questão por questão.
//
// Duas decisões que valem explicação:
//
//   - Pede a ALTERNATIVA, e não "quantas você acertou". É mais trabalho para
//     quem preenche, mas é o único jeito de a nota continuar valendo depois: o
//     gabarito muda no julgamento dos recursos, e quem informou só o total de
//     acertos fica com uma nota velha que ninguém consegue recalcular.
//
//   - Clicar de novo na letra marcada apaga a marcação. Sem isso, uma questão
//     tocada por engano ficaria respondida para sempre — e num cartão de 120
//     questões, num celular, o toque por engano é regra, não exceção.

import { useActionState, useState } from "react";

import { enviarCartaoAcao, type ResultadoEnvio } from "../acoes";
import { ALTERNATIVAS, type Cartao, type EstiloProva, type MateriaProva } from "../../lib/ranking";

export default function CartaoResposta({
  provaId,
  estilo,
  tipos,
  materias,
  apelidoInicial,
  cartaoInicial,
  tipoInicial,
}: {
  provaId: number;
  estilo: EstiloProva;
  /** Vazio quando a prova tem caderno único. */
  tipos: string[];
  materias: MateriaProva[];
  apelidoInicial: string;
  /** O que a pessoa já enviou antes, para poder corrigir em vez de recomeçar. */
  cartaoInicial: Cartao;
  tipoInicial: string;
}) {
  const [respostas, setRespostas] = useState<Cartao>(cartaoInicial);
  const [tipo, setTipo] = useState(tipoInicial || (tipos.length === 1 ? tipos[0] : ""));
  const [resultado, acao, enviando] = useActionState<ResultadoEnvio | null, FormData>(
    enviarCartaoAcao,
    null,
  );

  const letras = ALTERNATIVAS[estilo];
  const total = materias.reduce((t, m) => t + (m.questaoAte - m.questaoDe + 1), 0);
  const marcadas = Object.keys(respostas).length;

  function marcar(q: number, letra: string) {
    setRespostas((r) => {
      const novo = { ...r };
      if (novo[q] === letra) delete novo[q];
      else novo[q] = letra;
      return novo;
    });
  }

  return (
    <form action={acao} className="mt-6">
      <input type="hidden" name="provaId" value={provaId} />
      <input type="hidden" name="respostas" value={JSON.stringify(respostas)} />
      <input type="hidden" name="tipo" value={tipo} />

      <div className="rounded-2xl border border-white/10 bg-[#121215] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1" htmlFor="apelido">
            <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
              Como você aparece no ranking
            </span>
            <input
              id="apelido"
              name="apelido"
              defaultValue={apelidoInicial}
              maxLength={28}
              required
              placeholder="Seu nome ou um apelido"
              className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#ffcd07]"
            />
            <span className="text-[11px] text-gray-500">
              Seu e-mail nunca aparece — só este nome.
            </span>
          </label>

          {tipos.length > 0 && (
            <label className="flex flex-col gap-1" htmlFor="tipo">
              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Tipo do seu caderno
              </span>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
                className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-white outline-none focus:border-[#ffcd07]"
              >
                <option value="" disabled>
                  Escolha…
                </option>
                {tipos.map((t) => (
                  <option key={t} value={t} className="bg-[#141418]">
                    {t}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-500">
                Está na capa da prova. Cada tipo tem um gabarito diferente.
              </span>
            </label>
          )}
        </div>
      </div>

      {materias.map((m) => {
        const questoes = [];
        for (let q = m.questaoDe; q <= m.questaoAte; q++) questoes.push(q);
        const feitas = questoes.filter((q) => respostas[q]).length;

        return (
          <section key={`${m.nome}-${m.questaoDe}`} className="mt-4">
            <div className="flex items-baseline justify-between gap-3 px-1">
              <h3 className="text-sm font-bold text-white">{m.nome}</h3>
              <span className="text-[11px] text-gray-500">
                {feitas}/{questoes.length}
                {m.peso !== 1 && ` · peso ${m.peso}`}
              </span>
            </div>

            <ul className="mt-2 divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#121215] px-4">
              {questoes.map((q) => (
                <li key={q} className="flex items-center gap-3 py-2">
                  <span
                    className="w-8 shrink-0 text-right text-xs font-bold text-gray-500"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {q}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {letras.map((letra) => {
                      const marcado = respostas[q] === letra;
                      return (
                        <button
                          key={letra}
                          type="button"
                          onClick={() => marcar(q, letra)}
                          aria-pressed={marcado}
                          aria-label={`Questão ${q}, alternativa ${letra}`}
                          // 40px de lado: é o mínimo em que o dedo acerta a
                          // letra certa num cartão com dezenas de linhas.
                          className={`h-10 w-10 rounded-lg text-xs font-bold transition ${
                            marcado
                              ? "bg-[#ffcd07] text-gray-900"
                              : "border border-white/15 text-gray-300 hover:border-white/40"
                          }`}
                        >
                          {letra}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* Fica colado embaixo: num cartão de cem questões, um botão no fim da
          página é um botão que ninguém encontra sem rolar tudo de volta. */}
      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#0b0b0d]/95 py-4 backdrop-blur">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">
            {marcadas} de {total} questões marcadas
          </p>
          {resultado && (
            <p
              role="status"
              className={`text-sm font-medium ${
                resultado.ok ? "text-green-400" : "text-red-400"
              }`}
            >
              {resultado.mensagem}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="shrink-0 rounded-full bg-[#ffcd07] px-6 py-2.5 text-sm font-bold text-gray-900 transition hover:brightness-95 disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Enviar cartão"}
        </button>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
        Dá para enviar quantas vezes quiser: o último cartão substitui o anterior,
        e não cria uma segunda posição no ranking.
      </p>
    </form>
  );
}
