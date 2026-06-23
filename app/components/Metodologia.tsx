const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    title: "Videoaulas Completas",
    desc: "Aulas gravadas por médicos legistas em exercício, cobrindo todo o conteúdo do edital com profundidade clínica e forense.",
    badge: "",
    colorClass: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: "Flashcards Inteligentes",
    desc: "Sistema de repetição espaçada integrado à plataforma, vinculando cada flashcard ao conteúdo da videoaula correspondente.",
    badge: "Novo",
    colorClass: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Banco de Questões",
    desc: "Questões comentadas pelos próprios professores, organizadas por tema e dificuldade para treino progressivo.",
    badge: "",
    colorClass: "bg-orange-500/10 text-orange-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    title: "Mapas Mentais",
    desc: "Mapas visuais criados pelos professores para facilitar a memorização dos tópicos mais complexos da medicina legal.",
    badge: "",
    colorClass: "bg-teal-500/10 text-teal-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Cronograma Automático",
    desc: "Informe sua rotina e o sistema monta um cronograma personalizado, distribuindo todos os assuntos nos seus horários livres.",
    badge: "Exclusivo",
    colorClass: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    title: "Monitor de Direito",
    desc: "Suporte especializado em direito para as matérias jurídicas do concurso, complementando a formação médica.",
    badge: "",
    colorClass: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    title: "Suporte dos Professores",
    desc: "Acesso direto aos professores de medicina legal para tirar dúvidas, com respostas rápidas e embasadas.",
    badge: "",
    colorClass: "bg-teal-500/10 text-teal-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Acompanhamento Pós-Prova",
    desc: "Auxiliamos nos recursos, análise de gabarito e orientação para as próximas etapas até a nomeação.",
    badge: "Único",
    colorClass: "bg-green-500/10 text-green-400",
  },
];

export default function Metodologia() {
  return (
    <section id="metodologia" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-500/20 mb-5">
            METODOLOGIA
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tudo que você precisa,{" "}
            <span className="gradient-text">em um só lugar</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Não é só mais um curso — é um ecossistema completo de estudo estruturado para a aprovação.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative bg-[#0b0f1e] border border-white/5 rounded-2xl p-6 card-hover"
            >
              {f.badge && (
                <span className="absolute top-4 right-4 bg-blue-500/12 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/20">
                  {f.badge}
                </span>
              )}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${f.colorClass}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
