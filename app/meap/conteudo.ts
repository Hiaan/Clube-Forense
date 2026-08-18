// Todo o texto da página de vendas do MEAP fica aqui, separado do layout, para
// que a copy possa ser ajustada sem mexer em JSX.
//
// ATENÇÃO: os itens marcados com `// PREENCHER` são espaços reservados para
// dados reais (números, depoimentos, imagens de projetos). Nada aqui pode ir ao
// ar como prova social sem ser verdadeiro — troque antes de publicar.

/**
 * Checkout na Hotmart.
 *
 * Só o botão de dentro do cartão do preço aponta para cá. Todos os outros
 * botões da página levam para a seção da oferta (`#oferta`), para a pessoa ver
 * o preço e o que está incluso antes de sair da página — quem manda o tráfego
 * frio direto para o checkout perde a leitura da oferta.
 */
export const CHECKOUT_URL =
  "https://pay.hotmart.com/S107175977E?off=ocburh69&bid=1787074079347";

/** Âncora da seção da oferta, para onde vão os demais botões. */
export const ANCORA_OFERTA = "#oferta";

/** Contato exibido no rodapé — o mesmo da página de captura. */
export const CONTATO = "contato@engquerencosta.com";

/**
 * WhatsApp do botão flutuante.
 *
 * CONFERIR: o número veio como "+55 83 8600-8392", que tem 8 dígitos depois do
 * DDD. Celular no Brasil tem 9 e começa em 9, então provavelmente falta o 9 —
 * seria 5583986008392. Está no ar exatamente como foi passado; se o link não
 * abrir a conversa certa, é este dígito.
 */
export const WHATSAPP = {
  /** Só dígitos, no formato que o wa.me espera: DDI + DDD + número. */
  numero: "558386008392",
  exibicao: "+55 83 8600-8392",
  mensagem: "Olá! Vim pela página do MEAP e quero saber mais sobre o curso.",
};

/**
 * Imagens hospedadas no Wix, que é onde a página de captura já as serve.
 *
 * ATENÇÃO: enquanto apontarem para cá, esta página depende do site do Wix
 * continuar no ar. Para cortar essa dependência, baixe os arquivos, coloque em
 * `/public/meap/` e troque as URLs por caminhos locais (ex.: "/meap/queren.png").
 */
export const MARCA = {
  logo: "https://static.wixstatic.com/media/240889_87af9e2b8b5743488bd1cf489270ee2e~mv2.png",
  logoAlt: "Queren Costa Engenharia",
};

export const HERO = {
  eyebrow: "MEAP – Método Estruturas de Alto Padrão",
  sub: "que irão mudar sua realidade como engenheiro(a) civil.",
  bullets: [
    "Desenvolva 2 Projetos Estruturais Reais do Início ao Fim",
    "Aprenda a Precificar e Vender Seus Projetos",
    "Tenha Mais Segurança Para Atuar no Mercado",
    "Aulas Gravadas + Grupo Exclusivo no WhatsApp",
    "Planilhas, PDFs e Materiais Práticos",
    "Bônus: Mentoria Quinzenal ao Vivo",
  ],
  cta: "QUERO ME INSCREVER AGORA",
  escassez: "Mentoria quinzenal ao vivo para os 15 primeiros — garanta a sua vaga",
  // PNG recortado, 1080x1350, com o grafismo do "QC" já embutido atrás dela.
  // Fica no repositório em vez de vir do Wix: o next/image só otimiza o que
  // pode ler, e servir local também tira uma dependência externa do caminho
  // crítico da hero.
  foto: "/queren-hero.png",
  fotoAlt: "Queren Costa",
};

export const PRECO = {
  aVista: "R$ 497",
  parcelado: "12x de R$ 51,40",
  ancora: "R$ 997", // preço cheio, confirmado pela Queren
};

export const OPORTUNIDADE = {
  // Mesmo título da página de captura — quem chega de lá reconhece a promessa.
  titulo: "A oportunidade que muitos engenheiros deixam passar.",
  paragrafos: [
    "Existe um mercado específico dentro dos projetos estruturais que combina clientes com maior poder de investimento, projetos de boa rentabilidade e complexidade acessível: projetos estruturais de alto padrão.",
    "É uma oportunidade para aumentar o faturamento com projetos valorizados, sem precisar abandonar a atividade que você já exerce hoje.",
  ],
  meta: {
    valor: "R$ 7 mil",
    texto:
      "é o valor médio que você como engenheiro consegue adicionar por mês, sem abrir mão do que faz hoje.",
  },
};

/**
 * Seção "Você se encaixa em algum perfil abaixo?".
 *
 * `icone` referencia um dos desenhos declarados em `Icone`, dentro de page.tsx.
 */
