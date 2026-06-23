const depoimentos = [
  {
    nome: "Aluno aprovado — 2024",
    cargo: "Médico Legista, 1º lugar",
    texto:
      "O cronograma automático mudou minha vida. Trabalho em plantões e nunca consegui manter ritmo fixo de estudos. A plataforma se adapta e eu sempre soube exatamente o que estudar. Cheguei na prova sem lacunas.",
    inicial: "A",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    nome: "Aluno aprovado — 2023",
    cargo: "Médico Legista, 1º lugar",
    texto:
      "O Dr. Bonnet foi essencial nas madrugadas de estudo. Tinha uma dúvida em tanatologia às 2h e a IA me trouxe a resposta com a referência exata do Hygino. Isso fez diferença real na minha preparação.",
    inicial: "B",
    gradient: "from-purple-500 to-purple-700",
  },
  {
    nome: "Aluna aprovada — 2024",
    cargo: "Médica Legista",
    texto:
      "Quando vi o gabarito, fui tirar dúvida com os professores e eles me ajudaram a entender o recurso cabível. Não esperava esse nível de suporte pós-prova. A mentoria vai muito além do que qualquer curso oferece.",
    inicial: "C",
    gradient: "from-teal-500 to-teal-700",
  },
];

export default function Depoimentos() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 mb-5">
            DEPOIMENTOS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            O que dizem nossos{" "}
            <span className="gradient-text">aprovados</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {depoimentos.map((d) => (
            <div key={d.nome} className="bg-[#0b0f1e] border border-white/5 rounded-2xl p-6 flex flex-col card-hover">
              <div className="flex-1">
                <svg className="w-6 h-6 text-slate-700 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{d.texto}</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
                >
                  {d.inicial}
                </div>
                <div>
                  <div className="text-white text-xs font-medium">{d.nome}</div>
                  <div className="text-slate-600 text-xs">{d.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          * Identidades preservadas a pedido dos alunos.
        </p>
      </div>
    </section>
  );
}
