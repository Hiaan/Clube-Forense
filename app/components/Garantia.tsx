export default function Garantia() {
  return (
    <section className="py-20 px-6" style={{ background: "#060d1a" }}>
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="inline-flex flex-col items-center gap-4 rounded-2xl p-8"
          style={{ background: "#0b1628", border: "1px solid rgba(240,165,0,0.15)" }}
        >
          {/* Badge */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center flex-col"
            style={{
              background: "linear-gradient(135deg, #0f2240, #0b1628)",
              border: "3px solid #f0a500",
              boxShadow: "0 0 30px rgba(240,165,0,0.2)",
            }}
          >
            <div className="font-black text-gold" style={{ fontSize: "1.6rem", lineHeight: 1 }}>7</div>
            <div className="text-[9px] font-bold" style={{ color: "#f0a500", letterSpacing: "0.1em" }}>DIAS</div>
          </div>

          <h3 className="text-xl font-black text-white">Garantia Incondicional de 7 Dias</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b", maxWidth: 380 }}>
            Compre sem medo. Se por qualquer motivo você não gostar, devolveremos todo o seu dinheiro.
            Sem perguntas, sem burocracia.
          </p>
        </div>
      </div>
    </section>
  );
}
