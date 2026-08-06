"use client";

// Formulário de edição de um estado.

import Link from "next/link";
import { useActionState, useState } from "react";

import CampoFoto from "../../../graficos/CampoFoto";
import EditorPlano from "./EditorPlano";
import { enviarSemLimpar } from "../../../enviarSemLimpar";
import { salvarEstadoAcao, type Resultado } from "../../../acoes";
import type { EstadoCuradoria } from "../../../../lib/estadosRepo";
import type { ClassePlano } from "../../../../lib/planoRepo";
import { NIVEL_LABEL, type Nivel } from "../../../../monitor/lib/tipos";

const ETAPAS: Nivel[] = [
  "sem", "estudo", "solicitado", "autorizado", "comissao", "banca", "edital", "noticia",
];

/** Menção que o robô coletou, oferecida como ponto de partida. */
export interface MencaoSugerida {
  titulo: string;
  resumo: string;
  fonte: string;
  link: string;
  data: string | null;
}

const campo =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none " +
  "focus:border-gray-900 focus:ring-1 focus:ring-gray-900";
const rotulo = "text-xs font-semibold uppercase tracking-wide text-gray-500";

function Campo({
  nome,
  label,
  children,
  dica,
}: {
  nome: string;
  label: string;
  children: React.ReactNode;
  dica?: string;
}) {
  return (
    <label className="flex flex-col gap-1" htmlFor={nome}>
      <span className={rotulo}>{label}</span>
      {children}
      {dica && <span className="text-xs text-gray-400">{dica}</span>}
    </label>
  );
}

