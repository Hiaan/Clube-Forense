export default function Garantia() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex flex-col items-center gap-4 rounded-2xl p-8 card-white" style={{ borderTop: "4px solid #ffcd07" }}>
          {/* Badge */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center flex-col"
            style={{
              background: "#fff9db",
              border: "3px solid #ffcd07",
              boxShadow: "0 0 30px rgba(255,205,7,0.2)",
            }}
          >
            <div className="font-black" style={{ color: "#e6b800", fontSize: "1.6rem", lineHeight: 1 }}>7</div>
            <div className="text-[9px] font-bold" style={{ color: "#e6b800", letterSpacing: "0.1em" }}>DIAS</div>
          </div>

          <h3 className="text-xl font-black text-gray-900">Garantia Incondicional de 7 Dias</h3>
          <p className="text-sm leading-relaxed text-gray-500" style={{ maxWidth: 380 }}>
            Compre sem medo. Se por qualquer motivo você não gostar, devolveremos todo o seu dinheiro.
            Sem perguntas, sem burocracia.
          </p>
        </div>
      </div>
    </section>
  );
}
