// Curadoria Clube Forense — situação verificada dos concursos que envolvem o
// cargo de médico-legista, por estado. Fonte: análise editorial (carrosséis
// "Editais Previstos — Perito Médico Legista 2026").
//
// Esta camada funciona como PISO do monitor: cada estado nunca aparece num
// estágio abaixo do que a curadoria sabe. As notícias coletadas só elevam ou
// reforçam o estágio. Quando a situação de um estado mudar, atualize a entrada
// (estagio/resumo) e o campo `verificadoEm`.
//
// Estágios (ver tipos.ts): estudo → solicitado → autorizado → comissao → banca → edital.

import { lerPlanilha, planilhaConfigurada, type LinhaCuradoria } from "./planilha";
import type { Mencao, Nivel } from "./tipos";

/** Data da última verificação editorial destes dados. */
export const VERIFICADO_EM = "2026-07-26";

interface EntradaCuradoria {
  uf: string;
  estagio: Exclude<Nivel, "sem" | "noticia">;
  titulo: string;
  resumo: string;
}

const CURADORIA: EntradaCuradoria[] = [
  {
    uf: "MA",
    estagio: "edital",
    titulo: "Perícia Oficial MA: EDITAL PUBLICADO — inscrições de 31/07 a 05/10/2026",
    resumo:
      "Edital publicado pela SEAD/MA e SSP-MA para a Perícia Oficial de Natureza Criminal, organizado pelo Cebraspe. 25 vagas imediatas para Médico Legista, além de cadastro de reserva nas especialidades de psiquiatria e radiologia. Inscrições exclusivamente on-line de 31/07 a 05/10/2026, taxa de R$ 250,00; provas objetiva e discursiva em 10/01/2027. Salário inicial de R$ 14.675,58 para 40h semanais. Etapas seguintes: exame médico, avaliação psicológica, investigação social e curso de formação.",
  },
  {
    uf: "RJ",
    estagio: "banca",
    titulo: "PC-RJ: FGV definida como banca (homologada em 24/06/2026) — edital iminente",
    resumo:
      "A escolha da FGV foi homologada em 24/06/2026 via publicação no Portal Nacional de Contratações Públicas (PNCP), encerrando a disputa que tinha 9 instituições. 251 vagas para Perito Legista (nível superior em Medicina, Odontologia ou Farmácia), dentro de um lote de 329 vagas sob a FGV; remuneração inicial de R$ 13.786,36 e taxa de inscrição de R$ 220,00. Falta a assinatura do contrato e a divulgação do cronograma com as datas de inscrição e prova.",
  },
  {
    uf: "DF",
    estagio: "comissao",
    titulo: "PC-DF: quatro bancas com proposta entregue — prazo do 1º trimestre venceu",
    resumo:
      "Concurso autorizado e previsto na Lei Orçamentária de 2026, mas a expectativa de edital no primeiro trimestre não se cumpriu. O Plano de Contratações 2026 reserva R$ 500 mil para contratar a instituição responsável pelas carreiras de Perito Criminal, Médico Legista e Papiloscopista, e o prazo de propostas atraiu Instituto Access, Instituto Verbena, FGV e IDCAP. 75 vagas para Médico Legista (25 imediatas + 50 cadastro de reserva), remuneração inicial de R$ 26.690,15. Ainda sem data confirmada de publicação. Último concurso: 2014 (Fundação Universa).",
  },
  {
    uf: "TO",
    estagio: "comissao",
    titulo: "PC-TO: cronograma oficial prevê edital no fim de agosto e provas em novembro/2026",
    resumo:
      "A Justiça deu 100 dias para a publicação do edital da área pericial. O secretário de Segurança Pública, Luciano Cruz, divulgou cronograma com definição da banca no início de julho, contratação em meados de agosto, publicação do edital no fim de agosto e provas objetivas em novembro/2026. Enviaram proposta: Instituto Access, FGV, Instituto Verbena e IDCAP (o último certame foi da Fundação Aroeira). 12 vagas para Médico Legista (9 imediatas + 3 cadastro de reserva), dentro de 452 vagas totais. Subsídio inicial do Perito Oficial: R$ 15.763,91.",
  },
  {
    uf: "PA",
    estagio: "comissao",
    titulo: "PC-PA: comissão formada — banca em definição; prazo do 1º semestre venceu",
    resumo:
      "Comissão organizadora formada desde março/2024 e processo de escolha da banca ainda em andamento; a expectativa de edital no primeiro semestre de 2026 não se cumpriu. O próximo edital deve ofertar 174 vagas de Perito Criminal e 72 de Perito Médico Legista, distribuídas entre Belém, Altamira, Santarém e outras coordenadorias. Remuneração por níveis, de R$ 12.214,37 (Nível I) a R$ 14.846,64 (Nível V). Último concurso: 2018 (Fadesp).",
  },
  {
    uf: "PE",
    estagio: "autorizado",
    titulo: "Politec-PE: novo concurso autorizado, banca em definição — prazo de junho venceu",
    resumo:
      "Novo concurso autorizado pelo Governo de Pernambuco, com banca ainda em definição; a previsão oficial de edital até junho/2026, reforçada pelo secretário de Defesa Social Alessandro Carvalho, não se cumpriu. Quantitativo em definição — referência: o concurso de 2024 ofertou 60 vagas para Médico Legista (Instituto AOCP) e segue em andamento, o que tende a empurrar o novo edital. Remuneração inicial de ~R$ 10.622,86 (vencimento base + gratificação de risco de função policial).",
  },
  {
    uf: "ES",
    estagio: "comissao",
    titulo: "PCI-ES: trâmites iniciados em junho/2026 — banca ainda não escolhida",
    resumo:
      "Em 06/01/2026 o governador Renato Casagrande sancionou o novo Estatuto da Polícia Científica (LC 1.137/2026), consolidando a autonomia do órgão e fixando um quadro de 892 cargos — 120 deles de Perito Médico Legista. Os trâmites do certame foram iniciados em junho/2026, mas a banca ainda não foi escolhida e a expectativa de edital no primeiro semestre não se cumpriu. Remuneração inicial na faixa de R$ 9.769,00 a R$ 10.159,77 conforme a nova lei. Último concurso (2018): 15 vagas para Médico Legista, pelo Instituto AOCP.",
  },
  {
    uf: "MT",
    estagio: "solicitado",
    titulo: "Politec-MT: validade do certame anterior expirou em 30/06/2026 — destrava o novo edital",
    resumo:
      "A Politec-MT está contemplada na LOA 2026 e o PLDO 2026, com parecer favorável da CCJR da Assembleia, prevê concurso para Perito Oficial Criminal e Perito Médico Legista. O travamento principal caiu: a validade prorrogada do certame anterior venceu em 30/06/2026. Banca ainda a definir (a última foi a UFMT). Salário inicial do Perito Médico Legista entre R$ 17.358,00 e R$ 18.295,00 (44h semanais), chegando a ~R$ 43.000,00 no topo — uma das remunerações periciais mais fortes do Brasil. Último concurso (2022, UFMT): apenas cadastro de reserva para medicina legal.",
  },
  {
    uf: "AC",
    estagio: "estudo",
    titulo: "PC-AC: concurso em estudos de viabilidade para 2026",
    resumo:
      "O estado estuda a viabilidade de um novo concurso da área pericial para 2026. Ainda sem previsão concreta de edital.",
  },
];

