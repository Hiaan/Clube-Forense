"use client";

// Formulário de agendamento da reunião.
//
// Os dias vêm de `lib/agenda.ts`, o mesmo arquivo que a API usa para validar:
// o que aparece aqui é exatamente o que vai ser aceito lá.

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";

import {
  HORARIOS,
  dataPorExtenso,
  diasDisponiveis,
  hojeNoFuso,
  horarioCurto,
  partesDaData,
} from "../../lib/agenda";
import { LINK_GRUPO_CASOS } from "../../lib/site";

type Estado =
  | { fase: "editando"; erro?: string }
  | { fase: "enviando" }
  | { fase: "pronto"; resumo: string; primeiroNome: string };

// "Hoje" só existe no navegador. No HTML gerado no build a data seria a do
// dia da publicação, então o servidor entrega a agenda vazia e o navegador a
// preenche com a data real — sem divergência de hidratação.
const semAssinatura = () => () => {};
function useHoje(): string | null {
  return useSyncExternalStore(semAssinatura, () => hojeNoFuso(), () => null);
}

function mascararTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const rotulo = "block font-mono text-[11px] uppercase tracking-[0.18em] text-tinta/60";
const campo =
  "mt-2 w-full rounded-none border-0 border-b border-tinta/25 bg-transparent px-0 py-2.5 text-[17px] text-tinta outline-none transition placeholder:text-tinta/35 focus:border-floresta focus:ring-0";

function Etapa({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <span className="font-mono text-xs text-latao">{numero}</span>
      <h3 className="font-serif text-xl text-tinta">{titulo}</h3>
      <span className="h-px flex-1 translate-y-[-4px] bg-tinta/10" />
    </div>
  );
}

