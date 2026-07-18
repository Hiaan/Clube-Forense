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

import type { Mencao, Nivel } from "./tipos";

/** Data da última verificação editorial destes dados. */
export const VERIFICADO_EM = "2026-07-01";

interface EntradaCuradoria {
  uf: string;
  estagio: Exclude<Nivel, "sem" | "noticia">;
  titulo: string;
  resumo: string;
}

const CURADORIA: EntradaCuradoria[] = [
  {
    uf: "MA",
    estagio: "banca",
    titulo:
      "PC-MA: banca Cebraspe definida — edital iminente (decisão judicial: até junho/2026)",
    resumo:
      "Comissão formada e ativa; certame consta na PLOA 2026. A Justiça do Maranhão determinou a realização do concurso até junho/2026 e o governador Carlos Brandão anunciou o Cebraspe como banca, com previsão de publicação do edital em até 30 dias. 25 vagas para médico legista; salário inicial de R$ 14.675,58 (valor reajustado a partir de junho/2026).",
  },
  {
    uf: "RJ",
    estagio: "comissao",
    titulo:
      "PC-RJ: concurso autorizado — banca em definição final (9 instituições na disputa)",
    resumo:
      "Autorizado oficialmente pelo governador Cláudio Castro em abril/2025; fase final de preparação, com meta de divulgar os editais até junho. 414 vagas totais autorizadas, sendo 251 para Perito Legista (nível superior em Medicina, Odontologia ou Farmácia); remuneração inicial de R$ 13.786,36. Na disputa pela banca: FGV, Cebraspe, Fundação Cesgranrio, Instituto AOCP, Idecan, Selecon, Fundação Ceperj, Instituto Consulplan e Instituto Seleção.",
  },
  {
    uf: "DF",
    estagio: "comissao",
    titulo:
      "PC-DF: comissão formada — projeto básico para contratação da banca em elaboração",
    resumo:
      "Concurso autorizado e previsto na Lei Orçamentária de 2026; expectativa de edital no primeiro trimestre. 75 vagas autorizadas para Médico Legista (25 imediatas + 50 cadastro de reserva), com expectativa de nomeações chegando a 134 até 2027. Remuneração inicial de R$ 27.831,70 (Terceira Classe), chegando a R$ 41.350,00 no topo da carreira. Último concurso: 2014 (Fundação Universa).",
  },
  {
    uf: "TO",
    estagio: "comissao",
    titulo: "PC-TO: comissão formada — edital confirmado para 2026",
    resumo:
      "O prazo estipulado pelo MPTO (outubro/2025) expirou sem cumprimento, mas em 22/01/2026 o secretário de Segurança Pública, Wlademir Mota, reafirmou publicamente que o edital está previsto no orçamento e será lançado este ano. O governo trabalha com 452 vagas no total (381 imediatas + 71 CR), entre Delegado, Investigador/Escrivão, Papiloscopista, Agente de Necrotomia e Peritos (incluindo Médico-Legista). Subsídio inicial do Perito Oficial: R$ 16.348,75; final de carreira pode ultrapassar R$ 28.000,00.",
  },
  {
    uf: "PA",
    estagio: "comissao",
    titulo: "PC-PA: comissão formada desde março/2024 — banca em fase de definição",
    resumo:
      "Comissão organizadora formada desde março/2024 e processo de escolha da banca em andamento. Expectativa de publicação do edital no primeiro semestre de 2026, visando reforçar a segurança pública. 72 vagas previstas para Médico Perito Legista, distribuídas entre Belém, Altamira, Santarém e outras coordenadorias. Remuneração inicial de ~R$ 12.954,40 (vencimento base + gratificação de risco de vida e escolaridade). Último concurso: 2018 (Fadesp).",
  },
  {
    uf: "PE",
    estagio: "estudo",
    titulo:
      "PC-PE: novo edital em estudo — anúncio da governadora Raquel Lyra (dez/2025)",
    resumo:
      "Em dezembro/2025 a governadora Raquel Lyra anunciou a necessidade do novo concurso; a previsão oficial, reforçada pelo secretário de Defesa Social, Alessandro Carvalho, é de publicação do edital até junho/2026. Quantitativo em definição — referência: o concurso de 2024 ofertou 60 vagas para Médico Legista (Instituto AOCP, ainda em finalização/homologação). Remuneração inicial de ~R$ 10.622,86 (vencimento base + gratificação de risco de função policial).",
  },
  {
    uf: "ES",
    estagio: "comissao",
    titulo:
      "PCI-ES: concurso confirmado na LOA 2026 — trâmites de contratação da banca",
    resumo:
      "Concurso confirmado para 2026: em 06/01/2026 o governador Renato Casagrande sancionou o novo Estatuto da Polícia Científica, consolidando a autonomia do órgão. O edital consta na LOA 2026 e a expectativa é de publicação no primeiro semestre, logo após os trâmites de contratação da banca. Com a nova lei (LC 1.137/2026), a remuneração inicial do Perito Oficial Médico Legista ficou em R$ 10.159,77. Último concurso (2018): 15 vagas para Médico Legista; banca anterior: Instituto AOCP.",
  },
  {
    uf: "MT",
    estagio: "solicitado",
    titulo:
      "Politec-MT: previsto na LOA 2026 — comissão e banca esperadas para o 1º semestre",
    resumo:
      "A Politec MT está contemplada na LOA 2026, que garante reserva de recursos para novas contratações. Detalhe estratégico: o último certame teve a validade prorrogada e segue vigente até 30/06/2026 — a expectativa é que comissão e escolha da banca ocorram no primeiro semestre, com edital a partir do segundo semestre. Salário inicial do Perito Oficial Médico Legista entre R$ 17.358,00 e R$ 18.295,00 (44h semanais), chegando a ~R$ 43.000,00 no topo — uma das remunerações periciais mais fortes do Brasil. Último concurso (2022, UFMT): apenas cadastro de reserva para medicina legal.",
  },
  {
    uf: "AC",
    estagio: "estudo",
    titulo: "PC-AC: concurso em estudos de viabilidade para 2026",
    resumo:
      "O estado estuda a viabilidade de um novo concurso da área pericial para 2026. Ainda sem previsão concreta de edital.",
  },
];

/** Converte a curadoria em menções prontas para o consolidador. */
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
