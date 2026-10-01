// Cases exibidos na seção "Cases" (mesmos clientes do site da Smart Opus, do mesmo grupo).
// Para adicionar um cliente, inclua um item aqui. Logo opcional: arquivo em
// public/cases/ (PNG/SVG transparente e claro, o fundo é escuro); sem logo,
// o card mostra as iniciais. Sem itens, a seção não aparece no site.

export type Case = {
  cliente: string;
  iniciais: string;
  segmento: string;
  local: string;
  /** Ex.: "/cases/minha-marca.svg" */
  logo?: string;
  destaque: { valor: string; legenda: string };
  /** Uma ou duas frases: o que foi feito. */
  resumo: string;
};

export const CASES: Case[] = [
  {
    cliente: "Habemus Domus",
    iniciais: "HD",
    segmento: "Imobiliário & Loteamentos",
    local: "Portugal",
    destaque: { valor: "+50%", legenda: "em vendas com recuperação de leads antigos" },
    resumo: "Funcionário de IA que reativa a base parada, requalifica o interesse e devolve o lead pronto para o corretor.",
  },
  {
    cliente: "Tua Casa Gaia",
    iniciais: "TC",
    segmento: "Imobiliário & Loteamentos",
    local: "Portugal",
    destaque: { valor: "−94%", legenda: "no tempo de resposta ao lead" },
    resumo: "Atendimento automatizado que responde em segundos, qualifica o interesse e organiza a jornada no CRM.",
  },
  {
    cliente: "Jardim Ouro Verde",
    iniciais: "JV",
    segmento: "Imobiliário & Loteamentos",
    local: "Brasília · Brasil",
    destaque: { valor: "+128%", legenda: "de conversão no estande de vendas" },
    resumo: "SDR com IA que qualifica, agenda a visita, lembra o cliente antes e faz a pesquisa de NPS depois.",
  },
  {
    cliente: "Eduardo Imóveis",
    iniciais: "EI",
    segmento: "Imobiliário & Loteamentos",
    local: "João Pessoa · Brasil",
    destaque: { valor: "R$ 10 mi", legenda: "em vendas" },
    resumo: "Funcionário de IA que qualifica a faixa de investimento com discrição e conduz o cliente até a visita privativa.",
  },
  {
    cliente: "ABC Construtora",
    iniciais: "ABC",
    segmento: "Construção & Locações",
    local: "Goiânia · Brasil",
    destaque: { valor: "−58%", legenda: "na inadimplência da carteira" },
    resumo: "Régua de cobrança automatizada, com lembretes antecipados e notificações extrajudiciais programadas.",
  },
  {
    cliente: "Trevo Locações",
    iniciais: "TL",
    segmento: "Construção & Locações",
    local: "Rio Grande do Sul · Brasil",
    destaque: { valor: "R$ 200 mil+", legenda: "em oportunidades qualificadas" },
    resumo: "Atendimento único para as três unidades, com consulta ao sistema e triagem automática de quem procura equipamento.",
  },
  {
    cliente: "FisioAcademy",
    iniciais: "FA",
    segmento: "Saúde & Clínicas",
    local: "Caxias do Sul · Garibaldi · Bento Gonçalves",
    destaque: { valor: "−31%", legenda: "em custos operacionais" },
    resumo: "Sistema próprio de gestão com financeiro, contas, métricas por funcionário e dashboards de performance.",
  },
  {
    cliente: "Dr. Jorge Cecílio Daher Jr.",
    iniciais: "JD",
    segmento: "Saúde & Clínicas",
    local: "Goiás · Brasil",
    destaque: { valor: "R$ 25 mil+", legenda: "por ano economizados com o funcionário de IA" },
    resumo: "Funcionário de IA que atende o paciente, organiza a agenda da clínica de endocrinologia e confirma a consulta sozinho.",
  },
  {
    cliente: "Farmácia Cristo",
    iniciais: "FC",
    segmento: "Saúde & Clínicas",
    local: "Brasil",
    destaque: { valor: "3 unidades", legenda: "abertas com a expansão da operação digital" },
    resumo: "A operação digital que sustentou a expansão: aquisição, atendimento e processo replicados em cada nova unidade.",
  },
  {
    cliente: "Kontrolsat",
    iniciais: "KS",
    segmento: "Varejo & E-commerce",
    local: "Portugal",
    destaque: { valor: "+47%", legenda: "de carrinhos recuperados" },
    resumo: "Assistentes de IA para suporte, pós-venda, recomendação de produtos e recuperação de vendas abandonadas.",
  },
  {
    cliente: "PetLand",
    iniciais: "PL",
    segmento: "Varejo & E-commerce",
    local: "Argentina",
    destaque: { valor: "+53%", legenda: "de recompra na base de clientes" },
    resumo: "Atendimento em espanhol que recomenda ração e acessórios por porte do pet e lembra a reposição na hora certa.",
  },
];
