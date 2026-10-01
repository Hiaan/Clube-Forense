import { mostrarEdicao } from "@/lib/painel/auth";
import { itensDoPlano } from "@/lib/painel/dados";
import { STATUS_PLANO, type StatusPlano } from "@/lib/painel/textos";
import { fmt } from "@/lib/i18n";
import { mudarStatusPlano } from "../../acoes";
import { SelectAutoEnvio } from "../../_ui/Botoes";
import { contextoEmpresa } from "../contexto";

const ESTILO: Record<StatusPlano, string> = {
  feito: "bg-emerald-400/15 text-emerald-300 border-emerald-400/25",
  andamento: "bg-amber-400/15 text-amber-200 border-amber-400/25",
  pendente: "bg-white/5 text-white/55 border-white/10",
};

export default async function Plano({ params }: { params: Promise<{ empresa: string }> }) {
  const { usuario, empresa, t } = await contextoEmpresa(params);
  const itens = await itensDoPlano(empresa.id);
  const editavel = await mostrarEdicao(usuario);
  const feitos = itens.filter((i) => i.status === "feito").length;

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.plano.titulo}</h1>
      <p className="mt-1 text-white/55">{t.plano.subtitulo}</p>

      {itens.length === 0 ? (
        <p className="painel-cartao mt-6 p-6 text-center text-white/60">{t.plano.vazio}</p>
      ) : (
        <>
          <div className="painel-cartao mt-6 p-5">
            <p className="text-sm text-white/65">{fmt(t.plano.progresso, { feitos, total: itens.length })}</p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-gradient-to-r from-[#a80d14] to-[#ff3540]" style={{ width: `${(feitos / itens.length) * 100}%` }} />
            </div>
          </div>

          <ol className="mt-4 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((semana) => {
              const daSemana = itens.filter((i) => i.semana === semana);
              const completa = daSemana.length > 0 && daSemana.every((i) => i.status === "feito");
              return (
                <li key={semana} className={`painel-cartao p-5 ${completa ? "border-emerald-400/25" : ""}`}>
                  <p className="font-display text-sm font-extrabold text-[#ff4550]">{fmt(t.plano.semana, { n: semana })}</p>
                  <h2 className="font-display text-xl font-extrabold">{t.plano.semanas[semana - 1]}</h2>
                  <ul className="mt-4 grid gap-2">
                    {daSemana.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2.5">
                        <span className={`text-sm ${item.status === "feito" ? "text-white/55 line-through decoration-white/30" : ""}`}>{item.titulo}</span>
                        {editavel ? (
                          <form action={mudarStatusPlano} className="shrink-0">
                            <input type="hidden" name="item" value={item.id} />
                            <SelectAutoEnvio
                              name="status"
                              valor={item.status}
                              rotulo={item.titulo}
                              opcoes={STATUS_PLANO.map((s) => ({ valor: s, rotulo: t.plano.status[s] }))}
                            />
                          </form>
                        ) : (
                          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${ESTILO[item.status]}`}>
                            {t.plano.status[item.status]}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </>
  );
}
