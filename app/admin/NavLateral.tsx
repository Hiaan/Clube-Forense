"use client";

// Barra lateral do painel. Cliente por causa do item ativo: só o navegador sabe
// em que rota estamos depois de uma navegação sem recarregar a página.

import Link from "next/link";
import { usePathname } from "next/navigation";

import Icone, { type NomeIcone } from "./graficos/Icone";
import { sair } from "./acoes";

const ITENS: { href: string; rotulo: string; icone: NomeIcone }[] = [
  { href: "/admin", rotulo: "Dashboard", icone: "painel" },
  { href: "/admin/estados", rotulo: "Estados", icone: "mapa" },
  { href: "/admin/provas", rotulo: "Provas e ranking", icone: "podio" },
  { href: "/admin/aprovados", rotulo: "Aprovados", icone: "estrela" },
  { href: "/admin/leads", rotulo: "Leads", icone: "pessoas" },
  { href: "/admin/vendas", rotulo: "Vendas", icone: "dinheiro" },
];

const ITEM = "flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition";
const APAGADO = "text-gray-400 hover:bg-white/5 hover:text-white";

export default function NavLateral({ email }: { email: string | null }) {
  const rota = usePathname();

  // "/admin" só é o item ativo na própria rota; "/admin/estados/MA" é Estados.
  const ativo = (href: string) =>
    href === "/admin" ? rota === "/admin" : rota.startsWith(href);

  return (
    <aside className="flex shrink-0 flex-col bg-[#111827] text-gray-300 lg:sticky lg:top-0 lg:h-screen lg:w-64">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-lg font-black tracking-tight text-white">
          Clube<span className="text-[#ffcd07]">Forense</span>
        </p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffcd07]">
          Painel admin
        </p>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
        {ITENS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            aria-current={ativo(i.href) ? "page" : undefined}
            className={`${ITEM} ${ativo(i.href) ? "bg-white/10 text-white" : APAGADO}`}
          >
            <Icone nome={i.icone} />
            {i.rotulo}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        {email && (
          <p className="truncate px-4 pb-2 pt-3 text-xs text-gray-500" title={email}>
            {email}
          </p>
        )}

        <a href="/" target="_blank" rel="noopener noreferrer" className={`${ITEM} ${APAGADO}`}>
          <Icone nome="externo" />
          Ver o site
        </a>

        <form action={sair}>
          <button type="submit" className={`${ITEM} w-full text-left ${APAGADO}`}>
            <Icone nome="sair" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
