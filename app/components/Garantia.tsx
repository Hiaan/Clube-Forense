export default function Garantia() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#090d1c] border border-blue-500/10 rounded-2xl p-8 md:p-14 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/20 mb-8">
            NOSSO COMPROMISSO
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            100% dos primeiros lugares{" "}
            <span className="gradient-text-gold">nos últimos 2 anos</span>
          </h2>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Não é coincidência — é método. Todos os candidatos que ocuparam o 1º lugar nos concursos
            para médico legista nos últimos dois anos eram alunos da Aprova Legista.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { stat: "2023", label: "1º lugar aprovado", desc: "Polícia Civil — aluno Aprova Legista", highlight: false },
              { stat: "2024", label: "1º lugar aprovado", desc: "Polícia Civil — aluno Aprova Legista", highlight: false },
              { stat: "2025", label: "Sua vez", desc: "PC Maranhão — vagas abertas agora", highlight: true },
            ].map((item) => (
              <div
                key={item.stat}
                className={`rounded-xl p-5 border ${
                  item.highlight ? "bg-blue-500/8 border-blue-500/20" : "bg-white/3 border-white/6"
                }`}
              >
                <div
                  className={`text-3xl font-bold mb-1 ${
                    item.highlight ? "gradient-text" : "gradient-text-gold"
                  }`}
                >
                  {item.stat}
                </div>
                <div className={`text-sm font-medium mb-1 ${item.highlight ? "text-blue-300" : "text-white"}`}>
                  {item.label}
                </div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>

          <a
            href="#inscricao"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-blue-500/20"
          >
            Quero fazer parte dessa lista
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
