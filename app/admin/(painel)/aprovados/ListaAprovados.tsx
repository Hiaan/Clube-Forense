"use client";

// Lista de aprovados com edição no lugar: clicar em "Editar" abre o formulário
// na própria linha, em vez de navegar para outra tela. São cadastros curtos, e
// ir e voltar para trocar uma colocação custaria mais que a edição em si.

import Image from "next/image";
import { useActionState, useState } from "react";

import FormAprovado from "./FormAprovado";
import { apagarAprovadoAcao, type Resultado } from "../../acoes";
import { enviarSemLimpar } from "../../enviarSemLimpar";
import type { Aprovado } from "../../../lib/aprovadosRepo";

function Foto({ aprovado }: { aprovado: Aprovado }) {
  if (aprovado.fotoUrl) {
    return (
      <Image
        src={aprovado.fotoUrl}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  const ini = aprovado.nome
    .replace(/^dr[a]?\.?\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
      {ini}
    </span>
  );
}

function BotaoApagar({ id, nome }: { id: number; nome: string }) {
  const [resultado, acao, apagando] = useActionState<Resultado | null, FormData>(
    apagarAprovadoAcao,
    null,
  );

  return (
    <form
      onSubmit={(e) => {
        if (!window.confirm(`Remover ${nome}?`)) {
          e.preventDefault();
          return;
        }
        enviarSemLimpar(acao)(e);
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={apagando}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
      >
        {apagando ? "Removendo…" : "Remover"}
      </button>
      {resultado && !resultado.ok && (
        <span role="alert" className="ml-2 text-xs text-red-700">
          {resultado.mensagem}
        </span>
      )}
    </form>
  );
}

export default function ListaAprovados({
  aprovados,
  estados,
  temBlob,
}: {
  aprovados: Aprovado[];
  estados: { uf: string; nome: string }[];
  temBlob: boolean;
}) {
  const [editando, setEditando] = useState<number | null>(null);
  const nomeUf = new Map(estados.map((e) => [e.uf, e.nome]));

  // Agrupa por estado mantendo a ordem que veio do banco (uf, ordem, id).
  const porUf = new Map<string, Aprovado[]>();
  for (const a of aprovados) {
    const lista = porUf.get(a.uf) ?? [];
    lista.push(a);
    porUf.set(a.uf, lista);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...porUf.entries()].map(([uf, lista]) => (
        <section key={uf}>
          <h2 className="mb-2 flex items-baseline gap-2 text-sm font-bold text-gray-900">
            <span className="font-mono text-gray-400">{uf}</span>
            {nomeUf.get(uf) ?? uf}
            <span className="font-normal text-gray-400">
              · {lista.length} {lista.length === 1 ? "aprovado" : "aprovados"}
            </span>
          </h2>

          <ul className="flex flex-col gap-2">
            {lista.map((a) =>
              editando === a.id ? (
                <li key={a.id}>
                  <FormAprovado
                    estados={estados}
                    inicial={a}
                    temBlob={temBlob}
                    aoFechar={() => setEditando(null)}
                  />
                </li>
              ) : (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                >
                  <Foto aprovado={a} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{a.nome}</p>
                    <p className="truncate text-xs text-gray-500">
                      {[a.titulo, a.orgao, a.ano].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditando(a.id)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Editar
                  </button>
                  <BotaoApagar id={a.id} nome={a.nome} />
                </li>
              ),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
