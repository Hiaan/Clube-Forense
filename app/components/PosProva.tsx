const etapas = [
  {
    step: "01",
    title: "Durante o estudo",
    items: [
      "Cronograma automático personalizado",
      "Aulas, questões e flashcards integrados",
      "Dr. Bonnet disponível 24h",
      "Suporte dos professores",
    ],
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "text-blue-400",
  },
  {
    step: "02",
    title: "No dia da prova",
    items: [
      "Simulado final com gabarito rápido",
      "Material de revisão de véspera",
      "Suporte emocional e estratégico",
      "Checklist do que levar",
    ],
    color: "border-purple-500/30 bg-purple-500/5",
    badge: "text-purple-400",
  },
  {
    step: "03",
    title: "Após a prova",
    items: [
      "Análise do gabarito com os professores",
      "Orientação nos recursos administrativos",
      "Estratégia para as próximas fases",
      "Acompanhamento até a nomeação",
    ],
    color: "border-green-500/30 bg-green-500/5",
    badge: "text-green-400",
  },
];

export default function PosProva() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-500/20 mb-5">
            SUPORTE COMPLETO
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Não paramos na{" "}
            <span className="gradient-text">prova</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Nosso acompanhamento vai do primeiro flashcard até você assinar o contrato de nomeação.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {etapas.map((e) => (
            <div
              key={e.step}
              className={`border rounded-2xl p-6 card-hover ${e.color}`}
            >
              <div className={`text-4xl font-bold opacity-30 mb-4 ${e.badge}`}>{e.step}</div>
              <h3 className="font-bold text-white mb-5">{e.title}</h3>
              <ul className="space-y-3">
                {e.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <svg
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${e.badge}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
