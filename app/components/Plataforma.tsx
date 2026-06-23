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

        {/* Feature highlight: cronograma automático */}
        <div className="bg-gradient-to-br from-[#0d1830] to-[#0a1020] border border-blue-500/15 rounded-2xl p-8 md:p-12 mb-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Cronograma que se adapta{" "}
                <span className="gradient-text">à sua vida</span>
              </h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                Insira seus horários livres e o sistema distribui automaticamente todos os temas do
                edital. Trabalha de dia? Tem plantão? O cronograma se ajusta — sem você precisar
                replanejar nada.
              </p>
              <ul className="space-y-3">
                {[
                  "Insira sua rotina semanal uma vez",
                  "O sistema aloca os temas nos horários livres",
                  "Ajuste automático quando você adia um estudo",
                  "Visualização semanal e mensal do progresso",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <svg
                      className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mini calendar mockup */}
            <div className="bg-[#080b14] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white">Semana atual</span>
                <span className="text-xs text-slate-500">Jun 2025</span>
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
                        ? "bg-white/2 opacity-40"
                        : item.done
                        ? "bg-green-500/8 border border-green-500/15"
                        : "bg-white/4 border border-white/5"
                    }`}
                  >
                    <span className="text-xs font-medium w-8 text-slate-500">{item.day}</span>
                    <span
                      className={`text-xs flex-1 ${
                        item.done ? "text-green-300 line-through opacity-60" : item.free ? "text-slate-600" : "text-slate-300"
                      }`}
                    >
                      {item.subject}
                    </span>
                    {item.done && (
                      <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Questões + Flashcards row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0d1220] border border-white/6 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/15 rounded-xl flex items-center justify-center text-xl">
                ❓
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Questões Comentadas</div>
                <div className="text-xs text-slate-500">Respostas em vídeo e texto</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cada questão é comentada pelo professor responsável pela disciplina — não por
              monitores ou IA. Você entende o raciocínio de quem já foi médico legista concursado.
            </p>
          </div>

          <div className="bg-[#0d1220] border border-white/6 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-xl">
                🃏
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Flashcards Vinculados</div>
                <div className="text-xs text-slate-500">Conectados às videoaulas</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cada flashcard está vinculado ao trecho exato da videoaula que trata do assunto. Errou
              o card? Um clique te leva direto para a revisão no vídeo — sem perder tempo buscando.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
