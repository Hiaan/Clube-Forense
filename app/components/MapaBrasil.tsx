// Simplified Brazil SVG map with approval callouts
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

// Simplified Brazil outline SVG path (approximate)
const BRAZIL_PATH = `
  M 220 10 L 240 12 L 260 8 L 295 15 L 315 12 L 335 20 L 350 18 L 365 25
  L 375 22 L 385 30 L 390 45 L 385 55 L 395 60 L 400 75 L 390 80 L 395 95
  L 400 105 L 395 115 L 388 125 L 380 135 L 370 140 L 355 145 L 345 155
  L 340 170 L 330 180 L 315 190 L 305 205 L 290 215 L 275 225 L 260 235
  L 245 245 L 235 260 L 225 275 L 215 285 L 205 295 L 195 305 L 185 318
  L 178 330 L 172 345 L 168 360 L 165 375 L 162 390 L 158 405 L 150 415
  L 140 420 L 130 425 L 120 430 L 110 435 L 100 440 L 90 445 L 80 450
  L 70 455 L 60 460 L 55 455 L 50 445 L 45 435 L 42 420 L 40 405
  L 38 390 L 36 375 L 35 360 L 34 345 L 33 330 L 35 315 L 38 300
  L 40 285 L 45 270 L 50 255 L 55 240 L 62 225 L 70 215 L 80 205
  L 90 198 L 100 192 L 112 188 L 120 180 L 128 170 L 133 158 L 135 145
  L 133 130 L 128 118 L 122 108 L 115 98 L 108 88 L 100 78 L 95 65
  L 92 52 L 95 42 L 102 33 L 115 25 L 130 18 L 148 12 L 165 8 L 185 6
  L 205 8 L 220 10 Z
`;

export default function MapaBrasil() {
  return (
    <div className="relative w-full" style={{ maxWidth: 520, margin: "0 auto" }}>
      {/* SVG Map */}
      <svg viewBox="0 50 460 420" className="w-full h-auto drop-shadow-lg">
        <defs>
          <filter id="mapShadow">
            <feDropShadow dx="2" dy="4" stdDeviation="6" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Brazil fill */}
        <path d={BRAZIL_PATH} fill="#fef9e7" stroke="#ffcd07" strokeWidth="2" filter="url(#mapShadow)"/>

        {/* State pins */}
        {aprovacoes.map(a => {
          const svgX = (a.x / 100) * 460;
          const svgY = 50 + (a.y / 100) * 420;
          return (
            <g key={a.estado}>
              {/* Pin shadow */}
              <circle cx={svgX} cy={svgY + 2} r="7" fill="rgba(0,0,0,0.15)"/>
              {/* Pin circle */}
              <circle cx={svgX} cy={svgY} r="7" fill={a.cor} stroke="#fff" strokeWidth="1.5"/>
              {/* Pin dot */}
              <circle cx={svgX} cy={svgY} r="2.5" fill="#fff"/>
            </g>
          );
        })}
      </svg>

      {/* Callout boxes — positioned absolutely */}
      {aprovacoes.map(a => {
        const isRight = a.x < 50;
        return (
          <div key={a.estado} className="absolute" style={{
            left: `${a.x}%`,
            top: `${((a.y / 100) * 420 + 50) / 470 * 100}%`,
            transform: isRight ? "translate(-100%, -50%) translateX(-12px)" : "translate(12px, -50%)",
            zIndex: 10,
          }}>
            <div className="rounded-xl p-3 shadow-xl whitespace-nowrap"
              style={{ background: "#fff", border: `2px solid ${a.cor}`, minWidth: 150, maxWidth: 200 }}>
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
              style={{ [isRight ? "right" : "left"]: "-10px", width: 10, height: 2, background: a.cor }}/>
          </div>
        );
      })}
    </div>
  );
}
