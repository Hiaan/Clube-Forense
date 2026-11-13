"use client";

import { useContext } from "react";
import { useFormStatus } from "react-dom";
import { Processando } from "./Form";
import { botao } from "./estilo";

/** Botão de envio que avisa enquanto processa e pode pedir confirmação. */
export default function Enviar({
  children,
  enviando,
  className = botao,
  confirmar,
}: {
  children: React.ReactNode;
  enviando?: string;
  className?: string;
  confirmar?: string;
}) {
  const { pending: enviandoForm } = useFormStatus();
  const processando = useContext(Processando);
  const pending = enviandoForm || processando;
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      {pending && enviando ? enviando : children}
    </button>
  );
}
