export default function DrBonnet() {
  return (
    <section className="py-24 px-6" style={{ background: "#060d1a" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="section-label mb-3">INTELIGÊNCIA ARTIFICIAL</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-5">
              Conheça o{" "}
              <span className="text-gold">Dr. Bonnet</span>
            </h2>
            <p className="mb-6" style={{ color: "#94a3b8" }}>
              Nossa IA foi treinada com as principais referências bibliográficas cobradas nas
              provas de concurso para médico-legista. Tire dúvidas a qualquer hora com respostas
              fundamentadas nas fontes que a banca exige.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Hygino de Carvalho Hercules — Medicina Legal",
                "Genival Veloso de França — Medicina Legal",
                "Delton Croce — Manual de Medicina Legal",
                "Neusa Bitencourt Maia — Medicina Legal",
              ].map((r) => (
                <div key={r} className="flex items-center gap-3 text-sm" style={{ color: "#94a3b8" }}>
                  <span style={{ color: "#f0a500" }}>✦</span> {r}
                </div>
              ))}
            </div>
            <div
              className="rounded-xl p-4 text-sm"
              style={{ background: "rgba(240,165,0,0.08)", border: "1px solid rgba(240,165,0,0.2)", color: "#fbbf24" }}
            >
              <strong>Disponível 24h por dia.</strong> Estude de madrugada, no plantão ou no fim de semana.
            </div>
          </div>

          {/* Right: chat mockup */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#0b1628",
              border: "1px solid rgba(240,165,0,0.1)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-black"
                style={{ background: "linear-gradient(135deg,#f0a500,#c98900)" }}
              >
                B
              </div>
              <div>
                <div className="font-bold text-white text-sm">Dr. Bonnet</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                  <span className="text-xs" style={{ color: "#64748b" }}>Online agora</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 min-h-[260px]">
              <div className="flex justify-end">
                <div className="max-w-[80%] text-xs rounded-2xl rounded-tr-sm px-4 py-3 leading-relaxed"
                  style={{ background: "#1d4ed8", color: "#fff" }}>
                  Qual a diferença entre lesão vital e post-mortem segundo Hygino?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] text-xs rounded-2xl rounded-tl-sm px-4 py-3 leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", color: "#cbd5e1" }}>
                  Segundo Hygino Hercules (Medicina Legal, 2ª ed.), lesão vital apresenta halo eritematoso, retração dos bordos e infiltração hemorrágica por mediadores inflamatórios. Lesão post-mortem, pela ausência de circulação, não exibe esses sinais. Complementando com França: a mancha equimótica peri-lesional é o principal diferencial macroscópico...
                </div>
              </div>
              {/* Typing */}
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#475569", animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex-1 text-xs rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#334155" }}>
                Faça uma pergunta sobre medicina legal...
              </div>
              <button className="rounded-xl px-3" style={{ background: "#f0a500" }}>
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
