"use client";

import { useActionState } from "react";
import { pedirLink, type EstadoLogin } from "../acoes";
import type { TextosPainel } from "@/lib/painel/textos";
import type { Idioma } from "@/lib/i18n";

export default function FormLogin({ t, idioma }: { t: TextosPainel["login"]; idioma: Idioma }) {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(pedirLink, { estado: "inicio" });

  if (estado.estado === "enviado") {
    return (
      <p role="status" className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-4 text-sm leading-relaxed text-emerald-100">
        {t.enviado}
      </p>
    );
  }

  const erro = { email: t.emailInvalido, limite: t.limite, erro: t.erro, inicio: null }[estado.estado];
  return (
    <form action={acao} className="mt-6">
      <input type="hidden" name="idioma" value={idioma} />
      <label htmlFor="email" className="painel-rotulo">
        {t.email}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        className="painel-campo !min-h-[50px]"
        placeholder="voce@empresa.com"
        aria-invalid={estado.estado === "email" || undefined}
      />
      {erro && (
        <p role="alert" className="mt-3 text-sm text-[#ff8a90]">
          {erro}
        </p>
      )}
      <button className="botao-painel mt-5 w-full !min-h-[50px] !text-base" disabled={enviando}>
        {enviando ? t.enviando : t.enviar}
      </button>
    </form>
  );
}