export const PERFIS = {
  titulo: "Você se encaixa em algum",
  tituloDestaque: "perfil abaixo?",
  chamada:
    "Descubra como atuar no nicho mais rentável da engenharia estrutural — o mesmo que ainda passa despercebido pela maioria dos engenheiros.",
  itens: [
    {
      icone: "livro" as const,
      titulo: "Estudantes de Engenharia",
      texto:
        "Para quem quer sair da faculdade já dominando uma área de excelente retorno financeiro e entrar com o pé direito no mercado.",
    },
    {
      icone: "capelo" as const,
      titulo: "Engenheiros recém-formados",
      texto:
        "Para quem quer dar os primeiros passos em projetos estruturais com segurança, método e experiência prática em projetos reais.",
    },
    {
      icone: "dinheiro" as const,
      titulo: "Para quem quer uma segunda renda",
      texto:
        "Para você que quer aprender a fazer projetos estruturais e ter uma segunda renda de pelo menos 7 mil extras.",
    },
    {
      icone: "maleta" as const,
      titulo: "Empreendedor",
      texto:
        "Iniciar ou empreender através do seu escritório de engenharia e faturar muito mais.",
    },
    {
      icone: "capacete" as const,
      titulo: "Engenheiros atuantes",
      texto:
        "Para quem já está no mercado, mas quer ganhar mais segurança técnica, aprimorar seus projetos e atuar com serviços de maior valor.",
    },
    {
      icone: "moedas" as const,
      titulo: "Quem quer atuar no mercado de alto padrão",
      texto:
        "Para quem quer trabalhar com clientes que valorizam o serviço, aumentar o ticket dos projetos e construir uma atuação mais rentável.",
    },
  ],
};

/** Selos de confiança, exibidos sob os botões de compra. */
export const SELOS = [
  { icone: "escudo" as const, linha1: "Compra", linha2: "Segura" },
  { icone: "trofeu" as const, linha1: "Satisfação", linha2: "Garantida" },
  { icone: "cadeado" as const, linha1: "Privacidade", linha2: "Protegida" },
];

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
      "Concepção, lançamento, modelagem, dimensionamento e detalhamento. Aprenda a tomar decisões estruturais com critério e segurança em cada etapa do projeto.",
  },
  {
    numero: "02",
    nome: "Posicionar",
    resumo: "Transforme projeto em um serviço valorizado",
    texto:
      "Aprenda como apresentar, precificar e valorizar seu trabalho para que o cliente enxergue o valor técnico da sua entrega — e não escolha apenas pelo menor preço.",
  },
  {
    numero: "03",
    nome: "Prospectar",
    resumo: "Encontre, aborde e feche",
    texto:
      "Entenda onde estão os clientes do mercado de alto padrão, como chegar até eles, o que falar e como conduzir a negociação até o fechamento.",
  },
];

/**
 * Módulos do curso.
 *
 * As artes já trazem o nome do módulo e a numeração dentro da própria imagem,
 * então o cartão do carrossel não imprime título nem descrição: qualquer texto
 * ao lado repetiria o que está no JPEG.
 *
 * O `alt` carrega o que está escrito na arte, e não uma descrição genérica. É o
 * único lugar onde esse texto existe em HTML — sem ele, nem leitor de tela nem
 * buscador têm como saber o que são os doze cartões.
 */
