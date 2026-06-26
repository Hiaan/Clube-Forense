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

// Brazil outline derived from real geographic coordinates
// viewBox "0 50 460 420": x maps 73.1°W→34.8°W, y maps 5.3°N(50)→33.7°S(470)
const BRAZIL_PATH = `
  M 157 51
  L 155 74
  L 192 68
  L 229 83
  L 256 64
  L 265 107
  L 295 123
  L 346 134
  C 388 139 410 144 415 147
  C 445 158 458 172 460 184
  L 459 194
  C 443 218 428 233 415 247
  C 405 272 397 302 394 326
  C 380 340 369 349 359 355
  C 342 361 331 363 322 365
  C 294 385 274 413 263 430
  C 250 448 240 463 237 470
  L 221 458
  L 192 427
  L 222 383
  L 181 322
  L 157 299
  L 1 225
  L 37 153
  L 73 108
  L 121 64
  L 157 51
  Z
`;

export default function MapaBrasil() {
  return (
    <div className="relative w-full" style={{ maxWidth: 520, margin: "0 auto" }}>
      <svg viewBox="0 50 460 420" className="w-full h-auto drop-shadow-lg">
        <defs>
          <filter id="mapShadow">
            <feDropShadow dx="2" dy="4" stdDeviation="6" floodOpacity="0.12"/>
          </filter>
        </defs>
        <path d={BRAZIL_PATH} fill="#fef9e7" stroke="#ffcd07" strokeWidth="1.5" filter="url(#mapShadow)"/>

        {/* State pins */}
        {aprovacoes.map(a => {
          const svgX = (a.x / 100) * 460;
          const svgY = 50 + (a.y / 100) * 420;
          return (
            <g key={a.estado}>
              <circle cx={svgX} cy={svgY + 2} r="6" fill="rgba(0,0,0,0.12)"/>
              <circle cx={svgX} cy={svgY} r="6" fill={a.cor} stroke="#fff" strokeWidth="1.5"/>
              <circle cx={svgX} cy={svgY} r="2.5" fill="#fff"/>
            </g>
          );
        })}
      </svg>

      {/* Interactive callout boxes — hover to reveal */}
      {aprovacoes.map(a => {
        const isRight = a.x < 50;
        return (
          <div key={a.estado} className="group absolute" style={{
            left: `${a.x}%`,
            top: `${((a.y / 100) * 420 + 50) / 470 * 100}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            cursor: "pointer",
          }}>
            <div className="w-5 h-5"/>

            <div className={`
              absolute pointer-events-none
              opacity-0 group-hover:opacity-100
              transition-opacity duration-150
              ${isRight ? "right-4" : "left-4"} top-1/2 -translate-y-1/2
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
