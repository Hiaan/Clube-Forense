"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/placar/app", rotulo: "Clientes" },
  { href: "/placar/app/config", rotulo: "Configurações" },
  { href: "/placar/app/plano", rotulo: "Plano" },
];

export default function Abas() {
  const caminho = usePathname();
  const ativa = (href: string) => (href === "/placar/app" ? caminho === href || caminho.startsWith("/placar/app/clientes") : caminho.startsWith(href));
  return (
    <nav aria-label="Principal" className="flex flex-wrap gap-1">
      {ABAS.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          aria-current={ativa(a.href) ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm ${ativa(a.href) ? "bg-[#EEF2FF] font-semibold text-[#2F5BEA]" : "text-gray-600 hover:text-gray-900"}`}
        >
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}
