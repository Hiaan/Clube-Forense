import type { Metadata } from "next";
import Link from "next/link";
import PainelMonitor from "./PainelMonitor";
import { coletar } from "./lib/coletor";
import { NIVEL_COR, NIVEL_LABEL, type Nivel } from "./lib/tipos";

// Regenera a página de hora em hora (também é forçado pelo cron em /api/cron).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Monitor de Concursos — Médico-Legista | Aprova Legista",
  description:
    "Acompanhamento, atualizado de hora em hora, dos concursos para perito médico-legista, médico legista e perito criminal médico-legista em todos os estados do Brasil.",
};

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ORDEM_RESUMO: Nivel[] = ["edital", "banca", "previsto", "noticia", "sem"];

export default async function MonitorPage() {
  const relatorio = await coletar();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-gray-400 hover:text-gray-700"
        >
          ← Aprova Legista
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Monitor de Concursos · Médico-Legista
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Rastreamento de concursos para{" "}
          <strong>perito médico-legista</strong>, <strong>médico legista</strong>{" "}
          e <strong>perito criminal médico-legista</strong> nos 27 estados.
          Atualizado automaticamente a cada hora.
        </p>
        <p className="mt-3 text-xs text-gray-400">
          Atualizado em {formatarHora(relatorio.atualizadoEm)} ·{" "}
          {relatorio.totalMencoes} menções monitoradas
        </p>

        {relatorio.fonteIndisponivel && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ As fontes externas estão indisponíveis neste ambiente (rede
            restrita). Os dados abaixo são apenas de <strong>demonstração</strong>.
            Em produção (Vercel), o monitor exibe dados reais coletados de hora em
            hora.
          </div>
        )}
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ORDEM_RESUMO.map((nivel) => (
          <div
            key={nivel}
            className="rounded-2xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: NIVEL_COR[nivel] }}
              />
              <span className="text-xs font-medium text-gray-500">
                {NIVEL_LABEL[nivel]}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {relatorio.resumo[nivel]}
            </p>
          </div>
        ))}
      </section>

      <PainelMonitor relatorio={relatorio} />

      <footer className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        <p>
          Fontes: Google Notícias (agregando portais e diários oficiais) +
          links diretos para o Diário Oficial de cada estado. O monitoramento de
          Instagram de governadores/secretarias não está incluído nesta versão
          por restrições da plataforma — a informação oficial de concurso sempre
          passa pelo Diário Oficial, que é a fonte priorizada aqui.
        </p>
      </footer>
    </main>
  );
}
