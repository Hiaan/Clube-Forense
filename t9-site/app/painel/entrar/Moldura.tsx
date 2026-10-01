import Link from "next/link";
import Logo from "@/app/components/Logo";
import { CONFIG_IDIOMA, IDIOMAS, type Idioma } from "@/lib/i18n";

/** Caixa central das telas de login, com o seletor PT · EN · ES. */
export default function Moldura({ idioma, caminho, children }: { idioma: Idioma; caminho: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Logo className="w-20" assinaturaClassName="text-[0.7rem]" />
          <nav className="flex rounded-full border border-white/15 bg-white/5 p-1">
            {IDIOMAS.map((i) => (
              <Link
                key={i}
                href={`${caminho}${caminho.includes("?") ? "&" : "?"}idioma=${i}`}
                lang={CONFIG_IDIOMA[i].html}
                aria-current={i === idioma ? "true" : undefined}
                className={`rounded-full px-2.5 py-1 font-display text-xs font-extrabold ${
                  i === idioma ? "bg-[#e3121c] text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {CONFIG_IDIOMA[i].sigla}
              </Link>
            ))}
          </nav>
        </div>
        <div className="painel-cartao p-7 sm:p-9">{children}</div>
      </div>
    </main>
  );
}
