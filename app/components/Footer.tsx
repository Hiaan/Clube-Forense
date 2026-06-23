export default function Footer() {
  const navLinks = [
    { href: "#como-funciona", label: "Como Funciona" },
    { href: "#metodologia", label: "Metodologia" },
    { href: "#resultados", label: "Resultados" },
    { href: "#professores", label: "Professores" },
    { href: "#faq", label: "FAQ" },
    { href: "#inscricao", label: "Garantir Vaga" },
  ];

  return (
    <footer className="border-t border-white/5 py-14 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AL</span>
              </div>
              <span className="font-semibold text-white tracking-tight">
                Aprova <span className="text-blue-400">Legista</span>
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              A mentoria feita por médicos legistas para futuros médicos legistas.
              Metodologia exclusiva, resultados comprovados.
            </p>
            <p className="text-slate-700 text-xs mt-2">by Clube Forense</p>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Navegação</div>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Concurso Alvo</div>
            <div className="space-y-2">
              <p className="text-slate-500 text-xs">Polícia Civil do Maranhão — 2025</p>
              <p className="text-slate-500 text-xs">Cargo: Médico Legista</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["Tanatologia", "Traumatologia", "Toxicologia", "Sexologia"].map((a) => (
                  <span key={a} className="bg-white/4 border border-white/6 text-slate-600 text-[10px] px-2 py-0.5 rounded">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-700 text-xs">
            © {new Date().getFullYear()} Aprova Legista. Todos os direitos reservados.
          </p>
          <p className="text-slate-700 text-xs">
            Feito por médicos legistas, para médicos legistas.
          </p>
        </div>
      </div>
    </footer>
  );
}
