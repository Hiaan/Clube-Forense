"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  EMAIL_VALIDO,
  FAIXAS_FATURAMENTO,
  HORARIOS,
  dataPorExtenso,
  intervaloUTC,
  mascararWhatsApp,
  proximosDiasUteis,
  whatsAppValido,
  type Dia,
} from "@/lib/agenda";
import type { Dicionario } from "@/lib/dicionarios";
import { enviarLeadPorEmail } from "@/lib/emailLead";
import { CONFIG_IDIOMA, fmt, type Idioma } from "@/lib/i18n";
import Rico from "./Rico";
import GerenciadorAnuncios from "./GerenciadorAnuncios";
import Logo from "./Logo";
import { IconeCadeado, IconeCalendario, IconeCheck, IconeRelogio, IconeSeta, IconeSetaEsquerda, MarcaWhatsApp } from "./Icones";

const WHATSAPP_T9 = process.env.NEXT_PUBLIC_T9_WHATSAPP ?? "";

type Dados = { nome: string; email: string; whatsapp: string; faturamento: string; site: string };
type Campo = "nome" | "email" | "whatsapp" | "horario";

async function enviar(corpo: Record<string, string>, t: Dicionario["agendamento"]) {
  const resposta = await fetch("/api/agendamento", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...corpo, origem: window.location.href }),
  }).catch(() => null);
  const json = resposta ? await resposta.json().catch(() => ({})) : {};
  // As mensagens vêm do dicionário; o servidor só diz se foi erro de campo (422) ou de envio.
  if (!resposta?.ok || !json.ok) throw new Error(resposta?.status === 422 ? t.erroCampos : t.erroEnvio);
  if (corpo.site) return; // armadilha de robô preenchida: não manda e-mail
  enviarLeadPorEmail({
    etapa: corpo.etapa,
    nome: corpo.nome,
    email: corpo.email,
    whatsapp: corpo.whatsapp,
    faturamento: corpo.faturamento,
    data: corpo.data,
    horario: corpo.horario,
    idioma: corpo.idioma,
  });
}

function validar(d: Dados, t: Dicionario["agendamento"]) {
  const erros: Partial<Record<Campo, string>> = {};
  if (d.nome.trim().length < 2) erros.nome = t.erroNome;
  if (!EMAIL_VALIDO.test(d.email.trim())) erros.email = t.erroEmail;
  if (!whatsAppValido(d.whatsapp)) erros.whatsapp = t.erroWhatsapp;
  return erros;
}

