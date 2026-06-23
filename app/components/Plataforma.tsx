const cards = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    colorClass: "bg-orange-500/10 text-orange-400",
    title: "Questões Comentadas",
    sub: "Comentadas pelos professores",
    desc: "Cada questão é comentada pelo professor responsável pela disciplina. Você entende o raciocínio de quem já foi médico legista concursado — não por monitores ou IA.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    colorClass: "bg-blue-500/10 text-blue-400",
    title: "Flashcards Vinculados",
    sub: "Conectados às videoaulas",
    desc: "Cada flashcard está vinculado ao trecho exato da videoaula que trata do assunto. Errou o card? Um clique te leva direto para a revisão em vídeo.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    colorClass: "bg-teal-500/10 text-teal-400",
    title: "Mapas Mentais",
    sub: "Criados pelos professores",
    desc: "Mapas visuais para os tópicos mais complexos. Memorize mais rápido e revise de forma eficiente com recursos estruturados pelos próprios legistas.",
  },
];

export default function Plataforma() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/20 mb-5">
            PLATAFORMA EXCLUSIVA
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Uma plataforma pensada{" "}
            <span className="gradient-text">para o concurso</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Cada recurso foi construído para que o conteúdo se fixe mais rápido e você estude com
            mais eficiência.
          </p>
        </div>

        <div className="bg-[#090d1c] border border-blue-500/10 rounded-2xl p-8 md:p-10 mb-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Cronograma que se adapta{" "}
                <span className="gradient-text">à sua vida</span>
              </h3>
              <p className="text-slate-400 leading-relaxed mb-6 text-sm">
                Insira seus horários livres e o sistema distribui automaticamente todos os temas do
                edital. Trabalha de dia? Tem plantão? O cronograma se ajusta — sem você precisar
                replanejar nada.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Insira sua rotina semanal uma vez",
                  "O sistema aloca os temas nos horários livres",
                  "Ajuste automático quando você adia um estudo",
                  "Visualização semanal e mensal do progresso",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#070a12] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white">Semana atual</span>
                <span className="text-xs text-slate-600">Jun 2025</span>
              </div>
              <div className="space-y-2">
                {[
                  { day: "Seg", subject: "Tanatologia — Fenômenos Cadavéricos", done: true },
                  { day: "Ter", subject: "Traumatologia — Lesões Contusas", done: true },
                  { day: "Qua", subject: "Plantão — dia livre", free: true },
                  { day: "Qui", subject: "Toxicologia — Alcaloides", done: false },
                  { day: "Sex", subject: "Revisão + Simulado", done: false },
                  { day: "Sáb", subject: "Sexologia Forense", done: false },
                ].map((item) => (
                  <div
                    key={item.day}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      item.free
                        ? "opacity-25"
                        : item.done
                        ? "bg-green-500/5 border border-green-500/10"
                        : "bg-white/3 border border-white/5"
                    }`}
                  >
                    <span className="text-xs font-medium w-8 text-slate-600">{item.day}</span>
                    <span
                      className={`text-xs flex-1 ${
                        item.done ? "text-green-300/50 line-through" : item.free ? "text-slate-700" : "text-slate-300"
                      }`}
                    >
                      {item.subject}
                    </span>
                    {item.done && (
                      <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.title} className="bg-[#0b0f1e] border border-white/5 rounded-2xl p-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.colorClass}`}>
                {card.icon}
              </div>
              <div className="font-semibold text-white text-sm mb-1">{card.title}</div>
              <div className="text-xs text-slate-600 mb-3">{card.sub}</div>
              <p className="text-slate-400 text-xs leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
