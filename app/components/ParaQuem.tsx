const sim = [
  "Desejam estabilidade, altos salários, plano de carreira e férias remuneradas",
  "Querem ser aprovados como perito médico-legista da PC Maranhão",
  "Desejam os benefícios exclusivos de servidor público e da carreira policial",
  "Querem estudar com professores que já são médicos legistas aprovados",
  "Estão cansados de plantões exaustivos e das incertezas da medicina clínica",
  "Procuram acompanhamento semanal e ao vivo com mentores que passaram pelo mesmo",
];

const nao = [
  "Preferem ficar presos à rotina exaustiva e imprevisível de clínicas e hospitais",
  "Acham que salários de R$ 40 mil com previsibilidade são coisas irreais",
  "Estão confortáveis com o cenário atual da medicina no Brasil e não desejam mudar",
  "Preferem estudar com professores que não passaram pelo mesmo caminho",
  "Desejam pagar caro em conteúdos infinitos e sem direcionamento",
];

export default function ParaQuem() {
  return (
    <section className="py-24 px-6" style={{ background: "#0b1628" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">PARA QUEM É</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-white">
            Para quem é e para quem{" "}
            <span className="text-gold">não é</span>{" "}
            a Mentoria Aprova Legista
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Sim */}
          <div
            className="rounded-2xl p-7"
            style={{ background: "#060d1a", border: "1px solid rgba(240,165,0,0.15)" }}
          >
            <div className="text-sm font-bold mb-1" style={{ color: "#64748b" }}>Essa mentoria foi feita</div>
            <div className="text-xl font-black text-white mb-6">
              Para <span className="italic text-gold">MÉDICOS</span> que...
              <div className="text-xs font-normal" style={{ color: "#475569" }}>*ou estudantes de medicina</div>
            </div>
            <ul className="space-y-3">
              {sim.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#94a3b8" }}>
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f0a500" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Não */}
          <div
            className="rounded-2xl p-7"
            style={{ background: "#060d1a", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="text-sm font-bold mb-1" style={{ color: "#64748b" }}>Essa mentoria NÃO foi feita</div>
            <div className="text-xl font-black text-white mb-6">
              Para <span className="italic" style={{ color: "#ef4444" }}>MÉDICOS</span> que...
              <div className="text-xs font-normal" style={{ color: "#475569" }}>*ou estudantes de medicina</div>
            </div>
            <ul className="space-y-3">
              {nao.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#64748b" }}>
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
