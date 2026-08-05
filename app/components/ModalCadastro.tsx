"use client";

// Modal que aparece quando o visitante tenta abrir um estado sem estar
// cadastrado. O texto é direto sobre a troca que está sendo proposta: ele ganha
// o detalhe do estado, o Clube ganha o contato.

import { useEffect, useRef, useState } from "react";

/** Formata o celular enquanto digita: (31) 99999-8888 */
function mascaraCelular(bruto: string): string {
  const d = bruto.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function ModalCadastro({
  estado,
  onFechar,
  onSucesso,
}: {
  /** Nome do estado que a pessoa tentou abrir — deixa a oferta concreta. */
  estado: string | null;
  onFechar: () => void;
  onSucesso: () => void;
}) {
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
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resp = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, celular, senha }),
      });
      const dados = await resp.json();
      if (!resp.ok) {
        setErro(dados?.mensagem ?? "Não consegui concluir o cadastro.");
        return;
      }
      onSucesso();
    } catch {
      setErro("Sem conexão. Verifique sua internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const campo =
    "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white " +
    "placeholder:text-gray-500 outline-none focus:border-[#ffcd07] focus:ring-1 focus:ring-[#ffcd07]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onFechar}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#141418] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-cadastro"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffcd07]">
              Acesso gratuito
            </p>
            <h2 id="titulo-cadastro" className="mt-1 text-xl font-bold text-white">
              Faça login para usar nosso sistema!
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="-mr-1 -mt-1 rounded-lg px-2 py-1 text-xl leading-none text-gray-500 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-400">
          {estado
            ? `Crie sua conta para ver a situação completa de ${estado} — vagas, banca, prazos e histórico — e de todos os outros estados.`
            : "Crie sua conta para ver a situação completa de todos os estados: vagas, banca, prazos e histórico."}
        </p>

        <form onSubmit={enviar} className="mt-5 flex flex-col gap-3">
          <input
            ref={primeiroCampo}
            className={campo}
            placeholder="Nome completo"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            className={campo}
            type="email"
            placeholder="Seu melhor e-mail"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={campo}
            type="tel"
            placeholder="(00) 00000-0000"
            autoComplete="tel"
            value={celular}
            onChange={(e) => setCelular(mascaraCelular(e.target.value))}
            required
          />
          <div className="relative">
            <input
              className={`${campo} pr-20`}
              type={mostrarSenha ? "text" : "password"}
              placeholder="Crie uma senha (mín. 8 caracteres)"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={8}
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
            {enviando ? "Criando sua conta…" : "Criar conta e ver o mapa completo"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-500">
          Sua conta vale também para a plataforma do Clube Forense.
        </p>
      </div>
    </div>
  );
}
