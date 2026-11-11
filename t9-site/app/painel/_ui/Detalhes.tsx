"use client";

import { useState } from "react";

/**
 * <details> que guarda o próprio estado aberto/fechado. Com o `open` vindo do servidor, a seção
 * fechava sozinha depois de salvar (os dados mudavam a condição) e escondia a mensagem de sucesso.
 */
export default function Detalhes({
  inicialAberto = false,
  resumo,
  className = "",
  children,
}: {
  inicialAberto?: boolean;
  resumo: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(inicialAberto);
  return (
    <details className={className} open={aberto} onToggle={(e) => setAberto(e.currentTarget.open)}>
      <summary className="cursor-pointer font-display font-extrabold">{resumo}</summary>
      {children}
    </details>
  );
}
