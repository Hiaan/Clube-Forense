// Endpoint acionado pelo agendador (GitHub Action, de hora em hora; config em
// .github/workflows/atualizar-monitor.yml).
//
// A passada faz quatro coisas, nesta ordem: lê as fontes sem cache, grava
// quando o sistema checou, transforma em post o que é notícia nova (publicando
// na hora o que nasce completo — ver pautas.ts) e avisa por e-mail o que
// apareceu. Depois revalida as páginas que mostram tudo isso.

import { revalidatePath } from "next/cache";

import { semearImls } from "../../lib/imlsRepo";
import { corrigirPlanos, semearPlanos } from "../../lib/planoRepo";
import { registrarColeta } from "../../lib/sistemaRepo";
import { avisarNovidades } from "../../monitor/lib/avisoDeNovidades";
import { coletar } from "../../monitor/lib/coletor";
import { abrirPautas } from "../../monitor/lib/pautas";
import { dispararColetaInstagram } from "../../monitor/lib/instagram";

// Sempre executa no servidor, sem cache estático.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Proteção opcional: se CRON_SECRET estiver definido, exige o header.
  const segredo = process.env.CRON_SECRET;
  if (segredo) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${segredo}`) {
      return new Response("Não autorizado", { status: 401 });
    }
  }

  // Dispara (assíncrono) um novo scrape do Instagram no Apify. A função tem
  // trava interna de intervalo mínimo, então é seguro chamar o cron de hora em
  // hora. A coleta abaixo lê o resultado do último run já concluído.
  const instagram = await dispararColetaInstagram();

  // Leva para o banco os planos de carreira que estão no código, nos estados que
  // ainda não têm nenhum. Depois da primeira vez isto não faz nada.
  const planosSemeados = await semearPlanos();
  // Depois da semeadura: quem acabou de nascer já nasce certo, e a correção só
  // tem trabalho nos estados semeados em passadas anteriores.
  const planosCorrigidos = await corrigirPlanos();

  // Mesma ideia para a distribuição dos IMLs.
  const imlsSemeados = await semearImls();

  // Sem cache, e isto é o que faz o monitor ser de hora em hora de verdade.
  // Os feeds são guardados por uma hora para a visita ao mapa não pagar a
  // coleta; com o cron lendo do mesmo cache, a notícia podia chegar com duas
  // horas de atraso — a hora do cache mais a hora até a próxima passada.
  // Aqui a leitura é sempre nova, que é o motivo de o cron existir.
  const relatorio = await coletar({ semCache: true });
  const estadosComNovidade = relatorio.estados.filter((e) => e.nivel !== "sem").length;

  // Fica gravado para o painel poder dizer quando o sistema checou por último —
  // separado da conferência humana, que é outra data.
  await registrarColeta({
    em: relatorio.atualizadoEm,
    estadosComNovidade,
    fonteIndisponivel: relatorio.fonteIndisponivel,
  });

  // Depois do relatório, e só aqui: a coleta roda a cada visita ao mapa, mas
  // pauta nova só nasce quando quem roda tem o direito de escrever — o cron e o
  // botão do painel.
  const pautas = await abrirPautas(relatorio);

  // O aviso vem depois de tudo gravado, e nunca antes: um e-mail dizendo que o
  // post está no ar precisa que o post esteja no ar. Sem novidade, não manda
  // nada — ver avisoDeNovidades.ts.
  const aviso = await avisarNovidades(pautas);

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  revalidatePath("/admin");
  revalidatePath("/monitor");
  revalidatePath("/api/monitor");

  // A data da menção mais nova é o que responde "está chegando notícia?" —
  // `estadosComNovidade` não responde, porque conta também os estados cujo
  // único sinal é a curadoria, que está sempre lá. Sem esta linha, a única
  // forma de saber era abrir o site e reparar nas datas.
  const maisRecente = relatorio.estados
    .flatMap((e) => e.mencoes)
    .map((m) => m.data)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  return Response.json({
    ok: true,
    atualizadoEm: relatorio.atualizadoEm,
    estadosComNovidade,
    totalMencoes: relatorio.totalMencoes,
    mencaoMaisRecente: maisRecente ?? null,
    fonteIndisponivel: relatorio.fonteIndisponivel,
    instagram,
    pautasAbertas: pautas.abertas,
    pautasPublicadas: pautas.publicadas,
    pautasNaFila: pautas.naFila,
    aviso,
    planosSemeados,
    planosCorrigidos,
    imlsSemeados,
  });
}
