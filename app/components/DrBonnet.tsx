const refs = [
  { author: "Hygino Hercules", work: "Medicina Legal" },
  { author: "Genival Veloso de França", work: "Medicina Legal" },
  { author: "Delton Croce", work: "Manual de Medicina Legal" },
  { author: "Neusa Bitencourt Maia", work: "Medicina Legal" },
];

const messages = [
  {
    role: "user",
    text: "Qual é a diferença entre lesão vital e lesão post-mortem segundo Hygino de Carvalho Hercules?",
  },
  {
    role: "ai",
    text: "Segundo Hygino Hercules (Medicina Legal, 2ª ed.), lesão vital é aquela produzida em ser vivo, apresentando sinais de reação vital como halo eritematoso, retração dos bordos, infiltração hemorrágica e mediadores inflamatórios. Lesão post-mortem, por ausência de circulação, não exibe esses fenômenos. Complementando com França: a mancha equimótica peri-lesional é o principal diferencial macroscópico...",
  },
];

export default function DrBonnet() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/4 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-500/20 mb-6">
              INTELIGÊNCIA ARTIFICIAL
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Conheça o{" "}
              <span className="gradient-text">Dr. Bonnet</span>
            </h2>

            <p className="text-slate-400 leading-relaxed mb-6 text-sm">
              Nossa IA foi treinada com as principais referências bibliográficas de medicina legal
              utilizadas nas provas de concursos públicos. Tire dúvidas a qualquer hora com respostas
              fundamentadas nas fontes que a banca cobra.
            </p>

            <div className="space-y-2.5 mb-8">
              {refs.map((ref) => (
                <div key={ref.author} className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-purple-400 rounded-full flex-shrink-0" />
                  <span className="text-sm text-slate-400">
                    <span className="text-white font-medium">{ref.author}</span>
                    {" — "}
                    <span className="text-slate-500 italic">{ref.work}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl p-4 text-sm text-purple-300">
              <strong className="text-purple-200">Disponível 24 horas.</strong> Estude de madrugada,
              no fim de semana ou em qualquer horário — o Dr. Bonnet está sempre disponível.
            </div>
          </div>

          <div className="bg-[#0b0f1e] border border-white/6 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/8">
            <div className="border-b border-white/5 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                B
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Dr. Bonnet</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-xs text-slate-500">Online agora</span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 min-h-[280px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-white/4 border border-white/6 text-slate-300 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              <div className="flex justify-start">
                <div className="bg-white/4 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 px-4 py-3 flex gap-2">
              <div className="flex-1 bg-white/4 border border-white/7 rounded-xl px-3 py-2 text-xs text-slate-600">
                Faça uma pergunta sobre medicina legal...
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
