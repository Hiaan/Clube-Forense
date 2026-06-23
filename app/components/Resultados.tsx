const stats = [
  {
    value: "100%",
    label: "dos 1ºs lugares",
    detail: "Aprovamos todos os primeiros colocados nos concursos para médico legista dos últimos 2 anos",
    color: "from-amber-400 to-orange-500",
  },
  {
    value: "2+",
    label: "anos de resultados",
    detail: "Histórico comprovado de aprovações em concursos estaduais para médico legista",
    color: "from-blue-400 to-blue-600",
  },
  {
    value: "360°",
    label: "de acompanhamento",
    detail: "Do primeiro dia de estudo até o gabarito, recursos e nomeação",
    color: "from-purple-400 to-purple-600",
  },
];

export default function Resultados() {
  return (
    <section id="resultados" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/20 mb-5">
            RESULTADOS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Números que{" "}
            <span className="gradient-text-gold">falam por si</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Não prometemos aprovação. Entregamos o método que os campeões usaram.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[#0d1220] border border-white/6 rounded-2xl p-8 text-center card-hover"
            >
              <div
                className={`text-5xl font-bold mb-2 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}
              >
                {s.value}
              </div>
              <div className="text-white font-semibold mb-3">{s.label}</div>
              <div className="text-slate-500 text-sm leading-relaxed">{s.detail}</div>
            </div>
          ))}
        </div>

        {/* Timeline de conquistas */}
        <div className="bg-gradient-to-br from-amber-500/8 to-orange-500/5 border border-amber-500/15 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Histórico de Aprovações
          </h3>
          <div className="space-y-4">
            {[
              {
                year: "2024",
                desc: "1º lugar no concurso para médico legista — aluno Aprova Legista",
              },
              {
                year: "2023",
                desc: "1º lugar no concurso para médico legista — aluno Aprova Legista",
              },
              {
                year: "Próximo",
                desc: "Seu nome aqui — PC Maranhão 2025",
                highlight: true,
              },
            ].map((item) => (
              <div key={item.year} className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-16 text-xs font-bold px-2 py-1 rounded text-center ${
                    item.highlight
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {item.year}
                </div>
                <div
                  className={`text-sm leading-relaxed ${
                    item.highlight ? "text-blue-200 font-medium" : "text-slate-400"
                  }`}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
