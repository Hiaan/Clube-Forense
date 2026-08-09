// Edição de um estado.

import Link from "next/link";
import { notFound } from "next/navigation";

import FormEstado, { type MencaoSugerida } from "./FormEstado";
import { blobConfigurado } from "../../../../lib/blob";
import { lerEstado } from "../../../../lib/estadosRepo";
import { lerImlsDoEstado } from "../../../../lib/imlsRepo";
import { lerPlano } from "../../../../lib/planoRepo";
import { coletar } from "../../../../monitor/lib/coletor";
import { ESTADO_POR_UF } from "../../../../monitor/lib/estados";
import { NIVEL_LABEL } from "../../../../monitor/lib/tipos";

export const dynamic = "force-dynamic";

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
