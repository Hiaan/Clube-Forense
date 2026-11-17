// O preparatório da PC-TO, como dado para a PaginaPreparatorio.

import type { ConcursoPreparatorio } from "../preparatorio/concurso";
import { DADOS_TO } from "./dados";
import SecaoConcursoTO from "./SecaoConcursoTO";

export const CONCURSO_TO: ConcursoPreparatorio = {
  slug: "preparatorio-to",
  sigla: DADOS_TO.sigla,
  orgao: DADOS_TO.orgao,
  cargo: "Médico Legista",
  checkout: DADOS_TO.checkout,
  selo: `Banca ${DADOS_TO.banca} definida`,
  faixa: `PC-TO · banca ${DADOS_TO.banca} definida · edital em breve · médico legista`,
  itensCapa: [
    "Aulas gravadas de Medicina Legal com base nos últimos concursos",
    "eBooks das matérias",
    "Mapas mentais exclusivos (resumos ilustrados)",
    "Banco de questões de concursos anteriores",
    "Suporte dedicado ao aluno",
    "Grupo com professores e alunos para tirar dúvidas e compartilhar conhecimento",
    "…e muito mais!",
  ],
  ficha: {
    nota: `banca definida em ${DADOS_TO.bancaDefinidaEm}`,
    titulo: "O concurso da PC-TO para médico legista",
    texto:
      "A Cebraspe foi contratada e o edital é o próximo passo. Estes são os dados já definidos, e é com eles que o seu estudo começa — antes de a concorrência acordar.",
    conteudo: <SecaoConcursoTO />,
    botao: "Quero me preparar para a PC-TO",
  },
  urgencia: {
    titulo: (
      <>
        Banca definida: o edital pode sair a qualquer momento.{" "}
        <span className="text-[#ffcd07]">Comece antes dele</span>
      </>
    ),
    texto:
      "Quem deixa para começar quando o edital sai perde semanas que não voltam. Com o nosso material, você estuda agora a medicina legal que cai em todo concurso de médico legista, com base nos últimos concursos, e chega ao edital da PC-TO com a maior parte da prova específica já vista.",
  },
  paraQuem: [
    "Vão prestar o concurso da PC-TO para médico legista",
    "Desejam estudar com professores que já são médicos legistas, com uma metodologia validada",
    "Querem começar antes do edital e chegar à prova na frente da concorrência",
    "Desejam estabilidade, subsídio inicial de R$ 15,7 mil e a carreira policial",
    "Querem continuar preparados para os próximos concursos de legista do país",
  ],
  oferta: {
    subtitulo: "Tudo o que você leva para estudar para a PC-TO:",
    primeiroItem: "Material pré-edital com base nos últimos concursos",
    quadro: "preparatório PC-TO · médico legista",
  },
  schema: {
    nome: "Preparatório para Médico Legista da Polícia Civil do Tocantins (PC-TO) — Clube Forense",
    descricao: `Preparatório para o concurso de médico legista (perito oficial) da PC-TO, com banca ${DADOS_TO.banca} definida em ${DADOS_TO.bancaDefinidaEm}: Medicina Legal com professores que são médicos legistas, material pré-edital com base nos últimos concursos, eBooks, mapas mentais e banco de questões.`,
    assuntos: ["Medicina Legal", "Concurso PC-TO", "Médico legista", "Cebraspe"],
  },
  produto: "Preparatório PC-TO",
};
