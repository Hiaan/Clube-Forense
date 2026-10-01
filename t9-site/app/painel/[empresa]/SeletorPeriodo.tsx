import Link from "next/link";
import { PERIODOS, type ChavePeriodo } from "@/lib/painel/dados";
import type { TextosPainel } from "@/lib/painel/textos";

export default function SeletorPeriodo({ atual, base, t }: { atual: ChavePeriodo; base: string; t: TextosPainel["periodo"] }) {
  return (
    <nav aria-label={t.rotulo} className="sem-barra flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1">
      {PERIODOS.map((p) => (
        <Link
          key={p}
          href={`${base}?periodo=${p}`}
          scroll={false}
          aria-current={p === atual ? "true" : undefined}
          className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap sm:text-sm ${
            p === atual ? "bg-[#e3121c] text-white" : "text-white/60 hover:text-white"
          }`}
        >
          {t[p]}
        </Link>
      ))}
    </nav>
  );
}
