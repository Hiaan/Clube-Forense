// Diagnóstico do que está publicado. Responde em milissegundos.
//
// Por que não usar /api/monitor para isso: ela dispara 58 buscas externas e é
// pré-renderizada no build, então a resposta pode ser de horas atrás — foi
// exatamente o que nos fez concluir coisas erradas sobre qual código estava no
// ar. Esta rota é sempre dinâmica e não busca nada, então o que ela diz vale
// para AGORA.
//
// Uso:
//   /api/versao              -> commit, branch, ambiente, se a planilha está configurada
//   /api/versao?planilha=1   -> tudo acima + tenta ler a planilha de verdade e
//                               relata o resultado, sem esperar revalidação

import { lerPlanilha, planilhaConfigurada } from "../../monitor/lib/planilha";
import { versaoAtual } from "../../monitor/lib/versao";

// Nunca em cache: uma resposta de diagnóstico velha é pior que nenhuma.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const querPlanilha = new URL(request.url).searchParams.has("planilha");

  const corpo: Record<string, unknown> = {
    ...versaoAtual(),
    // O valor da URL não é exposto — só se ela existe.
    curadoriaConfigurada: planilhaConfigurada(),
  };

  if (querPlanilha) {
    const r = await lerPlanilha();
    corpo.planilha = r.ok
      ? { ok: true, linhas: r.linhas.length, avisos: r.avisos, ufs: r.linhas.map((l) => l.uf) }
      : { ok: false, motivo: r.motivo };
  }

  return Response.json(corpo, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