export const MODULOS = [
  { imagem: "/modulos/1.jpg", alt: "Módulo 1 — Apresentações e boas-vindas" },
  { imagem: "/modulos/2.jpg", alt: "Módulo 2 — Concepção estrutural" },
  { imagem: "/modulos/3.jpg", alt: "Módulo 3 — Iniciando o primeiro projeto" },
  {
    imagem: "/modulos/4.jpg",
    alt: "Módulo 4 — Desenvolvendo o primeiro projeto",
  },
  { imagem: "/modulos/5.jpg", alt: "Módulo 5 — Otimizando o primeiro projeto" },
  { imagem: "/modulos/6.jpg", alt: "Módulo 6 — Finalizando o primeiro projeto" },
  { imagem: "/modulos/7.jpg", alt: "Módulo 7 — Iniciando o segundo projeto" },
  {
    imagem: "/modulos/8.jpg",
    alt: "Módulo 8 — Desenvolvendo o segundo projeto",
  },
  { imagem: "/modulos/9.jpg", alt: "Módulo 9 — Otimizando o segundo projeto" },
  {
    imagem: "/modulos/10.jpg",
    alt: "Módulo 10 — Finalizando o segundo projeto",
  },
  { imagem: "/modulos/11.jpg", alt: "Módulo bônus — Empreendedorismo" },
  { imagem: "/modulos/12.jpg", alt: "Módulo bônus — Planilhas, PDFs e mais" },
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
  // Mesmo retrato usado na seção "Quem é Queren Costa" da captura.
  foto: "https://static.wixstatic.com/media/240889_ba02552268b8448ebd215fa6dfd331db~mv2.png/v1/fill/w_603,h_754,al_c,q_90,enc_auto/IMG_2968_heic.png",
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

/** Seção de quebra de objeção, antes da oferta. */
export const SOZINHO = {
  titulo: "Sim, você até poderia tentar sozinho…",
  paragrafos: [
    "Mas pode aprender direto com quem já vive disso e já descobriu, na prática, o que realmente funciona.",
    "No MEAP, você aprende o caminho técnico e comercial para atuar com mais segurança, precificar corretamente e apresentar seus projetos ao cliente.",
    "E não fica só na teoria: vamos desenvolver juntos 2 projetos estruturais reais, contratados por clientes da minha empresa, do início ao fim.",
    "Assim, você começa a ganhar experiência prática antes mesmo de conquistar o seu primeiro cliente.",
  ],
  // Arte da área de membros, 1080x1080 com fundo transparente. O conteúdo
  // ocupa só a faixa do meio, então a página corta o vazio de cima e de baixo.
  imagem:
    "https://static.wixstatic.com/media/240889_b8f92219f4d64cf0ab69ebe7b39c2db7~mv2.png",
};

/** Bônus entregues junto com o curso. */
export const BONUS = {
  titulo: "E ainda leve de",
  tituloDestaque: "bônus",
  tituloFim: "o acesso a",
  itens: [
    {
      tipo: "celular" as const,
      etiqueta: "Grupo VIP",
      headline: "Nosso Grupo VIP no WhatsApp",
      texto:
        "Aqui todo mundo persegue a mesma coisa: fazer projetos estruturais de verdade. No grupo você tira dúvida técnica, mostra o que está desenvolvendo, vê o projeto dos outros alunos e evolui junto com quem está na mesma estrada.",
      /**
       * PREENCHER: print real do grupo. Enquanto estiver vazio, o aparelho
       * mostra a conversa de exemplo abaixo, que é ilustração de interface —
       * não é conversa real de aluno e por isso não traz nome, elogio nem
       * promessa de resultado.
       */
      imagem: "",
      grupo: "MEAP · Grupo VIP",
      conversa: [
        {
          de: "aluno" as const,
          texto: "Posso engastar a laje na viga em balanço?",
        },
        {
          de: "queren" as const,
          texto:
            "Depende da continuidade. Em balanço eu reveria a carga antes — te mostro no projeto 02.",
        },
        { de: "aluno" as const, texto: "Fechou, vou refazer o lançamento hoje." },
      ],
    },
    {
      tipo: "planilha" as const,
      etiqueta: "Materiais editáveis",
      headline: "Planilha de precificação e modelos de proposta",
      texto:
        "Os mesmos arquivos que eu uso no escritório, liberados para você editar: a planilha que fecha o preço do projeto e os modelos de proposta comercial. É abrir, colocar os seus números e enviar para o cliente.",
      // Mockup do notebook com a planilha aberta e os ícones de PDF e Excel.
      imagem: "/bonus-planilha.png",
      arquivo: "Precificação — Projeto Estrutural",
      colunas: ["Item", "Qtd", "Valor"],
      linhas: [
        ["Lançamento estrutural", "1", "—"],
        ["Dimensionamento", "1", "—"],
        ["Detalhamento", "1", "—"],
        ["Total da proposta", "", "—"],
      ],
    },
  ],
};

/**
 * Bônus da mentoria — seção própria, em pêssego, entre os bônus e a oferta.
 *
 * É o gatilho de urgência da página. O número de vagas repete na linha abaixo
 * do CTA da hero, no que está incluso e no FAQ: mexeu aqui, confira os três.
 */
export const MENTORIA = {
  tag: "Bônus exclusivo · 1ª turma",
  titulo:
    "E entrando agora, você ainda terá meu acompanhamento ao vivo a cada 15 dias.",
  chamada:
    "Uma mentoria que poderia facilmente custar mais de R$ 2.000, incluída sem nenhum custo extra para os 15 primeiros alunos do MEAP.",
  // 1080x1080 com fundo transparente: o notebook ocupa o meio e sobra vazio
  // nos cantos, que é onde as etiquetas flutuantes se encaixam sem cobrir a
  // tela.
  imagem: "/mentoria.png",
  imagemAlt:
    "Notebook aberto numa chamada do Google Meet, com um projeto estrutural sendo revisado na tela",
  // Lidas nesta ordem pelo mockup: vagas, ao vivo, cadência.
  etiquetas: ["15 vagas", "Ao vivo", "A cada 15 dias"],
  selo: {
    rotulo: "Valor estimado",
    de: "R$ 2.000+",
    por: "Hoje: R$ 0",
  },
  aviso:
    "Essa condição é EXCLUSIVA da 1ª turma do MEAP e não pretendemos repeti-la nas próximas turmas.",
  cta: "QUERO GARANTIR A MENTORIA + MEAP",
};

/** Garantia, logo depois do preço. */
export const GARANTIA = {
  etiqueta: "Risco zero",
  titulo: "Garantia incondicional de 7 dias",
  chamada: "Pode comprar sem medo.",
  texto:
    "Entre, assista às aulas, abra os projetos e veja por dentro. Se em até 7 dias você concluir que o MEAP não é para você, basta pedir o reembolso — sem formulário, sem justificativa e sem pergunta nenhuma. Devolvemos 100% do valor.",
};

/** Faixa diagonal em movimento, logo antes do preço. */
export const URGENCIA = {
  frase: "Condições exclusivas de lançamento",
  /** Quantas vezes a frase se repete em cada volta da faixa. */
  repeticoes: 6,
};

export const OFERTA = {
  titulo: "Quanto você precisará investir?",
  apoio: "Tudo isso pelo valor menor que o de uma pizza por mês.",
  /**
   * Gatilho da mentoria repetido dentro do cartão do preço, que é onde a
   * decisão acontece. O número de vagas também aparece na hero, na seção da
   * mentoria e no FAQ: mexeu aqui, confira os outros três.
   */
  gatilho: {
    etiqueta: "Bônus da 1ª turma · 15 vagas",
    texto:
      "Os 15 primeiros inscritos entram na mentoria quinzenal ao vivo com a Queren. Depois disso, ela sai do pacote.",
  },
  produto: "MEAP",
  produtoLinha2: "Método Estruturas de Alto Padrão",
  antes: "o MEAP sai por:",
  ctaCartao: "QUERO GARANTIR MINHA VAGA",
};

export const ENTREGAS = [
  "Curso completo do MEAP, do lançamento estrutural à entrega do projeto",
  "Dois projetos estruturais desenvolvidos do zero, do briefing à prancha final",
  "Aulas gravadas, para assistir no seu ritmo",
  "Módulo de precificação, com o método para formar o seu preço",
  "Módulo de captação e vendas, com abordagens prontas",
  "Modelos de proposta comercial e de contrato",
  "Grupo VIP no WhatsApp, junto com os outros alunos",
  "Suporte para tirar dúvidas técnicas durante o curso",
  "Mentoria quinzenal ao vivo no Google Meet — bônus para os 15 primeiros",
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
      "As aulas usam o Eberick, e um dos objetivos do curso é justamente você dominá-lo. O raciocínio ensinado — concepção, análise e detalhamento — vale para qualquer software do mercado.",
  },
  {
    pergunta: "Sou recém-formado. Consigo mesmo conseguir cliente?",
    resposta:
      "Os módulos de posicionamento e prospecção existem justamente para isso: montar portfólio antes de ter carteira, definir preço sem histórico e abordar arquitetos e construtoras do zero.",
  },
  {
    pergunta: "As aulas são ao vivo ou gravadas?",
    resposta:
      "As aulas do curso são gravadas: você assiste no seu ritmo, quantas vezes quiser, e volta na aula que precisar enquanto desenvolve os seus próprios projetos. Ao vivo há a mentoria quinzenal, que é bônus para os 15 primeiros inscritos.",
  },
  {
    pergunta: "Como funciona o suporte?",
    resposta:
      "Você pode enviar suas dúvidas técnicas durante o curso e recebe retorno da equipe — inclusive sobre projetos que estiver desenvolvendo. Fora isso, tem o Grupo VIP no WhatsApp.",
  },
  {
    pergunta: "Como funciona a mentoria quinzenal?",
    resposta:
      "São encontros ao vivo no Google Meet, a cada quinze dias, para tirar dúvidas de projeto e aprofundar conteúdo que não cabe nas aulas gravadas. É um bônus exclusivo para os 15 primeiros inscritos: quem entrar depois recebe todo o resto do curso, mas não a mentoria.",
  },
  {
    pergunta: "E se eu não gostar?",
    resposta:
      "Você tem 7 dias de garantia. Entrou, assistiu e concluiu que não é para você? Basta pedir o reembolso dentro desse prazo e devolvemos 100% do valor.",
  },
];
