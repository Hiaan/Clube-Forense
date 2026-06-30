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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.0)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e5e7eb" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 8V16C26 21.523 20.627 26.373 14 27C7.373 26.373 2 21.523 2 16V8L14 2Z" fill="#ffcd07" opacity="0.3" stroke="#ffcd07" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="3.5" fill="#ffcd07"/>
          </svg>
          <span className={`font-bold tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>
            Clube<span style={{ color: "#ffcd07" }}>Forense</span>
          </span>
        </div>

        <nav className={`hidden md:flex items-center gap-7 text-sm transition-colors ${scrolled ? "text-gray-600" : "text-white/80"}`}>
          {[["#metodologia","Metodologia"],["#professores","Professores"],["#resultados","Resultados"],["#depoimentos","Depoimentos"],["#preco","Preço"],["/monitor","Monitor de Concursos"]].map(([href,label]) => (
            <a key={href} href={href} className="hover:text-gray-900 transition-colors">{label}</a>
          ))}
        </nav>

        <a href="#preco" className="btn-yellow px-5 py-2.5 text-sm">Garantir Vaga</a>
      </div>
    </header>
  );
}
