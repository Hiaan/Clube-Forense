const items = ["100% dos 1ºs Lugares","Plataforma Exclusiva","Dr. Bonnet — IA Forense","Cronograma Automático","Flashcards Inteligentes","Professores em Exercício","Suporte Pós-Prova","Mapas Mentais","Monitor de Direito","Encontros Semanais ao Vivo"];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-4 border-y" style={{ background: "#ffcd07", borderColor: "#e6b800" }}>
      <div className="marquee-track flex gap-12 w-max">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-black font-black text-sm">✦</span>
            <span className="text-sm font-bold text-black uppercase tracking-wider">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
