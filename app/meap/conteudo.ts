// Todo o texto da página de vendas do MEAP fica aqui, separado do layout, para
// que a copy possa ser ajustada sem mexer em JSX.
//
// ATENÇÃO: os itens marcados com `// PREENCHER` são espaços reservados para
// dados reais (números, depoimentos, imagens de projetos). Nada aqui pode ir ao
// ar como prova social sem ser verdadeiro — troque antes de publicar.

/** Link do checkout. Trocar pela URL real da plataforma de pagamento. */
export const CHECKOUT_URL = "#oferta"; // PREENCHER: URL do checkout

/** Contato exibido no rodapé — o mesmo da página de captura. */
export const CONTATO = "contato@engquerencosta.com";

export const PRECO = {
  aVista: "R$ 497",
  parcelado: "12x de R$ 51,10",
  ancora: "R$ 997", // PREENCHER: preço cheio, só se for verdadeiro
};

export const OPORTUNIDADE = {
  // Mesmo título da página de captura — quem chega de lá reconhece a promessa.
  titulo: "A oportunidade que muitos engenheiros deixam passar",
  paragrafos: [
    "Toda obra precisa de projeto estrutural. Toda construtora, todo arquiteto e todo cliente de alto padrão precisam de alguém que assine, calcule e responda tecnicamente por aquilo. E, na prática, faltam engenheiros preparados para entregar esse serviço com segurança.",
    "É por isso que o projeto estrutural é uma das formas mais diretas de somar faturamento dentro da engenharia — sem abandonar a obra, o escritório ou o emprego que você já tem. Um único projeto bem posicionado já paga meses de estudo.",
  ],
  meta: {
    valor: "R$ 7 mil",
    texto:
      "é a faixa que um engenheiro estruturalista consegue somar por mês ao dominar projeto, precificação e captação — trabalhando nas próprias horas, em paralelo ao que já faz.",
  },
};

export const BARREIRAS = [
  {
    titulo: "Insegurança técnica",
    texto:
      "Você até estudou estruturas, mas travaria na hora de assinar um projeto real. Falta a confiança de quem já fez do lançamento à entrega.",
  },
  {
    titulo: "Não saber por onde começar",
    texto:
      "Muito conteúdo solto, nenhuma sequência. Você não sabe qual é o primeiro passo nem qual é o próximo depois dele.",
  },
  {
    titulo: "Não saber quanto cobrar",
    texto:
      "Chega o pedido de orçamento e vem a dúvida: cobro por m², por hora, por complexidade? Cobrar errado queima o cliente e o seu tempo.",
  },
  {
    titulo: "Não saber conseguir clientes",
    texto:
      "Você sabe fazer, mas ninguém sabe que você faz. Sem prospecção e sem portfólio, o telefone simplesmente não toca.",
  },
];

export const PILARES = [
  {
    numero: "01",
    nome: "Projetar",
    resumo: "Segurança e domínio técnico",
    texto:
      "Concepção, lançamento, modelagem, dimensionamento e detalhamento. Você aprende a tomar decisão estrutural com critério — e a defender cada uma delas.",
  },
  {
    numero: "02",
    nome: "Posicionar",
    resumo: "Do projeto ao serviço valorizado",
    texto:
      "Como apresentar, precificar e empacotar o seu projeto para que o cliente enxergue valor técnico, e não uma planilha de preço mais barato.",
  },
  {
    numero: "03",
    nome: "Prospectar",
    resumo: "Encontrar, abordar e fechar",
    texto:
      "Onde estão os clientes de alto padrão, como chegar até eles, o que falar na primeira conversa e como conduzir a proposta até a assinatura.",
  },
];

export const BLOCOS = [
  {
    titulo: "Fundamentos e concepção estrutural",
    texto:
      "Como nasce uma estrutura: leitura do projeto arquitetônico, escolha do sistema, lançamento de pilares e vigas, caminho das cargas.",
  },
  {
    titulo: "Modelagem e dimensionamento",
    texto:
      "Modelagem no software, análise dos esforços, dimensionamento de lajes, vigas, pilares e fundações dentro das normas brasileiras.",
  },
  {
    titulo: "Projetos reais de alto padrão",
    texto:
      "Acompanhamento de projetos completos, do briefing à entrega, com as decisões e os ajustes reais que aparecem no meio do caminho.",
  },
  {
    titulo: "Detalhamento e entrega",
    texto:
      "Pranchas, armaduras, compatibilização e o pacote final que você entrega ao cliente e à obra — no padrão de um escritório profissional.",
  },
  {
    titulo: "Precificação e propostas",
    texto:
      "Como formar o seu preço, montar a proposta comercial e apresentar o orçamento sem competir por ser o mais barato.",
  },
  {
    titulo: "Captação e fechamento de clientes",
    texto:
      "Prospecção ativa, parcerias com arquitetos e construtoras, portfólio, abordagem e condução da negociação até o fechamento.",
  },
];