export default function FormEstado({
  uf,
  nome,
  inicial,
  sugestoes,
  temBlob,
  plano,
}: {
  uf: string;
  nome: string;
  inicial: EstadoCuradoria | null;
  sugestoes: MencaoSugerida[];
  temBlob: boolean;
  plano: ClassePlano[];
}) {
  const [resultado, acao, salvando] = useActionState<Resultado | null, FormData>(
    salvarEstadoAcao,
    null,
  );

  // A notícia principal fica em estado do React para o botão "usar esta"
  // conseguir preencher os quatro campos de uma vez.
  const [noticia, setNoticia] = useState({
    titulo: inicial?.noticiaTitulo ?? "",
    resumo: inicial?.noticiaResumo ?? "",
    fonte: inicial?.noticiaFonte ?? "",
    link: inicial?.noticiaLink ?? "",
  });

  const v = (x: string | number | null | undefined) => (x == null ? "" : String(x));

  return (
    <form onSubmit={enviarSemLimpar(acao)} className="flex flex-col gap-8">
      <input type="hidden" name="uf" value={uf} />

      {/* ---------- Situação ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-gray-900">Situação</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="etapa" label="Estágio do edital">
            <select id="etapa" name="etapa" className={campo} defaultValue={inicial?.etapa ?? "sem"}>
              {ETAPAS.map((e) => (
                <option key={e} value={e}>
                  {NIVEL_LABEL[e]}
                </option>
              ))}
            </select>
          </Campo>

          <Campo nome="confianca" label="Confiança">
            <select
              id="confianca"
              name="confianca"
              className={campo}
              defaultValue={inicial?.confianca ?? "media"}
            >
              <option value="alta">alta — conferido no edital</option>
              <option value="media">média — a confirmar</option>
              <option value="baixa">baixa — indício solto</option>
            </select>
          </Campo>
        </div>

        <div className="mt-4">
          <Campo
            nome="andamento"
            label="Andamento"
            dica="Texto que descreve a situação. Aparece no site quando não há notícia principal escolhida."
          >
            <textarea
              id="andamento"
              name="andamento"
              rows={4}
              className={campo}
              defaultValue={v(inicial?.andamento)}
            />
          </Campo>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo nome="previsao" label="Previsão">
            <input id="previsao" name="previsao" className={campo} defaultValue={v(inicial?.previsao)} />
          </Campo>
          <Campo nome="verificadoEm" label="Conferido em" dica="Quando VOCÊ checou por último.">
            <input
              id="verificadoEm"
              name="verificadoEm"
              type="date"
              className={campo}
              defaultValue={v(inicial?.verificadoEm)}
            />
          </Campo>
        </div>

        <div className="mt-4">
          {temBlob ? (
            <CampoFoto
              nome="imagemUrl"
              pasta="estados"
              valorInicial={inicial?.imagemUrl ?? null}
              rotulo="Imagem do estado"
            />
          ) : (
            <input type="hidden" name="imagemUrl" value={inicial?.imagemUrl ?? ""} />
          )}
        </div>

        <label className="mt-4 flex items-start gap-3 rounded-xl bg-gray-50 p-3">
          <input
            type="checkbox"
            name="travado"
            defaultChecked={inicial?.travado ?? false}
            className="mt-0.5 h-4 w-4"
          />
          <span className="text-sm text-gray-700">
            <strong>Travado</strong> — nenhuma notícia altera o estágio deste estado.
            Use quando você souber algo que a manchete não mostra, como um concurso
            que parece avançar mas não tem vaga de médico-legista.
          </span>
        </label>
      </section>

      {/* ---------- Notícia principal ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-900">Notícia principal</h2>
        <p className="mt-1 text-sm text-gray-500">
          É o que aparece no topo do estado, no site. Deixe tudo em branco para o
          robô escolher sozinho.
        </p>

        {sugestoes.length > 0 && (
          <div className="mt-4">
            <p className={rotulo}>O robô encontrou</p>
            <div className="mt-2 flex flex-col gap-2">
              {sugestoes.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{s.titulo}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{s.resumo}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{s.fonte}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNoticia({
                        titulo: s.titulo,
                        resumo: s.resumo,
                        fonte: s.fonte,
                        link: s.link,
                      })
                    }
                    className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Usar esta
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-4">
          <Campo nome="noticiaTitulo" label="Título">
            <input
              id="noticiaTitulo"
              name="noticiaTitulo"
              className={campo}
              value={noticia.titulo}
              onChange={(e) => setNoticia({ ...noticia, titulo: e.target.value })}
            />
          </Campo>
          <Campo nome="noticiaResumo" label="Resumo">
            <textarea
              id="noticiaResumo"
              name="noticiaResumo"
              rows={3}
              className={campo}
              value={noticia.resumo}
              onChange={(e) => setNoticia({ ...noticia, resumo: e.target.value })}
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo nome="noticiaFonte" label="Fonte">
              <input
                id="noticiaFonte"
                name="noticiaFonte"
                className={campo}
                value={noticia.fonte}
                onChange={(e) => setNoticia({ ...noticia, fonte: e.target.value })}
              />
            </Campo>
            <Campo
              nome="noticiaLink"
              label="Link"
              dica="Troque pelo endereço do seu blog para o clique ficar no seu site."
            >
              <input
                id="noticiaLink"
                name="noticiaLink"
                type="url"
                className={campo}
                value={noticia.link}
                onChange={(e) => setNoticia({ ...noticia, link: e.target.value })}
              />
            </Campo>
          </div>
        </div>
      </section>

      {/* ---------- Concurso ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-gray-900">Concurso</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo nome="vagasImediatas" label="Vagas imediatas">
            <input id="vagasImediatas" name="vagasImediatas" type="number" className={campo} defaultValue={v(inicial?.vagasImediatas)} />
          </Campo>
          <Campo nome="vagasCr" label="Cadastro de reserva">
            <input id="vagasCr" name="vagasCr" type="number" className={campo} defaultValue={v(inicial?.vagasCr)} />
          </Campo>
          <Campo nome="salarioInicial" label="Salário inicial (R$)">
            <input id="salarioInicial" name="salarioInicial" className={campo} defaultValue={v(inicial?.salarioInicial)} />
          </Campo>
          <Campo nome="cargaHoraria" label="Carga horária (h)">
            <input id="cargaHoraria" name="cargaHoraria" type="number" className={campo} defaultValue={v(inicial?.cargaHoraria)} />
          </Campo>
          <Campo nome="banca" label="Banca">
            <input id="banca" name="banca" className={campo} defaultValue={v(inicial?.banca)} />
          </Campo>
          <Campo nome="especialidades" label="Especialidades">
            <input id="especialidades" name="especialidades" className={campo} defaultValue={v(inicial?.especialidades)} />
          </Campo>
          <Campo nome="inscricoesAte" label="Inscrições até">
            <input id="inscricoesAte" name="inscricoesAte" type="date" className={campo} defaultValue={v(inicial?.inscricoesAte)} />
          </Campo>
          <Campo nome="dataProva" label="Data da prova">
            <input id="dataProva" name="dataProva" type="date" className={campo} defaultValue={v(inicial?.dataProva)} />
          </Campo>
          <Campo nome="fonteUrl" label="Fonte (link)">
            <input id="fonteUrl" name="fonteUrl" type="url" className={campo} defaultValue={v(inicial?.fonteUrl)} />
          </Campo>
        </div>
      </section>

      {/* ---------- Plano de carreira ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-bold text-gray-900">Plano de cargos e carreiras</h2>
        <p className="mb-4 text-sm text-gray-500">
          A tabela de classes e subsídios do estado. Aparece no site, no detalhe
          deste estado.
        </p>

        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Campo nome="planoOrgao" label="Órgão" dica="Ex.: ITEP/RN">
            <input id="planoOrgao" name="planoOrgao" className={campo} defaultValue={v(inicial?.planoOrgao)} />
          </Campo>
          <Campo nome="planoAno" label="Ano do plano">
            <input id="planoAno" name="planoAno" type="number" className={campo} defaultValue={v(inicial?.planoAno)} />
          </Campo>
          <Campo nome="planoFonte" label="Fonte (link)">
            <input id="planoFonte" name="planoFonte" type="url" className={campo} defaultValue={v(inicial?.planoFonte)} />
          </Campo>
        </div>

        <EditorPlano inicial={plano} />
      </section>

      {/* ---------- Histórico ---------- */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-bold text-gray-900">Histórico</h2>
        <p className="mb-4 text-sm text-gray-500">
          O certame anterior. A validade dele costuma ser o que trava o próximo.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="ultimoEdital" label="Último edital">
            <input id="ultimoEdital" name="ultimoEdital" type="date" className={campo} defaultValue={v(inicial?.ultimoEdital)} />
          </Campo>
          <Campo nome="ultimaProva" label="Última prova">
            <input id="ultimaProva" name="ultimaProva" type="date" className={campo} defaultValue={v(inicial?.ultimaProva)} />
          </Campo>
          <Campo nome="bancaAnterior" label="Banca anterior">
            <input id="bancaAnterior" name="bancaAnterior" className={campo} defaultValue={v(inicial?.bancaAnterior)} />
          </Campo>
          <Campo nome="validadeCertameAnterior" label="Validade do certame anterior">
            <input id="validadeCertameAnterior" name="validadeCertameAnterior" type="date" className={campo} defaultValue={v(inicial?.validadeCertameAnterior)} />
          </Campo>
        </div>
        <div className="mt-4">
          <Campo nome="observacao" label="Observação">
            <textarea id="observacao" name="observacao" rows={2} className={campo} defaultValue={v(inicial?.observacao)} />
          </Campo>
        </div>
      </section>

      {/* ---------- Salvar ---------- */}
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
            href="/admin/estados"
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Voltar
          </Link>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {salvando ? "Salvando…" : `Salvar ${nome}`}
          </button>
        </div>
      </div>
    </form>
  );
}
