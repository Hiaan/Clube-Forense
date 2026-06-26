const professorCards = [
  { nome: "Dra. Erika Anjos", role: "Legista PE", inicial: "E", cor: "#1d4ed8" },
  { nome: "Dr. João Paulo", role: "Legista CE — 4 aprovações", inicial: "J", cor: "#e6b800" },
  { nome: "Dr. Miguel Souza", role: "Legista PE", inicial: "M", cor: "#7c3aed" },
];

const features = [
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    ),
    label: "Aulas objetivas",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
      </svg>
    ),
    label: "Mentoria estratégica",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
    ),
    label: "Material completo",
  },
];

const stats = [
  { icon: "🏆", num: "100+", label: "aprovações" },
  { icon: "🥇", num: "1º lugar", label: "em 4 concursos consecutivos" },
  { icon: "💼", num: "Professores", label: "em exercício" },
];

export default function Hero() {
  return (
    <section style={{ background: "#f5f0e4" }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[55%_45%] min-h-[calc(100vh-72px)]">

        {/* Left: Text */}
        <div className="flex flex-col justify-center py-16 lg:pr-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-7 w-fit"
            style={{ background: "rgba(255,205,7,0.18)", border: "1px solid rgba(214,171,0,0.45)", color: "#7a5c00" }}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"/>
            </svg>
            <span className="text-xs font-black tracking-widest uppercase">Mentoria Aprova Legista</span>
          </div>

          {/* Headline */}
          <h1 className="font-black leading-tight text-gray-900 mb-5"
            style={{ fontSize: "clamp(2rem,4vw,3.2rem)" }}>
            Prepare-se para concursos de{" "}
            <span style={{ color: "#c89b00" }}>Médico Legista</span>{" "}
            com quem já vive a Medicina Legal.
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed" style={{ maxWidth: 500, fontSize: "1.05rem" }}>
            Método, direcionamento e acompanhamento com professores especialistas para transformar sua preparação em aprovação.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {features.map(f => (
              <div key={f.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white text-gray-700"
                style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <span style={{ color: "#c89b00" }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <a href="#preco" className="btn-yellow inline-flex items-center gap-2 px-8 py-4 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"/>
              </svg>
              GARANTIR MINHA VAGA
            </a>
            <a href="#metodologia" className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold rounded-xl text-gray-700 transition-colors hover:text-gray-900"
              style={{ border: "1.5px solid #d1c9b0" }}>
              Conhecer a metodologia
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right: Professor area */}
        <div className="relative hidden lg:flex items-end overflow-hidden"
          style={{ background: "linear-gradient(160deg, #ede3c8 0%, #e4d8b0 100%)", minHeight: 560 }}>
          {/* Decorative concentric rings (forensic/fingerprint feel) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.12 }}>
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {[40,80,120,160,200,240,280,320,360].map(r => (
                <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#a07000" strokeWidth="1.5"/>
              ))}
            </svg>
          </div>

          {/* Professor cards */}
          <div className="relative w-full flex justify-center items-end pb-0 px-8 gap-4">
            {professorCards.map((p, i) => (
              <div key={p.nome}
                className="flex flex-col overflow-hidden rounded-2xl shadow-lg flex-1"
                style={{
                  maxWidth: 160,
                  marginBottom: i === 1 ? 0 : 40,
                  border: `2px solid ${p.cor}30`,
                  background: `linear-gradient(180deg, ${p.cor}12 0%, ${p.cor}28 100%)`,
                }}>
                {/* Photo area */}
                <div className="flex-1 flex items-center justify-center"
                  style={{ minHeight: 200, background: `linear-gradient(180deg, ${p.cor}10, ${p.cor}30)` }}>
                  <span className="font-black text-6xl" style={{ color: p.cor + "60" }}>{p.inicial}</span>
                </div>
                {/* Name tag */}
                <div className="p-3 text-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                  <div className="text-xs font-black text-gray-900">{p.nome}</div>
                  <div className="text-[10px] font-semibold mt-0.5" style={{ color: p.cor }}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ background: "#ece5d2", borderTop: "1px solid #d9cfb5" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 divide-x"
          style={{ borderColor: "#d9cfb5" }}>
          {stats.map(s => (
            <div key={s.label} className="py-5 px-6 flex items-center gap-4">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="font-black text-gray-900 text-lg leading-none">{s.num}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
