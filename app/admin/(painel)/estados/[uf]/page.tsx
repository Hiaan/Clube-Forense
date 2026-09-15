// Edição de um estado.

import Link from "next/link";
import { notFound } from "next/navigation";

import BotaoColetar from "./BotaoColetar";
import FormEstado, { type MencaoSugerida } from "./FormEstado";
import { blobConfigurado } from "../../../../lib/blob";
import { lerEstado } from "../../../../lib/estadosRepo";
import { lerImlsDoEstado } from "../../../../lib/imlsRepo";
import { lerPlano } from "../../../../lib/planoRepo";
import { coletar } from "../../../../monitor/lib/coletor";
import { ESTADO_POR_UF } from "../../../../monitor/lib/estados";
import { consultasDoEstado } from "../../../../monitor/lib/fontes";
import { NIVEL_LABEL } from "../../../../monitor/lib/tipos";

export const dynamic = "force-dynamic";

// A coleta manual refaz 64 buscas sem cache; o teto padrão da função não dá
// conta. A Vercel limita ao máximo do plano, então pedir mais que ele é
// inofensivo — o que não pode é ficar no padrão e o botão morrer no meio.
export const maxDuration = 60;

/** Quantas manchetes do robô mostrar como sugestão. Mais que isso vira ruído. */
const MAX_SUGESTOES = 8;

export default async function EditarEstado({
  params,
}: {
  params: Promise<{ uf: string }>;
}) {
  const uf = (await params).uf.toUpperCase();
  const estado = ESTADO_POR_UF[uf];
  if (!estado) notFound();

  // A coleta é a mesma do site (cache de 1h nos feeds), então abrir esta tela
  // não dispara uma busca nova a cada clique. Se ela falhar, a edição continua
  // possível — só ficamos sem as sugestões.
  const [gravado, relatorio, plano, imls] = await Promise.all([
    lerEstado(uf),
    coletar().catch(() => null),
    lerPlano(uf),
    lerImlsDoEstado(uf),
  ]);

  const doEstado = relatorio?.estados.find((e) => e.uf === uf) ?? null;
  const consultas = consultasDoEstado(estado.nome);

  const sugestoes: MencaoSugerida[] = (doEstado?.mencoes ?? [])
    // A própria curadoria entra na coleta como uma menção; oferecê-la de volta
    // como sugestão seria devolver ao painel o que saiu dele.
    .filter((m) => !m.daCuradoria)
    .slice(0, MAX_SUGESTOES)
    .map((m) => ({
      titulo: m.titulo,
      resumo: m.resumo,
      fonte: m.fonte,
      link: m.link,
      data: m.data,
    }));

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <Link
          href="/admin/estados"
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Estados
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          <span className="font-mono text-gray-400">{uf}</span> {estado.nome}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {doEstado
            ? `O robô classificou como “${NIVEL_LABEL[doEstado.nivel]}” a partir de ${doEstado.mencoes.length} menção(ões).`
            : "Sem coleta disponível agora — a edição funciona do mesmo jeito."}
        </p>
      </header>

      {/* Conferir à mão o que o robô viu.
          <details>, e não um pop-up: são só links, o painel é servido pelo
          servidor e isto não precisa de JavaScript nenhum para funcionar. */}
      <details className="mb-6 rounded-2xl border border-gray-200 bg-white">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-gray-900 hover:bg-gray-50">
          🔎 Pesquisar notícias · {estado.nome}
        </summary>
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="mb-4 text-sm text-gray-500">
            Abre as buscas que o monitor roda, para você ver o que ele vê. Se
            uma notícia aparece aqui e não entrou no site, o problema é a
            classificação — e aí é só ajustar a etapa acima.
          </p>

          <div className="flex flex-col gap-3">
            {consultas.map((c) => (
              <a
                key={c.rotulo}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gray-200 px-4 py-3 transition hover:border-gray-900"
              >
                <span className="block text-sm font-semibold text-gray-900">
                  {c.rotulo} ↗
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                  {c.nota}
                </span>
              </a>
            ))}

            <a
              href={estado.diarioOficial}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-gray-200 px-4 py-3 transition hover:border-gray-900"
            >
              <span className="block text-sm font-semibold text-gray-900">
                Diário Oficial · {estado.nome} ↗
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                A fonte que decide. Concurso só existe de verdade depois de
                publicado aqui.
              </span>
            </a>
          </div>
        </div>

        <div className="px-5 pb-4">
          <BotaoColetar uf={uf} />
        </div>
      </details>

      {gravado === null && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Este estado ainda não tem linha no banco. Salvar cria a linha.
        </div>
      )}

      <FormEstado
        uf={uf}
        nome={estado.nome}
        inicial={gravado}
        sugestoes={sugestoes}
        temBlob={blobConfigurado()}
        plano={plano}
        imls={imls}
      />
    </div>
  );
}
