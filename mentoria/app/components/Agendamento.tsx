"use client";

// Agendamento da reunião em três passos, dentro da capa.
//
// Começar por uma pergunta só ("você já é médico?") custa um clique e já
// compromete a pessoa com o formulário; nome e telefone ficam para o fim,
// quando ela já escolheu o horário e tem motivo para terminar.
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

type Passo = 1 | 2 | 3;

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

const SITUACOES = [
  {
    valor: "medico",
    titulo: "Já sou médico(a)",
    sub: "Formado(a) e mirando o concurso",
    icone: (
      <path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    ),
  },
  {
    valor: "formando",
    titulo: "Estou me formando",
    sub: "Ainda na graduação",
    icone: <path d="M2 9l10-5 10 5-10 5L2 9Zm4 2.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6" />,
  },
];

const PASSOS = ["Momento", "Agenda", "Dados"];

const rotulo = "block text-xs font-bold uppercase tracking-[0.14em] text-osso/55";
const campo =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-base text-osso outline-none transition placeholder:text-osso/30 focus:border-ouro focus:bg-white/[0.07]";
const opcaoBase = "border transition";
const opcaoAtiva = "border-ouro bg-ouro text-preto";
const opcaoInativa = "border-white/10 bg-white/[0.03] hover:border-white/30";

