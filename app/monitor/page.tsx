import type { Metadata } from "next";
import MapaConcursos, { type EstadoMapa } from "../components/MapaConcursos";
import PainelMonitor from "./PainelMonitor";
import { BANCAS_LISTA } from "./lib/bancas";
import { coletar } from "./lib/coletor";
import { NIVEL_COR, NIVEL_LABEL, type Nivel } from "./lib/tipos";

// Regenera a cada hora (também é forçado pelo cron em /api/cron).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Monitor de Concursos — Médico-Legista | Clube Forense",
  description:
    "Radar dos concursos para perito médico-legista nos 27 estados: estágio do edital (estudo, autorização, comissão, banca, edital), curadoria verificada e notícias atualizadas.",
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

// Funil do edital, do estágio mais avançado ao mais incipiente.
const ORDEM_RESUMO: Nivel[] = [
  "edital",
  "banca",
  "comissao",
  "autorizado",
  "solicitado",
  "estudo",
  "noticia",
  "sem",
];

export default async function MonitorPage() {
  const relatorio = await coletar();

  const estadosMapa: EstadoMapa[] = relatorio.estados.map((e) => ({
    uf: e.uf,
    nome: e.nome,
    nivel: e.nivel,
    score: e.score,
    ultimaMencao: e.ultimaMencao,
    destaque: e.mencoes[0]
      ? {
          titulo: e.mencoes[0].titulo,
          resumo: e.mencoes[0].resumo,
          fonte: e.mencoes[0].fonte,
        }
      : null,
    historico: e.historico
      ? {
          ultimoEdital: e.historico.ultimoEdital,
          ultimaProva: e.historico.ultimaProva,
          banca: e.historico.banca,
        }
      : null,
  }));

  return (
    <>
      {/* Abertura: mapa interativo (radar) */}
      <header className="bg-[#0b0b0d] pt-10">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-lg font-black tracking-tight text-white">
            <span className="text-[#ffcd07]">Clube</span>Forense
          </p>
        </div>
      </header>
      <MapaConcursos estados={estadosMapa} />

      {/* Painel detalhado */}
      <main id="painel" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Monitor de Concursos · Médico-Legista
          </h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Rastreamento dos concursos que envolvem o cargo de{" "}
            <strong>médico-legista</strong> nos 27 estados, no funil real do
            edital: estudo → solicitação → autorização → comissão → banca →
            edital publicado.
          </p>
          <p className="mt-3 text-xs text-gray-400">
            Atualizado em {formatarHora(relatorio.atualizadoEm)} ·{" "}
            {relatorio.totalMencoes} menções monitoradas
          </p>

          {relatorio.fonteIndisponivel && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              ⚠️ As fontes externas estão indisponíveis neste ambiente (rede
              restrita). Exibindo apenas a{" "}
              <strong>curadoria Clube Forense</strong> — em produção, o monitor
              soma a ela as notícias coletadas automaticamente.
            </div>
          )}
        </div>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

        <section className="mt-12 border-t border-gray-100 pt-6">
          <h2 className="text-sm font-bold text-gray-700">Bancas oficiais</h2>
          <p className="mt-1 text-xs text-gray-400">
            Sites oficiais das organizadoras — onde os editais são publicados.
            Também são consultados automaticamente pelo monitor.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BANCAS_LISTA.map((b) => (
              <a
                key={b.chave}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
              >
                {b.nome} ↗
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-gray-100 pt-6 text-xs text-gray-400">
          <p>
            Fontes: curadoria Clube Forense (situação verificada por estado, no
            funil Edital em Estudo → Concurso Solicitado → Concurso Autorizado →
            Comissão Formada → Banca Definida → Edital Publicado), Google
            Notícias (agregando portais de notícia e diários oficiais), sites
            oficiais das bancas organizadoras, Instagram das contas oficiais de
            governo e dos governadores das 27 UFs, e links diretos para o Diário
            Oficial de cada estado. São consideradas apenas menções dos últimos 2
            anos. A informação oficial de concurso sempre passa pelo Diário
            Oficial, que continua sendo a fonte priorizada aqui.
          </p>
        </footer>
      </main>
    </>
  );
}
