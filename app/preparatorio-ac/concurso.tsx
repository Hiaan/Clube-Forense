// O preparatório da PC-AC, como dado para a PaginaPreparatorio.

import type { ConcursoPreparatorio } from "../preparatorio/concurso";
import { EDITAL_AC } from "./edital";
import { MATERIAS_AC } from "./materias";
import SecaoEditalAC from "./SecaoEditalAC";

export const CONCURSO_AC: ConcursoPreparatorio = {
  slug: "preparatorio-ac",
  sigla: EDITAL_AC.sigla,
  orgao: EDITAL_AC.orgao,
  cargo: "Perito Médico-Legista",
  checkout: EDITAL_AC.checkout,
  selo: `Edital ${EDITAL_AC.sigla} publicado`,
  faixa: `Edital PC-AC publicado · perito médico-legista · prova em ${EDITAL_AC.dataProva}`,
  itensCapa: [
    "Aulas gravadas de todos os assuntos do edital",
    "eBooks das matérias",
    "Mapas mentais exclusivos (resumos ilustrados)",
    "Banco de questões de concursos anteriores",
    "Suporte dedicado ao aluno",
    "Grupo com professores e alunos para tirar dúvidas e compartilhar conhecimento",
    "…e muito mais!",
  ],
  prova: { inicio: EDITAL_AC.inicioProva },
  ficha: {
    nota: "edital publicado em 06/11/2026",
    titulo: "O concurso da PC-AC para perito médico-legista",
    texto:
      "O primeiro concurso com vagas de médico-legista no Acre desde 2015. Estes são os números do edital, e é com eles que o seu estudo começa.",
    conteudo: <SecaoEditalAC />,
    botao: "Quero me preparar para a PC-AC",
  },
  urgencia: {
    titulo: (
      <>
        O edital saiu: são poucas semanas até a prova.{" "}
        <span className="text-[#ffcd07]">Cada uma delas conta</span>
      </>
    ),
    texto:
      "Com 75% da objetiva em conhecimentos específicos, quem chega à prova dominando medicina legal sai na frente. Em vez de juntar material de vários lugares, você estuda numa sequência só, já organizada pelo que o edital da PC-AC cobra.",
  },
  paraQuem: [
    "Vão prestar o concurso da PC-AC para perito médico-legista",
    "Desejam estudar com professores que já são médicos legistas, com uma metodologia validada",
    "Querem otimizar o tempo até a prova com um estudo direcionado ao edital",
    "Desejam estabilidade, salário de R$ 14,6 mil e a carreira policial",
    "Querem continuar preparados para os próximos concursos de legista do país",
  ],
  oferta: {
    subtitulo: "Tudo o que você leva para estudar para a PC-AC:",
    primeiroItem: "Aulas gravadas de todos os assuntos do edital",
    quadro: "preparatório PC-AC · perito médico-legista",
  },
  materias: MATERIAS_AC,
  schema: {
    nome: "Preparatório para Perito Médico-Legista da Polícia Civil do Acre (PC-AC) — Clube Forense",
    descricao: `Preparatório para o concurso de perito médico-legista da PC-AC (edital de 2026, banca ${EDITAL_AC.banca}, prova em ${EDITAL_AC.dataProva}), com aulas de todos os assuntos do edital, Medicina Legal com professores que são médicos legistas, eBooks, mapas mentais e banco de questões.`,
    assuntos: ["Medicina Legal", "Concurso PC-AC", "Perito médico-legista", "Toxicologia forense"],
  },
  produto: "Preparatório PC-AC",
  faq: [
    {
      p: "Quando é a prova da PC-AC para perito médico-legista?",
      r: `As provas objetiva e discursiva são em ${EDITAL_AC.dataProva}, à tarde (13h às 18h, horário do Acre). As inscrições vão de ${EDITAL_AC.inscricoes}, pelo site do Idecan, e o salário inicial é de R$ 14.629,25.`,
    },
  ],
};
