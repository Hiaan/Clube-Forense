const professores = [
  {
    inicial: "P1",
    nome: "Prof. Dr. [Nome]",
    cargo: "Médico Legista",
    bio: "Aprovado em 1º lugar no concurso para médico legista. Especialista em tanatologia e traumatologia forense.",
    areas: ["Tanatologia", "Traumatologia"],
    gradient: "from-blue-500 to-blue-700",
  },
  {
    inicial: "P2",
    nome: "Prof. Dr. [Nome]",
    cargo: "Médico Legista",
    bio: "Médico legista em exercício com vasta experiência em concursos públicos e docência em medicina legal.",
    areas: ["Sexologia Forense", "Psiquiatria"],
    gradient: "from-purple-500 to-purple-700",
  },
  {
    inicial: "P3",
    nome: "Prof. Dr. [Nome]",
    cargo: "Médico Legista",
    bio: "Especialista em toxicologia forense e responsável pelo conteúdo de questões comentadas da plataforma.",
    areas: ["Toxicologia", "Genética Forense"],
    gradient: "from-teal-500 to-teal-700",
  },
];

export default function Professores() {
  return (
    <section id="professores" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-500/20 mb-5">
            QUEM ENSINA
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Aprenda com quem{" "}
            <span className="gradient-text">já foi aprovado</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Nossos professores são médicos legistas em exercício. Não teóricos — profissionais que
            vivem o dia a dia da perícia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {professores.map((p) => (
            <div
              key={p.inicial}
              className="bg-[#0d1220] border border-white/6 rounded-2xl p-6 card-hover"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white font-bold text-xl mb-5`}
              >
                {p.inicial}
              </div>
              <div className="text-white font-semibold mb-0.5">{p.nome}</div>
              <div className="text-xs text-slate-500 mb-3">{p.cargo}</div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{p.bio}</p>
              <div className="flex flex-wrap gap-2">
                {p.areas.map((a) => (
                  <span
                    key={a}
                    className="bg-white/5 border border-white/8 text-slate-400 text-xs px-2.5 py-1 rounded-lg"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          * Nomes dos professores serão revelados aos alunos matriculados.
        </p>
      </div>
    </section>
  );
}
