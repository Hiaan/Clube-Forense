"use client";
import { useState } from "react";

const faqs = [
  { q: "A mentoria é exclusiva para o concurso da PC Maranhão?", a: "O conteúdo e o cronograma são calibrados para a PC-MA, mas toda a medicina legal abordada vale para qualquer concurso de médico legista no Brasil." },
  { q: "Preciso ter conhecimento prévio em medicina legal?", a: "Não. A mentoria começa do zero e avança até os temas mais complexos. Médicos recém-formados e residentes com pouca experiência estão entre nossos aprovados." },
  { q: "Como funciona o Dr. Bonnet?", a: "É uma IA treinada com as principais obras de medicina legal (Hygino, França, Croce e outros). Você faz perguntas em linguagem natural e recebe respostas fundamentadas com as fontes bibliográficas." },
  { q: "Quanto tempo por dia preciso estudar?", a: "O cronograma se adapta ao seu tempo livre. Com 2 horas diárias você cobre o edital dentro do prazo. Você define o ritmo." },
  { q: "O acesso continua após a prova?", a: "Sim. Você mantém acesso durante todo o suporte pós-prova, que inclui análise de gabarito, orientação nos recursos e acompanhamento das próximas etapas." },
  { q: "O que é o acompanhamento pós-prova?", a: "Nossa equipe analisa o gabarito junto com você, orienta sobre os recursos cabíveis e argumentos técnicos. Permanecemos disponíveis até a nomeação." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 px-6" style={{ background: "#0b1628" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">PERGUNTAS FREQUENTES</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-white">
            Ainda tem <span className="text-gold">dúvidas?</span>
          </h2>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden" style={{ background: "#060d1a" }}>
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-white text-sm pr-4">{f.q}</span>
                <svg
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                  style={{ color: "#f0a500" }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
