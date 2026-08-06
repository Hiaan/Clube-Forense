"use client";

// Entrada do painel. Única página de /admin acessível sem sessão.

import { useActionState } from "react";

import { enviarSemLimpar } from "../enviarSemLimpar";
import { entrar, type Resultado } from "../acoes";

export default function LoginAdmin() {
  const [estado, acao, enviando] = useActionState<Resultado | null, FormData>(entrar, null);

  const campo =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none " +
    "focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
          Clube Forense
        </p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">Painel do monitor</h1>

        {/* method="post" é cinto de segurança: se o JavaScript não carregar, o
            navegador envia por POST em vez de pendurar a senha na URL. */}
        <form
          method="post"
          onSubmit={enviarSemLimpar(acao)}
          className="mt-6 flex flex-col gap-3"
        >
          <input
            className={campo}
            type="email"
            name="email"
            placeholder="E-mail"
            autoComplete="username"
            required
            autoFocus
          />
          <input
            className={campo}
            type="password"
            name="senha"
            placeholder="Senha"
            autoComplete="current-password"
            required
          />

          {estado && !estado.ok && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {estado.mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-1 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
