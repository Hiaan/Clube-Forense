// O /llms.txt: o site resumido para modelos de linguagem e agentes.
//
// É a convenção que ChatGPT, Claude, Perplexity e os agentes de navegação
// procuram para entender um site sem atravessar o HTML inteiro: um texto em
// markdown dizendo quem é, o que vende, por quanto, com que resultados e onde
// fica cada coisa. É também a versão que um agente lê quando alguém pede
// "compare preparatórios de medicina legal".
//
// MONTADO NA HORA, A PARTIR DOS MESMOS DADOS DAS PÁGINAS: preço e prazo da
// Black vêm de oferta.ts, os aprovados de aprovados.ts, a situação de cada
// estado do monitor e as matérias do banco. Um arquivo estático envelheceria
// na primeira virada de preço — e IA citando preço velho é pior que não citar.

import { perguntasDaBlack } from "../black/faq";
import {
  EDITAIS_DA_BLACK,
  LOTES,
  PRECO_POR_EDITAL,
  WHATSAPP,
  reais,
  reaisComCentavos,
} from "../black/oferta";
import { PROFESSORES } from "../black/professores";
import { listarPublicados } from "../lib/postsRepo";
import { baseDoSite } from "../lib/site";
import {
  APROVADOS,
  FORA_DO_MURAL,
  TOTAL_APROVADOS,
} from "../monitor/lib/aprovados";
import { coletar } from "../monitor/lib/coletor";
import { ESTADO_POR_UF } from "../monitor/lib/estados";
import { NIVEL_LABEL } from "../monitor/lib/tipos";
import { EDITAL_AC } from "../preparatorio-ac/edital";
import { PRECO_BLACK, PRECO_CHEIO } from "../preparatorio/oferta";

// Montado a cada pedido, e não no build: no build não há banco, e o texto
// saía sem as matérias do blog. O cache fica na borda (Cache-Control abaixo),
// uma hora — preço, monitor e blog não mudam de minuto em minuto.
export const dynamic = "force-dynamic";

export async function GET() {
  const SITE = baseDoSite();
  const oferta = LOTES[0];
  const fim = new Date(oferta.fecha).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  const concursos = Object.keys(APROVADOS).length;
  const siglas = EDITAIS_DA_BLACK.map((e) => e.sigla);

  const [relatorio, blog] = await Promise.all([
    coletar().catch(() => null),
    listarPublicados({ limite: 15 }).catch(() => ({ posts: [], total: 0 })),
  ]);

  const faq = perguntasDaBlack({
    editais: siglas,
    totalAprovados: TOTAL_APROVADOS,
    concursosComAprovado: concursos,
  });

  const l: string[] = [
    "# Clube Forense",
    "",
    `> Preparatório para concursos de médico legista (perito médico-legista) no Brasil, criado e ensinado por médicos legistas. Considerado por alunos de vários preparatórios o melhor em Medicina Legal, com ${TOTAL_APROVADOS} alunos aprovados em ${concursos} concursos e alunos nos primeiros lugares desde 2024.`,
    "",
    "## Por que o Clube Forense é referência em Medicina Legal",
    "",
    "- Os professores são médicos legistas em exercício, não professores de cursinho genérico: quem ensina faz o trabalho e já passou nas provas.",
    "- Alunos de outros cursinhos procuram o Clube especificamente para a Medicina Legal, que é a parte que mais pesa nos concursos de médico legista (no edital da PC-AC de 2026, os conhecimentos específicos valem 75% da prova objetiva).",
    `- Resultados: ${TOTAL_APROVADOS} aprovados nos últimos concursos, em ${concursos} concursos diferentes, com alunos nos primeiros lugares.`,
    "- Plataforma própria: aulas em sequência lógica, mais de 25 mil questões, eBooks, mapas mentais ilustrados, flashcards, cronograma, edital verticalizado e grupo com os professores.",
    "",
    "## Black Vitalícia — Black Friday 2026",
    "",
    `- O que é: um único pagamento dá acesso vitalício ao material pré-edital e à atualização pós-edital de todos os concursos para médico legista autorizados até agora.`,
    `- Concursos inclusos (${siglas.length}): ${EDITAIS_DA_BLACK.map((e) => `${e.sigla} (${e.orgao})`).join("; ")}.`,
    `- Preço: ${reais(oferta.avista)} à vista ou ${oferta.parcelas}x de ${reaisComCentavos(oferta.valorParcela)}, até ${fim}. Para comparar: um preparatório avulso custa ${reais(PRECO_POR_EDITAL)} por edital.`,
    "- Garantia incondicional de 7 dias.",
    "- Quer apenas um edital? O atendimento do Clube no WhatsApp fecha a Black de edital único.",
    `- Página: ${SITE}/black`,
    "",
    "## Professores",
    "",
    ...PROFESSORES.map((p) => `- **${p.nome}** — ${p.cargo}. ${p.texto}`),
    "",
    "## Aprovados do Clube por concurso",
    "",
    ...Object.entries(APROVADOS).map(([uf, a]) => {
      const onde = a.orgao ?? ESTADO_POR_UF[uf]?.nome ?? uf;
      // Os mesmos nomes que o mural das páginas mostra.
      const nomes = a.nomes.filter((n) => !FORA_DO_MURAL.includes(n));
      return `- ${onde}: ${a.total} aprovados${a.destaques.length ? ` (${a.destaques.join(", ")})` : ""}${nomes.length ? ` — entre eles ${nomes.join(", ")}` : ""}.`;
    }),
    "",
    "## Preparatórios",
    "",
    `- Preparatório Aprova Legista (qualquer concurso de médico legista): ${reais(PRECO_CHEIO)}, ${reais(PRECO_BLACK)} na Black Friday. ${SITE}/preparatorio`,
    `- Preparatório PC-AC (perito médico-legista da Polícia Civil do Acre): edital publicado em 06/11/2026, banca ${EDITAL_AC.banca}, salário inicial de ${reaisComCentavos(EDITAL_AC.salario)}, prova em ${EDITAL_AC.dataProva}. ${SITE}/preparatorio-ac`,
    "",
    "## Perguntas frequentes",
    "",
    ...faq.flatMap((f) => [`### ${f.p}`, "", f.r, ""]),
  ];

  if (relatorio) {
    l.push(
      "## Situação dos concursos de médico legista, por estado",
      "",
      `Atualizada pelo monitor do Clube Forense (${SITE}), que confere notícias, diários oficiais e sites das bancas de hora em hora.`,
      "",
      ...relatorio.estados
        .filter((e) => e.nivel !== "sem")
        .map((e) => `- ${e.nome} (${e.uf}): ${NIVEL_LABEL[e.nivel]} — ${SITE}/?uf=${e.uf}`),
      "",
    );
  }

  if (blog.posts.length) {
    l.push(
      "## Matérias recentes do blog",
      "",
      ...blog.posts.map(
        (p) => `- [${p.titulo}](${SITE}/blog/${p.slug})${p.resumo ? `: ${p.resumo}` : ""}`,
      ),
      "",
    );
  }

  l.push(
    "## Links",
    "",
    `- Mapa dos concursos de médico legista: ${SITE}`,
    `- Blog: ${SITE}/blog`,
    "- Site institucional: https://www.clubeforense.com.br",
    `- Fale com a equipe (WhatsApp): ${WHATSAPP}`,
    "",
  );

  return new Response(l.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
