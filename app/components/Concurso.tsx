export default function Concurso() {
  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#0d1426] to-[#0a1020] border border-blue-500/15 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/20 mb-5">
                CONCURSO ALVO
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Polícia Civil do{" "}
                <span className="gradient-text">Maranhão</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Nossa mentoria é estruturada com base no edital e nas especificidades da banca. Cada
                aula, cada questão e cada material foi pensado para maximizar sua pontuação nesse
                concurso específico.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  "Medicina Legal",
                  "Toxicologia",
                  "Traumatologia",
                  "Tanatologia",
                  "Sexologia Forense",
                  "Psiquiatria Forense",
                ].map((area) => (
                  <span
                    key={area}
                    className="bg-white/5 border border-white/8 text-slate-300 text-xs px-3 py-1.5 rounded-lg"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: "📋",
                  title: "Conteúdo Programático",
                  desc: "100% alinhado ao edital da PC-MA",
                },
                {
                  icon: "📊",
                  title: "Análise de Banca",
                  desc: "Questões dos últimos editais mapeadas",
                },
                {
                  icon: "🎯",
                  title: "Foco no Essencial",
                  desc: "Sem enrolação, direto ao que cai na prova",
                },
                {
                  icon: "📅",
                  title: "Cronograma Adaptado",
                  desc: "Planejamento baseado no prazo do edital",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white/3 border border-white/5 rounded-xl p-4 hover:border-blue-500/20 transition-colors"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-sm font-medium text-white mb-1">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
