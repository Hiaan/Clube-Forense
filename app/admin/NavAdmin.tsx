// Cabeçalho comum das telas do painel.

import Link from "next/link";
import { sair } from "./acoes";

export default function NavAdmin({ atual }: { atual: "estados" | "leads" }) {
  const aba = (ativa: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      ativa ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
      <div className="flex items-center gap-6">
        <p className="text-sm font-black tracking-tight text-gray-900">
          Clube<span className="text-[#d4a300]">Forense</span>
          <span className="ml-2 font-medium text-gray-400">painel</span>
        </p>
        <nav className="flex gap-1">
          <Link href="/admin" className={aba(atual === "estados")}>
            Estados
          </Link>
          <Link href="/admin/leads" className={aba(atual === "leads")}>
            Leads
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          Ver o site ↗
        </a>
        <form action={sair}>
          <button
            type="submit"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-900"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
