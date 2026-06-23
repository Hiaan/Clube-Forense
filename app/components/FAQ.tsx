"use client";

import { useState } from "react";

const faqs = [
  {
    q: "A mentoria é exclusiva para o concurso da PC Maranhão?",
    a: "O conteúdo e o cronograma são calibrados para a PC-MA, mas toda a medicina legal abordada é válida para qualquer concurso de médico legista. Se você está estudando para outro estado, o conteúdo te prepara igualmente bem.",
  },
  {
    q: "Preciso ter conhecimento prévio em medicina legal?",
    a: "Não. A mentoria começa do zero conceitual e avança até os temas mais complexos. Médicos recém-formados e residentes com pouca experiência em medicina legal estão entre nossos aprovados.",
  },
  {
    q: "Como funciona o Dr. Bonnet?",
    a: "O Dr. Bonnet é uma IA treinada com os principais livros de medicina legal (Hygino, França, Croce e outros). Você faz perguntas em linguagem natural e recebe respostas fundamentadas com as fontes bibliográficas utilizadas.",
  },
  {
    q: "Quanto tempo por dia preciso estudar?",
    a: "O cronograma automático se adapta ao seu tempo disponível. Com 2 horas diárias você consegue cobrir o edital dentro do prazo. Com mais tempo, o ritmo acelera — você define.",
  },
  {
    q: "O acesso à plataforma continua após a prova?",
    a: "Sim. Você mantém acesso ao material durante todo o suporte pós-prova, que inclui análise de gabarito, recursos e acompanhamento das etapas seguintes.",
  },
  {
    q: "Como é feito o acompanhamento pós-prova?",
    a: "Nossa equipe analisa o gabarito junto com os alunos e orienta sobre os recursos cabíveis, argumentos técnicos e estratégias para as próximas fases do concurso. Permanecemos disponíveis até a nomeação.",
  },
  {
    q: "Os flashcards são realmente vinculados às videoaulas?",
    a: "Sim. Cada flashcard está linkado ao trecho específico da videoaula que aborda aquele conteúdo. Se você erra uma carta, pode acessar diretamente a parte do vídeo correspondente sem precisar rebobinar tudo.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 mb-5">
            PERGUNTAS FREQUENTES
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ainda tem{" "}
            <span className="gradient-text">dúvidas?</span>
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-[#0b0f1e]">
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/2 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-white text-sm pr-4">{faq.q}</span>
                <svg
                  className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/4 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
