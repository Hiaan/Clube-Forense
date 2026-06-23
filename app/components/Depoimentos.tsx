const depoimentos = [
  {
    nome: "Aluno aprovado — 2024",
    cargo: "Médico Legista, aprovado em 1º lugar",
    texto:
      "O cronograma automático mudou minha vida. Trabalho em plantões e nunca consegui manter um ritmo fixo de estudos. A plataforma se adapta e eu sempre soube exatamente o que estudar. Cheguei na prova sem lacunas.",
    inicial: "A",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    nome: "Aluno aprovado — 2023",
    cargo: "Médico Legista, aprovado em 1º lugar",
    texto:
      "O Dr. Bonnet foi essencial nas madrugadas de estudo. Tinha uma dúvida em tanatologia às 2h da manhã e a IA me trouxe a resposta com a referência exata do Hygino. Isso fez diferença na minha formação.",
    inicial: "B",
    gradient: "from-purple-500 to-purple-700",
  },
  {
    nome: "Aluna aprovada — 2024",
    cargo: "Médica Legista",
    texto:
      "Quando vi o gabarito, fui tirar dúvida de uma questão com os professores e eles me ajudaram a entender o recurso cabível. Não esperava esse nível de suporte pós-prova. Valeu cada centavo.",
    inicial: "C",
    gradient: "from-teal-500 to-teal-700",
  },
];

export default function Depoimentos() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-700/50 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 mb-5">
            DEPOIMENTOS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            O que dizem nossos{" "}
            <span className="gradient-text">aprovados</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {depoimentos.map((d) => (
            <div
              key={d.nome}
              className="bg-[#0d1220] border border-white/6 rounded-2xl p-6 flex flex-col card-hover"
            >
              <div className="flex-1">
                <div className="text-slate-500 text-2xl mb-4">"</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{d.texto}</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {d.inicial}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{d.nome}</div>
                  <div className="text-slate-500 text-xs">{d.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          * Identidades preservadas a pedido dos alunos.
        </p>
      </div>
    </section>
  );
}