export default function Agendamento() {
  const hoje = useHoje();
  const dias = useMemo(() => (hoje ? diasDisponiveis(hoje) : []), [hoje]);

  const [passo, setPasso] = useState<Passo>(1);
  const [situacao, setSituacao] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [telefone, setTelefone] = useState("");
  const [estado, setEstado] = useState<Estado>({ fase: "editando" });

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nome = String(form.get("nome") ?? "");
    setEstado({ fase: "enviando" });

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
      // A confirmação é mais curta que o formulário: sem isto, no celular a
      // pessoa fica olhando para o que vem depois sem ver que deu certo.
      document.getElementById("agendar")?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setEstado({ fase: "editando", erro: "Sem conexão. Confira sua internet e tente de novo." });
    }
  }

  const cartao =
    "relative min-w-0 rounded-3xl border border-white/10 bg-carvao/90 p-5 shadow-[0_40px_120px_-40px_rgba(231,172,60,0.35)] backdrop-blur sm:p-7";

  if (estado.fase === "pronto") {
    return (
      <div className={`${cartao} animate-surgir`} role="status">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ouro">Reunião agendada</p>
        <h3 className="mt-3 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
          Tudo certo, {estado.primeiroNome}.
        </h3>
        <p className="mt-4 leading-relaxed text-osso/75">
          Sua reunião ficou para <strong className="text-osso">{estado.resumo}</strong>. O Miguel já foi
          avisado e vai falar com você pelo WhatsApp para confirmar e enviar o link do Google Meet.
        </p>
        <div className="mt-6 rounded-2xl border border-verde/30 bg-verde/10 p-5">
          <p className="font-extrabold uppercase">Enquanto isso: Dose Diária</p>
          <p className="mt-1 text-sm text-osso/70">
            O grupo onde o Miguel discute um caso forense por dia.
          </p>
          {LINK_GRUPO_CASOS ? (
            <a
              href={LINK_GRUPO_CASOS}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-verde px-5 py-3 text-sm font-extrabold uppercase text-preto transition hover:brightness-110"
            >
              Entrar no grupo <span aria-hidden>→</span>
            </a>
          ) : (
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-verde">
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
    <div className={cartao}>
      {/* Passos */}
      <ol className="mb-6 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] sm:gap-2 sm:text-xs sm:tracking-[0.1em]">
        {PASSOS.map((nome, i) => {
          const n = (i + 1) as Passo;
          const feito = passo > n;
          const atual = passo === n;
          return (
            <li key={nome} className="flex items-center gap-2">
              <button
                type="button"
                disabled={!feito}
                onClick={() => setPasso(n)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition sm:gap-2 sm:px-3 ${
                  atual ? "bg-ouro text-preto" : feito ? "text-osso/80 hover:text-osso" : "text-osso/35"
                }`}
              >
                <span
                  className={`grid size-5 place-items-center rounded-full text-[11px] ${
                    atual ? "bg-preto/15" : "border border-current"
                  }`}
                >
                  {feito ? "✓" : n}
                </span>
                {nome}
              </button>
              {i < PASSOS.length - 1 && <span className="hidden h-px w-5 bg-white/15 sm:block" />}
            </li>
          );
        })}
      </ol>

      {passo === 1 && (
        <div className="animate-surgir">
          <h3 className="text-xl font-extrabold sm:text-2xl">Você já é médico(a)?</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SITUACOES.map((op) => (
              <button
                key={op.valor}
                type="button"
                onClick={() => {
                  setSituacao(op.valor);
                  setPasso(2);
                }}
                className={`group flex items-center gap-4 rounded-2xl p-4 text-left ${opcaoBase} ${
                  situacao === op.valor ? "border-ouro bg-ouro/10" : opcaoInativa
                }`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ouro text-preto">
                  <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {op.icone}
                  </svg>
                </span>
                <span className="flex-1">
                  <span className="block font-extrabold">{op.titulo}</span>
                  <span className="block text-sm text-osso/55">{op.sub}</span>
                </span>
                <span aria-hidden className="text-osso/40 transition group-hover:translate-x-1 group-hover:text-ouro">
                  ›
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {passo === 2 && (
        <div className="animate-surgir">
          <h3 className="text-xl font-extrabold sm:text-2xl">Escolha o dia e o horário</h3>
          <p className={`${rotulo} mt-5`}>Dia</p>
          <div
            className="-mx-5 mt-2 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:scroll-px-7 sm:px-7 [scrollbar-width:thin]"
            role="radiogroup"
            aria-label="Dia da reunião"
          >
            {dias.length === 0
              ? Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="h-[78px] w-[62px] shrink-0 animate-pulse rounded-xl bg-white/5" />
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
                      className={`flex h-[78px] w-[62px] shrink-0 snap-start flex-col items-center justify-center rounded-xl ${opcaoBase} ${
                        ativo ? opcaoAtiva : opcaoInativa
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase ${ativo ? "" : "text-osso/50"}`}>{p.semana}</span>
                      <span className="font-impacto text-[26px] leading-tight">{p.dia}</span>
                      <span className={`text-[10px] font-bold uppercase ${ativo ? "" : "text-osso/50"}`}>{p.mes}</span>
                    </button>
                  );
                })}
          </div>

          <p className={`${rotulo} mt-4`}>
            Horário <span className="font-medium normal-case tracking-normal text-osso/35">(Brasília)</span>
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Horário da reunião">
            {HORARIOS.map((h) => {
              const ativo = horario === h;
              return (
                <button
                  key={h}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => setHorario(h)}
                  className={`rounded-lg py-2.5 text-sm font-bold ${opcaoBase} ${ativo ? opcaoAtiva : opcaoInativa}`}
                >
                  {h}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setPasso(1)} className="px-2 py-3 text-sm font-bold text-osso/50 hover:text-osso">
              ← Voltar
            </button>
            <button
              type="button"
              disabled={!data || !horario}
              onClick={() => setPasso(3)}
              className="rounded-full bg-ouro px-7 py-3.5 text-sm font-extrabold uppercase text-preto transition hover:bg-ouro-claro disabled:cursor-not-allowed disabled:opacity-30"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {passo === 3 && (
        <form onSubmit={enviar} className="relative animate-surgir">
          {/* Armadilha para robô, fora da tela e fora do Tab. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Site <input name="site" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <h3 className="text-xl font-extrabold sm:text-2xl">Para o Miguel confirmar com você</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <label className="sm:col-span-2">
              <span className={rotulo}>
                Concurso que vai prestar{" "}
                <span className="font-medium normal-case tracking-normal text-osso/35">(opcional)</span>
              </span>
              <input name="concurso" className={campo} placeholder="Ex.: Polícia Científica de PE, PC-SP…" maxLength={120} />
            </label>
          </div>

          {erro && (
            <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="group mt-6 flex w-full items-center justify-between gap-4 rounded-2xl bg-ouro px-6 py-4 text-left text-preto transition hover:bg-ouro-claro disabled:cursor-wait disabled:opacity-70"
          >
            <span>
              <span className="block text-base font-black uppercase">
                {enviando ? "Agendando…" : "Confirmar reunião gratuita"}
              </span>
              <span className="block text-sm font-semibold text-preto/65">
                {dataPorExtenso(data)}, às {horarioCurto(horario)}
              </span>
            </span>
            <span aria-hidden className="text-2xl transition group-hover:translate-x-1">→</span>
          </button>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-osso/40">
            <button type="button" onClick={() => setPasso(2)} className="py-2 font-bold hover:text-osso">
              ← Trocar horário
            </button>
            <span>Seus dados vão só para o Miguel.</span>
          </div>
        </form>
      )}
    </div>
  );
}
