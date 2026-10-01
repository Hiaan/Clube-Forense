"use client";

import { useEffect, useState } from "react";
import { CASES } from "@/lib/cases";
import type { Dicionario } from "@/lib/dicionarios";
import { CONFIG_IDIOMA, IDIOMAS, type Idioma } from "@/lib/i18n";
import Logo from "./Logo";
import { IconeFechar, IconeMenu } from "./Icones";

/** PT · EN · ES — leva para a mesma página no outro idioma. */
function SeletorIdioma({ atual, rotulo, className = "" }: { atual: Idioma; rotulo: string; className?: string }) {
  return (
    <nav aria-label={rotulo} className={`flex items-center rounded-full border border-white/15 bg-white/5 p-1 ${className}`}>
      {IDIOMAS.map((i) => {
        const c = CONFIG_IDIOMA[i];
        const ativo = i === atual;
        return (
          <a
            key={i}
            href={c.caminho}
            hrefLang={c.html}
            lang={c.html}
            title={c.nome}
            aria-current={ativo ? "page" : undefined}
            className={`rounded-full px-2.5 py-1.5 font-display text-xs font-extrabold tracking-wide transition-colors ${
              ativo ? "bg-[#e3121c] text-white shadow-[0_6px_16px_-6px_rgba(227,18,28,0.9)]" : "text-white/60 hover:text-white"
            }`}
          >
            {c.sigla}
          </a>
        );
      })}
    </nav>
  );
}

export default function Navegacao({ t, idioma }: { t: Dicionario["nav"]; idioma: Idioma }) {
  const LINKS = [
    { href: "#como-funciona", rotulo: t.comoFunciona },
    { href: "#servicos", rotulo: t.servicos },
    { href: "#resultados", rotulo: t.resultados },
    ...(CASES.length ? [{ href: "#cases", rotulo: t.clientes }] : []),
    { href: "#metodo", rotulo: t.metodo },
  ];
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
  }, [aberto]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        rolou || aberto
          ? "border-b border-white/10 bg-[#0a0203]/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="container-t9 flex h-[72px] items-center justify-between" aria-label={t.principal}>
        <a href="#topo" className="w-[58px]" onClick={() => setAberto(false)}>
          <Logo />
        </a>

        <ul className="hidden items-center gap-6 text-[15px] text-white/75 lg:flex xl:gap-9">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-white">
                {l.rotulo}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <SeletorIdioma atual={idioma} rotulo={t.idioma} />
          <a href="#agendar" className="botao botao-vermelho hidden !min-h-[46px] !px-6 text-sm sm:inline-flex">
            {t.agendar}
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 lg:hidden"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-movel"
            aria-label={aberto ? t.fecharMenu : t.abrirMenu}
          >
            {aberto ? <IconeFechar className="h-5 w-5" /> : <IconeMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        id="menu-movel"
        className={`overflow-hidden transition-[max-height] duration-500 lg:hidden ${aberto ? "max-h-[420px]" : "max-h-0"}`}
      >
        <ul className="container-t9 flex flex-col gap-1 pb-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setAberto(false)}
                className="block border-b border-white/10 py-4 font-display text-xl font-extrabold"
              >
                {l.rotulo}
              </a>
            </li>
          ))}
          <li className="pt-4">
            <a href="#agendar" onClick={() => setAberto(false)} className="botao botao-vermelho w-full">
              {t.agendarGratuita}
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
