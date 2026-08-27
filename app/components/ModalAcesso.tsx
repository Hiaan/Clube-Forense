"use client";

// Tela de acesso do site: entra quem já tem conta, cadastra quem não tem.
//
// Abre no login — e-mail e senha, só — porque a maioria de quem chega aqui já é
// aluno do Clube. Antes o pop-up abria direto no formulário completo, e o aluno
// era obrigado a se cadastrar de novo para ver o mapa. O cadastro continua a um
// clique, no botão pequeno embaixo.

import { useEffect, useRef, useState } from "react";

import Modal from "./Modal";

type Modo = "login" | "cadastro";

/** Formata o celular enquanto digita: (31) 99999-8888 */
function mascaraCelular(bruto: string): string {
  const d = bruto.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const campo =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white " +
  "placeholder:text-gray-500 outline-none focus:border-[#ffcd07] focus:ring-1 focus:ring-[#ffcd07]";

export default function ModalAcesso({
  estado,
  uf,
  modoInicial = "login",
  aoFechar,
  aoEntrar,
}: {
  /** Nome do estado que a pessoa tentou abrir — deixa a oferta concreta. */
  estado: string | null;
  /** Sigla do mesmo estado, guardada como sinal de demanda. */
  uf: string | null;
  modoInicial?: Modo;
  aoFechar: () => void;
  aoEntrar: () => void;
}) {
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const primeiroCampo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    primeiroCampo.current?.focus();
  }, [modo]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const rota = modo === "login" ? "/api/login" : "/api/cadastro";
      const corpo =
        modo === "login" ? { email, senha, uf } : { nome, email, celular, senha, uf };

      const resp = await fetch(rota, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const dados = await resp.json();

      if (!resp.ok) {
        // O login pode responder "esse e-mail não existe aqui". Levar a pessoa
        // ao cadastro já com o e-mail digitado é melhor que a mensagem sozinha.
        if (dados?.precisaCadastro) {
          setModo("cadastro");
          setErro("Você ainda não tem conta neste e-mail. Complete o cadastro:");
          return;
        }
        setErro(dados?.mensagem ?? "Não consegui concluir. Tente de novo.");
        return;
      }
      aoEntrar();
    } catch {
      setErro("Sem conexão. Verifique sua internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const ehLogin = modo === "login";

  return (
    <Modal
      sobretitulo={ehLogin ? "Acesso" : "Acesso gratuito"}
      titulo={ehLogin ? "Entrar" : "Criar conta"}
      aoFechar={aoFechar}
      rodape={
        <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-500">
          Sua conta vale também para a plataforma do Clube Forense.
        </p>
      }
    >
      <p className="mt-3 text-sm text-gray-400">
        {ehLogin
          ? estado
            ? `Entre para ver a situação completa de ${estado} — vagas, banca, prazos e histórico — e de todos os outros estados.`
            : "Entre para ver a situação completa de todos os estados: vagas, banca, prazos e histórico."
          : "Leva um minuto, e libera o mapa inteiro."}
      </p>

      <form onSubmit={enviar} className="mt-5 flex flex-col gap-3">
        {!ehLogin && (
          <input
            ref={ehLogin ? undefined : primeiroCampo}
            className={campo}
            placeholder="Nome completo"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        )}

        <input
          ref={ehLogin ? primeiroCampo : undefined}
          className={campo}
          type="email"
          placeholder={ehLogin ? "Seu e-mail" : "Seu melhor e-mail"}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!ehLogin && (
          <input
            className={campo}
            type="tel"
            placeholder="(00) 00000-0000"
            autoComplete="tel"
            value={celular}
            onChange={(e) => setCelular(mascaraCelular(e.target.value))}
            required
          />
        )}

        <div className="relative">
          <input
            className={`${campo} pr-20`}
            type={mostrarSenha ? "text" : "password"}
            placeholder={ehLogin ? "Sua senha" : "Crie uma senha (mín. 8 caracteres)"}
            autoComplete={ehLogin ? "current-password" : "new-password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={ehLogin ? undefined : 8}
            required
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-white"
          >
            {mostrarSenha ? "ocultar" : "mostrar"}
          </button>
        </div>

        {erro && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-1 rounded-xl bg-[#ffcd07] px-5 py-3 text-sm font-bold text-gray-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando
            ? ehLogin
              ? "Entrando…"
              : "Criando sua conta…"
            : ehLogin
              ? "Entrar"
              : "Criar conta e ver o mapa completo"}
        </button>
      </form>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => {
            setModo(ehLogin ? "cadastro" : "login");
            setErro(null);
          }}
          className="text-xs font-semibold text-gray-400 underline underline-offset-2 hover:text-[#ffcd07]"
        >
          {ehLogin ? "Não tem conta? Criar Conta" : "Já tenho conta — entrar"}
        </button>
      </div>
    </Modal>
  );
}
