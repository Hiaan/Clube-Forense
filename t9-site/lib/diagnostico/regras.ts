// Regras do diagnóstico: notas por área, prioridades, plano de 30 dias e temperatura do lead.
// São as regras que decidem o conteúdo; a IA (ia.ts) só reescreve o texto de forma mais
// pessoal. Assim o diagnóstico nunca promete o que a T9 não faz, mesmo se a IA falhar.

import { anuncia, PERGUNTAS, respostaLegivel, type Respostas } from "./perguntas";

export type Area = "redes" | "google" | "anuncios" | "criativos" | "comercial";
export const NOMES_AREA: Record<Area, string> = {
  redes: "Redes sociais",
  google: "Google",
  anuncios: "Anúncios",
  criativos: "Vídeos e criativos",
  comercial: "Atendimento e vendas",
};

export type Prioridade = {
  id: string;
  area: Area;
  titulo: string;
  texto: string;
  /** O que a empresa ganha ao implementar (não só o passo a passo). */
  beneficios: string[];
  servico: "trafego" | "criativos" | "automacao" | "base";
};

/** O que muda quando a T9 cuida de tudo: aparece no fechamento do diagnóstico. */
export const BENEFICIOS_T9 = [
  "Contatos certos chegando todo dia, não só por indicação",
  "Vídeos roteirizados que prendem a atenção e levam o cliente a chamar ou comprar",
  "Atendimento automático: ninguém fica sem resposta, nem à noite",
  "Você sabe quanto custa cada cliente e onde vale investir mais",
];
export type Temperatura = "quente" | "morno" | "frio";

export type Diagnostico = {
  notas: Record<Area, number>;
  notaGeral: number;
  resumo: string;
  prioridades: Prioridade[];
  plano: { semana: number; titulo: string; itens: string[] }[];
  comoAT9Ajuda: string;
  temperatura: Temperatura;
  /** Por que essa temperatura (para a equipe, não aparece para o cliente). */
  motivoTemperatura: string;
  /** True quando o texto foi reescrito pela IA. */
  personalizado: boolean;
};

const um = (r: Respostas, id: string) => (typeof r[id] === "string" ? (r[id] as string) : "");
const varios = (r: Respostas, id: string) => (Array.isArray(r[id]) ? (r[id] as string[]) : []);
const tabela = (r: Respostas, id: string, valores: Record<string, number>, padrao = 0) => valores[um(r, id)] ?? padrao;
const limitar = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function notas(r: Respostas): Record<Area, number> {
  const posts = tabela(r, "posts", { diario: 100, semana_varias: 80, semanal: 45, raro: 20, sem_perfil: 0 });
  const stories = um(r, "posts") === "sem_perfil" ? 0 : tabela(r, "stories", { diario: 100, as_vezes: 55, nunca: 15 });
  const google = tabela(r, "google", { atualizado: 100, abandonado: 40, nao: 0, nao_sei: 0 });
  const site = tabela(r, "site", { sim: 100, so_instagram: 40, nao: 10 });

  let anuncios: number;
  if (anuncia(r)) {
    const base = tabela(r, "quem_faz", { agencia: 65, freelancer: 55, gerenciador: 55, impulsionar: 30 }, 45);
    const satisfacao = tabela(r, "satisfeito", { sim: 30, mais_ou_menos: 5, nao: -15 });
    anuncios = base + satisfacao - varios(r, "problemas").length * 8;
  } else {
    anuncios = um(r, "anuncia") === "ja_anunciou" ? 20 : 5;
  }

  const resposta = tabela(r, "resposta", { minutos: 100, horas: 55, dia_seguinte: 20, as_vezes_nao: 0 });
  const anota = tabela(r, "anota", { crm: 100, planilha: 65, whatsapp: 25, nao_anota: 0 });
  const followUp = tabela(r, "follow_up", { sempre: 100, as_vezes: 50, nunca: 0 });
  const atende = tabela(r, "atende", { equipe: 100, uma_pessoa: 80, eu: 60, ninguem: 15 });
  const automacao = tabela(r, "automacao", { sim: 100, nao: 20, nao_sei: 0 });
  const videos = tabela(r, "videos", { roteiro: 100, sem_roteiro: 50, raro: 20, nao: 0 });
  const foco = tabela(r, "foco_video", { dores: 100, produto: 40, nao_sei: 30 });

  return {
    redes: limitar(posts * 0.65 + stories * 0.35),
    google: limitar(google * 0.7 + site * 0.3),
    anuncios: limitar(anuncios),
    criativos: limitar(videos * 0.7 + foco * 0.3),
    comercial: limitar(resposta * 0.35 + anota * 0.2 + followUp * 0.2 + atende * 0.1 + automacao * 0.15),
  };
}

