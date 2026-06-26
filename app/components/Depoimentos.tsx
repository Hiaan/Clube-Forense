// Replace these YouTube video IDs with your real testimonial video IDs
const videosDepoimentos = [
  { youtubeId: "SUBSTITUA_PELO_ID_1", nome: "Bruno Viana", cargo: "Aprovado — Médico Legista" },
  { youtubeId: "SUBSTITUA_PELO_ID_2", nome: "Laís Nader", cargo: "Aprovada — 1º Lugar" },
  { youtubeId: "SUBSTITUA_PELO_ID_3", nome: "Marcel Medeiros", cargo: "Aprovado — Médico Legista" },
];

const depoimentos = [
  {
    nome: "Bruno Viana",
    cargo: "Aprovado — Médico Legista",
    texto: "Entrei no Clube Forense durante o intensivão de questões... Eu precisava de alguém que já tivesse passado pelo que eu passei e nisso, o Clube Forense foi EXCELENTE.",
    inicial: "B",
    cor: "#1d4ed8",
  },
  {
    nome: "Laís Nader",
    cargo: "Aprovada — 1º Lugar",
    texto: "Comprei todo o material, ebooks, mentoria... e agora, já aprovada, estou ainda com a ficha caindo, eufórica, a sensação é de dever cumprido.",
    inicial: "L",
    cor: "#0d9488",
  },
  {
    nome: "Marcel Medeiros",
    cargo: "Aprovado — Médico Legista",
    texto: "Foi o grande diferencial na minha preparação, os encontros com os professores, bem como a disponibilidade para tirar dúvidas e discutir casos reais fizeram total diferença.",
    inicial: "M",
    cor: "#7c3aed",
  },
  {
    nome: "André Souza",
    cargo: "Aprovado",
    texto: "De início achei que não conseguiria estudar... ao final acreditei que teria chances: persisti e continuei esperançoso. Hoje aprovado e aguardando as próximas etapas.",
    inicial: "A",
    cor: "#d97706",
  },
  {
    nome: "Pietro Tenório",
    cargo: "Aprovado — Médico Legista",
    texto: "Esses encontros semanais foram incrivelmente importantes... mnemônicos, mapas mentais fizeram total diferença. Atribuo meu sucesso a essa equipe... gratidão.",
    inicial: "P",
    cor: "#0284c7",
  },
  {
    nome: "Carla Bandeira",
    cargo: "Aprovada — Médica Legista",
    texto: "Para mim vocês se tornaram uma família por tanto cuidado que vai além de uma simples questão contratual. A dedicação, atenção e cordialidade de cada um do Clube é incrível.",
    inicial: "C",
    cor: "#db2777",
  },
];

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-5">
          <p className="section-label">DEPOIMENTOS</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-black uppercase text-center text-gray-900 mb-3">
          Seja o próximo{" "}
          <span style={{ color: "#e6b800" }}>aprovado.</span>
        </h2>
        <p className="text-center mb-12 text-base text-gray-500">
          Veja o que dizem os nossos alunos
        </p>

        {/* Video testimonials */}
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {videosDepoimentos.map((v) => (
            <div key={v.nome} className="card-white overflow-hidden">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${v.youtubeId}?rel=0&modestbranding=1`}
                  title={`Depoimento — ${v.nome}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 0 }}
                />
              </div>
              <div className="px-4 py-3">
                <div className="font-bold text-gray-900 text-sm">{v.nome}</div>
                <div className="text-xs font-semibold" style={{ color: "#e6b800" }}>{v.cargo}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Text testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {depoimentos.map((d) => (
            <div key={d.nome} className="card-white p-6 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {[0,1,2,3,4].map(i => (
                  <svg key={i} className="w-4 h-4" style={{ color: "#ffcd07" }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <p className="text-sm leading-relaxed flex-1 mb-5 text-gray-600">
                "{d.texto}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: d.cor }}>
                  {d.inicial}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{d.nome}</div>
                  <div className="text-xs font-semibold" style={{ color: "#e6b800" }}>{d.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
