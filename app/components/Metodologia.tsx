function CronogramaMockup() {
  const semana = [
    { dia: "Seg", topico: "Tanatologia — Fenômenos Cadavéricos", done: true },
    { dia: "Ter", topico: "Traumatologia — Lesões Contusas", done: true },
    { dia: "Qua", topico: "Tanatologia — Lesões Vitais", done: true },
    { dia: "Qui", topico: "Toxicologia — Alcaloides", done: false },
    { dia: "Sex", topico: "Revisão + Simulado", done: false, highlight: true },
    { dia: "Sáb", topico: "Sexologia Forense", done: false },
  ];
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-sm font-bold text-white">Semana atual</span>
        <span className="text-xs text-gray-500">Jun 2025</span>
      </div>
      <div className="p-3 space-y-1.5">
        {semana.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{
            background: item.highlight ? "rgba(255,205,7,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${item.highlight ? "rgba(255,205,7,0.15)" : "transparent"}`,
          }}>
            <span className="text-xs font-bold w-6 flex-shrink-0" style={{ color: item.done ? "rgba(255,255,255,0.2)" : item.highlight ? "#ffcd07" : "rgba(255,255,255,0.4)" }}>
              {item.dia}
            </span>
            <span className="flex-1 text-xs" style={{
              color: item.done ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.72)",
              textDecoration: item.done ? "line-through" : "none",
            }}>
              {item.topico}
            </span>
            {item.done && (
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            )}
            {item.highlight && !item.done && (
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#ffcd07" }}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const subfeatures = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    cor: "#f97316",
    titulo: "Questões Comentadas",
    sub: "Comentadas pelos professores",
    desc: "Cada questão é comentada pelo professor responsável pela disciplina. Você entende o raciocínio de quem já foi médico legista concursado — não por monitores ou IA.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
    ),
    cor: "#10b981",
    titulo: "Flashcards Vinculados",
    sub: "Conectados às videoaulas",
    desc: "Cada flashcard está vinculado ao trecho exato da videoaula que trata do assunto. Errou o card? Um clique te leva direto para a revisão em vídeo.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
    ),
    cor: "#06b6d4",
    titulo: "Mapas Mentais",
    sub: "Criados pelos professores",
    desc: "Mapas visuais para os tópicos mais complexos. Memorize mais rápido e revise de forma eficiente com recursos estruturados pelos próprios legistas.",
  },
];

export default function Metodologia() {
  return (
    <section id="metodologia" className="py-24 px-6" style={{ background: "#f8f9fb" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">PLATAFORMA EXCLUSIVA</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-gray-900">
            Uma plataforma pensada{" "}
            <span style={{ color: "#e6b800" }}>para o concurso</span>
          </h2>
          <p className="text-gray-500 mt-4 text-base" style={{ maxWidth: 540, margin: "1rem auto 0" }}>
            Cada recurso foi construído para que o conteúdo se fixe mais rápido e você estude com mais eficiência.
          </p>
        </div>

        {/* Big featured card: Cronograma */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{ background: "#111827" }}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: text */}
            <div className="p-8 md:p-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(255,205,7,0.12)", border: "1px solid rgba(255,205,7,0.2)" }}>
                <svg className="w-5 h-5" style={{ color: "#ffcd07" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-4">
                Cronograma que se adapta{" "}
                <span style={{ color: "#ffcd07" }}>à sua vida</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Insira seus horários livres e o sistema distribui automaticamente todos os temas do edital.
                Trabalha de dia? Tem plantão? O cronograma se ajusta — sem você precisar replanejar nada.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Insira sua rotina semanal uma vez",
                  "O sistema aloca os temas nos horários livres",
                  "Ajuste automático quando você adia um estudo",
                  "Visualização semanal e mensal do progresso",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-4 h-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: schedule mockup */}
            <div className="p-6 md:p-8 flex items-center" style={{ borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="w-full">
                <CronogramaMockup/>
              </div>
            </div>
          </div>
        </div>

        {/* 3 sub-feature cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {subfeatures.map(f => (
            <div key={f.titulo} className="rounded-2xl p-6" style={{ background: "#1a1f2e" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.cor + "18", color: f.cor }}>
                {f.icon}
              </div>
              <div className="text-xs font-semibold mb-1" style={{ color: f.cor }}>{f.sub}</div>
              <h3 className="font-black text-white text-base mb-3">{f.titulo}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
