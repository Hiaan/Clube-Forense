// As perguntas frequentes das páginas de preparatório.
//
// Como na Black (black/faq.ts), a lista é dado: a página mostra e os dados
// estruturados repetem como FAQPage. As perguntas do concurso (em que pé
// está, quando é a prova) vêm primeiro, de cada página — são as que alguém
// faz a uma IA sobre aquele estado; as gerais vêm depois.

import type { Pergunta } from "../black/faq";
import { PROFESSORES } from "../black/professores";
import { TOTAL_APROVADOS } from "../monitor/lib/aprovados";

export function perguntasDoPreparatorio(doConcurso: Pergunta[] = []): Pergunta[] {
  const nomes = PROFESSORES.map((p) => p.nome);
  const professores = `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
  return [
    ...doConcurso,
    {
      p: "O que vem no preparatório?",
      r: "Material pré-edital completo, com base nas principais matérias do último concurso; pós-edital gratuito quando o edital sair; eBooks, PDFs e material de todas as matérias previstas para o edital; banco de questões exclusivo com mais de 25 mil questões e filtro por edital; grupo com os professores médicos legistas e os alunos; e suporte pós-prova, com ajuda para montar recursos. De bônus: resumos ilustrados (mapas mentais), minigames, questões impressas comentadas e muito mais.",
    },
    {
      p: "O pós-edital está incluído?",
      r: "Está. Quando o edital sair, o material pós-edital do concurso entra no seu acesso sem custo extra.",
    },
    {
      p: "Até quando eu tenho acesso?",
      r: "O acesso é garantido por 1 ano. Se a sua prova for depois disso, ele vai até a data da prova.",
    },
    {
      p: "Quem são os professores?",
      r: `${professores}: os três são médicos legistas e criaram o Clube Forense. Desde 2024, alunos do Clube ficaram nos primeiros lugares dos concursos para médico legista — são ${TOTAL_APROVADOS} aprovados.`,
    },
    {
      p: "Vale a pena estudar Medicina Legal no Clube mesmo fazendo outro cursinho?",
      r: "Vale, e é o que muitos alunos fazem: o Clube é considerado por alunos de vários preparatórios o melhor em Medicina Legal, que é a parte que mais pesa nos concursos de médico legista.",
    },
    {
      p: "Funciona no celular?",
      r: "Funciona. A plataforma roda no navegador do computador e do celular.",
    },
    {
      p: "E se eu não gostar?",
      r: "Sete dias de garantia incondicional. Pediu reembolso dentro do prazo, devolvemos tudo.",
    },
    {
      p: "Já sou aluno do Clube. Tenho alguma condição?",
      r: "Fale com a equipe pelo WhatsApp antes de comprar: existe condição para quem já estuda com a gente, e ela não aparece no checkout.",
    },
  ];
}
