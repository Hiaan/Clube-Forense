"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type DadosAviso = {
  chave: string;
  nivel: "lembrete" | "atraso" | "suspensao";
  titulo: string;
  texto: string;
  extra: string | null;
  link: string | null;
  instrucoes: string | null;
  hrefFinanceiro: string;
  rotulos: { pagarAgora: string; verFinanceiro: string; fechar: string; jaPaguei: string; comoPagar: string; copiar: string; copiado: string };
};

const ESTILO = {
  lembrete: { faixa: "from-[#a80d14] to-[#ff3540]", icone: "🗓️" },
  atraso: { faixa: "from-amber-600 to-amber-400", icone: "⚠️" },
  suspensao: { faixa: "from-[#7c0409] to-[#e3121c]", icone: "⛔" },
} as const;

/**
 * Pop-up de pagamento. Lembretes aparecem uma vez por dia; atrasos, uma vez por sessão
 * do navegador (mais insistente). Com `sempre`, abre toda vez (pré-visualização da equipe).
 */
export default function AvisoPagamento({ aviso, sempre = false }: { aviso: DadosAviso; sempre?: boolean }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [copiado, setCopiado] = useState(false);
  const armazenamento = () => {
    try {
      return aviso.nivel === "lembrete" ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let visto = false;
    try {
      visto = !sempre && armazenamento()?.getItem(aviso.chave) === "1";
    } catch {
      visto = false;
    }
    if (!visto && dialogo.current && !dialogo.current.open) {
      dialogo.current.showModal();
      // Foco no botão principal (o navegador focaria o primeiro botão, o "Copiar").
      dialogo.current.querySelector<HTMLElement>("[data-foco]")?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aviso.chave, sempre]);

  const fechar = () => {
    try {
      if (!sempre) armazenamento()?.setItem(aviso.chave, "1");
    } catch {
      // sem armazenamento (navegação privada): o aviso só volta na próxima visita
    }
    dialogo.current?.close();
  };

  const estilo = ESTILO[aviso.nivel];
  return (
    <dialog
      ref={dialogo}
      onCancel={fechar}
      aria-labelledby="aviso-pagamento-titulo"
      className="m-auto w-[min(92vw,460px)] overflow-hidden rounded-3xl border border-white/10 bg-[#140405] p-0 text-white shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className={`h-2 bg-gradient-to-r ${estilo.faixa}`} />
      <div className="p-6 sm:p-7">
        <p className="text-3xl" aria-hidden="true">
          {estilo.icone}
        </p>
        <h2 id="aviso-pagamento-titulo" className="mt-3 font-display text-2xl leading-tight font-extrabold">
          {aviso.titulo}
        </h2>
        <p className="mt-3 leading-relaxed text-white/75">{aviso.texto}</p>
        {aviso.extra && <p className="mt-3 rounded-xl bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-200">{aviso.extra}</p>}

        {aviso.instrucoes && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium tracking-wide text-white/50 uppercase">{aviso.rotulos.comoPagar}</p>
              <button
                type="button"
                className="text-xs text-[#ff8a90] hover:underline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(aviso.instrucoes!);
                    setCopiado(true);
                  } catch {
                    setCopiado(false);
                  }
                }}
              >
                {copiado ? `${aviso.rotulos.copiado} ✓` : aviso.rotulos.copiar}
              </button>
            </div>
            <p className="mt-1.5 text-sm whitespace-pre-line text-white/85">{aviso.instrucoes}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {aviso.link && (
            <a href={aviso.link} target="_blank" rel="noopener noreferrer" className="botao-painel" data-foco>
              {aviso.rotulos.pagarAgora} ↗
            </a>
          )}
          <Link
            href={aviso.hrefFinanceiro}
            onClick={fechar}
            className={aviso.link ? "botao-painel botao-painel-sec" : "botao-painel"}
            {...(aviso.link ? {} : { "data-foco": true })}
          >
            {aviso.rotulos.verFinanceiro}
          </Link>
          <button type="button" onClick={fechar} className="ml-auto px-3 text-sm text-white/55 hover:text-white">
            {aviso.rotulos.fechar}
          </button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/40">{aviso.rotulos.jaPaguei}</p>
      </div>
    </dialog>
  );
}
