export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      style={{
        background: "linear-gradient(135deg, #060d1a 0%, #0b1628 50%, #071222 100%)",
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(29,78,216,0.12) 0%, transparent 70%)",
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            {/* Live badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 badge-pulse"
              style={{
                background: "rgba(240,165,0,0.12)",
                border: "1px solid rgba(240,165,0,0.3)",
                color: "#f0a500",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              Vagas abertas — PC Maranhão 2025
            </div>

            <h1
              className="font-black leading-[1.05] mb-6"
              style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", textTransform: "uppercase" }}
            >
              PARTICIPE DA MENTORIA QUE{" "}
              <span className="text-gold">MAIS APROVA</span>{" "}
              MÉDICOS-LEGISTAS NO BRASIL
            </h1>

            <p className="text-lg mb-3" style={{ color: "#94a3b8" }}>
              Seja acompanhado por professores aprovados e conquiste sua vaga como{" "}
              <span style={{ color: "#f0a500", fontWeight: 700 }}>
                médico-legista da Polícia Civil do Maranhão
              </span>
            </p>

            {/* Pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["100% do Edital da PC-MA", "Acompanhamento Semanal e Ao Vivo", "Suporte Pós-Prova"].map((t) => (
                <span
                  key={t}
                  className="text-xs px-4 py-2 rounded-full font-medium"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#cbd5e1",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Feature checklist */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-10">
              {[
                "Professores Aprovados",
                "Suporte Dedicado ao Aluno",
                "eBooks das Matérias",
                "Grupo com Professores e Monitor",
                "Mapas Mentais Exclusivos",
                "Encontros Semanais ao Vivo",
                "Almanaque Forense (Questões)",
                "Simulados Exclusivos",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#f0a500" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <a href="#preco" className="btn-gold px-8 py-4 text-base inline-block">
                GARANTA A SUA VAGA
              </a>
              <a
                href="#metodologia"
                className="px-8 py-4 text-base font-semibold rounded-lg transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                }}
              >
                Ver a metodologia
              </a>
            </div>

            {/* Payment icons */}
            <div className="flex items-center gap-3 mt-6 opacity-50">
              {["Eduzz", "VISA", "Mastercard", "Boleto", "PIX"].map((p) => (
                <span key={p} className="text-xs font-medium" style={{ color: "#64748b" }}>{p}</span>
              ))}
            </div>
          </div>

          {/* Right: professor photos arrangement */}
          <div className="hidden lg:flex justify-center items-center relative h-[500px]">
            {/* Shield/badge shape background */}
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(29,78,216,0.1) 0%, transparent 70%)",
              }}
            />
            {/* Professor placeholder cards */}
            <div className="relative w-full h-full flex items-center justify-center gap-4">
              {[
                { name: "Dra. Erika Anjos", role: "Legista PE", top: "10%", left: "5%", w: 170 },
                { name: "Dr. João Paulo", role: "Legista CE", top: "30%", left: "35%", w: 200 },
                { name: "Dr. Miguel Souza", role: "Legista PE", top: "15%", right: "5%", w: 165 },
              ].map((p) => (
                <div
                  key={p.name}
                  className="absolute rounded-xl overflow-hidden flex flex-col justify-end"
                  style={{
                    width: p.w,
                    height: p.w * 1.35,
                    top: p.top,
                    left: p.left,
                    right: (p as any).right,
                    background: "linear-gradient(180deg, #0f1e35 0%, #0b1628 100%)",
                    border: "1px solid rgba(240,165,0,0.15)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="p-3" style={{ background: "rgba(6,13,26,0.8)" }}>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[10px]" style={{ color: "#f0a500" }}>{p.role}</div>
                  </div>
                </div>
              ))}

              {/* Center badge */}
              <div
                className="absolute z-10"
                style={{ top: "55%", left: "50%", transform: "translate(-50%,-50%)" }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #f0a500, #c98900)",
                    boxShadow: "0 0 40px rgba(240,165,0,0.4)",
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
                    <path d="M14 2L26 8V16C26 21.523 20.627 26.373 14 27C7.373 26.373 2 21.523 2 16V8L14 2Z" fill="rgba(0,0,0,0.4)"/>
                    <circle cx="14" cy="14" r="5" fill="#000" opacity="0.6"/>
                    <circle cx="14" cy="14" r="3" fill="#fff"/>
                  </svg>
                </div>
              </div>

              {/* Stats floating */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 px-6 py-4 rounded-2xl"
                style={{
                  background: "rgba(11,22,40,0.9)",
                  border: "1px solid rgba(240,165,0,0.15)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {[
                  { v: "100%", l: "1ºs lugares" },
                  { v: "4+", l: "concursos" },
                  { v: "100+", l: "aprovações" },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className="text-lg font-black text-gold">{s.v}</div>
                    <div className="text-[10px]" style={{ color: "#64748b" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
