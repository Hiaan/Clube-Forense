"use client";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-xl" : ""
      }`}
      style={{
        background: scrolled ? "rgba(6,13,26,0.97)" : "rgba(6,13,26,0.6)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 8V16C26 21.523 20.627 26.373 14 27C7.373 26.373 2 21.523 2 16V8L14 2Z" fill="#f0a500" opacity="0.2"/>
            <path d="M14 2L26 8V16C26 21.523 20.627 26.373 14 27C7.373 26.373 2 21.523 2 16V8L14 2Z" stroke="#f0a500" strokeWidth="1.5" fill="none"/>
            <circle cx="14" cy="14" r="4" fill="#f0a500"/>
          </svg>
          <span className="font-bold text-white tracking-tight">
            Clube<span style={{ color: "#f0a500" }}>Forense</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: "#94a3b8" }}>
          {[["#metodologia","Metodologia"],["#professores","Professores"],["#resultados","Resultados"],["#depoimentos","Depoimentos"],["#preco","Preço"]].map(([href, label]) => (
            <a key={href} href={href} className="hover:text-white transition-colors">{label}</a>
          ))}
        </nav>

        <a href="#preco" className="btn-gold px-5 py-2.5 text-sm hidden md:block">
          Garantir Vaga
        </a>
      </div>
    </header>
  );
}
