// Clientes do carrossel da seção "Clientes": os 21 cases do site da Smart Opus (empresa do mesmo grupo)
// e clientes antigos da T9, como o AES Sports Legacy Channel.
// A primeira metade vai na fileira de cima e a segunda na de baixo. O carrossel mostra só o logo
// (ou o nome, enquanto não houver logo); os demais campos ficam guardados para uma versão com detalhes.
// Para adicionar um cliente, inclua um item aqui. Logo opcional: arquivo em public/cases/,
// em branco com fundo transparente (o fundo do site é escuro). Sem itens, a seção não aparece.

export type Case = {
  cliente: string;
  /** Ex.: "/cases/minha-marca.png" */
  logo?: string;
  /** Largura ÷ altura do logo, para logos quadrados e compridos terem o mesmo peso visual. */
  logoProporcao?: number;
  // Detalhes do case (vindos da Smart Opus). O carrossel não os mostra; ficam
  // guardados para uma versão com cards. Cliente sem case publicado fica sem eles.
  iniciais?: string;
  segmento?: string;
  local?: string;
  destaque?: { valor: string; legenda: string };
  /** Uma ou duas frases: o que foi feito. */
  resumo?: string;
};

export const CASES: Case[] = [
  {
    cliente: "Habemus Domus",
    logo: "/cases/habemus-domus.png",
    logoProporcao: 0.93,
    iniciais: "HD",
    segmento: "Imobiliário & Loteamentos",
    local: "Portugal",
    destaque: { valor: "+50%", legenda: "em vendas com recuperação de leads antigos" },
    resumo:
      "Funcionário de IA que reativa a base parada, requalifica o interesse e devolve o lead pronto para o corretor.",
  },
  {
    cliente: "Tua Casa Gaia",
    logo: "/cases/tua-casa-gaia.png",
    logoProporcao: 0.89,
    iniciais: "TC",
    segmento: "Imobiliário & Loteamentos",
    local: "Portugal",
    destaque: { valor: "−94%", legenda: "no tempo de resposta ao lead" },
    resumo:
      "Atendimento automatizado que responde em segundos, qualifica o interesse e organiza a jornada no CRM.",
  },
  {
    cliente: "Jardim Ouro Verde",
    logo: "/cases/jardim-ouro-verde.png",
    logoProporcao: 2.83,
    iniciais: "JV",
    segmento: "Imobiliário & Loteamentos",
    local: "Brasília · Brasil",
    destaque: { valor: "+128%", legenda: "conversão do estande de vendas" },
    resumo:
      "SDR com IA que qualifica, agenda a visita, lembra o cliente antes e faz a pesquisa de NPS depois.",
  },
  {
    cliente: "Eduardo Imóveis",
    logo: "/cases/eduardo-vieira.png",
    logoProporcao: 1.02,
    iniciais: "EI",
    segmento: "Imobiliário & Loteamentos",
    local: "João Pessoa · Brasil",
    destaque: { valor: "R$ 10 milhões", legenda: "em vendas" },
    resumo:
      "Funcionário de IA que qualifica a faixa de investimento com discrição e conduz o cliente até a visita privativa.",
  },
  {
    cliente: "ABC Construtora",
    iniciais: "ABC",
    segmento: "Construção & Locações",
    local: "Goiânia · Brasil",
    destaque: { valor: "−58%", legenda: "na inadimplência da carteira" },
    resumo:
      "Régua de cobrança automatizada, com lembretes antecipados e notificações extrajudiciais programadas.",
  },
  {
    cliente: "Trevo Locações",
    logo: "/cases/trevo-locacoes.png",
    logoProporcao: 4.83,
    iniciais: "TL",
    segmento: "Construção & Locações",
    local: "Rio Grande do Sul · Brasil",
    destaque: { valor: "R$ 200 mil+", legenda: "em oportunidades qualificadas" },
    resumo:
      "Atendimento único para as três unidades, com consulta ao sistema e triagem automática de quem procura equipamento.",
  },
  {
    cliente: "FisioAcademy",
    logo: "/cases/fisioacademy.png",
    logoProporcao: 5.64,
    iniciais: "FA",
    segmento: "Saúde & Clínicas",
    local: "Caxias do Sul · Garibaldi · Bento Gonçalves",
    destaque: { valor: "−31%", legenda: "em custos operacionais" },
    resumo:
      "Sistema próprio de gestão com financeiro, contas, métricas por funcionário e dashboards de performance.",
  },
  {
    cliente: "Dr. Jorge Cecílio Daher Jr.",
    logo: "/cases/clinica-daher.png",
    logoProporcao: 6.43,
    iniciais: "JD",
    segmento: "Saúde & Clínicas",
    local: "Goiás · Brasil",
    destaque: { valor: "R$ 25 mil+", legenda: "por ano economizados com o funcionário de IA" },
    resumo:
      "Funcionário de IA que atende o paciente, organiza a agenda da clínica de endocrinologia e confirma a consulta sozinho.",
  },
  {
    cliente: "Farmácia Cristo",
    logo: "/cases/farmacia-cristo.png",
    logoProporcao: 2.44,
    iniciais: "FC",
    segmento: "Saúde & Clínicas",
    local: "Brasil",
    destaque: { valor: "3 unidades", legenda: "abertas com a expansão da operação digital" },
    resumo:
      "A operação digital que sustentou a expansão: aquisição, atendimento e processo replicados em cada nova unidade.",
  },
  {
    cliente: "Kontrolsat",
    logo: "/cases/kontrolsat.png",
    logoProporcao: 4.17,
    iniciais: "KS",
    segmento: "Varejo & E-commerce",
    local: "Portugal",
    destaque: { valor: "+47%", legenda: "de carrinhos recuperados" },
    resumo:
      "Assistentes de IA para suporte, pós-venda, recomendação de produtos e recuperação de vendas abandonadas.",
  },
  {
    cliente: "PetLand",
    iniciais: "PL",
    segmento: "Varejo & E-commerce",
    local: "Argentina",
    destaque: { valor: "+53%", legenda: "de recompra na base de clientes" },
    resumo:
      "Atendimento em espanhol que recomenda ração e acessórios por porte do pet e lembra a reposição na hora certa.",
  },
  {
    cliente: "Sunset Store",
    logo: "/cases/sunset-store.png",
    logoProporcao: 0.91,
    iniciais: "SS",
    segmento: "Varejo & E-commerce",
    local: "Flórida · Estados Unidos",
    destaque: { valor: "+R$ 62 mil", legenda: "por mês em vendas no atendimento bilíngue" },
    resumo:
      "Atendimento bilíngue com IA, consulta de estoque em tempo real e recomendação por numeração e estilo.",
  },
  {
    cliente: "Premium Peptides",
    logo: "/cases/premium-peptides.png",
    logoProporcao: 4.67,
    iniciais: "PP",
    segmento: "Varejo & E-commerce",
    local: "Flórida · Estados Unidos",
    destaque: { valor: "+R$ 88 mil", legenda: "por mês em pedidos recorrentes" },
    resumo:
      "Assistente que orienta a escolha do produto, acompanha o pedido e reativa a base na recompra.",
  },
  {
    cliente: "Get In",
    logo: "/cases/get-in.png",
    logoProporcao: 0.93,
    iniciais: "GI",
    segmento: "Mobilidade & Transporte",
    local: "Flórida · Estados Unidos",
    destaque: { valor: "100%", legenda: "digital — a 1ª locadora do tipo na Flórida" },
    resumo:
      "Da captação ao fechamento, uma operação de locação construída para rodar inteira no digital.",
  },
  {
    cliente: "IturanMob",
    logo: "/cases/ituranmob.png",
    logoProporcao: 6.14,
    iniciais: "IM",
    segmento: "Mobilidade & Transporte",
    local: "Brasil",
    destaque: { valor: "Todo dia", legenda: "com novos clientes entrando pelo funil" },
    resumo:
      "Digitalizamos a operação de uma empresa de capital aberto e construímos o funil que hoje traz cliente novo todos os dias.",
  },
  {
    cliente: "Buffet Evento Perfeito",
    logo: "/cases/buffet-evento-perfeito.png",
    logoProporcao: 1.47,
    iniciais: "EP",
    segmento: "Eventos & Casamentos",
    local: "São Paulo · Brasil",
    destaque: { valor: "+70 mil", legenda: "leads entregues no último ano" },
    resumo:
      "Distribuição automática dos leads entre 30 consultores, pelo mais adequado e disponível.",
  },
  {
    cliente: "Campanhas Eleitorais",
    iniciais: "CE",
    segmento: "Política & Eleições",
    local: "Goiás · Brasil",
    destaque: { valor: "+20 mil", legenda: "disparos sem um único banimento" },
    resumo:
      "API oficial do WhatsApp para disparos em escala, com clone de IA do candidato respondendo eleitor por eleitor.",
  },
  {
    cliente: "FD Sistemas",
    iniciais: "FD",
    segmento: "Serviços B2B",
    local: "São Paulo · Brasil",
    destaque: { valor: "−1.800", legenda: "tickets de suporte por mês" },
    resumo:
      "Assistentes que atendem alunos 24 horas por dia e convertem novos interessados na plataforma EAD.",
  },
  {
    cliente: "De Vie Joalheria",
    logo: "/cases/dvie-joalheria.png",
    logoProporcao: 1.39,
    iniciais: "DV",
    segmento: "Joalherias",
    local: "Rio Grande do Sul · Brasil",
    destaque: { valor: "R$ 80 mil", legenda: "por ano economizados em produção de books" },
    resumo:
      "Books profissionais das peças gerados por IA, sem estúdio nem sessão de fotos a cada nova coleção.",
  },
  {
    cliente: "Kits Higiene",
    logo: "/cases/kits-higiene.png",
    logoProporcao: 2.65,
    iniciais: "KH",
    segmento: "Varejo & E-commerce",
    local: "São Paulo · Brasil",
    destaque: { valor: "24/7", legenda: "de atendimento desde o primeiro dia" },
    resumo:
      "Tráfego e infraestrutura de IA no mesmo projeto: a mídia alimenta o funil, o funcionário de IA atende e qualifica.",
  },
  {
    cliente: "Porto Menina",
    logo: "/cases/porto-menina.png",
    logoProporcao: 2.68,
    iniciais: "PM",
    segmento: "Varejo & E-commerce",
    local: "Brasil",
    destaque: { valor: "R$ 100 mil", legenda: "de faturamento, partindo do zero" },
    resumo:
      "Loja de calçados femininos construída do zero: presença digital, aquisição e atendimento na mesma estrutura.",
  },
  {
    cliente: "AES Sports Legacy Channel",
    logo: "/cases/aes.png",
    logoProporcao: 0.90,
  },
];
