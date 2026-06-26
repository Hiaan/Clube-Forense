export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0d1520 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 60% 50%, rgba(255,205,7,0.07) 0%, transparent 70%)"
      }}/>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
        backgroundSize: "60px 60px"
      }}/>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-7 badge-pulse"
              style={{ background: "rgba(255,205,7,0.12)", border: "1px solid rgba(255,205,7,0.35)", color: "#ffcd07", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"/>
              Vagas abertas — PC Maranhão 2025
            </div>

            <h1 className="font-black leading-[1.05] mb-6 text-white uppercase"
              style={{ fontSize: "clamp(2rem,4.5vw,3.4rem)" }}>
              PARTICIPE DA MENTORIA QUE{" "}
              <span style={{ color: "#ffcd07" }}>MAIS APROVA</span>{" "}
              MÉDICOS-LEGISTAS NO BRASIL
            </h1>

            <p className="text-lg mb-3 text-white/70">
              Seja acompanhado por professores aprovados e conquiste sua vaga como{" "}
              <span style={{ color: "#ffcd07", fontWeight: 700 }}>médico-legista da Polícia Civil do Maranhão</span>
            </p>

            <div className="flex flex-wrap gap-2.5 mb-8">
              {["100% do Edital da PC-MA", "Acompanhamento Semanal e Ao Vivo", "Suporte Pós-Prova"].map(t => (
                <span key={t} className="text-xs px-4 py-1.5 rounded-full font-medium"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#d1d5db" }}>
                  {t}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-10">
              {[
                "Professores Aprovados","Suporte Dedicado ao Aluno",
                "eBooks das Matérias","Grupo com Professores e Monitor",
                "Mapas Mentais Exclusivos","Encontros Semanais ao Vivo",
                "Almanaque Forense (Questões)","Simulados Exclusivos",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#ffcd07" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <a href="#preco" className="btn-yellow px-8 py-4 text-base inline-block">GARANTA A SUA VAGA</a>
              <a href="#metodologia" className="px-8 py-4 text-base font-semibold rounded-lg transition-all text-white/80 hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                Ver a metodologia
              </a>
            </div>

            <div className="flex items-center gap-4 mt-6">
              {["Eduzz","VISA","Mastercard","Boleto","PIX"].map(p => (
                <span key={p} className="text-xs font-medium text-white/25">{p}</span>
              ))}
            </div>
          </div>

          {/* Right: professor cards */}
          <div className="hidden lg:block relative h-[520px]">
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,205,7,0.06) 0%, transparent 70%)" }}/>

            {[
              { name: "Dra. Erika Anjos", role: "Legista PE", pos: "top-[5%] left-[0%]", w: 175, h: 230, color: "#3b82f6" },
              { name: "Dr. João Paulo", role: "Legista CE — 4 aprovações", pos: "top-[20%] left-[28%]", w: 195, h: 260, color: "#ffcd07" },
              { name: "Dr. Miguel Souza", role: "Legista PE", pos: "top-[8%] right-[0%]", w: 170, h: 225, color: "#8b5cf6" },
            ].map(p => (
              <div key={p.name} className={`absolute ${p.pos} rounded-2xl overflow-hidden flex flex-col justify-end`}
                style={{ width: p.w, height: p.h, background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)", border: `1px solid ${p.color}25`, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                <div className="p-3" style={{ background: "rgba(0,0,0,0.7)" }}>
                  <div className="text-xs font-bold text-white">{p.name}</div>
                  <div className="text-[10px]" style={{ color: p.color }}>{p.role}</div>
                </div>
              </div>
            ))}

            {/* Stats bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 px-6 py-4 rounded-2xl whitespace-nowrap"
              style={{ background: "rgba(17,24,39,0.9)", border: "1px solid rgba(255,205,7,0.2)", backdropFilter: "blur(10px)" }}>
              {[{ v: "100%", l: "1ºs lugares" }, { v: "4+", l: "concursos" }, { v: "100+", l: "aprovações" }].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-lg font-black" style={{ color: "#ffcd07" }}>{s.v}</div>
                  <div className="text-[10px] text-white/40">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
