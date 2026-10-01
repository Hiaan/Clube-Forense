import { CASES } from "@/lib/cases";
import type { Dicionario } from "@/lib/dicionarios";
import Logo from "./Logo";

export default function Rodape({ t, nav }: { t: Dicionario["rodape"]; nav: Dicionario["nav"] }) {
  const ano = new Date().getFullYear();
  const links = [
    { href: "#como-funciona", rotulo: nav.comoFunciona },
    { href: "#servicos", rotulo: nav.servicos },
    { href: "#resultados", rotulo: nav.resultados },
    ...(CASES.length ? [{ href: "#cases", rotulo: nav.clientes }] : []),
    { href: "#metodo", rotulo: nav.metodo },
  ];
  return (
    <footer className="relative overflow-hidden bg-[#070102]">
      <div className="faixa h-2" aria-hidden="true" />
      <div className="container-t9 flex flex-col gap-10 py-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Logo className="w-[92px]" assinaturaClassName="text-[0.8rem]" />
          <p className="mt-5 max-w-sm text-white/60">{t.descricao}</p>
        </div>
        <nav aria-label={t.aria}>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-white/70">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-white">
                  {l.rotulo}
                </a>
              </li>
            ))}
            <li>
              <a href="#agendar" className="font-semibold text-[#ff4550] hover:text-white">
                {nav.agendar}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="container-t9 py-6 text-sm text-white/40">
          © {ano} T9 ADS Company. {t.direitos}
        </p>
      </div>
    </footer>
  );
}