/** PREENCHER: renders/projetos reais. `src` deve apontar para /public. */
export const PROJETOS: { src: string; alt: string }[] = [
  // { src: "/meap/projeto-01.jpg", alt: "Estrutura residencial de alto padrão" },
];

/** PREENCHER: depoimentos reais de alunos, com autorização de uso. */
export const DEPOIMENTOS: { nome: string; papel: string; texto: string }[] = [
  // { nome: "", papel: "", texto: "" },
];

export const AUTORA = {
  nome: "Queren Costa",
  chamada: "Especialista em Projetos Estruturais de Alto Padrão.",
  /** PREENCHER: foto da Queren em /public. */
  foto: "", // ex.: "/meap/queren.jpg"
  // Bio da própria página de captura, para manter uma única voz entre as duas.
  paragrafos: [
    "Especialista em Projetos Estruturais de Alto Padrão, Queren Costa consolidou sua carreira transformando teoria complexa em resultado financeiro e em estruturas reais, entregues em várias construções de alto padrão.",
    "Com anos de experiência no mercado, ela decidiu ensinar o caminho que percorreu: como dominar estruturas com segurança e faturar mais de R$ 7.000 extras por mês fazendo isso.",
    "Sua metodologia foca no que realmente importa: a prática do escritório, a captação de clientes de alto valor e a execução técnica impecável que o mercado premium exige.",
  ],
  /** PREENCHER: números verificáveis. */
  numeros: [] as { valor: string; rotulo: string }[],
  // ex.: [{ valor: "+300", rotulo: "alunos formados" }]
};

export const ENTREGAS = [
  "Curso completo do MEAP, do lançamento estrutural à entrega do projeto",
  "Aulas de projetos reais, acompanhados do briefing à prancha final",
  "Módulo de precificação, com o método para formar o seu preço",
  "Módulo de captação e vendas, com abordagens prontas",
  "Modelos de proposta comercial e de contrato",
  "Suporte para tirar dúvidas técnicas durante o curso",
  "Acesso por 12 meses, com atualizações incluídas", // PREENCHER: confirmar prazo
  "Certificado de conclusão",
];

export const FAQ = [
  {
    pergunta: "Preciso já saber projetar estruturas?",
    resposta:
      "Não. O curso começa nos fundamentos, do lançamento estrutural em diante. Se você é estudante dos períodos finais ou engenheiro formado, consegue acompanhar do começo ao fim.",
  },
  {
    pergunta: "Qual software é usado?",
    resposta:
      "As aulas seguem o fluxo de trabalho de um escritório de projeto estrutural. O raciocínio ensinado — concepção, análise e detalhamento — vale para qualquer software do mercado.",
  },
  {
    pergunta: "Sou recém-formado. Consigo mesmo conseguir cliente?",
    resposta:
      "Os módulos de posicionamento e prospecção existem justamente para isso: montar portfólio antes de ter carteira, definir preço sem histórico e abordar arquitetos e construtoras do zero.",
  },
  {
    pergunta: "Como funciona o suporte?",
    resposta:
      "Você pode enviar suas dúvidas técnicas durante o curso e recebe retorno da equipe — inclusive sobre projetos que estiver desenvolvendo.",
  },
  {
    pergunta: "Por quanto tempo tenho acesso?",
    resposta:
      "O acesso vale por 12 meses a partir da matrícula, incluindo as atualizações lançadas nesse período.", // PREENCHER: confirmar
  },
  {
    pergunta: "Recebo certificado?",
    resposta: "Sim, você recebe certificado de conclusão ao final do curso.",
  },
  {
    pergunta: "E se eu não gostar?",
    resposta:
      "Você tem 7 dias de garantia. Entrou, assistiu e concluiu que não é para você? Basta pedir o reembolso dentro desse prazo e devolvemos 100% do valor.",
  },
];
