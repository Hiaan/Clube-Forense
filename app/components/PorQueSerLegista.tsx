const motivos = [
  { icon: "🏛️", title: "Estabilidade pública", desc: "Progressão na carreira com benefícios exclusivos de servidor policial." },
  { icon: "🕐", title: "Jornada definida", desc: "Sem plantões exaustivos ou sobrecarga de trabalho da medicina clínica." },
  { icon: "💰", title: "Salários de até R$ 40 mil", desc: "Remuneração diferenciada com adicionais e benefícios da carreira policial." },
  { icon: "🔫", title: "Benefícios exclusivos", desc: "Porte de arma, distintivo, aposentadoria especial e atuação nas Forças Policiais." },
];

export default function PorQueSerLegista() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">A CARREIRA</p>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-gray-900">
            Por que tantos médicos decidem{" "}
            <span style={{ color: "#e6b800" }}>seguir essa carreira?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {motivos.map(m => (
            <div key={m.title} className="card-white p-6 text-center">
              <div className="text-4xl mb-4">{m.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{m.title}</h3>
              <p className="text-xs leading-relaxed text-gray-500">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="#preco" className="btn-yellow px-8 py-4 text-sm inline-block">PRECISO DISSO AGORA</a>
        </div>
      </div>
    </section>
  );
}
