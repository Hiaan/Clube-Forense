import { CASES } from "@/lib/cases";
import Logo from "./Logo";

export default function Rodape() {
  const ano = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-[#070102]">
      <div className="faixa h-2" aria-hidden="true" />
      <div className="container-t9 flex flex-col gap-10 py-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Logo className="w-[92px]" assinaturaClassName="text-[0.8rem]" />
          <p className="mt-5 max-w-sm text-white/60">
            Tráfego pago, estrutura comercial e automações para empresas que querem escalar com previsibilidade.
          </p>
        </div>
        <nav aria-label="Rodapé">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-white/70">
            <li><a href="#como-funciona" className="hover:text-white">Como funciona</a></li>
            <li><a href="#servicos" className="hover:text-white">Serviços</a></li>
            <li><a href="#resultados" className="hover:text-white">Resultados</a></li>
            {CASES.length > 0 && <li><a href="#cases" className="hover:text-white">Cases</a></li>}
            <li><a href="#metodo" className="hover:text-white">Método</a></li>
            <li><a href="#agendar" className="font-semibold text-[#ff4550] hover:text-white">Agendar consultoria</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="container-t9 py-6 text-sm text-white/40">© {ano} T9 ADS Company. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
