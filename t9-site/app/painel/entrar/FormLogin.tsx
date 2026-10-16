"use client";

import { useActionState, useState } from "react";
import { entrarSenha, pedirLink, type EstadoLogin, type EstadoSenha } from "../acoes";
import type { TextosPainel } from "@/lib/painel/textos";
import type { Idioma } from "@/lib/i18n";

/** Login com e-mail e senha. O link por e-mail fica para "esqueci a senha" e primeiro acesso. */
export default function FormLogin({ t, idioma }: { t: TextosPainel["login"]; idioma: Idioma }) {
  const [modo, setModo] = useState<"senha" | "link">("senha");
  return modo === "senha" ? (
    <FormSenha t={t} aoEsquecer={() => setModo("link")} />
  ) : (
    <FormLink t={t} idioma={idioma} aoVoltar={() => setModo("senha")} />
  );
}

function FormSenha({ t, aoEsquecer }: { t: TextosPainel["login"]; aoEsquecer: () => void }) {
  const [estado, acao, enviando] = useActionState<EstadoSenha, FormData>(entrarSenha, { estado: "inicio" });
  const erro = { invalido: t.senhaInvalida, limite: t.limite, erro: t.erro, inicio: null }[estado.estado];
  return (
    <form action={acao} className="mt-6">
      <label htmlFor="email" className="painel-rotulo">
        {t.email}
      </label>
      <input
        key={estado.vez}
        id="email"
        name="email"
        type="email"
        required
        autoComplete="username"
        autoFocus={!estado.email}
        defaultValue={estado.email}
        className="painel-campo !min-h-[50px]"
        placeholder="voce@empresa.com"
      />
      <label htmlFor="senha" className="painel-rotulo mt-4 block">
        {t.senha}
      </label>
      <input
        id="senha"
        name="senha"
        type="password"
        required
        autoComplete="current-password"
        autoFocus={Boolean(estado.email)}
        className="painel-campo !min-h-[50px]"
        aria-invalid={estado.estado === "invalido" || undefined}
      />
      {erro && (
        <p role="alert" className="mt-3 text-sm text-[#ff8a90]">
          {erro}
        </p>
      )}
      <button className="botao-painel mt-5 w-full !min-h-[50px] !text-base" disabled={enviando}>
        {enviando ? t.entrando : t.entrar}
      </button>
      <button type="button" onClick={aoEsquecer} className="mt-4 w-full text-center text-sm text-white/55 underline-offset-2 hover:text-white hover:underline">
        {t.esqueci}
      </button>
    </form>
  );
}

function FormLink({ t, idioma, aoVoltar }: { t: TextosPainel["login"]; idioma: Idioma; aoVoltar: () => void }) {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(pedirLink, { estado: "inicio" });
  const voltar = (
    <button type="button" onClick={aoVoltar} className="mt-4 w-full text-center text-sm text-white/55 underline-offset-2 hover:text-white hover:underline">
      {t.voltarSenha}
    </button>
  );

  if (estado.estado === "enviado") {
    return (
      <>
        <p role="status" className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-4 text-sm leading-relaxed text-emerald-100">
          {t.enviado}
        </p>
        {voltar}
      </>
    );
  }

  const erro = { email: t.emailInvalido, limite: t.limite, erro: t.erro, inicio: null }[estado.estado];
  return (
    <form action={acao} className="mt-6">
      <p className="mb-4 text-sm leading-relaxed text-white/65">{t.textoLink}</p>
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
      {voltar}
    </form>
  );
}
