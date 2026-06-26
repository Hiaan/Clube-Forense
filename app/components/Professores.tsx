const professores = [
  {
    nome: "Dra. Erika Anjos",
    crm: "CRM PE 18.469 RQE 3.561",
    cargo: "Perita Médica Legista — Estado de Pernambuco",
    bio: "Formada em Medicina pela UFPE, residência em Oftalmologia pelo HCPE e fellowships em Estrabismo e Neuroftalmologia. Mestre em Ciências da Saúde/Psicologia Clínica pela UCPe. Atua também como Médica Oftalmologista.",
    gradient: "from-[#1d4ed8] to-[#0b1628]",
    cor: "#60a5fa",
  },
  {
    nome: "Dr. João Paulo",
    crm: "CRM CE 23.994 RQE 12.575",
    cargo: "Médico Perito Legista — 4 aprovações em concursos",
    bio: "Formado pela UESC (Bahia), residência em Patologia pelo IMIP. Médico Legista Oficial do IPEML em Recife, Perito Legista Patologista da PEFOCE/CE e Médico Patologista do Laboratório Argos. Ampla experiência em Medicina Legal e Patologia Forense.",
    gradient: "from-[#0d9488] to-[#0b1628]",
    cor: "#2dd4bf",
  },
  {
    nome: "Dr. Miguel Souza",
    crm: "CRM PE 21.639 RQE 4.156",
    cargo: "Perito Médico Legista — Estado de Pernambuco desde 2018",
    bio: "Médico formado pela UFPE com especialização em Traumato-Ortopedia pelo Hospital das Clínicas da UFPE. Mestre em Perícias Forenses pela Universidade de Pernambuco. Sólida atuação na área da Medicina Legal.",
    gradient: "from-[#7c3aed] to-[#0b1628]",
    cor: "#a78bfa",
  },
];

const parceiros = [
  { nome: "Prof. Adenilton Almeida", area: "Direito Administrativo", cargo: "Policial Penal do DF" },
  { nome: "Prof. Bruno Vasconselos", area: "Direito Constitucional", cargo: "" },
  { nome: "Prof. Ricardo Ziegler", area: "Legislação Especial", cargo: "Oficial da Polícia Militar" },
];

export default function Professores() {
  return (
    <section id="professores" className="py-24 px-6" style={{ background: "#060d1a" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-5">
          <p className="section-label">QUEM ENSINA</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-black uppercase text-center text-white mb-4">
          Conheça os criadores do{" "}
          <span className="text-gold">Clube Forense</span>
        </h2>
        <p className="text-center mb-14 text-base" style={{ color: "#64748b" }}>
          Que serão seus <strong style={{ color: "#fff" }}>professores de Medicina Legal</strong> e te
          acompanharão durante o preparatório.
        </p>

        <div className="space-y-5 mb-16">
          {professores.map((p, i) => (
            <div
              key={p.nome}
              className="card flex flex-col md:flex-row gap-6 p-6 md:p-8"
              style={{ background: "#0b1628" }}
            >
              {/* Photo placeholder */}
              <div
                className="flex-shrink-0 w-full md:w-48 h-56 md:h-auto rounded-xl flex items-end overflow-hidden"
                style={{
                  background: `linear-gradient(180deg, #0f1e35 0%, ${p.cor}15 100%)`,
                  border: `1px solid ${p.cor}20`,
                  minHeight: 200,
                }}
              >
                <div className="w-full p-3" style={{ background: "rgba(6,13,26,0.85)" }}>
                  <div className="text-xs font-bold text-white">{p.nome}</div>
                  <div className="text-[10px]" style={{ color: p.cor }}>{p.crm}</div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-xl font-black text-white mb-1">{p.nome}</h3>
                <p className="text-sm font-semibold mb-4" style={{ color: p.cor }}>{p.cargo}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{p.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partner professors */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold" style={{ color: "#64748b" }}>
            Conheça também alguns dos <strong style={{ color: "#fff" }}>nossos professores parceiros:</strong>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {parceiros.map((p) => (
            <div key={p.nome} className="card p-5 text-center" style={{ background: "#0b1628" }}>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center font-black text-black"
                style={{ background: "linear-gradient(135deg,#f0a500,#c98900)" }}
              >
                {p.nome.split(" ")[1][0]}
              </div>
              <div className="font-bold text-white text-sm">{p.nome}</div>
              <div className="text-xs mt-1" style={{ color: "#f0a500" }}>{p.area}</div>
              {p.cargo && <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{p.cargo}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