type Regra = Prioridade & { peso: (r: Respostas) => number };

const pesoVideo = (r: Respostas) => {
  if (um(r, "videos") === "roteiro") return um(r, "foco_video") === "dores" ? 0 : 74;
  return tabela(r, "videos", { sem_roteiro: 84, raro: 86, nao: 88 });
};

// Cada regra vira uma prioridade quando o peso é maior que zero; entram as três de maior peso.
// O peso reflete o que mais trava resultado: sem anúncio e sem atendimento rápido, nada anda.
const REGRAS: Regra[] = [
  {
    id: "comecar_anuncios",
    area: "anuncios",
    servico: "trafego",
    titulo: "Começar a anunciar com um valor pequeno e controlado",
    texto:
      "Hoje os clientes só chegam por indicação ou por acaso. Anúncio bem feito coloca sua empresa na frente de quem já procura o que você vende, na sua região. Dá para começar com pouco, medir o custo de cada cliente e só aumentar o que der retorno.",
    beneficios: ["Clientes chegando todo dia, não só por indicação", "Você controla quanto gasta e vê quanto volta", "Sua empresa aparece para quem já está procurando"],
    peso: (r) => (anuncia(r) ? 0 : um(r, "anuncia") === "ja_anunciou" ? 90 : 95),
  },
  {
    id: "video_aida",
    area: "criativos",
    servico: "criativos",
    titulo: "Criar vídeos roteirizados no método AIDA para os anúncios",
    texto:
      "Vídeo é o formato que mais prende a atenção no Instagram, mas só vende com roteiro. No método AIDA, o vídeo abre com a dor do seu cliente para prender a Atenção nos primeiros segundos, desperta o Interesse mostrando que existe solução, cria Desejo com prova e resultado de quem já comprou e termina com uma Ação clara: chamar no WhatsApp ou comprar no site.",
    beneficios: [
      "Mais gente para de rolar a tela e assiste até o fim",
      "Contatos que já chegam entendendo o valor do que você vende",
      "Anúncio que prende a atenção costuma sair mais barato, porque a Meta entrega mais o que o público assiste",
    ],
    peso: pesoVideo,
  },
  {
    id: "sair_impulsionar",
    area: "anuncios",
    servico: "trafego",
    titulo: "Trocar o botão \"Impulsionar\" pelo Gerenciador de Anúncios",
    texto:
      "O impulsionar mostra o post para muita gente, mas não escolhe quem tem chance de comprar. No Gerenciador de Anúncios dá para mirar no público certo, testar várias artes e pagar pelo resultado que importa: contato e venda.",
    beneficios: ["O dinheiro vai para quem tem chance de comprar", "Os testes mostram qual anúncio vende mais", "Mais contatos pelo mesmo valor"],
    peso: (r) => (anuncia(r) && um(r, "quem_faz") === "impulsionar" ? 85 : 0),
  },
  {
    id: "nao_fecha",
    area: "comercial",
    servico: "automacao",
    titulo: "Organizar o atendimento para transformar contato em venda",
    texto:
      "O problema não é só o anúncio: os contatos chegam e se perdem no caminho. Um roteiro de atendimento simples, resposta rápida e um lugar para acompanhar cada negociação fazem mais vendas com o mesmo investimento.",
    beneficios: ["Mais vendas sem gastar mais com anúncio", "Nenhum contato esquecido no caminho", "Todo mundo atendendo do mesmo jeito, com o mesmo roteiro"],
    peso: (r) => (varios(r, "problemas").includes("nao_fecho") ? 92 : 0),
  },
  {
    id: "resposta_rapida",
    area: "comercial",
    servico: "automacao",
    titulo: "Responder todo contato novo em até 5 minutos",
    texto:
      "Quem responde primeiro costuma fechar. Um atendimento automático no WhatsApp responde na hora, tira as dúvidas mais comuns e passa para você só quem está pronto para comprar, inclusive à noite e no fim de semana.",
    beneficios: ["Contato respondido na hora, até de madrugada", "Menos clientes indo para o concorrente", "Sua equipe só conversa com quem quer comprar"],
    peso: (r) => tabela(r, "resposta", { minutos: 0, horas: 70, dia_seguinte: 88, as_vezes_nao: 93 }),
  },
  {
    id: "contatos_ruins",
    area: "anuncios",
    servico: "trafego",
    titulo: "Filtrar curiosos e atrair contatos com real interesse",
    texto:
      "Contato de baixa qualidade quase sempre vem de público mal escolhido ou de formulário fácil demais. Ajustando quem vê o anúncio e fazendo as perguntas certas no cadastro, chega menos gente curiosa e mais gente pronta para fechar.",
    beneficios: ["Menos tempo perdido com curiosos", "Equipe focada em quem tem interesse de verdade", "Mais vendas com o mesmo número de contatos"],
    peso: (r) => (varios(r, "problemas").includes("contatos_ruins") ? 80 : 0),
  },
  {
    id: "poucos_contatos",
    area: "anuncios",
    servico: "trafego",
    titulo: "Aumentar o volume de contatos sem aumentar o custo",
    texto:
      "Poucos contatos costumam ser sinal de artes cansadas, público pequeno ou orçamento mal distribuído. Testar novas artes toda semana e concentrar a verba no que funciona aumenta os contatos com o mesmo valor.",
    beneficios: ["Mais contatos sem aumentar a verba", "Anúncios sempre renovados, sem cansar o público", "Dinheiro concentrado no que funciona"],
    peso: (r) => (varios(r, "problemas").includes("poucos_contatos") ? 75 : 0),
  },
  {
    id: "medir_retorno",
    area: "anuncios",
    servico: "trafego",
    titulo: "Saber quanto custa cada cliente que chega dos anúncios",
    texto:
      "Sem números claros, não dá para saber se o anúncio paga a conta. Um painel simples, com quanto foi investido, quantos contatos chegaram e quantos viraram venda, mostra onde vale colocar mais dinheiro e onde cortar.",
    beneficios: ["Você sabe quanto custa cada cliente", "Decide onde investir com número, não no achismo", "Corta o desperdício rápido"],
    peso: (r) =>
      varios(r, "problemas").includes("sem_clareza") || varios(r, "problemas").includes("caro") || varios(r, "terceiro").includes("sem_relatorio") ? 72 : 0,
  },
  {
    id: "parceiro",
    area: "anuncios",
    servico: "trafego",
    titulo: "Ter um parceiro de anúncios que responde e mostra resultado",
    texto:
      "Quem cuida dos seus anúncios precisa entender o seu negócio, responder rápido e mostrar com números o que está funcionando. Reuniões curtas e um relatório claro toda semana mudam o jogo.",
    beneficios: ["Respostas rápidas quando você precisa", "Relatório claro toda semana", "Estratégia feita para o seu negócio"],
    peso: (r) => (varios(r, "terceiro").some((t) => ["nao_responde", "nao_entende", "so_posta"].includes(t)) ? 70 : 0),
  },
  {
    id: "crm",
    area: "comercial",
    servico: "automacao",
    titulo: "Anotar cada contato e cada negociação num só lugar",
    texto:
      "Quando tudo fica só no WhatsApp, contato bom esquece de ser chamado de volta. Um quadro simples, com as etapas da venda, mostra quem está esperando resposta e quem está perto de fechar.",
    beneficios: ["Nenhuma oportunidade esquecida", "Você vê quantas vendas estão perto de fechar", "Fica fácil acompanhar a equipe"],
    peso: (r) => tabela(r, "anota", { crm: 0, planilha: 35, whatsapp: 60, nao_anota: 68 }),
  },
  {
    id: "follow_up",
    area: "comercial",
    servico: "automacao",
    titulo: "Voltar a falar com quem não fechou",
    texto:
      "Boa parte das vendas acontece no segundo ou terceiro contato. Mensagens automáticas de acompanhamento, alguns dias depois, recuperam clientes que você já pagou para atrair.",
    beneficios: ["Vendas recuperadas de quem já demonstrou interesse", "Sem trabalho manual: as mensagens saem sozinhas", "Mais retorno do mesmo investimento em anúncio"],
    peso: (r) => tabela(r, "follow_up", { sempre: 0, as_vezes: 45, nunca: 62 }),
  },
  {
    id: "google",
    area: "google",
    servico: "base",
    titulo: "Aparecer no Google Maps da sua região",
    texto:
      "Muita gente procura no Google antes de comprar. Um Perfil da Empresa no Google completo, com fotos, horário e avaliações de clientes, traz contatos de graça e deixa os seus anúncios mais confiáveis.",
    beneficios: ["Contatos de graça de quem procura no Google", "Mais confiança com avaliações de clientes", "Anúncios mais fortes com uma empresa bem avaliada"],
    peso: (r) => tabela(r, "google", { atualizado: 0, abandonado: 50, nao: 58, nao_sei: 58 }),
  },
  {
    id: "redes",
    area: "redes",
    servico: "base",
    titulo: "Manter o Instagram vivo para quem chega dos anúncios",
    texto:
      "Quem clica no anúncio quase sempre olha o perfil antes de chamar. Postar pelo menos três vezes por semana e aparecer nos stories todo dia mostra que a empresa é real e está ativa.",
    beneficios: ["Quem chega do anúncio confia mais e chama", "Sua marca lembrada no dia a dia", "Conteúdo que depois pode virar anúncio"],
    peso: (r) => tabela(r, "posts", { diario: 0, semana_varias: 15, semanal: 45, raro: 55, sem_perfil: 60 }),
  },
  {
    id: "pagina",
    area: "google",
    servico: "trafego",
    titulo: "Ter uma página feita para receber os anúncios",
    texto:
      "Mandar o anúncio direto para o perfil funciona, mas uma página simples, focada em uma oferta e com o botão do WhatsApp, costuma transformar mais visitas em contatos.",
    beneficios: ["Mais visitas viram contatos", "Uma oferta clara, sem distração", "Dá para medir cada passo até a venda"],
    peso: (r) => (um(r, "site") === "sim" ? 0 : 30),
  },
];

