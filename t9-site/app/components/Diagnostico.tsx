"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { EMAIL_VALIDO, HORARIOS, dataPorExtenso, mascararWhatsApp, proximosDiasUteis, whatsAppValido, type Dia } from "@/lib/agenda";
import { perguntasAtivas, type Respostas } from "@/lib/diagnostico/perguntas";
import type { Area, Diagnostico as Resultado } from "@/lib/diagnostico/regras";
import { enviarLeadPorEmail } from "@/lib/emailLead";
import { IconeCadeado, IconeCalendario, IconeCheck, IconeRelogio, IconeSeta, IconeSetaEsquerda, MarcaWhatsApp } from "./Icones";

// Assistente do diagnóstico gratuito: uma pergunta por tela, contato no fim, resultado na hora
// e, logo abaixo, a agenda para a reunião com a T9.

const WHATSAPP_T9 = process.env.NEXT_PUBLIC_T9_WHATSAPP ?? "";
const NOMES: Record<Area, string> = { redes: "Redes sociais", google: "Google", anuncios: "Anúncios", comercial: "Atendimento e vendas" };
type Publico = Omit<Resultado, "temperatura" | "motivoTemperatura">;
type Contato = { nome: string; email: string; whatsapp: string; site: string };

const corDaNota = (n: number) => (n >= 70 ? "#1fa34a" : n >= 40 ? "#e8a400" : "#e3121c");

