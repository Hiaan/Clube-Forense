const items = [
  "Acesso completo à plataforma Aprova Legista",
  "Videoaulas com médicos legistas aprovados",
  "Banco de questões comentadas pelos professores",
  "Flashcards vinculados às videoaulas",
  "Mapas mentais de todos os temas",
  "Dr. Bonnet — IA com referências bibliográficas",
  "Cronograma automático personalizado",
  "Monitor de direito",
  "Suporte direto com os professores",
  "Acompanhamento pós-prova e recursos",
];

export default function CTA() {
  return (
    <section id="inscricao" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-xs font-semibold px-4 py-2 rounded-full border border-red-500/20 mb-8 badge-live">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          VAGAS LIMITADAS — ENCERRAM EM BREVE
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Comece agora.{" "}
          <span className="gradient-text">Seja aprovado.</span>
        </h2>

        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Cada dia de espera é um dia a menos de preparação. Os primeiros lugares já estão estudando.
          Garanta sua vaga na mentoria com 100% de aprovação nos 1ºs lugares.
        </p>

        <div className="bg-[#0b0f1e] border border-white/6 rounded-2xl p-6 mb-10 text-left max-w-md mx-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">O que você leva:</div>
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <a
          href="#"
          className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-5 rounded-xl text-lg transition-all hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-0.5 mb-4"
        >
          Garantir minha vaga agora
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>

        <p className="text-slate-700 text-xs">
          Dúvidas? Entre em contato via WhatsApp antes de se inscrever.
        </p>
      </div>
    </section>
  );
}
