import MapaBrasil from "./MapaBrasil";

export default function Resultados() {
  return (
    <section id="resultados" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-5">
          <p className="section-label">HISTÓRICO DE APROVAÇÕES</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-black uppercase text-center text-gray-900 mb-4">
          Por que escolher o{" "}
          <span style={{ color: "#e6b800" }}>Clube Forense?</span>
        </h2>
        <p className="text-center text-base text-gray-500 mb-14" style={{ maxWidth: 600, margin: "0 auto 3.5rem" }}>
          Desde 2024, em <strong className="text-gray-900">todos os 4 concursos</strong> para médicos-legistas,
          o primeiro lugar esteve conosco. Mais de{" "}
          <strong style={{ color: "#e6b800" }}>100 aprovações</strong> nos últimos concursos.
        </p>

        {/* Big stats */}
        <div className="grid grid-cols-3 gap-5 mb-16">
          {[
            { v: "100%", l: "dos 1ºs lugares nos últimos concursos" },
            { v: "4", l: "concursos consecutivos com 1º lugar" },
            { v: "100+", l: "aprovações totais nos últimos editais" },
          ].map(s => (
            <div key={s.l} className="card-white py-8 px-4 text-center">
              <div className="font-black mb-2" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "#e6b800" }}>{s.v}</div>
              <div className="text-xs text-gray-500">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Map + right text */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <MapaBrasil />

          <div className="flex flex-col justify-center py-8">
            <h3 className="text-2xl font-black uppercase text-gray-900 mb-4">
              Não importa o número de vagas do concurso,{" "}
              <span style={{ color: "#e6b800" }}>aqui você estará no topo.</span>
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Desde 2024, em todos os 4 concursos que foram realizados para médicos-legistas, o
              primeiro lugar esteve conosco. Garantimos mais de{" "}
              <strong className="text-gray-900">100 aprovações</strong> nos últimos concursos com
              diversos alunos no topo de todos eles.
            </p>
            <div className="space-y-3 mb-8">
              {[
                { estado: "Pernambuco", n: "86 aprovados · 1º Lugar", cor: "#ffcd07" },
                { estado: "Santa Catarina", n: "49 aprovados · 1º e 2º Lugar", cor: "#06b6d4" },
                { estado: "Rio Grande do Sul", n: "55 aprovados · 1º Lugar", cor: "#ec4899" },
                { estado: "Polícia Federal", n: "3 alunos no Top 5", cor: "#dc2626" },
              ].map(e => (
                <div key={e.estado} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.cor }}/>
                  <span className="font-bold text-gray-900 text-sm">{e.estado}</span>
                  <span className="text-gray-500 text-sm">{e.n}</span>
                </div>
              ))}
            </div>
            <a href="#preco" className="btn-yellow px-8 py-4 text-sm inline-block w-fit">
              APROVEITAR OFERTA AGORA
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
