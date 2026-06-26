const aprovacoes = [
  { estado: "Polícia Federal", num: "Top 5", nomes: ["Dr. Bruno Viana", "Dr. Giuliano Castelo", "Dra. Giovanna Viemond"], badge: "🇧🇷" },
  { estado: "Pernambuco", num: "86", nomes: ["1º Lugar do Clube Forense", "Dr. Marcel Medeiros", "Dra. Simone Salgado", "Dr. Pietro Tenório"], badge: "🏅" },
  { estado: "Santa Catarina", num: "49", nomes: ["1º e 2º Lugar", "Dr. Lucas Mesquita", "Dr. Bruno Silva", "Dr. Hugo Emério"], badge: "🥇" },
  { estado: "Rio Grande do Sul", num: "55", nomes: ["1º Lugar do Clube Forense", "Dr. Marcos Sandro"], badge: "🏆" },
  { estado: "Goiás", num: "17", nomes: ["1º Lugar do Clube Forense", "Dr. Bruno Viana"], badge: "🥇" },
  { estado: "Piauí", num: "10", nomes: ["1º Lugar do Clube Forense", "Dr. Robert Wall"], badge: "🥇" },
  { estado: "Minas Gerais", num: "13", nomes: ["1º Lugar do Clube Forense", "Dra. Lívia Bárbara"], badge: "🥇" },
  { estado: "Paraná", num: "4", nomes: ["1º Lugar do Clube Forense", "Dra. Laís Nader"], badge: "🥇" },
];

export default function Resultados() {
  return (
    <section id="resultados" className="py-24 px-6" style={{ background: "#0b1628" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-5">
          <p className="section-label">HISTÓRICO DE APROVAÇÕES</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-black uppercase text-center text-white mb-4">
          Por que escolher o{" "}
          <span className="text-gold">Clube Forense?</span>
        </h2>
        <p className="text-center text-base mb-14" style={{ color: "#64748b", maxWidth: 600, margin: "0 auto 3.5rem" }}>
          Desde 2024, em <strong style={{ color: "#fff" }}>todos os 4 concursos</strong> realizados para médicos-legistas, o
          primeiro lugar esteve conosco. Mais de{" "}
          <strong style={{ color: "#f0a500" }}>100 aprovações</strong> nos últimos concursos.
        </p>

        {/* Big stats */}
        <div className="grid grid-cols-3 gap-6 mb-14">
          {[
            { v: "100%", l: "dos 1ºs lugares nos últimos concursos" },
            { v: "4", l: "concursos consecutivos com 1º lugar" },
            { v: "100+", l: "aprovações totais nos últimos editais" },
          ].map((s) => (
            <div key={s.l} className="text-center card py-8 px-4" style={{ background: "#060d1a" }}>
              <div className="font-black mb-2 text-gold" style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>{s.v}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Approval grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {aprovacoes.map((a) => (
            <div key={a.estado} className="card p-5" style={{ background: "#060d1a" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-white text-sm">{a.estado}</span>
                <span className="text-xl">{a.badge}</span>
              </div>
              <div className="font-black text-gold mb-2" style={{ fontSize: "1.8rem" }}>{a.num}</div>
              <div className="text-[10px]" style={{ color: "#475569" }}>aprovados</div>
              <div className="mt-3 space-y-1">
                {a.nomes.map(n => (
                  <div key={n} className="text-[11px]" style={{ color: "#64748b" }}>• {n}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href="#preco" className="btn-gold px-8 py-4 text-sm inline-block">
            APROVEITAR OFERTA AGORA
          </a>
        </div>
      </div>
    </section>
  );
}
