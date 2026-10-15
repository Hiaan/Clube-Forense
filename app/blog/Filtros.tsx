"use client";

// A barra de filtros do blog.
//
// Três eixos e uma busca. Cada escolha reescreve a query string e a página
// recarrega do servidor — nada é filtrado no navegador. Isso é de propósito: a
// lista pode ter centenas de posts, e mandar todos para o cliente só para
// esconder a maioria é o tipo de coisa que funciona em desenvolvimento e
// derruba o celular de quem está no 4G.
//
// Como consequência, toda combinação de filtro tem URL própria — dá para
// mandar "o blog da Politec-PE" por WhatsApp, e o Google indexa cada recorte.

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { CATEGORIAS, ESTADOS_FILTRO, ORGAOS } from "./lib/taxonomia";

const CAIXA =
  "w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm " +
  "text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

export default function Filtros({
  uf,
  orgao,
  categoria,
  busca,
  total,
}: {
  uf: string | null;
  orgao: string | null;
  categoria: string | null;
  busca: string | null;
  total: number;
}) {
  const router = useRouter();
  const parametros = useSearchParams();
  const [pendente, comecar] = useTransition();
  const [texto, setTexto] = useState(busca ?? "");

  /**
   * Troca um parâmetro e volta para a primeira página.
   *
   * Esquecer de zerar a página é o bug clássico desta tela: quem está na página
   * 4 de "notícias" e escolhe "Politec-PE" cairia na página 4 de um recorte com
   * seis posts, ou seja, numa tela vazia — e concluiria que não existe nada.
   */
  function ir(chave: string, valor: string) {
    const q = new URLSearchParams(parametros.toString());
    if (valor) q.set(chave, valor);
    else q.delete(chave);
    q.delete("pagina");
    comecar(() => router.push(q.size ? `/blog?${q}` : "/blog"));
  }

  const temFiltro = Boolean(uf || orgao || categoria || busca);

  return (
    <div className={`transition-opacity ${pendente ? "opacity-60" : ""}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ir("busca", texto.trim());
        }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Procurar no blog</span>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Procurar…"
            className={CAIXA}
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por concurso</span>
          <select
            value={orgao ?? ""}
            onChange={(e) => ir("orgao", e.target.value)}
            className={CAIXA}
          >
            <option value="">Todos os concursos</option>
            {ORGAOS.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.curto} — {o.estado}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filtrar por estado</span>
          <select value={uf ?? ""} onChange={(e) => ir("uf", e.target.value)} className={CAIXA}>
            <option value="">Todos os estados</option>
            {ESTADOS_FILTRO.map((e) => (
              <option key={e.uf} value={e.uf}>
                {e.nome}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filtrar por tipo de conteúdo</span>
          <select
            value={categoria ?? ""}
            onChange={(e) => ir("categoria", e.target.value)}
            className={CAIXA}
          >
            <option value="">Todo tipo de conteúdo</option>
            {CATEGORIAS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
      </form>

      {/* A linha do resultado só aparece com filtro ligado: sem filtro, dizer
          "148 posts" no topo da home não ajuda ninguém a decidir nada. */}
      {temFiltro && (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="font-semibold text-gray-900">
            {total} {total === 1 ? "post" : "posts"}
          </span>
          <button
            type="button"
            onClick={() => comecar(() => router.push("/blog"))}
            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
