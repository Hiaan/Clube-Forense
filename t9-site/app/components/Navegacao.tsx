"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import { IconeFechar, IconeMenu } from "./Icones";

const LINKS = [
  { href: "#como-funciona", rotulo: "Como funciona" },
  { href: "#servicos", rotulo: "Serviços" },
  { href: "#resultados", rotulo: "Resultados" },
  { href: "#metodo", rotulo: "Método" },
];

export default function Navegacao() {
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
      <nav className="container-t9 flex h-[72px] items-center justify-between" aria-label="Principal">
        <a href="#topo" className="w-[58px]" onClick={() => setAberto(false)}>
          <Logo />
        </a>

        <ul className="hidden items-center gap-9 text-[15px] text-white/75 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-white">
                {l.rotulo}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href="#agendar" className="botao botao-vermelho hidden !min-h-[46px] !px-6 text-sm sm:inline-flex">
            Agendar consultoria
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 lg:hidden"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-movel"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
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
              Agendar consultoria gratuita
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
