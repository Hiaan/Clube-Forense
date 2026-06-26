export default function Footer() {
  return (
    <footer className="py-12 px-6" style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 8V16C26 21.523 20.627 26.373 14 27C7.373 26.373 2 21.523 2 16V8L14 2Z" fill="rgba(255,205,7,0.15)" stroke="#ffcd07" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="3" fill="#ffcd07"/>
          </svg>
          <span className="font-bold text-white">
            Clube<span style={{ color: "#ffcd07" }}>Forense</span>
          </span>
        </div>

        <p className="text-xs text-center text-gray-500">
          A mentoria feita por médicos-legistas para futuros médicos-legistas.
        </p>

        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Aprova Legista. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
