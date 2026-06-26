const items = [
  "100% dos 1ºs Lugares",
  "Plataforma Exclusiva",
  "Dr. Bonnet — IA com Referências",
  "Cronograma Automático",
  "Flashcards Inteligentes",
  "Professores em Exercício",
  "Suporte Pós-Prova",
  "Mapas Mentais",
  "Monitor de Direito",
  "Encontros Semanais ao Vivo",
];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div
      className="overflow-hidden py-4 border-y"
      style={{
        background: "rgba(240,165,0,0.06)",
        borderColor: "rgba(240,165,0,0.15)",
      }}
    >
      <div className="marquee-track flex gap-12 w-max">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#f0a500" }}>
              ✦
            </span>
            <span className="text-sm font-semibold" style={{ color: "#cbd5e1" }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
