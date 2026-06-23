export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">AL</span>
            </div>
            <div>
              <div className="font-semibold text-white text-sm">
                Aprova <span className="text-blue-400">Legista</span>
              </div>
              <div className="text-xs text-slate-600">by Clube Forense</div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-600">
            A mentoria feita por médicos legistas para futuros médicos legistas.
          </div>

          <div className="text-xs text-slate-700">
            © {new Date().getFullYear()} Aprova Legista. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