const VERBA_ALTA = ["2000_5000", "5000_15000", "15000_mais"];
const FATURAMENTO_ALTO = /100 mil a R\$ 300|300 mil a R\$ 1 milh|Acima de R\$ 1 milh/;

export function temperatura(r: Respostas): { temperatura: Temperatura; motivo: string } {
  const quando = um(r, "quando");
  const motivos: string[] = [];
  let pontos = 0;
  const somar = (condicao: boolean, valor: number, motivo: string) => {
    if (!condicao) return;
    pontos += valor;
    motivos.push(motivo);
  };
  somar(quando === "agora", 3, "quer começar agora");
  somar(quando === "30_dias", 2, "quer começar em 30 dias");
  somar(quando === "pesquisando", -2, "só pesquisando");
  somar(anuncia(r) && VERBA_ALTA.includes(um(r, "investimento")), 2, "já investe R$ 2 mil+/mês");
  somar(anuncia(r) && ["mais_ou_menos", "nao"].includes(um(r, "satisfeito")), 2, "insatisfeito com os anúncios");
  somar(FATURAMENTO_ALTO.test(um(r, "faturamento")), 2, "fatura R$ 100 mil+/mês");
  somar(varios(r, "problemas").includes("nao_fecho"), 1, "não consegue fechar");
  const t: Temperatura = pontos >= 5 ? "quente" : pontos >= 2 ? "morno" : "frio";
  return { temperatura: t, motivo: motivos.join(", ") || "sem sinais fortes" };
}

