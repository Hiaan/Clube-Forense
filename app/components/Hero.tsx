export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-radial pt-20">
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-4 py-2 rounded-full mb-10 badge-live">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          VAGAS ABERTAS — PC MARANHÃO 2025
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
          A mentoria que{" "}
          <span className="gradient-text">aprova médicos</span>
          <br />
          legistas de verdade
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-5 leading-relaxed">
          Feita por quem já foi aprovado. Plataforma completa com IA, videoaulas, flashcards
          inteligentes e acompanhamento do primeiro estudo até a nomeação.
        </p>

        <div className="inline-flex items-center gap-2 bg-blue-500/8 border border-blue-500/15 text-blue-300 text-sm px-4 py-2 rounded-full mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Foco: Polícia Civil do Maranhão
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
          <a
            href="#inscricao"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-blue-500/20 text-base"
          >
            Quero minha vaga agora
          </a>
          <a
            href="#como-funciona"
            className="border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl transition-all hover:bg-white/4 text-base"
          >
            Como funciona
          </a>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
          {[
            { value: "100%", label: "1ºs lugares nos últimos concursos" },
            { value: "2", label: "anos consecutivos aprovando" },
            { value: "24/7", label: "suporte via IA Dr. Bonnet" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text-gold">{stat.value}</div>
              <div className="text-[11px] text-slate-600 mt-1 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float opacity-25">
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
