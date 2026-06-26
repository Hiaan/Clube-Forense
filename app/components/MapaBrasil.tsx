const aprovacoes = [
  {
    estado: "Polícia Federal", num: "Top 5", badge: "🇧🇷",
    nomes: ["Dr. Bruno Viana", "Dr. Giuliano Castelo", "Dra. Giovanna Viemond"],
    x: 44, y: 37, cor: "#dc2626",
  },
  {
    estado: "Piauí", num: "10", badge: "🥇",
    nomes: ["1º Lugar do Clube Forense", "Dr. Robert Wall", "Dr. Ricardo Augusto"],
    x: 62, y: 28, cor: "#f59e0b",
  },
  {
    estado: "Pernambuco", num: "86", badge: "🏅",
    nomes: ["1º Lugar do Clube Forense", "Dr. Marcel Medeiros", "Dra. Simone Salgado", "Dr. Pietro Tenório"],
    x: 73, y: 35, cor: "#ffcd07",
  },
  {
    estado: "Goiás", num: "17", badge: "🥇",
    nomes: ["1º Lugar do Clube Forense", "Dr. Bruno Viana"],
    x: 46, y: 50, cor: "#10b981",
  },
  {
    estado: "Minas Gerais", num: "13", badge: "🥇",
    nomes: ["1º Lugar do Clube Forense", "Dra. Lívia Bárbara"],
    x: 57, y: 56, cor: "#8b5cf6",
  },
  {
    estado: "Paraná", num: "14", badge: "🥇",
    nomes: ["1º Lugar do Clube Forense", "Dra. Laís Nader"],
    x: 46, y: 70, cor: "#3b82f6",
  },
  {
    estado: "Santa Catarina", num: "49", badge: "🥇",
    nomes: ["1º e 2º Lugar", "Dr. Lucas Mesquita", "Dr. Bruno Silva", "Dr. Hugo Emério"],
    x: 47, y: 77, cor: "#06b6d4",
  },
  {
    estado: "Rio Grande do Sul", num: "55", badge: "🏆",
    nomes: ["1º Lugar do Clube Forense", "Dr. Marcos Sandro"],
    x: 44, y: 85, cor: "#ec4899",
  },
];

export default function MapaBrasil() {
  return (
    <div className="relative w-full" style={{ maxWidth: 520, margin: "0 auto" }}>
      {/* Brazil map image */}
      <img
        src="https://static.wixstatic.com/media/240889_3411000ea67448f2a282bd98d5b48e20~mv2.png"
        alt="Mapa do Brasil com aprovações"
        className="w-full h-auto"
        style={{ display: "block" }}
      />

      {/* Pin overlays — positioned as percentage of container */}
      {aprovacoes.map(a => {
        const isRight = a.x < 50;
        return (
          <div key={a.estado} className="group absolute" style={{
            left: `${a.x}%`,
            top: `${a.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            cursor: "pointer",
          }}>
            {/* Pin dot */}
            <div className="relative">
              <div className="w-4 h-4 rounded-full shadow-md" style={{
                background: a.cor,
                border: "2.5px solid #fff",
                boxShadow: `0 0 0 3px ${a.cor}40`,
              }}/>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full animate-ping" style={{
                background: a.cor,
                opacity: 0.35,
              }}/>
            </div>

            {/* Hover callout */}
            <div className={`
              absolute pointer-events-none
              opacity-0 group-hover:opacity-100
              transition-opacity duration-150
              ${isRight ? "right-5" : "left-5"} top-1/2 -translate-y-1/2
            `} style={{ zIndex: 20 }}>
              <div className="rounded-xl p-3 shadow-2xl whitespace-nowrap"
                style={{ background: "#fff", border: `2px solid ${a.cor}`, minWidth: 155, maxWidth: 200 }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{a.badge}</span>
                  <span className="font-black text-gray-900 text-xs">{a.estado}</span>
                </div>
                <div className="font-black mb-1" style={{ color: a.cor, fontSize: "1.3rem", lineHeight: 1 }}>
                  {a.num} <span className="text-xs font-semibold text-gray-400">aprovados</span>
                </div>
                <div className="space-y-0.5">
                  {a.nomes.slice(0, 3).map(n => (
                    <div key={n} className="text-[10px] text-gray-500 flex items-center gap-1">
                      <span style={{ color: a.cor }}>•</span> {n}
                    </div>
                  ))}
                </div>
              </div>
              {/* Connector line */}
              <div className="absolute top-1/2 -translate-y-1/2"
                style={{ [isRight ? "right" : "left"]: "-8px", width: 8, height: 2, background: a.cor }}/>
            </div>
          </div>
        );
      })}

      <p className="text-center text-xs text-gray-400 mt-2">Passe o cursor sobre os pontos para ver os detalhes</p>
    </div>
  );
}
