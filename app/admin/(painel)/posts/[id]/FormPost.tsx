"use client";

// Editor de um post.
//
// Uma coluna só, na ordem em que se escreve: título, resumo, texto, e só então
// as etiquetas. O painel de estados é uma grade densa porque lá são 40 campos
// de referência; aqui são sete, e o que a tela precisa dar é espaço para o
// texto — a caixa do corpo é o maior elemento da página de propósito.

import Link from "next/link";
import { useActionState, useState } from "react";

import CampoFoto from "../../../graficos/CampoFoto";
import ColarReferencia from "./ColarReferencia";
import { enviarSemLimpar } from "../../../enviarSemLimpar";
import {
  apagarPostAcao,
  salvarPostAcao,
  type Resultado,
  type ResultadoReescrita,
} from "../../../acoes";
import type { Post } from "../../../../lib/postsRepo";
import { aSlug, CATEGORIAS, ESTADOS_FILTRO, orgaoDaUf } from "../../../../blog/lib/taxonomia";

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

export default function FormPost({ inicial }: { inicial: Post | null }) {
  const [resultado, enviar] = useActionState<Resultado | null, FormData>(salvarPostAcao, null);

  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [slug, setSlug] = useState(inicial?.slug ?? "");
  const [uf, setUf] = useState(inicial?.uf ?? "");

  // A REESCRITA TROCA O CONTEÚDO DAS CAIXAS, E ISSO PRECISOU DE UM TRUQUE. As
  // três caixas de texto são não controladas (`defaultValue`), que é o certo
  // para um formulário comprido — nada de um render por tecla digitada. Mas
  // `defaultValue` só vale no primeiro render: mudar o valor depois não mexe
  // numa caixa que já existe. A saída é trocar a `key` do bloco inteiro, o que
  // faz o React jogar fora as caixas antigas e montar caixas novas com o texto
  // novo. Efeito colateral assumido e avisado na tela: o que estava escrito à
  // mão é substituído, que é justamente o que se pede ao clicar em reescrever.
  const [reescrita, setReescrita] = useState<ResultadoReescrita | null>(null);
  // A categoria também vem da reescrita: receber o texto pronto e ainda ter de
  // acertar um campo à mão é o tipo de sobra que faz "pronto para postar" não
  // ser pronto para postar.
  const [categoria, setCategoria] = useState(inicial?.categoria ?? "noticia");
  const texto = {
    titulo: reescrita?.post?.titulo ?? inicial?.titulo ?? "",
    resumo: reescrita?.post?.resumo ?? inicial?.resumo ?? "",
    corpo: reescrita?.post?.corpo ?? inicial?.corpo ?? "",
  };

  // O slug só é sugerido enquanto o post nunca foi gravado. Depois disso ele é
  // o endereço público, e reescrever a cada letra do título quebraria o link de
  // quem já compartilhou.
  const novo = !inicial;
  const slugMostrado = novo && !slug ? aSlug(titulo) : slug;
  const orgao = uf ? orgaoDaUf(uf) : null;

  return (
    <form onSubmit={enviarSemLimpar(enviar)} className="mx-auto max-w-3xl space-y-5">
      <input type="hidden" name="id" value={inicial?.id ?? ""} />
      <input type="hidden" name="origem" value={inicial?.origem ?? "manual"} />
      <input type="hidden" name="publicadoEm" value={inicial?.publicadoEm ?? ""} />
      {/* O órgão é derivado da UF na ação; vai junto só para a tela poder
          mostrar qual é antes de salvar. */}
      <input type="hidden" name="orgaoMostrado" value={orgao?.slug ?? ""} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/posts" className="text-sm font-semibold text-gray-500 hover:text-gray-900">
          ← Blog
        </Link>
        {inicial?.status === "publicado" && (
          <Link
            href={`/blog/${inicial.slug}`}
            target="_blank"
            className="text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Ver no ar ↗
          </Link>
        )}
      </div>

      {inicial?.origem === "robo" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-900">
          <strong className="font-bold">Rascunho do robô.</strong> O texto abaixo
          foi montado a partir da notícia encontrada na coleta — leia, reescreva
          com as suas palavras e confira os números antes de publicar. A capa,
          quando veio, é a imagem da própria matéria: troque ou remova se não
          tiver direito de uso.
        </div>
      )}

      <ColarReferencia
        uf={uf}
        aoReescrever={(r) => {
          setReescrita(r);
          if (r.post) setTitulo(r.post.titulo);
          if (r.categoria) setCategoria(r.categoria);
        }}
      />

      <section
        key={reescrita?.em ?? "inicial"}
        className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5"
      >
        <Campo nome="titulo" label="Título">
          <input
            id="titulo"
            name="titulo"
            required
            defaultValue={texto.titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={`${campo} text-base font-semibold`}
          />
        </Campo>

        <Campo
          nome="resumo"
          label="Resumo"
          dica="Duas linhas. É o que aparece no cartão da listagem e na prévia do Google."
        >
          <textarea
            id="resumo"
            name="resumo"
            rows={2}
            defaultValue={texto.resumo}
            className={campo}
          />
        </Campo>

        <Campo
          nome="corpo"
          label="Texto"
          dica="Markdown simples: ## título, **negrito**, *itálico*, [texto](link), - lista, > citação, --- separador."
        >
          <textarea
            id="corpo"
            name="corpo"
            rows={22}
            defaultValue={texto.corpo}
            className={`${campo} font-mono text-[13px] leading-relaxed`}
          />
        </Campo>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-900">Capa</h2>
        <CampoFoto
          nome="capaUrl"
          pasta="blog"
          rotulo="Imagem"
          valorInicial={inicial?.capaUrl ?? null}
        />
        <Campo
          nome="capaCredito"
          label="Crédito da foto"
          dica="Quem fez ou de onde saiu. Sem crédito, prefira publicar sem capa — o cartão usa a sigla do órgão."
        >
          <input
            id="capaCredito"
            name="capaCredito"
            defaultValue={inicial?.capaCredito ?? ""}
            className={campo}
          />
        </Campo>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="font-bold text-gray-900">Classificação</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            nome="uf"
            label="Estado"
            dica={
              orgao
                ? `Filtra também por ${orgao.curto}.`
                : "Vazio = post nacional, sem estado nem órgão."
            }
          >
            <select
              id="uf"
              name="uf"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className={campo}
            >
              <option value="">Nacional</option>
              {ESTADOS_FILTRO.map((e) => (
                <option key={e.uf} value={e.uf}>
                  {e.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo nome="categoria" label="Tipo de conteúdo">
            <select
              id="categoria"
              name="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={campo}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            nome="fonteNome"
            label="Fonte (nome)"
            dica="Só preencha para dar crédito. Com nome, o post mostra a caixa “Fonte” no fim; vazio, não mostra nada — que é o caso do texto escrito pelo monitor, feito da nossa própria base."
          >
            <input
              id="fonteNome"
              name="fonteNome"
              defaultValue={inicial?.fonteNome ?? ""}
              className={campo}
            />
          </Campo>

          <Campo
            nome="fonteUrl"
            label="Fonte (link)"
            dica="Onde a notícia apareceu. Fica só aqui no painel, para você conferir o fato antes de publicar — e é ele que impede a mesma notícia de virar duas pautas."
          >
            <input
              id="fonteUrl"
              name="fonteUrl"
              type="url"
              placeholder="https://…"
              defaultValue={inicial?.fonteUrl ?? ""}
              className={campo}
            />
          </Campo>
        </div>

        <Campo
          nome="slug"
          label="Endereço"
          dica={
            novo
              ? "Gerado a partir do título. Dá para mudar agora; depois de publicado, mudar quebra links."
              : "Mudar aqui quebra todo link já compartilhado deste post."
          }
        >
          <div className="flex items-center gap-1">
            <span className="shrink-0 text-xs text-gray-400">/blog/</span>
            <input
              id="slug"
              name="slug"
              value={slugMostrado}
              onChange={(e) => setSlug(e.target.value)}
              className={`${campo} font-mono text-[13px]`}
            />
          </div>
        </Campo>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Campo nome="status" label="Situação">
            <select
              id="status"
              name="status"
              defaultValue={inicial?.status ?? "rascunho"}
              className={campo}
            >
              <option value="rascunho">Rascunho</option>
              <option value="revisao">Para revisar</option>
              <option value="publicado">Publicado — no ar</option>
            </select>
          </Campo>

          <div className="flex gap-2">
            {inicial && (
              // Apagar fica longe de Salvar e com confirmação: é a única ação
              // desta tela que não dá para desfazer.
              <button
                type="submit"
                formAction={apagarPostAcao}
                formNoValidate
                onClick={(e) => {
                  if (!confirm("Apagar este post? Não dá para desfazer.")) e.preventDefault();
                }}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Apagar
              </button>
            )}
            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-bold text-[#ffcd07] hover:bg-gray-800"
            >
              Salvar
            </button>
          </div>
        </div>

        {resultado && (
          <p
            role="status"
            className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-medium ${
              resultado.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {resultado.mensagem}
          </p>
        )}
      </section>
    </form>
  );
}