export default function Agendamento({
  t,
  gerenciador,
  idioma,
}: {
  t: Dicionario["agendamento"];
  gerenciador: Dicionario["gerenciador"];
  idioma: Idioma;
}) {
  const locale = CONFIG_IDIOMA[idioma].locale;
  const [etapa, setEtapa] = useState(0);
  const [dados, setDados] = useState<Dados>({ nome: "", email: "", whatsapp: "", faturamento: "", site: "" });
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [dias, setDias] = useState<Dia[]>([]);
  const [dia, setDia] = useState("");
  const [horario, setHorario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const cartaoRef = useRef<HTMLDivElement>(null);

  // No celular, ao trocar de etapa, traz o topo do cartão de volta para a tela.
  useEffect(() => {
    const cartao = cartaoRef.current;
    if (!cartao || etapa === 0) return;
    if (cartao.getBoundingClientRect().top < 80) cartao.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [etapa]);

  const alterar = (campo: keyof Dados, valor: string) => {
    setDados((d) => ({ ...d, [campo]: campo === "whatsapp" ? mascararWhatsApp(valor, idioma !== "pt") : valor }));
    if (erros[campo as Campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const avancar = (e: FormEvent) => {
    e.preventDefault();
    const encontrados = validar(dados, t);
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;

    // O lead já fica registrado aqui, mesmo que a pessoa não chegue a escolher o horário.
    enviar({ etapa: "lead", ...dados, idioma }, t).catch(() => {});

    const proximos = proximosDiasUteis(undefined, undefined, locale);
    setDias(proximos);
    if (!dia) setDia(proximos[0]?.iso ?? "");
    setEtapa(1);
  };

  const confirmar = async () => {
    if (!dia || !horario) {
      setErros({ horario: t.erroHorario });
      return;
    }
    setEnviando(true);
    setErroEnvio("");
    try {
      await enviar({ etapa: "agendamento", ...dados, data: dia, horario, idioma }, t);
      setEtapa(2);
    } catch (erro) {
      setErroEnvio(erro instanceof Error ? erro.message : t.erroEnvio);
    } finally {
      setEnviando(false);
    }
  };

  const primeiroNome = dados.nome.trim().split(/\s+/)[0] ?? "";
  const quando = dia && horario ? fmt(t.quando, { data: dataPorExtenso(dia, locale), hora: horario }) : "";

  const linkAgenda = (() => {
    if (!dia || !horario) return "";
    const { inicio, fim } = intervaloUTC(dia, horario);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: t.agendaTitulo,
      dates: `${inicio}/${fim}`,
      details: t.agendaDetalhes,
      ctz: "America/Sao_Paulo",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })();

  const linkWhatsApp = WHATSAPP_T9
    ? `https://wa.me/${WHATSAPP_T9}?text=${encodeURIComponent(
        fmt(t.whatsappMensagem, { nome: dados.nome.trim(), quando }),
      )}`
    : "";

  return (
    <section id="agendar" className="fundo-claro relative overflow-hidden">
      <div className="linhas-diagonais pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="container-t9 relative grid gap-14 py-24 sm:py-32 lg:grid-cols-[1fr_1.02fr] lg:gap-16">
        {/* Texto, como na última arte */}
        <div className="relative">
          <Logo cor="preto" className="w-[88px]" assinaturaClassName="text-[0.78rem]" />
          <h2
            className="mt-10 font-display text-[2.1rem] leading-[1.06] font-extrabold tracking-tight text-balance text-[#0b0b0b] sm:text-5xl lg:text-[3.3rem]"
            data-reveal
          >
            {t.titulo} <span className="text-[#e3121c]">{t.tituloDestaque}</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#1c1c1c] sm:text-xl" data-reveal>
            <Rico texto={t.texto} classeForte="font-bold" />
          </p>
          <ul className="mt-8 space-y-3 text-[#1c1c1c]" data-reveal>
            {t.beneficios.map((b) => (
              <li key={b} className="flex items-center gap-3 text-lg">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e3121c] text-white">
                  <IconeCheck className="h-4 w-4" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="relative mt-14 hidden lg:block" data-reveal="direita">
            <GerenciadorAnuncios t={gerenciador} idioma={idioma} />
          </div>
        </div>

        {/* Agendador */}
        <div className="lg:sticky lg:top-28 lg:self-start" data-reveal="zoom">
          <div ref={cartaoRef} className="scroll-mt-24 rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_40px_100px_-30px_rgba(120,0,6,0.45)] sm:p-9">
            <ol className="mb-8 flex items-center gap-2" aria-label={t.etapasAria}>
              {t.etapas.map((nome, i) => (
                <li key={nome} className="flex flex-1 items-center gap-2" aria-current={i === etapa ? "step" : undefined}>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${
                      i <= etapa ? "bg-[#e3121c] text-white" : "bg-[#f1ecec] text-[#9b9292]"
                    }`}
                  >
                    {i < etapa ? <IconeCheck className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`hidden text-sm sm:inline ${i === etapa ? "font-semibold text-[#0b0b0b]" : "text-[#9b9292]"}`}>
                    {nome}
                  </span>
                  {i < t.etapas.length - 1 && <span className="h-px flex-1 bg-[#ece6e6]" aria-hidden="true" />}
                </li>
              ))}
            </ol>

            {etapa === 0 && (
              <form onSubmit={avancar} noValidate className="text-[#0b0b0b]">
                <h3 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t.formTitulo}
                </h3>
                <p className="mt-2 text-[#5b5353]">{t.formSub}</p>

                <div className="mt-7 space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium">{t.nome}</span>
                    <input
                      className="campo"
                      name="nome"
                      autoComplete="name"
                      placeholder={t.nomeExemplo}
                      value={dados.nome}
                      onChange={(e) => alterar("nome", e.target.value)}
                      aria-invalid={!!erros.nome}
                      aria-describedby={erros.nome ? "erro-nome" : undefined}
                    />
                    {erros.nome && <span id="erro-nome" className="mt-1.5 block text-sm text-[#d11]">{erros.nome}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium">{t.email}</span>
                    <input
                      className="campo"
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder={t.emailExemplo}
                      value={dados.email}
                      onChange={(e) => alterar("email", e.target.value)}
                      aria-invalid={!!erros.email}
                      aria-describedby={erros.email ? "erro-email" : undefined}
                    />
                    {erros.email && <span id="erro-email" className="mt-1.5 block text-sm text-[#d11]">{erros.email}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium">{t.whatsapp}</span>
                    <input
                      className="campo"
                      type="tel"
                      name="whatsapp"
                      autoComplete={idioma === "pt" ? "tel-national" : "tel"}
                      inputMode="tel"
                      placeholder={t.whatsappExemplo}
                      value={dados.whatsapp}
                      onChange={(e) => alterar("whatsapp", e.target.value)}
                      aria-invalid={!!erros.whatsapp}
                      aria-describedby={erros.whatsapp ? "erro-whatsapp" : "dica-whatsapp"}
                    />
                    {erros.whatsapp ? (
                      <span id="erro-whatsapp" className="mt-1.5 block text-sm text-[#d11]">{erros.whatsapp}</span>
                    ) : (
                      <span id="dica-whatsapp" className="mt-1.5 block text-xs text-[#9b9292]">
                        {t.whatsappDica}
                      </span>
                    )}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium">
                      {t.faturamento} <span className="font-normal text-[#9b9292]">{t.opcional}</span>
                    </span>
                    <span className="relative block">
                      <select
                        className="campo appearance-none pr-11"
                        name="faturamento"
                        value={dados.faturamento}
                        onChange={(e) => alterar("faturamento", e.target.value)}
                      >
                        <option value="">{t.faixaExemplo}</option>
                        {/* O valor enviado é sempre o rótulo em português; só o texto exibido muda. */}
                        {FAIXAS_FATURAMENTO.map((f, i) => (
                          <option key={f} value={f}>
                            {t.faixas[i]}
                          </option>
                        ))}
                      </select>
                      <svg
                        viewBox="0 0 24 24"
                        className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[#9b9292]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </label>
                  {/* Armadilha para robôs: invisível para pessoas */}
                  <input
                    type="text"
                    name="site"
                    tabIndex={-1}
                    autoComplete="off"
                    value={dados.site}
                    onChange={(e) => alterar("site", e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    aria-hidden="true"
                  />
                </div>

                <button type="submit" className="botao botao-vermelho mt-8 w-full text-lg">
                  {t.escolherHorario}
                  <IconeSeta className="h-5 w-5" />
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9b9292]">
                  <IconeCadeado className="h-3.5 w-3.5" />
                  {t.privacidade}
                </p>
              </form>
            )}

            {etapa === 1 && (
              <div className="text-[#0b0b0b]">
                <button
                  type="button"
                  onClick={() => setEtapa(0)}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#5b5353] hover:text-[#0b0b0b]"
                >
                  <IconeSetaEsquerda className="h-4 w-4" />
                  {t.voltar}
                </button>
                <h3 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {primeiroNome ? fmt(t.horarioTituloNome, { nome: primeiroNome }) : t.horarioTitulo}
                </h3>
                <p className="mt-2 text-[#5b5353]">{t.horarioSub}</p>

                <p className="mt-7 mb-3 flex items-center gap-2 text-sm font-semibold">
                  <IconeCalendario className="h-4 w-4 text-[#e3121c]" /> {t.dia}
                </p>
                <div className="sem-barra -mx-6 flex gap-2.5 overflow-x-auto px-6 pb-2 sm:-mx-9 sm:px-9" role="group" aria-label={t.diasAria}>
                  {dias.map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      className="dia flex min-w-[68px] flex-col items-center rounded-2xl px-3 py-3"
                      aria-pressed={dia === d.iso}
                      onClick={() => {
                        setDia(d.iso);
                        setErros({});
                      }}
                    >
                      <span className="text-xs tracking-wide uppercase opacity-75">{d.semana}</span>
                      <span className="font-display text-2xl font-extrabold">{d.dia}</span>
                      <span className="text-xs opacity-75">{d.mes}</span>
                    </button>
                  ))}
                </div>

                <p className="mt-6 mb-3 flex items-center gap-2 text-sm font-semibold">
                  <IconeRelogio className="h-4 w-4 text-[#e3121c]" /> {t.horario}
                </p>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" role="group" aria-label={t.horariosAria}>
                  {HORARIOS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className="horario rounded-xl py-3 font-semibold tabular-nums"
                      aria-pressed={horario === h}
                      onClick={() => {
                        setHorario(h);
                        setErros({});
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>

                {erros.horario && <p className="mt-4 text-sm text-[#d11]">{erros.horario}</p>}
                {erroEnvio && (
                  <p className="mt-4 rounded-xl bg-[#fdecec] px-4 py-3 text-sm text-[#a10b0b]" role="alert">
                    {erroEnvio}
                  </p>
                )}

                <div className="mt-7 rounded-2xl bg-[#f8f4f4] px-5 py-4 text-sm text-[#3d3636]" aria-live="polite">
                  {quando ? (
                    <>
                      {t.suaReuniao} <strong className="text-[#0b0b0b]">{quando}</strong>
                    </>
                  ) : (
                    t.escolhaDiaHorario
                  )}
                </div>

                <button
                  type="button"
                  className="botao botao-vermelho mt-6 w-full text-lg"
                  onClick={confirmar}
                  disabled={enviando || !dia || !horario}
                >
                  {enviando ? t.agendando : t.confirmar}
                  {!enviando && <IconeCheck className="h-5 w-5" />}
                </button>
              </div>
            )}

            {etapa === 2 && (
              <div className="py-4 text-center text-[#0b0b0b]" role="status">
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e3121c] text-white shadow-[0_20px_40px_-12px_rgba(227,18,28,0.8)]">
                  <IconeCheck className="h-10 w-10" />
                </span>
                <h3 className="mt-6 font-display text-3xl font-extrabold tracking-tight">{t.confirmadoTitulo}</h3>
                <p className="mx-auto mt-3 max-w-sm text-[#5b5353]">
                  <Rico
                    texto={
                      primeiroNome
                        ? fmt(t.confirmadoTextoNome, { nome: primeiroNome, quando })
                        : fmt(t.confirmadoTexto, { quando })
                    }
                    classeForte="text-[#0b0b0b]"
                  />
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  {linkWhatsApp && (
                    <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="botao w-full bg-[#1fb345] text-white hover:bg-[#199a3b]">
                      <MarcaWhatsApp className="h-6 w-6" />
                      {t.confirmarWhatsapp}
                    </a>
                  )}
                  <a
                    href={linkAgenda}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="botao w-full border-[1.5px] border-[#e4dede] text-[#0b0b0b] hover:border-[#e3121c]"
                  >
                    <IconeCalendario className="h-5 w-5 text-[#e3121c]" />
                    {t.salvarAgenda}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
