"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Abas({ abas }: { abas: { href: string; rotulo: string }[] }) {
  const caminho = usePathname();
  // A aba mais específica que casa com o endereço atual fica ativa.
  const ativa = abas
    .filter((a) => caminho === a.href || caminho.startsWith(`${a.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav className="sem-barra -mb-px flex gap-1 overflow-x-auto">
      {abas.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          aria-current={a.href === ativa ? "page" : undefined}
          className={`border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 ${
            a.href === ativa ? "border-[#ff2d38] text-white" : "border-transparent text-white/55 hover:text-white"
          }`}
        >
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}
