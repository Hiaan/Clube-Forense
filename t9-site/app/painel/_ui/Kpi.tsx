import { porcentagem } from "@/lib/painel/formato";
import type { Idioma } from "@/lib/i18n";

/**
 * Indicador com a variação contra o período anterior.
 * `melhor` diz se subir é bom (leads, receita) ou ruim (custo por lead).
 */
export default function Kpi({
  rotulo,
  valor,
  atual,
  anterior,
  melhor = "subir",
  idioma,
  destaque = false,
  legenda,
}: {
  rotulo: string;
  valor: string;
  atual?: number | null;
  anterior?: number | null;
  melhor?: "subir" | "descer" | "neutro";
  idioma: Idioma;
  destaque?: boolean;
  legenda?: string;
}) {
  let variacao: number | null = null;
  if (atual != null && anterior != null && anterior > 0) variacao = atual / anterior - 1;
  const bom = variacao == null || melhor === "neutro" ? null : melhor === "subir" ? variacao >= 0 : variacao <= 0;

  return (
    <div className={`painel-cartao p-4 sm:p-5 ${destaque ? "border-[#ff2d38]/40 shadow-[0_20px_50px_-30px_rgba(255,45,56,0.8)]" : ""}`}>
      <p className="text-xs font-medium tracking-wide text-white/55 uppercase">{rotulo}</p>
      <p className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-[1.7rem]">{valor}</p>
      {variacao != null && Math.abs(variacao) >= 0.0005 ? (
        <p className={`mt-1 text-xs font-medium ${bom == null ? "text-white/50" : bom ? "text-emerald-400" : "text-[#ff6b72]"}`}>
          {variacao > 0 ? "▲" : "▼"} {porcentagem(Math.abs(variacao), idioma, 1)}
          {legenda && <span className="font-normal text-white/40"> {legenda}</span>}
        </p>
      ) : (
        <p className="mt-1 text-xs text-white/30">&nbsp;</p>
      )}
    </div>
  );
}
