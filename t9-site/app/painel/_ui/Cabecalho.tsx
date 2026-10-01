import Link from "next/link";
import Logo from "@/app/components/Logo";
import { ehEquipe, type Empresa, type Usuario } from "@/lib/painel/auth";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import { sair } from "../acoes";

/** Barra do topo: marca, troca de empresa e menu da conta. Os menus usam <details>, sem JavaScript. */
export default function Cabecalho({
  usuario,
  empresas = [],
  atual,
  children,
}: {
  usuario: Usuario;
  empresas?: Empresa[];
  atual?: Empresa | null;
  children?: React.ReactNode;
}) {
  const t = TEXTOS_PAINEL[usuario.idioma].geral;
  const equipe = ehEquipe(usuario);
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0203]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/painel" className="flex shrink-0 items-center gap-2.5" aria-label="T9 ADS Company">
          <Logo className="w-11" comAssinatura={false} />
          <span className="hidden font-display text-sm font-extrabold tracking-wide text-white/70 sm:inline">{t.painel}</span>
        </Link>

        {atual && (
          <details className="painel-menu relative min-w-0 flex-1 sm:flex-none">
            <summary className="flex w-fit max-w-full min-w-0 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-sm font-medium">
              <span className="truncate">{atual.nome}</span>
              {(empresas.length > 1 || equipe) && <span aria-hidden="true" className="text-white/50">▾</span>}
            </summary>
            {(empresas.length > 1 || equipe) && (
              <div className="absolute left-0 mt-2 max-h-[60vh] w-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#140405] p-1.5 shadow-2xl">
                <p className="px-3 pt-2 pb-1 text-[11px] tracking-wide text-white/40 uppercase">{t.trocarEmpresa}</p>
                {empresas.map((e) => (
                  <Link
                    key={e.id}
                    href={`/painel/${e.slug}`}
                    className={`block truncate rounded-xl px-3 py-2 text-sm hover:bg-white/8 ${e.id === atual.id ? "text-[#ff6b72]" : ""}`}
                  >
                    {e.nome}
                  </Link>
                ))}
              </div>
            )}
          </details>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {equipe && (
            <Link href="/painel/admin" className="hidden rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white sm:inline">
              {t.gerenciar}
            </Link>
          )}
          <details className="painel-menu relative">
            <summary
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-[#ff3540] to-[#a80d14] font-display text-sm font-extrabold uppercase"
              aria-label={usuario.email}
            >
              {(usuario.nome ?? usuario.email).slice(0, 1)}
            </summary>
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/10 bg-[#140405] p-1.5 shadow-2xl">
              <p className="truncate px-3 pt-2 pb-2 text-xs text-white/45">{usuario.email}</p>
              {equipe && (
                <Link href="/painel/admin" className="block rounded-xl px-3 py-2 text-sm hover:bg-white/8 sm:hidden">
                  {t.gerenciar}
                </Link>
              )}
              <Link href="/painel/conta" className="block rounded-xl px-3 py-2 text-sm hover:bg-white/8">
                {t.conta}
              </Link>
              <form action={sair}>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#ff6b72] hover:bg-white/8">{t.sair}</button>
              </form>
            </div>
          </details>
        </div>
      </div>
      {children && <div className="mx-auto max-w-7xl px-2 sm:px-4">{children}</div>}
    </header>
  );
}