const nomeDoNicho = (r: Respostas) => {
  if (um(r, "nicho") === "outro") return um(r, "nicho_outro") || "seu negócio";
  const p = PERGUNTAS.find((x) => x.id === "nicho")!;
  return respostaLegivel(p, um(r, "nicho")).toLowerCase();
};

export function diagnosticar(r: Respostas): Diagnostico {
  const n = notas(r);
  const notaGeral = limitar((n.redes + n.google + n.anuncios * 1.5 + n.criativos * 1.25 + n.comercial * 1.5) / 6.25);
  const escolhidas = REGRAS.map((regra) => ({ regra, peso: regra.peso(r) }))
    .filter((x) => x.peso > 0)
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 3)
    .map(({ regra }) => ({ id: regra.id, area: regra.area, titulo: regra.titulo, texto: regra.texto, beneficios: regra.beneficios, servico: regra.servico }));

  // Sempre há o que melhorar; se nada pesou (tudo já bem feito), o foco é escalar.
  if (!escolhidas.length) {
    escolhidas.push({
      id: "escalar",
      area: "anuncios",
      servico: "trafego",
      beneficios: ["Mais vendas com segurança, sem apostar no escuro", "Atendimento que dá conta do volume maior", "Crescimento medido semana a semana"],
      titulo: "Escalar o que já funciona",
      texto:
        "Sua base está bem montada. O próximo passo é aumentar o investimento com segurança, testando novos públicos e artes toda semana, e automatizar o atendimento para dar conta do volume maior.",
    });
  }

  const pior = (Object.keys(n) as Area[]).sort((a, b) => n[a] - n[b])[0];
  const empresa = um(r, "empresa") || "sua empresa";
  const resumo =
    `A ${empresa} tem nota geral ${notaGeral} de 100. O ponto que mais trava o crescimento hoje é ${NOMES_AREA[pior].toLowerCase()}, ` +
    `e as três ações abaixo são as que mais devem trazer resultado no curto prazo para ${nomeDoNicho(r)}.`;

  const temTrafego = escolhidas.some((p) => p.servico === "trafego");
  const plano = [
    { semana: 1, titulo: "Arrumar a casa", itens: ["Perfil do Google e Instagram completos e atualizados", "Roteiro de atendimento e respostas rápidas no WhatsApp", "Lista de todos os contatos num só lugar"] },
    {
      semana: 2,
      titulo: temTrafego ? "Anúncios no ar" : "Atendimento automático",
      itens: temTrafego
        ? ["Roteiros de vídeo no método AIDA, pensados nas dores do seu cliente", "Campanha com público da sua região e oferta clara", "Cada contato do anúncio chegando direto no WhatsApp"]
        : ["Resposta automática para todo contato novo", "Perguntas que separam curioso de cliente", "Aviso imediato para quem vende"],
    },
    { semana: 3, titulo: "Acompanhar e ajustar", itens: ["Custo por contato e por venda, todo dia", "Cortar o que não funciona e reforçar o que funciona", "Mensagens automáticas para quem não fechou"] },
    { semana: 4, titulo: "Escalar", itens: ["Aumentar a verba no que trouxe venda", "Novas artes a partir das que mais venderam", "Reunião de resultado e plano do próximo mês"] },
  ];

  const { temperatura: temp, motivo } = temperatura(r);
  return {
    notas: n,
    notaGeral,
    resumo,
    prioridades: escolhidas,
    plano,
    comoAT9Ajuda:
      "A T9 cuida de ponta a ponta: cria os roteiros dos vídeos de anúncio no método AIDA, pensados nas dores do seu cliente; faz a gestão dos anúncios no Instagram, Facebook e Google, com relatório claro de quanto custa cada cliente; e monta as automações que fazem esses contatos virarem venda (atendimento automático no WhatsApp, acompanhamento de quem não fechou e um quadro de vendas para você ver tudo). Na reunião gratuita, a gente monta esse plano com você para a sua empresa.",
    temperatura: temp,
    motivoTemperatura: motivo,
    personalizado: false,
  };
}

/** Respostas em texto, na ordem das perguntas (para o aviso do WhatsApp e o painel). */
export function respostasEmTexto(r: Respostas) {
  const saida: Record<string, string> = {};
  for (const p of PERGUNTAS) {
    const v = respostaLegivel(p, r[p.id]);
    if (v) saida[p.titulo] = v;
  }
  return saida;
}