/** Converte a curadoria embutida em menções prontas para o consolidador. */
export function mencoesCuradoria(): Mencao[] {
  return CURADORIA.map((c) => ({
    uf: c.uf,
    titulo: c.titulo,
    link: "",
    fonte: "Curadoria Clube Forense",
    data: `${VERIFICADO_EM}T12:00:00.000Z`,
    nivel: c.estagio,
    resumo: c.resumo,
  }));
}

/** Converte as linhas da planilha no mesmo formato de menção. */
function mencoesDaPlanilha(linhas: LinhaCuradoria[]): Mencao[] {
  return linhas
    .filter((l) => l.etapa !== "sem" || l.andamento)
    .map((l) => ({
      uf: l.uf,
      titulo: l.andamento.split(/[.;]\s/)[0] || `${l.uf}: ${l.etapa}`,
      link: l.fonteUrl,
      fonte: "Curadoria Clube Forense (planilha)",
      data: l.verificadoEm ?? new Date().toISOString(),
      nivel: l.etapa,
      resumo: l.andamento,
    }));
}

/** De onde a curadoria veio nesta geração, e por quê. */
export interface OrigemCuradoria {
  fonte: "planilha" | "embutida";
  /** Preenchido quando a planilha falhou e caímos no piso embutido. */
  motivo?: string;
  avisos: string[];
}

export interface CuradoriaResolvida {
  mencoes: Mencao[];
  /** UFs marcadas como travadas: notícia nenhuma altera o estágio delas. */
  travadas: Set<string>;
  /** Dados ricos por UF (vagas, salário, prazos), quando vieram da planilha. */
  detalhes: Map<string, LinhaCuradoria>;
  origem: OrigemCuradoria;
}

/**
 * Resolve a curadoria: tenta a planilha e, em qualquer falha, usa o piso
 * embutido. Nunca lança e nunca devolve vazio — o mapa não pode ficar órfão
 * porque o Google teve um soluço.
 */
export async function obterCuradoria(): Promise<CuradoriaResolvida> {
  const vazio = {
    travadas: new Set<string>(),
    detalhes: new Map<string, LinhaCuradoria>(),
  };

  if (!planilhaConfigurada()) {
    return {
      ...vazio,
      mencoes: mencoesCuradoria(),
      origem: { fonte: "embutida", motivo: "CURADORIA_CSV_URL não configurada", avisos: [] },
    };
  }

  const r = await lerPlanilha();
  if (!r.ok) {
    return {
      ...vazio,
      mencoes: mencoesCuradoria(),
      origem: { fonte: "embutida", motivo: r.motivo, avisos: [] },
    };
  }

  return {
    mencoes: mencoesDaPlanilha(r.linhas),
    travadas: new Set(r.linhas.filter((l) => l.travado).map((l) => l.uf)),
    detalhes: new Map(r.linhas.map((l) => [l.uf, l])),
    origem: { fonte: "planilha", avisos: r.avisos },
  };
}
