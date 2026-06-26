const features = [
  { icon: "🎥", title: "Aulas Gravadas de Todo o Edital", desc: "Todos os assuntos gravados para assistir quando quiser, tanto no pré quanto no pós-edital.", badge: "" },
  { icon: "💬", title: "Contato com Professores", desc: "Tire suas dúvidas direto com nossos professores através de um grupo exclusivo com alunos e monitor.", badge: "" },
  { icon: "📚", title: "Almanaque Forense", desc: "Plataforma com mais de 20 mil questões com comentários e simulados para você fazer quando quiser.", badge: "" },
  { icon: "🗺️", title: "Mapas Mentais", desc: "Faça rápidas revisões através dos nossos mapas mentais — verdadeiros resumos ilustrados da matéria.", badge: "" },
  { icon: "📅", title: "Cronograma Personalizado", desc: "Chega de se perder no que estudar. Insira sua rotina e o sistema adapta as aulas ao seu tempo disponível.", badge: "Exclusivo" },
  { icon: "🃏", title: "Flashcards Interativos", desc: "Revise rapidamente com cartões de perguntas e respostas que facilitam a memorização e aceleram o aprendizado.", badge: "Novo" },
  { icon: "👥", title: "Acompanhamento Semanal ao Vivo", desc: "Seja mentorado por professores através de encontros ao vivo via Google Meet e tire todas as dúvidas.", badge: "" },
  { icon: "🖥️", title: "Plataforma Própria", desc: "Uma área do aluno toda organizada e pensada para facilitar seu aprendizado, de forma sequencial e intuitiva.", badge: "" },
  { icon: "✅", title: "Suporte Pós-Prova", desc: "Nosso acompanhamento só termina após sua prova! Direcionamos nos recursos, resolução de gabarito e mais.", badge: "Único" },
  { icon: "🤖", title: "Dr. Bonnet — IA Forense", desc: "IA treinada com Hygino, França, Croce e demais referências bibliográficas. Tire dúvidas 24h com base científica.", badge: "IA" },
];

export default function Metodologia() {
  return (
    <section id="metodologia" className="py-24 px-6 divider" style={{ background: "#0b1628" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-5">
          <p className="section-label">A PREPARAÇÃO MAIS COMPLETA</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-center uppercase text-white mb-4">
          Tudo que você precisa para{" "}
          <span className="text-gold">conquistar sua vaga!</span>
        </h2>
        <p className="text-center mb-14 text-base" style={{ color: "#64748b" }}>
          Você terá acesso a toda a nossa plataforma para estudar quando e onde quiser.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-5 relative" style={{ background: "#060d1a" }}>
              {f.badge && (
                <span
                  className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(240,165,0,0.2)", color: "#f0a500", border: "1px solid rgba(240,165,0,0.3)" }}
                >
                  {f.badge}
                </span>
              )}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                style={{ background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.15)" }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-white text-xs mb-1.5">{f.title}</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: "#475569" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#preco" className="btn-gold px-8 py-4 text-sm inline-block">
            GARANTA A SUA VAGA
          </a>
        </div>
      </div>
    </section>
  );
}
