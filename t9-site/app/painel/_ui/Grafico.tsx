// Gráfico de barras diário em SVG puro (sem biblioteca), renderizado no servidor.

type Ponto = { rotulo: string; valor: number; dica: string };

export default function GraficoBarras({ pontos, titulo, total }: { pontos: Ponto[]; titulo: string; total: string }) {
  const largura = 640;
  const altura = 180;
  const margemBase = 22;
  const maximo = Math.max(...pontos.map((p) => p.valor), 0);
  const passo = largura / Math.max(pontos.length, 1);
  const larguraBarra = Math.max(2, Math.min(28, passo * 0.68));
  // Mostra no máximo ~8 rótulos no eixo, para não embolar.
  const cadaQuantos = Math.ceil(pontos.length / 8);

  return (
    <figure className="painel-cartao p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-white/60">{titulo}</span>
        <span className="font-display text-lg font-extrabold">{total}</span>
      </figcaption>
      <svg viewBox={`-16 0 ${largura + 32} ${altura}`} className="mt-4 h-auto w-full" role="img" aria-label={`${titulo}: ${total}`}>
        <defs>
          <linearGradient id="barra-t9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff3540" />
            <stop offset="100%" stopColor="#8c0a10" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1="0"
            x2={largura}
            y1={(altura - margemBase) * (1 - f)}
            y2={(altura - margemBase) * (1 - f)}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}
        {pontos.map((p, i) => {
          const h = maximo > 0 ? ((altura - margemBase - 6) * p.valor) / maximo : 0;
          const x = i * passo + (passo - larguraBarra) / 2;
          return (
            <g key={p.rotulo + i}>
              <rect x={x} y={altura - margemBase - h} width={larguraBarra} height={Math.max(h, p.valor > 0 ? 2 : 0)} rx={Math.min(4, larguraBarra / 2)} fill="url(#barra-t9)">
                <title>{p.dica}</title>
              </rect>
              {i % cadaQuantos === 0 && (
                <text x={i * passo + passo / 2} y={altura - 6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.45)">
                  {p.rotulo}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
