const features = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Conteúdo Programático",
    desc: "100% alinhado ao edital da PC-MA",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Análise de Banca",
    desc: "Questões dos últimos editais mapeadas",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Foco no Essencial",
    desc: "Direto ao que cai na prova",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Cronograma Adaptado",
    desc: "Planejamento baseado no prazo do edital",
  },
];

const areas = [
  "Medicina Legal",
  "Toxicologia",
  "Traumatologia",
  "Tanatologia",
  "Sexologia Forense",
  "Psiquiatria Forense",
];

export default function Concurso() {
  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#090d1c] border border-blue-500/10 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/20 mb-5">
                CONCURSO ALVO
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Polícia Civil do{" "}
                <span className="gradient-text">Maranhão</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6 text-sm">
                Nossa mentoria é estruturada com base no edital e nas especificidades da banca. Cada
                aula, cada questão e cada material foi pensado para maximizar sua pontuação nesse
                concurso específico.
              </p>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <span
                    key={area}
                    className="bg-white/4 border border-white/8 text-slate-400 text-xs px-3 py-1.5 rounded-lg"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="bg-white/3 border border-white/6 rounded-xl p-4 hover:border-blue-500/20 transition-colors"
                >
                  <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-3">
                    {item.icon}
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{item.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
