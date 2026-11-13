"use client";

// Formulário de inscrição no grupo Dose Diária: nome, e-mail, WhatsApp e
// perfil. Por ora o grupo é só para médicos e estudantes de Medicina: quem
// marca outra área recebe uma mensagem e não chega a enviar nada.
//
// Com o link do grupo configurado, a pessoa é levada direto para o WhatsApp
// depois de se inscrever; sem ele, fica o aviso de que o convite chega por
// mensagem.

import { useState, type FormEvent } from "react";

import { eventoPixel } from "../components/PixelMeta";

type Estado =
  | { fase: "editando"; erro?: string }
  | { fase: "enviando" }
  | { fase: "pronto"; primeiroNome: string; link: string | null };

function mascararTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const PERFIS = [
  { valor: "medico", titulo: "Médico(a)" },
  { valor: "estudante", titulo: "Estudante de Medicina" },
  { valor: "outro", titulo: "Outra área" },
];

const rotulo = "block text-xs font-bold uppercase tracking-[0.14em] text-osso/55";
const campo =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-base text-osso outline-none transition placeholder:text-osso/30 focus:border-verde focus:bg-white/[0.08]";

export default function Inscricao({ id }: { id?: string }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [perfil, setPerfil] = useState("");
  const [estado, setEstado] = useState<Estado>({ fase: "editando" });

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const site = String(new FormData(e.currentTarget).get("site") ?? "");
    if (!perfil) {
      setEstado({ fase: "editando", erro: "Conte se você é médico(a) ou estudante de Medicina." });
      return;
    }
    if (perfil === "outro") return;
    setEstado({ fase: "enviando" });
    try {
      const resposta = await fetch("/api/grupo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: crypto.randomUUID(), nome, email, telefone, perfil, site }),
      });
      const json = (await resposta.json().catch(() => ({}))) as {
        ok?: boolean;
        mensagem?: string;
        link?: string | null;
      };
      if (!resposta.ok || !json.ok) {
        setEstado({ fase: "editando", erro: json.mensagem ?? "Algo deu errado. Tente de novo em instantes." });
        return;
      }
      eventoPixel("Lead", { content_name: "Grupo Dose Diária" });
      setEstado({ fase: "pronto", primeiroNome: nome.trim().split(" ")[0], link: json.link ?? null });
      if (json.link) setTimeout(() => window.location.assign(json.link!), 1800);
    } catch {
      setEstado({ fase: "editando", erro: "Sem conexão. Confira sua internet e tente de novo." });
    }
  }

  const cartao =
    "relative min-w-0 rounded-3xl border border-verde/25 bg-preto/70 p-6 shadow-[0_40px_120px_-40px_rgba(34,180,110,0.45)] backdrop-blur sm:p-8";

  if (estado.fase === "pronto") {
    return (
      <div id={id} className={`${cartao} animate-surgir`} role="status">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-verde">Inscrição confirmada</p>
        <h3 className="mt-3 text-3xl font-bold uppercase leading-none tracking-tight">
          Bem-vindo(a), {estado.primeiroNome}.
        </h3>
        {estado.link ? (
          <>
            <p className="mt-4 leading-relaxed text-osso/75">Estou te levando para o grupo no WhatsApp…</p>
            <a
              href={estado.link}
              className="mt-6 flex items-center justify-between rounded-2xl bg-verde px-6 py-4 text-base font-bold uppercase text-preto transition hover:brightness-110"
            >
              Entrar no grupo agora <span aria-hidden>→</span>
            </a>
          </>
        ) : (
          <p className="mt-4 leading-relaxed text-osso/75">
            Recebi sua inscrição. Vou te mandar o convite do grupo pelo WhatsApp que você informou.
          </p>
        )}
      </div>
    );
  }

  const enviando = estado.fase === "enviando";
  const erro = estado.fase === "editando" ? estado.erro : undefined;

  return (
    <form id={id} onSubmit={enviar} className={cartao}>
      {/* Armadilha para robô, fora da tela e fora do Tab. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site <input name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <h3 className="text-xl font-bold sm:text-2xl">Entre para o Dose Diária</h3>
      <p className="mt-1 text-sm text-osso/55">Preencha e receba o acesso ao grupo no WhatsApp.</p>

      <div className="mt-5 grid gap-4">
        <label>
          <span className={rotulo}>Nome completo</span>
          <input
            name="nome"
            required
            minLength={3}
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={campo}
            placeholder="Seu nome completo"
          />
        </label>
        <label>
          <span className={rotulo}>E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={campo}
            placeholder="voce@email.com"
          />
        </label>
        <label>
          <span className={rotulo}>WhatsApp</span>
          <input
            name="telefone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel-national"
            value={telefone}
            onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
            pattern="\(\d{2}\) \d{4,5}-\d{4}"
            title="DDD + número"
            className={campo}
            placeholder="(81) 99999-9999"
          />
        </label>
        <fieldset>
          <legend className={rotulo}>Você é</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {PERFIS.map((p) => {
              const ativo = perfil === p.valor;
              return (
                <button
                  key={p.valor}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => {
                    setPerfil(p.valor);
                    setEstado({ fase: "editando" });
                  }}
                  className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                    ativo ? "border-verde bg-verde text-preto" : "border-white/10 bg-white/[0.04] hover:border-white/30"
                  }`}
                >
                  {p.titulo}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {perfil === "outro" && (
        <p role="status" className="mt-5 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm leading-relaxed text-osso/80">
          Por enquanto, o Dose Diária é exclusivo para médicos e estudantes de Medicina. Obrigado pelo interesse!
        </p>
      )}

      {erro && (
        <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || perfil === "outro"}
        className="group mt-6 flex w-full items-center justify-between gap-4 rounded-2xl bg-verde px-6 py-4 text-left text-base font-bold uppercase text-preto shadow-[0_15px_40px_-12px_rgba(34,180,110,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {enviando ? "Enviando…" : "Quero entrar no grupo"}
        <span aria-hidden className="text-2xl transition group-hover:translate-x-1">→</span>
      </button>
      <p className="mt-3 text-center text-xs text-osso/40">Seus dados ficam só comigo. Nada de spam.</p>
    </form>
  );
}
