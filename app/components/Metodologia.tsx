const features = [
  {
    icon: "🎥",
    title: "Videoaulas Completas",
    desc: "Aulas gravadas por médicos legistas em exercício, cobrindo todo o conteúdo do edital com profundidade clínica e forense.",
    badge: "",
  },
  {
    icon: "🃏",
    title: "Flashcards Inteligentes",
    desc: "Sistema de repetição espaçada integrado à plataforma, vinculando cada flashcard ao conteúdo da videoaula correspondente.",
    badge: "Novo",
  },
  {
    icon: "❓",
    title: "Banco de Questões",
    desc: "Questões comentadas pelos próprios professores, organizadas por tema e dificuldade para treino progressivo.",
    badge: "",
  },
  {
    icon: "🗺️",
    title: "Mapas Mentais",
    desc: "Mapas visuais criados pelos professores para facilitar a memorização dos tópicos mais complexos da medicina legal.",
    badge: "",
  },
  {
    icon: "📅",
    title: "Cronograma Automático",
    desc: "Informe sua rotina e o sistema monta um cronograma personalizado, distribuindo todos os assuntos nos seus horários livres.",
    badge: "Exclusivo",
  },
  {
    icon: "⚖️",
    title: "Monitor de Direito",
    desc: "Suporte especializado em direito para as matérias jurídicas do concurso, complementando a formação médica.",
    badge: "",
  },
  {
    icon: "💬",
    title: "Tirando Dúvidas ao Vivo",
    desc: "Acesso direto aos professores de medicina legal para tirar dúvidas, com respostas rápidas e embasadas.",
    badge: "",
  },
  {
    icon: "📝",
    title: "Acompanhamento Pós-Prova",
    desc: "Nosso suporte não termina na prova. Auxiliamos nos recursos, análise de gabarito e orientação para as próximas etapas.",
    badge: "Único",
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
            Construímos um ecossistema completo de estudo. Não é só mais um curso — é uma jornada
            estruturada até a aprovação.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative bg-[#0d1220] border border-white/6 rounded-2xl p-6 card-hover group"
            >
              {f.badge && (
                <span className="absolute top-4 right-4 bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/20">
                  {f.badge}
                </span>
              )}
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