export default function Diagnostico() {
  const [fase, setFase] = useState<"inicio" | "perguntas" | "contato" | "gerando" | "resultado">("inicio");
  const [respostas, setRespostas] = useState<Respostas>({});
  const [indice, setIndice] = useState(0);
  const [contato, setContato] = useState<Contato>({ nome: "", email: "", whatsapp: "", site: "" });
  const [erros, setErros] = useState<Partial<Record<keyof Contato, string>>>({});
  const [erroEnvio, setErroEnvio] = useState("");
  const [resultado, setResultado] = useState<Publico | null>(null);
  const topo = useRef<HTMLDivElement>(null);

  const ativas = useMemo(() => perguntasAtivas(respostas), [respostas]);
  const pergunta = ativas[Math.min(indice, ativas.length - 1)];
  const progresso = fase === "contato" ? 100 : Math.round((indice / (ativas.length + 1)) * 100);

  // A cada tela nova, o topo do cartão volta para a vista (no celular a tela é curta).
  useEffect(() => {
    const el = topo.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [fase, indice]);

  const responder = (id: string, valor: string | string[]) => setRespostas((r) => ({ ...r, [id]: valor }));
  const avancar = () => (indice + 1 >= ativas.length ? setFase("contato") : setIndice((i) => i + 1));
  const voltar = () => (fase === "contato" ? setFase("perguntas") : indice === 0 ? setFase("inicio") : setIndice((i) => i - 1));

  async function gerar(e: FormEvent) {
    e.preventDefault();
    const encontrados: typeof erros = {};
    if (contato.nome.trim().length < 2) encontrados.nome = "Digite seu nome.";
    if (!EMAIL_VALIDO.test(contato.email.trim())) encontrados.email = "Digite um e-mail válido.";
    if (!whatsAppValido(contato.whatsapp)) encontrados.whatsapp = "Digite o WhatsApp com DDD.";
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;

    setFase("gerando");
    setErroEnvio("");
    const resposta = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contato, respostas, origem: window.location.href }),
    }).catch(() => null);
    const json = resposta ? await resposta.json().catch(() => ({})) : {};
    if (!resposta?.ok || !json.ok) {
      setErroEnvio(json.erro ?? "Não conseguimos gerar agora. Confira a internet e tente de novo.");
      setFase("contato");
      return;
    }
    if (!contato.site) {
      enviarLeadPorEmail({ etapa: "lead", nome: contato.nome, email: contato.email, whatsapp: contato.whatsapp, idioma: "pt" });
    }
    setResultado(json.diagnostico);
    setFase("resultado");
  }

  const primeiroNome = contato.nome.trim().split(/\s+/)[0] ?? "";

  return (
    <section className="fundo-claro relative min-h-screen overflow-hidden">
      <div className="linhas-diagonais pointer-events-none absolute inset-0" aria-hidden="true" />
      <div ref={topo} className="relative mx-auto max-w-3xl scroll-mt-6 px-4 py-14 sm:px-6 sm:py-20">
        <Link href="/" className="text-sm text-[#5b5353] hover:text-[#0b0b0b]">
          ← T9 ADS Company
        </Link>

        {fase !== "resultado" && (
          <div className="mt-6 rounded-[28px] border border-black/5 bg-white p-6 text-[#0b0b0b] shadow-[0_40px_100px_-30px_rgba(120,0,6,0.35)] sm:p-10">
            {fase === "inicio" && (
              <div>
                <p className="text-sm font-semibold tracking-wide text-[#e3121c] uppercase">Diagnóstico gratuito</p>
                <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
                  Descubra o que está travando as vendas da sua empresa
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-[#3d3636]">
                  Responda algumas perguntas rápidas sobre suas redes, seus anúncios e seu atendimento. Na hora, você recebe uma nota para cada
                  área e as três ações que mais devem trazer resultado, em linguagem simples.
                </p>
                <ul className="mt-6 space-y-2.5 text-[#1c1c1c]">
                  {["Leva cerca de 3 minutos", "Resultado na hora, sem custo", "Plano de 30 dias para começar"].map((b) => (
                    <li key={b} className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e3121c] text-white">
                        <IconeCheck className="h-3.5 w-3.5" />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <button type="button" className="botao botao-vermelho mt-8 w-full text-lg sm:w-auto" onClick={() => (setIndice(0), setFase("perguntas"))}>
                  Começar o diagnóstico
                  <IconeSeta className="h-5 w-5" />
                </button>
              </div>
            )}

            {(fase === "perguntas" || fase === "contato") && (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <button type="button" onClick={voltar} className="inline-flex items-center gap-1.5 text-sm text-[#5b5353] hover:text-[#0b0b0b]">
                    <IconeSetaEsquerda className="h-4 w-4" /> Voltar
                  </button>
                  <span className="text-sm text-[#9b9292] tabular-nums">{progresso}%</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f1ecec]" aria-hidden="true">
                  <div className="h-full rounded-full bg-[#e3121c] transition-all duration-300" style={{ width: `${Math.max(4, progresso)}%` }} />
                </div>

                {fase === "perguntas" && pergunta && (
                  <TelaPergunta
                    key={pergunta.id}
                    pergunta={pergunta}
                    valor={respostas[pergunta.id]}
                    responder={(v) => responder(pergunta.id, v)}
                    avancar={avancar}
                  />
                )}

                {fase === "contato" && (
                  <form onSubmit={gerar} noValidate className="mt-8">
                    <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Pronto! Para onde mandamos o seu diagnóstico?</h2>
                    <p className="mt-2 text-[#5b5353]">Ele aparece aqui na tela em seguida, e a gente também guarda uma cópia para a sua reunião.</p>
                    <div className="mt-7 space-y-4">
                      <Campo rotulo="Seu nome" erro={erros.nome}>
                        <input
                          className="campo"
                          autoComplete="name"
                          placeholder="Como podemos te chamar?"
                          value={contato.nome}
                          onChange={(e) => setContato((c) => ({ ...c, nome: e.target.value }))}
                          aria-invalid={!!erros.nome}
                        />
                      </Campo>
                      <Campo rotulo="WhatsApp" erro={erros.whatsapp}>
                        <input
                          className="campo"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          placeholder="(11) 91234-5678"
                          value={contato.whatsapp}
                          onChange={(e) => setContato((c) => ({ ...c, whatsapp: mascararWhatsApp(e.target.value) }))}
                          aria-invalid={!!erros.whatsapp}
                        />
                      </Campo>
                      <Campo rotulo="E-mail" erro={erros.email}>
                        <input
                          className="campo"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="voce@empresa.com"
                          value={contato.email}
                          onChange={(e) => setContato((c) => ({ ...c, email: e.target.value }))}
                          aria-invalid={!!erros.email}
                        />
                      </Campo>
                      {/* Armadilha para robôs: invisível para pessoas */}
                      <input
                        type="text"
                        name="site"
                        tabIndex={-1}
                        autoComplete="off"
                        value={contato.site}
                        onChange={(e) => setContato((c) => ({ ...c, site: e.target.value }))}
                        className="absolute -left-[9999px] h-0 w-0 opacity-0"
                        aria-hidden="true"
                      />
                    </div>
                    {erroEnvio && (
                      <p className="mt-4 rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#a10b0b]" role="alert">
                        {erroEnvio}
                      </p>
                    )}
                    <button type="submit" className="botao botao-vermelho mt-8 w-full text-lg">
                      Ver meu diagnóstico
                      <IconeSeta className="h-5 w-5" />
                    </button>
                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[#9b9292]">
                      <IconeCadeado className="h-3.5 w-3.5 shrink-0" />
                      Seus dados ficam só com a T9. Veja a{" "}
                      <Link href="/privacidade" className="underline">
                        política de privacidade
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </div>
            )}

            {fase === "gerando" && (
              <div className="py-16 text-center" role="status">
                <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-[#f1ecec] border-t-[#e3121c]" aria-hidden="true" />
                <p className="mt-6 font-display text-2xl font-extrabold">Montando o seu diagnóstico...</p>
                <p className="mt-2 text-[#5b5353]">Leva só alguns segundos.</p>
              </div>
            )}
          </div>
        )}

        {fase === "resultado" && resultado && <TelaResultado resultado={resultado} contato={contato} primeiroNome={primeiroNome} />}
      </div>
    </section>
  );
}

function Campo({ rotulo, erro, children }: { rotulo: string; erro?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{rotulo}</span>
      {children}
      {erro && <span className="mt-1.5 block text-sm text-[#d11]">{erro}</span>}
    </label>
  );
}

function TelaPergunta({
  pergunta,
  valor,
  responder,
  avancar,
}: {
  pergunta: ReturnType<typeof perguntasAtivas>[number];
  valor: string | string[] | undefined;
  responder: (v: string | string[]) => void;
  avancar: () => void;
}) {
  const [textoLocal, setTextoLocal] = useState(typeof valor === "string" ? valor : "");
  const marcados = Array.isArray(valor) ? valor : [];

  return (
    <div className="mt-8">
      <h2 className="font-display text-2xl leading-snug font-extrabold tracking-tight sm:text-3xl">{pergunta.titulo}</h2>
      {pergunta.ajuda && <p className="mt-2 text-[#5b5353]">{pergunta.ajuda}</p>}

      {pergunta.tipo === "texto" && (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!textoLocal.trim() && !pergunta.opcional) return;
            responder(textoLocal.trim());
            avancar();
          }}
        >
          <input className="campo" autoFocus value={textoLocal} placeholder={pergunta.placeholder} maxLength={120} onChange={(e) => setTextoLocal(e.target.value)} />
          <button type="submit" className="botao botao-vermelho mt-6 w-full text-lg" disabled={!textoLocal.trim() && !pergunta.opcional}>
            {textoLocal.trim() || !pergunta.opcional ? "Continuar" : "Pular"}
            <IconeSeta className="h-5 w-5" />
          </button>
        </form>
      )}

      {pergunta.tipo === "unica" && (
        <div className="mt-6 grid gap-2.5">
          {pergunta.opcoes!.map((o) => (
            <button
              key={o.valor}
              type="button"
              aria-pressed={valor === o.valor}
              onClick={() => {
                responder(o.valor);
                // Um respiro para a pessoa ver o que marcou antes de trocar de tela.
                setTimeout(avancar, 180);
              }}
              className="horario rounded-2xl px-5 py-4 text-left text-base font-medium"
            >
              {o.rotulo}
            </button>
          ))}
        </div>
      )}

      {pergunta.tipo === "multipla" && (
        <>
          <div className="mt-6 grid gap-2.5">
            {pergunta.opcoes!.map((o) => {
              const marcado = marcados.includes(o.valor);
              return (
                <button
                  key={o.valor}
                  type="button"
                  aria-pressed={marcado}
                  onClick={() => responder(marcado ? marcados.filter((x) => x !== o.valor) : [...marcados, o.valor])}
                  className="horario flex items-center gap-3 rounded-2xl px-5 py-4 text-left text-base font-medium"
                >
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${marcado ? "border-current" : "border-[#d8d0d0]"}`}>
                    {marcado && <IconeCheck className="h-3.5 w-3.5" />}
                  </span>
                  {o.rotulo}
                </button>
              );
            })}
          </div>
          <button type="button" className="botao botao-vermelho mt-6 w-full text-lg" disabled={!marcados.length} onClick={avancar}>
            Continuar
            <IconeSeta className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}

function TelaResultado({ resultado, contato, primeiroNome }: { resultado: Publico; contato: Contato; primeiroNome: string }) {
  const areas = Object.keys(resultado.notas) as Area[];
  return (
    <div className="mt-6 space-y-5 text-[#0b0b0b]">
      <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_40px_100px_-30px_rgba(120,0,6,0.35)] sm:p-10">
        <p className="text-sm font-semibold tracking-wide text-[#e3121c] uppercase">Seu diagnóstico</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            {primeiroNome ? `${primeiroNome}, aqui está o raio-x da sua empresa` : "Aqui está o raio-x da sua empresa"}
          </h1>
          <div className="text-center">
            <span className="block font-display text-6xl font-extrabold tabular-nums" style={{ color: corDaNota(resultado.notaGeral) }}>
              {resultado.notaGeral}
            </span>
            <span className="text-sm text-[#5b5353]">nota geral, de 100</span>
          </div>
        </div>
        <p className="mt-5 text-lg leading-relaxed text-[#3d3636]">{resultado.resumo}</p>

        <dl className="mt-7 grid gap-4 sm:grid-cols-2">
          {areas.map((a) => (
            <div key={a}>
              <div className="flex items-baseline justify-between text-sm">
                <dt className="font-medium">{NOMES[a]}</dt>
                <dd className="font-semibold tabular-nums" style={{ color: corDaNota(resultado.notas[a]) }}>
                  {resultado.notas[a]}
                </dd>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#f1ecec]" aria-hidden="true">
                <div className="h-full rounded-full" style={{ width: `${Math.max(3, resultado.notas[a])}%`, background: corDaNota(resultado.notas[a]) }} />
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-[28px] border border-black/5 bg-white p-6 sm:p-10">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">O que fazer primeiro</h2>
        <ol className="mt-6 space-y-6">
          {resultado.prioridades.map((p, i) => (
            <li key={p.id} className="flex gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e3121c] font-display font-extrabold text-white">{i + 1}</span>
              <div>
                <h3 className="text-lg font-bold">{p.titulo}</h3>
                <p className="mt-1.5 leading-relaxed text-[#3d3636]">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-[28px] border border-black/5 bg-white p-6 sm:p-10">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Seu plano de 30 dias</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {resultado.plano.map((s) => (
            <div key={s.semana} className="rounded-2xl bg-[#f8f4f4] p-5">
              <p className="text-xs font-semibold tracking-wide text-[#e3121c] uppercase">Semana {s.semana}</p>
              <p className="mt-1 font-bold">{s.titulo}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-[#3d3636]">
                {s.itens.map((x) => (
                  <li key={x} className="flex gap-2">
                    <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#e3121c]" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div id="reuniao" className="rounded-[28px] bg-[#0b0b0b] p-6 text-white sm:p-10">
        <p className="text-sm font-semibold tracking-wide text-[#ff4d55] uppercase">Quer que a T9 faça isso por você?</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Anúncios que trazem contatos + automações que fecham vendas</h2>
        <p className="mt-4 text-lg leading-relaxed text-white/80">{resultado.comoAT9Ajuda}</p>
        <AgendarReuniao contato={contato} primeiroNome={primeiroNome} />
      </div>
    </div>
  );
}

function AgendarReuniao({ contato, primeiroNome }: { contato: Contato; primeiroNome: string }) {
  // Só aparece depois que a pessoa responde (nunca no servidor), então pode ler a data de hoje aqui.
  const [dias] = useState<Dia[]>(() => proximosDiasUteis());
  const [dia, setDia] = useState(() => dias[0]?.iso ?? "");
  const [horario, setHorario] = useState("");
  const [estado, setEstado] = useState<"escolher" | "enviando" | "feito" | "erro">("escolher");

  const quando = dia && horario ? `${dataPorExtenso(dia)}, às ${horario}` : "";
  const linkWhatsApp = WHATSAPP_T9
    ? `https://wa.me/${WHATSAPP_T9}?text=${encodeURIComponent(
        estado === "feito"
          ? `Olá, T9! Sou ${contato.nome.trim()}, fiz o diagnóstico e agendei a reunião para ${quando} (horário de Brasília).`
          : `Olá, T9! Sou ${contato.nome.trim()} e acabei de fazer o diagnóstico no site. Quero conversar sobre anúncios e automações.`,
      )}`
    : "";

  async function confirmar() {
    setEstado("enviando");
    const resposta = await fetch("/api/agendamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etapa: "agendamento", nome: contato.nome, email: contato.email, whatsapp: contato.whatsapp, data: dia, horario, idioma: "pt", origem: window.location.href }),
    }).catch(() => null);
    const json = resposta ? await resposta.json().catch(() => ({})) : {};
    if (!resposta?.ok || !json.ok) return setEstado("erro");
    enviarLeadPorEmail({ etapa: "agendamento", nome: contato.nome, email: contato.email, whatsapp: contato.whatsapp, data: dia, horario, idioma: "pt" });
    setEstado("feito");
  }

  if (estado === "feito") {
    return (
      <div className="mt-8 rounded-2xl bg-white/8 p-6 text-center" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e3121c]">
          <IconeCheck className="h-7 w-7" />
        </span>
        <p className="mt-4 font-display text-2xl font-extrabold">Reunião agendada!</p>
        <p className="mt-2 text-white/75">
          {primeiroNome ? `${primeiroNome}, ` : ""}sua reunião gratuita ficou para <strong className="text-white">{quando}</strong> (horário de Brasília). A
          gente confirma pelo WhatsApp e leva o seu diagnóstico pronto.
        </p>
        {linkWhatsApp && (
          <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="botao mt-6 w-full bg-[#1fb345] text-white hover:bg-[#199a3b]">
            <MarcaWhatsApp className="h-6 w-6" /> Confirmar pelo WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="font-semibold">Agende a sua reunião gratuita (45 minutos, online):</p>
      <p className="mt-5 mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
        <IconeCalendario className="h-4 w-4 text-[#ff4d55]" /> Dia
      </p>
      <div className="sem-barra -mx-6 flex gap-2.5 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10" role="group" aria-label="Dias disponíveis">
        {dias.map((d) => (
          <button
            key={d.iso}
            type="button"
            className="dia flex min-w-[68px] flex-col items-center rounded-2xl px-3 py-3 text-[#0b0b0b]"
            aria-pressed={dia === d.iso}
            onClick={() => setDia(d.iso)}
          >
            <span className="text-xs tracking-wide uppercase opacity-75">{d.semana}</span>
            <span className="font-display text-2xl font-extrabold">{d.dia}</span>
            <span className="text-xs opacity-75">{d.mes}</span>
          </button>
        ))}
      </div>
      <p className="mt-5 mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
        <IconeRelogio className="h-4 w-4 text-[#ff4d55]" /> Horário (Brasília)
      </p>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" role="group" aria-label="Horários disponíveis">
        {HORARIOS.map((h) => (
          <button
            key={h}
            type="button"
            className="horario rounded-xl py-3 font-semibold text-[#0b0b0b] tabular-nums"
            aria-pressed={horario === h}
            onClick={() => setHorario(h)}
          >
            {h}
          </button>
        ))}
      </div>
      {estado === "erro" && (
        <p className="mt-4 rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#a10b0b]" role="alert">
          Não conseguimos agendar agora. Tente de novo ou chame a gente no WhatsApp.
        </p>
      )}
      <button type="button" className="botao botao-vermelho mt-6 w-full text-lg" disabled={!dia || !horario || estado === "enviando"} onClick={confirmar}>
        {estado === "enviando" ? "Agendando..." : quando ? `Agendar para ${quando}` : "Escolha o dia e o horário"}
      </button>
      {linkWhatsApp && (
        <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="botao mt-3 w-full border-[1.5px] border-white/20 text-white hover:border-white/50">
          <MarcaWhatsApp className="h-6 w-6" /> Prefiro falar pelo WhatsApp
        </a>
      )}
    </div>
  );
}
