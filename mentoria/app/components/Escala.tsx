// Escala métrica em "L", a mesma que o perito põe ao lado da lesão antes de
// fotografá-la. Aqui ela emoldura o retrato do Miguel: é o detalhe que diz
// "medicina legal" sem precisar de caveira nem de fita zebrada.

export default function Escala({ className = "" }: { className?: string }) {
  const cm = 10;
  const passo = 24;
  const comprimento = cm * passo;

  return (
    <svg
      viewBox={`0 0 ${comprimento + 30} ${comprimento + 30}`}
      className={className}
      aria-hidden
      fill="none"
    >
      {/* Braço horizontal */}
      <g transform={`translate(30 ${comprimento})`}>
        {Array.from({ length: cm }, (_, i) => (
          <rect key={i} x={i * passo} y={0} width={passo} height={12} fill={i % 2 ? "#f4f0e7" : "#0b1210"} />
        ))}
        <rect x={0} y={0} width={comprimento} height={30} stroke="#0b1210" strokeWidth={1} />
        {Array.from({ length: cm * 5 + 1 }, (_, i) => (
          <line
            key={i}
            x1={(i * passo) / 5}
            x2={(i * passo) / 5}
            y1={12}
            y2={i % 5 === 0 ? 22 : 16}
            stroke="#0b1210"
            strokeWidth={0.75}
          />
        ))}
        {Array.from({ length: cm / 2 }, (_, i) => (
          <text key={i} x={(i + 1) * 2 * passo} y={29} fontSize={6.5} textAnchor="middle" fill="#0b1210" fontFamily="monospace">
            {(i + 1) * 2}
          </text>
        ))}
      </g>
      {/* Braço vertical */}
      <g transform="translate(0 0)">
        {Array.from({ length: cm }, (_, i) => (
          <rect key={i} x={18} y={i * passo} width={12} height={passo} fill={i % 2 ? "#0b1210" : "#f4f0e7"} />
        ))}
        <rect x={0} y={0} width={30} height={comprimento + 30} stroke="#0b1210" strokeWidth={1} />
        {Array.from({ length: cm * 5 + 1 }, (_, i) => (
          <line
            key={i}
            y1={(i * passo) / 5}
            y2={(i * passo) / 5}
            x1={18}
            x2={i % 5 === 0 ? 8 : 14}
            stroke="#0b1210"
            strokeWidth={0.75}
          />
        ))}
      </g>
      <text x={34} y={comprimento + 26} fontSize={6} fill="#0b1210" fontFamily="monospace" letterSpacing={1}>
        CM
      </text>
    </svg>
  );
}
