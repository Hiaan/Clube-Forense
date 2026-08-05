// Endpoint JSON com o relatório consolidado do monitor.
//
// Respeita o mesmo muro da página: sem cadastro, devolve só o que o mapa já
// mostra publicamente (sigla, nome, estágio e score). Com cadastro, devolve
// tudo. Sem esse cuidado, bastaria abrir esta rota para obter de graça o
// detalhe que a página pede cadastro para exibir.

import { cookies } from "next/headers";

import { NOME_COOKIE, sessaoValida } from "../../lib/sessao";
import { coletar } from "../../monitor/lib/coletor";

// Varia conforme o cookie, então não pode ser pré-renderizada uma vez só. As
// buscas externas dentro de `coletar` mantêm cache próprio (1h para notícias,
// 5min para a planilha), então o custo por requisição continua baixo.
export const dynamic = "force-dynamic";

export async function GET() {
  const [relatorio, jar] = await Promise.all([coletar(), cookies()]);

  if (sessaoValida(jar.get(NOME_COOKIE)?.value)) {
    return Response.json(relatorio, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  return Response.json(
    {
      ...relatorio,
      estados: relatorio.estados.map((e) => ({
        uf: e.uf,
        nome: e.nome,
        nivel: e.nivel,
        score: e.score,
        diarioOficial: e.diarioOficial,
      })),
      // Explícito, para a resposta menor não parecer defeito.
      detalheOmitido: "cadastro-necessario",
    },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } },
  );
}
