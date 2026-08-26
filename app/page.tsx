import type { Metadata } from "next";
import { cookies } from "next/headers";

import Cabecalho from "./components/Cabecalho";
import MapaConcursos, { type EstadoMapa } from "./components/MapaConcursos";
import { obterAprovadosSite } from "./lib/aprovadosSite";
import { lerImls } from "./lib/imlsRepo";
import { lerPlanos } from "./lib/planoRepo";
import { lerUltimaColeta } from "./lib/sistemaRepo";
import { NOME_COOKIE, sessaoValida } from "./lib/sessao";
import PainelMonitor from "./monitor/PainelMonitor";
import { BANCAS_LISTA } from "./monitor/lib/bancas";
import { coletar } from "./monitor/lib/coletor";
import { NIVEL_COR, NIVEL_LABEL, type Nivel } from "./monitor/lib/tipos";

// A página varia conforme o visitante já se cadastrou ou não, então não pode
// ser pré-renderizada uma vez só. As buscas externas dentro de `coletar` seguem
// com cache próprio (1h para notícias, 5min para a planilha), então o custo por
// visita continua baixo.
export const dynamic = "force-dynamic";

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
  const [relatorio, jar, aprovados, planos, imls, coleta] = await Promise.all([
    coletar(),
    cookies(),
    obterAprovadosSite(),
    lerPlanos(),
    lerImls(),
    lerUltimaColeta(),
  ]);
  const liberado = sessaoValida(jar.get(NOME_COOKIE)?.value);

  // O mapa (cores e estágios) é público — é ele que dá vontade de entrar. O
  // detalhe de cada estado só viaja para quem já se cadastrou; para os demais,
  // vai apenas o do estado em destaque, como vitrine. Fazer esse corte AQUI, no
  // servidor, é o que impede pular o cadastro lendo o código-fonte.
  const destaque = relatorio.estados[0]?.uf;

  const estadosMapa: EstadoMapa[] = relatorio.estados.map((e) => ({
    uf: e.uf,
    nome: e.nome,
    nivel: e.nivel,
    score: e.score,
    imagemUrl: e.curadoria?.imagemUrl ?? null,
    detalhe:
      liberado || e.uf === destaque
        ? {
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
            plano: planos?.[e.uf]?.length
              ? {
                  orgao: e.curadoria?.planoOrgao ?? null,
                  ano: e.curadoria?.planoAno ?? null,
                  fonte: e.curadoria?.planoFonte ?? null,
                  classes: planos[e.uf],
                }
              : null,
            // Cidades, total e texto são independentes: dá para descrever a
            // rede sem ter mapeado uma cidade sequer, e o botão "Ver IMLs"
            // precisa aparecer nos três casos.
            imls:
              imls?.[e.uf]?.length ||
              e.curadoria?.imlsTexto ||
              e.curadoria?.imlsTotal != null
                ? {
                    total: e.curadoria?.imlsTotal ?? null,
                    texto: e.curadoria?.imlsTexto ?? null,
                    unidades: imls?.[e.uf] ?? [],
                  }
                : null,
            editalUrl: e.curadoria?.editalUrl ?? null,
          }
        : null,
  }));

  return (
    <>
      <Cabecalho liberado={liberado} />

      {/* Abertura: mapa interativo (radar) */}
      <MapaConcursos estados={estadosMapa} aprovados={aprovados} />

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
            {/* A data é a da última coleta de verdade, e não a hora em que esta
                página foi montada — como as buscas têm cache de uma hora, a
                segunda diria "agora" mostrando notícia de 59 minutos atrás. */}
            Notícias checadas em {formatarHora(coleta?.em ?? relatorio.atualizadoEm)} ·{" "}
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
                  // O anel segura os passos quase brancos da escala, que
                  // sumiriam no cartão.
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
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

        {/* O painel é detalhe puro — todas as menções de todos os estados.
            Deixá-lo aberto anularia o cadastro pedido no mapa logo acima. */}
        {liberado ? (
          <PainelMonitor
            relatorio={relatorio}
            aprovados={aprovados}
            imls={imls ?? {}}
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-lg font-bold text-gray-900">
              Painel completo dos 27 estados
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Todas as menções coletadas, com fonte e data, filtráveis por
              estágio do edital — e o link do Diário Oficial de cada estado para
              você conferir na fonte.
            </p>
            <a
              href="#radar"
              className="mt-5 inline-flex rounded-full bg-[#ffcd07] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:brightness-95"
            >
              Liberar acesso gratuito ↑
            </a>
          </div>
        )}

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
