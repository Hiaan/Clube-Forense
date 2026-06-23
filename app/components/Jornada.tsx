const steps = [
  {
    num: "01",
    title: "Configure sua rotina",
    desc: "Informe seus horários livres. O cronograma automático distribui todos os temas do edital nos seus momentos disponíveis — sem replanejamento manual.",
    colorClass: "border-blue-500/25 bg-blue-500/8 text-blue-400",
  },
  {
    num: "02",
    title: "Estude com a plataforma",
    desc: "Videoaulas, flashcards vinculados, mapas mentais e questões comentadas — tudo conectado e organizado por tema do edital.",
    colorClass: "border-purple-500/25 bg-purple-500/8 text-purple-400",
  },
  {
    num: "03",
    title: "Tire dúvidas na hora",
    desc: "O Dr. Bonnet responde 24h com base nas referências bibliográficas. Dúvidas complexas vão direto para os professores legistas.",
    colorClass: "border-teal-500/25 bg-teal-500/8 text-teal-400",
  },
  {
    num: "04",
    title: "Acompanhamento total",
    desc: "Suporte na véspera, análise do gabarito, orientação em recursos administrativos e acompanhamento até a nomeação.",
    colorClass: "border-amber-500/25 bg-amber-500/8 text-amber-400",
  },
];

export default function Jornada() {
  return (
    <section id="como-funciona" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/20 mb-5">
            COMO FUNCIONA
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Sua jornada até a{" "}
            <span className="gradient-text">aprovação</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Uma estrutura pensada para guiar você desde o primeiro dia de estudo até a nomeação.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-5 relative">
          <div className="hidden md:block absolute top-7 left-[14%] right-[14%] h-px bg-gradient-to-r from-blue-500/15 via-teal-500/15 to-amber-500/15" />

          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-start md:items-center text-left md:text-center">
              <div
                className={`relative z-10 w-14 h-14 rounded-2xl border flex items-center justify-center text-sm font-bold mb-5 flex-shrink-0 ${step.colorClass}`}
              >
                {step.num}
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{step.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
