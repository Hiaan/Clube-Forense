/* Platform feature mockup components */
function AlmanaqueForense() {
  const rows = [
    { q: "Sobre tanatologia forense, assinale a alternativa...", tag: "TANATOLOGIA", cor: "#ef4444" },
    { q: "Acerca da toxicologia forense, é correto afirmar...", tag: "TOXICOLOGIA", cor: "#f97316" },
    { q: "Em relação à traumatologia, considera-se lesão vital...", tag: "TRAUMATOLOGIA", cor: "#8b5cf6" },
    { q: "Com base na sexologia forense, o hímem...", tag: "SEXOLOGIA", cor: "#06b6d4" },
  ];
  return (
    <div className="rounded-xl overflow-hidden text-left" style={{ background: "#1a1f2e", fontSize: 11 }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div className="flex gap-1.5">{["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }}/>)}</div>
        <span className="text-white/40 text-[10px]">Almanaque Forense — Banco de Questões</span>
      </div>
      <div className="p-3 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5" style={{ background: r.cor + "25", color: r.cor }}>{r.tag}</span>
            <span className="text-white/60 leading-tight">{r.q}</span>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <div className="flex-1 text-center py-1.5 rounded text-[10px] font-bold" style={{ background: "#ffcd07", color: "#000" }}>Ver questão</div>
          <div className="flex-1 text-center py-1.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "#fff/40" }}>Filtrar</div>
        </div>
      </div>
    </div>
  );
}

function VideoaulasMockup() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#1a1f2e", fontSize: 11 }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div className="flex gap-1.5">{["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }}/>)}</div>
        <span className="text-white/40 text-[10px]">Videoaulas — Clube Forense</span>
      </div>
      {/* Video player mockup */}
      <div className="relative mx-3 mt-2 rounded-lg overflow-hidden" style={{ background: "#0d1117", aspectRatio: "16/9" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#ffcd07" }}>
            <svg className="w-5 h-5 ml-0.5" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}>
          <div className="text-white text-[10px] font-bold">TANATOLOGIA — Fenômenos Cadavéricos</div>
          <div className="mt-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
            <div className="h-full rounded-full w-2/5" style={{ background: "#ffcd07" }}/>
          </div>
        </div>
      </div>
      {/* Playlist */}
      <div className="p-3 space-y-1.5">
        {[
          { n: "Tanatologia — Fenômenos Cadavéricos", done: true },
          { n: "Traumatologia — Lesões Contusas", done: true },
          { n: "Toxicologia — Alcaloides", done: false, active: true },
          { n: "Sexologia Forense", done: false },
        ].map((v, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
            style={{ background: v.active ? "rgba(255,205,7,0.1)" : "transparent", border: v.active ? "1px solid rgba(255,205,7,0.2)" : "1px solid transparent" }}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: v.done ? "#22c55e" : v.active ? "#ffcd07" : "rgba(255,255,255,0.1)" }}>
              {v.done && <svg className="w-2.5 h-2.5" fill="white" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
              {v.active && <svg className="w-2 h-2 ml-0.5" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
            </div>
            <span className="text-[10px]" style={{ color: v.active ? "#ffcd07" : v.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)" }}>{v.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapasMentaisMockup() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#fff", fontSize: 11 }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ background: "#1a1f2e" }}>
        <div className="flex gap-1.5">{["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }}/>)}</div>
        <span className="text-white/40 text-[10px]">Mapas Mentais</span>
        <div/>
      </div>
      <div className="p-3" style={{ background: "#fafafa" }}>
        {/* Map mental mockup */}
        <div className="relative h-32 flex items-center justify-center">
          {/* Center node */}
          <div className="absolute w-20 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] z-10"
            style={{ background: "#ffcd07", color: "#000" }}>TANATOLOGIA</div>
          {/* Branch nodes */}
          {[
            { text: "Morte Real", x: "-90px", y: "-20px", color: "#dbeafe" },
            { text: "Fenômenos Cadavéricos", x: "80px", y: "-30px", color: "#dcfce7" },
            { text: "Morte Aparente", x: "-85px", y: "25px", color: "#fce7f3" },
            { text: "Cronotanatognose", x: "75px", y: "28px", color: "#fef3c7" },
          ].map((n, i) => (
            <div key={i} className="absolute text-[9px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap"
              style={{ left: `calc(50% + ${n.x})`, top: `calc(50% + ${n.y})`, background: n.color, transform: "translate(-50%,-50%)" }}>
              {n.text}
            </div>
          ))}
        </div>
        {/* Thumbnails */}
        <div className="flex gap-2 mt-2">
          {["Toxicologia","Traumatologia","Sexologia"].map(t => (
            <div key={t} className="flex-1 rounded-lg py-2 text-center text-[9px] font-semibold" style={{ background: "#f3f4f6", color: "#374151" }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GrupoMockup() {
  const msgs = [
    { from: "Prof. João Paulo", text: "Lembrem do simulado de quinta-feira!", time: "08:12", prof: true },
    { from: "Aluno André", text: "Professor, essa questão da PC-MA 2023 sobre tanatologia...", time: "08:15", prof: false },
    { from: "Monitor", text: "Boa tarde! Vou compartilhar o gabarito comentado agora.", time: "14:03", monitor: true },
    { from: "Aluna Laís", text: "Obrigada! Ficou muito mais claro agora 🙏", time: "14:10", prof: false },
  ];
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#0b141a", fontSize: 11 }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#1f2c34", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white" style={{ background: "#25d366" }}>CF</div>
        <div>
          <div className="font-bold text-white text-[10px]">Aprova Legista — PC MA</div>
          <div className="text-[9px]" style={{ color: "#25d366" }}>● 247 membros</div>
        </div>
      </div>
      <div className="p-2.5 space-y-2 overflow-hidden">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.prof || m.monitor ? "justify-start" : "justify-end"}`}>
            <div className="max-w-[85%] rounded-lg px-2.5 py-1.5"
              style={{ background: m.prof ? "#1f2c34" : m.monitor ? "#213d29" : "#005c4b" }}>
              <div className="font-bold text-[9px] mb-0.5"
                style={{ color: m.prof ? "#ffcd07" : m.monitor ? "#25d366" : "rgba(255,255,255,0.6)" }}>
                {m.from}
              </div>
              <div className="text-[10px] text-white/80 leading-relaxed">{m.text}</div>
              <div className="text-right text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    title: "Almanaque Forense",
    desc: "Nosso banco de questões com mais de 21.000 questões de várias bancas, além de simulados, para você se preparar para a sua prova.",
    mockup: <AlmanaqueForense />,
  },
  {
    title: "Videoaulas em sequência lógica",
    desc: "Pare de pular de vídeo em vídeo no YouTube ou em outros cursos. Gravamos todo o edital e pré-edital para você assistir em um só lugar.",
    mockup: <VideoaulasMockup />,
  },
  {
    title: "Resumos e Mapas Mentais",
    desc: "Revise de maneira rápida os principais assuntos para a sua prova através de resumos e mapas mentais ilustrados.",
    mockup: <MapasMentaisMockup />,
  },
  {
    title: "Grupo Exclusivo no WhatsApp",
    desc: "Tire suas dúvidas com nossos professores legistas e monitor de direito, além de muito conteúdo para potencializar seus estudos.",
    mockup: <GrupoMockup />,
  },
];

export default function Metodologia() {
  return (
    <section id="metodologia" className="py-24 px-6" style={{ background: "#f8f9fb" }}>
      <div className="max-w-6xl mx-auto">
        {/* Top: platform screenshot + text */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          {/* Platform mockup */}
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
              <div className="flex gap-1.5">{["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }}/>)}</div>
              <div className="flex gap-6 ml-4">
                {["Início","Banco de Questões","Café Forense","Editais 2025"].map(t => (
                  <span key={t} className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs font-bold text-white/30 mb-3">Todos os nossos conteúdos disponíveis</div>
              <div className="grid grid-cols-4 gap-2">
                {["TANATOLOGIA","TRAUMATOLOGIA","TOXICOLOGIA","SEXOLOGIA","MEDICINA LEGAL","PSIQUIATRIA","GENÉTICA","LESÕES CORP."].map((label, i) => (
                  <div key={label} className="rounded-lg overflow-hidden" style={{ background: ["#dc2626","#2563eb","#7c3aed","#059669","#d97706","#0891b2","#be185d","#4f46e5"][i % 8] + "20", border: `1px solid ${["#dc2626","#2563eb","#7c3aed","#059669","#d97706","#0891b2","#be185d","#4f46e5"][i % 8]}30` }}>
                    <div className="aspect-video flex items-center justify-center p-1">
                      <span className="text-[8px] font-black text-center leading-tight text-white/70">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="section-label mb-3">A PREPARAÇÃO MAIS COMPLETA</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase text-gray-900 mb-5">
              Tudo que você precisa para{" "}
              <span style={{ color: "#e6b800" }}>conquistar sua vaga!</span>
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Você terá acesso a toda a nossa plataforma para estudar quando e onde quiser.
              Tudo o que você precisa para ser aprovado está aqui.
            </p>
            <a href="#preco" className="btn-yellow px-8 py-4 text-sm inline-block">GARANTA A SUA VAGA</a>
          </div>
        </div>

        {/* Feature cards with mockups */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map(f => (
            <div key={f.title} className="card-white overflow-hidden">
              {/* Mockup */}
              <div className="p-4 pb-0">{f.mockup}</div>
              {/* Text */}
              <div className="p-5">
                <h3 className="font-black text-gray-900 text-base mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Extra features row */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "📅", title: "Cronograma Personalizado", desc: "Insira sua rotina e o sistema adapta as aulas ao seu tempo." },
            { icon: "🃏", title: "Flashcards Interativos", desc: "Cartões de memorização vinculados às videoaulas." },
            { icon: "🤖", title: "Dr. Bonnet — IA", desc: "IA com Hygino, França, Croce. Dúvidas 24h." },
            { icon: "✅", title: "Suporte Pós-Prova", desc: "Acompanhamento de recursos e gabarito após a prova." },
          ].map(f => (
            <div key={f.title} className="card-white p-4 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold text-gray-900 text-xs mb-1">{f.title}</div>
              <div className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
