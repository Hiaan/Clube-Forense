const professores = [
  {
    nome: "Dra. Erika Anjos",
    crm: "CRM PE 18.469 RQE 3.561",
    cargo: "Perita Médica Legista — Estado de Pernambuco",
    bio: "Formada em Medicina pela UFPE, residência em Oftalmologia pelo HCPE e fellowships em Estrabismo e Neuroftalmologia. Mestre em Ciências da Saúde/Psicologia Clínica pela UCPe. Atua também como Médica Oftalmologista.",
    inicial: "E",
    cor: "#1d4ed8",
  },
  {
    nome: "Dr. João Paulo",
    crm: "CRM CE 23.994 RQE 12.575",
    cargo: "Médico Perito Legista — 4 aprovações em concursos",
    bio: "Formado pela UESC (Bahia), residência em Patologia pelo IMIP. Médico Legista Oficial do IPEML em Recife, Perito Legista Patologista da PEFOCE/CE e Médico Patologista do Laboratório Argos. Ampla experiência em Medicina Legal e Patologia Forense.",
    inicial: "J",
    cor: "#0d9488",
  },
  {
    nome: "Dr. Miguel Souza",
    crm: "CRM PE 21.639 RQE 4.156",
    cargo: "Perito Médico Legista — Estado de Pernambuco desde 2018",
    bio: "Médico formado pela UFPE com especialização em Traumato-Ortopedia pelo Hospital das Clínicas da UFPE. Mestre em Perícias Forenses pela Universidade de Pernambuco. Sólida atuação na área da Medicina Legal.",
    inicial: "M",
    cor: "#7c3aed",
  },
];

const parceiros = [
  { nome: "Prof. Adenilton Almeida", area: "Direito Administrativo", cargo: "Policial Penal do DF" },
  { nome: "Prof. Bruno Vasconselos", area: "Direito Constitucional", cargo: "" },
  { nome: "Prof. Ricardo Ziegler", area: "Legislação Especial", cargo: "Oficial da Polícia Militar" },
];

export default function Professores() {
  return (
    <section id="professores" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-5">
          <p className="section-label">QUEM ENSINA</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-black uppercase text-center text-gray-900 mb-4">
          Conheça os criadores do{" "}
          <span style={{ color: "#e6b800" }}>Clube Forense</span>
        </h2>
        <p className="text-center mb-14 text-base text-gray-500">
          Que serão seus <strong className="text-gray-900">professores de Medicina Legal</strong> e te
          acompanharão durante o preparatório.
        </p>

        <div className="space-y-5 mb-16">
          {professores.map((p) => (
            <div key={p.nome} className="card-white flex flex-col md:flex-row gap-6 p-6 md:p-8">
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-24 h-24 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-white text-2xl self-start"
                style={{ background: p.cor }}
              >
                {p.inicial}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900 mb-1">{p.nome}</h3>
                <p className="text-sm font-semibold mb-1" style={{ color: "#ffcd07" }}>{p.crm}</p>
                <p className="text-sm font-medium text-gray-500 mb-4">{p.cargo}</p>
                <p className="text-sm leading-relaxed text-gray-600">{p.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partner professors */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-gray-500">
            Conheça também alguns dos <strong className="text-gray-900">nossos professores parceiros:</strong>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {parceiros.map((p) => (
            <div key={p.nome} className="card-white p-5 text-center">
              <div
                className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center font-black text-black text-lg"
                style={{ background: "#ffcd07" }}
              >
                {p.nome.split(" ")[1][0]}
              </div>
              <div className="font-bold text-gray-900 text-sm">{p.nome}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: "#e6b800" }}>{p.area}</div>
              {p.cargo && <div className="text-xs mt-0.5 text-gray-400">{p.cargo}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
