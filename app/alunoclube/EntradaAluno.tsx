"use client";

// A porta da página dos alunos: o CPF antes de qualquer oferta.
//
// Validado, o servidor grava o passe num cookie e a página recarrega já com a
// oferta montada para aquele aluno. Nada da oferta (preço, link, cupom) chega
// ao navegador antes disso.

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { validarAluno, type RespostaAluno } from "./acoes";
import AvisoAluno from "./AvisoAluno";

const MENSAGENS: Record<
  Exclude<RespostaAluno, { ok: true }>["motivo"],
  string
> = {
  invalido: "Esse CPF não é válido. Confira os números e tente de novo.",
  "nao-encontrado":
    "Não encontramos uma compra paga com esse CPF. Use o mesmo CPF da compra do seu curso no Clube — se for ele e mesmo assim não liberar, fale com a gente no WhatsApp.",
  limite: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
  configurando:
    "A validação dos alunos está sendo configurada. Volte em instantes.",
  erro: "Não conseguimos conferir agora. Tente de novo em instantes.",
};

/** 000.000.000-00 enquanto digita. */
function mascara(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

export default function EntradaAluno() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      try {
        // PÁGINA DE OUTRA VERSÃO. Se o site foi publicado de novo enquanto a
        // página estava aberta, o botão chama uma função que o servidor novo
        // não tem — e a chamada pode ficar pendurada para sempre, com o botão
        // em "Conferindo…". O prazo corta a espera e recarrega a página, que
        // volta já na versão nova.
        const r = await Promise.race([
          validarAluno(cpf),
          new Promise<never>((_, falha) =>
            setTimeout(() => falha(new Error("prazo")), 15_000),
          ),
        ]);
        if (r.ok) router.refresh();
        else setErro(MENSAGENS[r.motivo]);
      } catch {
        setErro("A página foi atualizada. Recarregando…");
        setTimeout(() => window.location.reload(), 1200);
      }
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0b0d] px-4 py-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#ffcd07]/10 blur-[130px]" />

      <div className="relative w-full max-w-xl text-center">
        <Image
          src="/logo-fundo-escuro.png"
          alt="Clube Forense"
          width={162}
          height={28}
          priority
          className="mx-auto h-7 w-auto"
        />
        <span className="mt-8 inline-flex rounded-full border border-[#ffcd07]/30 bg-[#ffcd07]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#ffcd07]">
          Exclusivo para alunos
        </span>
        <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
          Black <span className="text-[#ffcd07]">Vitalícia</span> para alunos do
          Clube
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/65">
          O valor final é calculado a partir do seu cashback total com o Clube
          Forense. Digite o CPF que você usou na compra do seu curso para ver a
          sua oferta.
        </p>

        <form
          onSubmit={enviar}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left"
        >
          <label
            htmlFor="cpf"
            className="text-xs font-bold uppercase tracking-wider text-white/50"
          >
            Seu CPF
          </label>
          <input
            id="cpf"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(mascara(e.target.value))}
            className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-center font-mono text-xl tracking-wider text-white outline-none placeholder:text-white/25 focus:border-[#ffcd07]"
          />
          <button
            type="submit"
            disabled={enviando || cpf.replace(/\D/g, "").length !== 11}
            data-digital
            className="w-full rounded-2xl bg-[#ffcd07] px-6 py-4 text-base font-black uppercase tracking-wide text-gray-900 transition hover:brightness-110 disabled:opacity-40"
          >
            {enviando ? "Conferindo…" : "Ver minha oferta"}
          </button>
          {erro && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {erro}
            </p>
          )}
          <p className="text-center text-xs text-white/35">
            O CPF é usado só para conferir sua compra e não fica guardado.
          </p>
        </form>

        <div className="mt-8">
          <AvisoAluno />
        </div>
      </div>
    </div>
  );
}