export default function Agendamento() {
  const hoje = useHoje();
  const dias = useMemo(() => (hoje ? diasDisponiveis(hoje) : []), [hoje]);

  const [telefone, setTelefone] = useState("");
  const [situacao, setSituacao] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [estado, setEstado] = useState<Estado>({ fase: "editando" });

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (!situacao) {
      setEstado({ fase: "editando", erro: "Conte se você já é médico(a) ou se está se formando." });
      return;
    }
    if (!data || !horario) {
      setEstado({ fase: "editando", erro: "Escolha o dia e o horário da reunião." });
      return;
    }

    setEstado({ fase: "enviando" });
    const nome = String(form.get("nome") ?? "");

    try {
      const resposta = await fetch("/api/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email: form.get("email"),
          telefone,
          situacao,
          concurso: form.get("concurso"),
          data,
          horario,
          site: form.get("site"),
        }),
      });
      const json = (await resposta.json().catch(() => ({}))) as { ok?: boolean; mensagem?: string };
      if (!resposta.ok || !json.ok) {
        setEstado({
          fase: "editando",
          erro: json.mensagem ?? "Algo deu errado. Tente de novo em instantes.",
        });
        return;
      }
      setEstado({
        fase: "pronto",
        primeiroNome: nome.trim().split(" ")[0],
        resumo: `${dataPorExtenso(data)}, às ${horarioCurto(horario)}`,
      });
      // A confirmação é bem mais curta que o formulário: sem isto, no celular
      // a pessoa fica olhando para o rodapé sem ver que deu certo.
      document.getElementById("agendar")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setEstado({ fase: "editando", erro: "Sem conexão. Confira sua internet e tente de novo." });
    }
  }

  if (estado.fase === "pronto") {
    return (
      <div className="min-w-0 animate-surgir bg-osso p-7 text-tinta sm:p-10" role="status">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-latao">
          Agendamento recebido
        </p>
        <h3 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
          Tudo certo, {estado.primeiroNome}.
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-tinta/75">
          Sua reunião ficou para <strong className="font-semibold text-tinta">{estado.resumo}</strong>.
          O Miguel já foi avisado e vai falar com você pelo WhatsApp para confirmar e enviar o link do
          Google Meet.
        </p>
        <div className="mt-8 border-t border-tinta/10 pt-6">
          <p className="font-serif text-xl">Enquanto isso, entre no Grupo de Discussão de Casos.</p>
          <p className="mt-2 text-tinta/70">
            Casos forenses comentados pelo Miguel, com médicos que também miram a perícia.
          </p>
          {LINK_GRUPO_CASOS ? (
            <a
              href={LINK_GRUPO_CASOS}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 bg-floresta px-6 py-3.5 font-medium text-osso transition hover:bg-floresta-2"
            >
              Entrar no grupo <span aria-hidden>→</span>
            </a>
          ) : (
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-tinta/50">
              O convite chega junto com a confirmação.
            </p>
          )}
        </div>
      </div>
    );
  }

  const enviando = estado.fase === "enviando";
  const erro = estado.fase === "editando" ? estado.erro : undefined;

  return (
    <form onSubmit={enviar} className="relative min-w-0 bg-osso p-6 text-tinta sm:p-10">
      {/* Armadilha para robô, fora da tela e fora do Tab. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site <input name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Etapa numero="01" titulo="Seus dados" />
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={rotulo}>Nome completo</span>
          <input name="nome" required minLength={3} autoComplete="name" className={campo} placeholder="Como você se chama" />
        </label>
        <label>
          <span className={rotulo}>E-mail</span>
          <input name="email" type="email" required autoComplete="email" className={campo} placeholder="voce@email.com" />
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
      </div>

      <div className="mt-10">
        <Etapa numero="02" titulo="Seu momento" />
        <fieldset>
          <legend className={rotulo}>Você já é médico(a)?</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { valor: "medico", titulo: "Já sou médico(a)", sub: "Formado(a) e de olho no concurso" },
              { valor: "formando", titulo: "Estou me formando", sub: "Na graduação, preparando o caminho" },
            ].map((op) => {
              const ativo = situacao === op.valor;
              return (
                <label
                  key={op.valor}
                  className={`cursor-pointer border px-4 py-3.5 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-latao ${
                    ativo ? "border-floresta bg-floresta text-osso" : "border-tinta/15 hover:border-tinta/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="situacao"
                    value={op.valor}
                    checked={ativo}
                    onChange={() => setSituacao(op.valor)}
                    className="sr-only"
                  />
                  <span className="block font-medium">{op.titulo}</span>
                  <span className={`block text-sm ${ativo ? "text-osso/70" : "text-tinta/55"}`}>{op.sub}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <label className="mt-6 block">
          <span className={rotulo}>
            Qual concurso você quer prestar? <span className="normal-case tracking-normal text-tinta/40">(opcional)</span>
          </span>
          <input name="concurso" className={campo} placeholder="Ex.: Polícia Científica de PE, PC-SP, IGP-RS…" maxLength={120} />
        </label>
      </div>

      <div className="mt-10">
        <Etapa numero="03" titulo="Dia e horário da reunião" />
        <p className={rotulo}>Escolha o dia</p>
        <div
          className="-mx-6 mt-3 flex snap-x scroll-px-6 gap-2 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:scroll-px-10 sm:px-10 [scrollbar-width:thin]"
          role="radiogroup"
          aria-label="Dia da reunião"
        >
          {dias.length === 0
            ? Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="h-[84px] w-[66px] shrink-0 animate-pulse bg-tinta/5" />
              ))
            : dias.map((d) => {
                const p = partesDaData(d.iso);
                const ativo = data === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    aria-label={dataPorExtenso(d.iso)}
                    onClick={() => setData(d.iso)}
                    className={`flex h-[84px] w-[66px] shrink-0 snap-start flex-col items-center justify-center border transition ${
                      ativo
                        ? "border-floresta bg-floresta text-osso"
                        : "border-tinta/15 hover:border-tinta/40"
                    }`}
                  >
                    <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${ativo ? "text-latao-claro" : "text-tinta/50"}`}>
                      {p.semana}
                    </span>
                    <span className="font-serif text-[28px] leading-none">{p.dia}</span>
                    <span className={`text-[11px] uppercase ${ativo ? "text-osso/70" : "text-tinta/50"}`}>{p.mes}</span>
                  </button>
                );
              })}
        </div>

        <p className={`${rotulo} mt-6`}>Escolha o horário <span className="normal-case tracking-normal text-tinta/40">(horário de Brasília)</span></p>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Horário da reunião">
          {HORARIOS.map((h) => {
            const ativo = horario === h;
            return (
              <button
                key={h}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => setHorario(h)}
                className={`border py-2.5 font-mono text-sm transition ${
                  ativo ? "border-floresta bg-floresta text-osso" : "border-tinta/15 hover:border-tinta/40"
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>
      </div>

      {erro && (
        <p role="alert" className="mt-8 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="group mt-8 flex w-full items-center justify-between gap-4 bg-tinta px-6 py-5 text-left text-osso transition hover:bg-floresta disabled:cursor-wait disabled:opacity-70"
      >
        <span>
          <span className="block text-lg font-medium">
            {enviando ? "Enviando…" : "Agendar minha reunião"}
          </span>
          <span className="block text-sm text-osso/60">
            {data && horario
              ? `${dataPorExtenso(data)}, às ${horarioCurto(horario)}`
              : "Individual, pelo Google Meet"}
          </span>
        </span>
        <span aria-hidden className="text-2xl transition group-hover:translate-x-1">→</span>
      </button>
      <p className="mt-4 text-center text-xs text-tinta/50">
        Seus dados vão só para o Miguel, para ele confirmar a reunião com você.
      </p>
    </form>
  );
}
