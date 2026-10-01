"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/** Botão de envio que se desativa enquanto o formulário é processado. */
export function BotaoEnviar({
  children,
  enviando,
  className = "botao-painel",
  confirmar,
}: {
  children: ReactNode;
  enviando?: string;
  className?: string;
  /** Pergunta antes de enviar (ações que apagam algo). */
  confirmar?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      {pending && enviando ? enviando : children}
    </button>
  );
}

/** Select que envia o próprio formulário ao mudar (etapa do lead, status do plano). */
export function SelectAutoEnvio({
  name,
  valor,
  opcoes,
  rotulo,
  className = "",
}: {
  name: string;
  valor: string;
  opcoes: { valor: string; rotulo: string }[];
  rotulo: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    // key: o React reinicia formulários após a ação; remontar com o valor novo evita voltar ao antigo.
    <select
      key={valor}
      name={name}
      defaultValue={valor}
      aria-label={rotulo}
      disabled={pending}
      className={`painel-campo !min-h-[36px] !w-auto !py-1.5 !text-sm ${className}`}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      {opcoes.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.rotulo}
        </option>
      ))}
    </select>
  );
}
