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
    <section className="py-24 px-6" style={{ background: "#f8f9fb" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">PARA QUEM É</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-gray-900">
            Para quem é e para quem{" "}
            <span style={{ color: "#e6b800" }}>não é</span>{" "}
            a Mentoria Aprova Legista
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Sim */}
          <div className="card-white p-7" style={{ borderLeft: "4px solid #ffcd07" }}>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Essa mentoria foi feita</div>
            <div className="text-xl font-black text-gray-900 mb-6">
              Para <span className="italic" style={{ color: "#e6b800" }}>MÉDICOS</span> que...
              <div className="text-xs font-normal text-gray-400 mt-0.5">*ou estudantes de medicina</div>
            </div>
            <ul className="space-y-3">
              {sim.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Não */}
          <div className="card-white p-7" style={{ borderLeft: "4px solid #ef4444" }}>
            <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Essa mentoria NÃO foi feita</div>
            <div className="text-xl font-black text-gray-900 mb-6">
              Para <span className="italic text-red-500">MÉDICOS</span> que...
              <div className="text-xs font-normal text-gray-400 mt-0.5">*ou estudantes de medicina</div>
            </div>
            <ul className="space-y-3">
              {nao.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-500">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
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
