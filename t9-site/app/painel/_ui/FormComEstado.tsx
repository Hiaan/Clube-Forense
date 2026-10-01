"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { Estado } from "../admin/acoes";

/**
 * Formulário ligado a uma Server Action que devolve { ok, mensagem, link }.
 * Mostra a mensagem, o link gerado (com botão de copiar) e limpa os campos após sucesso.
 */
export default function FormComEstado({
  acao,
  children,
  className = "",
  limparAoSalvar = false,
}: {
  acao: (anterior: Estado, dados: FormData) => Promise<Estado>;
  children: React.ReactNode;
  className?: string;
  limparAoSalvar?: boolean;
}) {
  const [estado, enviar] = useActionState(acao, {});
  const form = useRef<HTMLFormElement>(null);
  const [copiadoEm, setCopiadoEm] = useState<number | undefined>();
  const copiado = copiadoEm !== undefined && copiadoEm === estado.vez;

  useEffect(() => {
    if (estado.ok && limparAoSalvar) form.current?.reset();
  }, [estado, limparAoSalvar]);

  return (
    <form ref={form} action={enviar} className={className}>
      {children}
      {estado.mensagem && (
        <div
          role={estado.ok ? "status" : "alert"}
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            estado.ok ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-[#ff2d38]/30 bg-[#ff2d38]/10 text-[#ffb3b7]"
          }`}
        >
          <p>{estado.mensagem}</p>
          {estado.link && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input readOnly value={estado.link} className="painel-campo !min-h-[38px] flex-1 !text-xs" onFocus={(e) => e.currentTarget.select()} />
              <button
                type="button"
                className="botao-painel botao-painel-sec !min-h-[38px]"
                onClick={async () => {
                  await navigator.clipboard.writeText(estado.link!);
                  setCopiadoEm(estado.vez);
                }}
              >
                {copiado ? "Copiado ✓" : "Copiar link"}
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
