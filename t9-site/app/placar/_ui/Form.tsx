"use client";

import { createContext, startTransition, useActionState } from "react";
import type { Estado } from "@/app/painel/admin/acoes";

/** Diz ao botão de envio que o formulário está processando. */
export const Processando = createContext(false);

/**
 * Formulário ligado a uma Server Action; mostra a mensagem de sucesso ou de erro logo abaixo.
 * Envia pelo onSubmit (e não pelo action do form) para o React não apagar o que a pessoa
 * digitou quando volta um erro (senha errada, campo faltando).
 */
export default function Form({
  acao,
  children,
  className = "",
}: {
  acao: (anterior: Estado, dados: FormData) => Promise<Estado>;
  children: React.ReactNode;
  className?: string;
}) {
  const [estado, enviar, processando] = useActionState(acao, {});
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
        startTransition(() => enviar(dados));
      }}
    >
      <Processando.Provider value={processando}>{children}</Processando.Provider>
      {estado.mensagem && (
        <p
          role={estado.ok ? "status" : "alert"}
          className={`mt-4 rounded-[10px] px-4 py-3 text-sm ${estado.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
