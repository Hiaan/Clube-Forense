// Distribuição dos IMLs por estado.
//
// Fica no código pelo mesmo motivo da curadoria, dos aprovados e do plano de
// carreira: é o piso. O painel continua sendo quem manda — assim que alguém
// edita os IMLs de um estado, o banco passa a responder por ele e isto aqui
// não é mais consultado para aquela UF.
//
// Levantado em agosto de 2026 nas fontes oficiais de cada órgão de perícia.
// Cada entrada diz de onde veio, porque um dado sem procedência é boato — e a
// tela mostra essa fonte junto da lista.
//
// O total é um campo à parte, e não a contagem das unidades: dá para saber que
// o estado tem 70 pontos e conhecer o endereço de 40. Quando não há número
// oficial confiável, o total fica nulo e o site conta as cidades. Dois estados
// entram só com o texto, sem lista: o órgão não publica as unidades de medicina
// legal por município, e cidade não confirmada mandaria o candidato a um lugar
// que não existe.

export interface UnidadeBase {
  cidade: string;
  /** Nome da unidade, quando ela tem um. */
  nome: string | null;
}

export interface ImlsBase {
  /** Total no estado.  quando não há número oficial confiável. */
  total: number | null;
  /** Como a rede é organizada — o que a lista de cidades não conta. */
  texto: string;
  /** De onde saiu, por extenso. */
  fonte: string;
  unidades: UnidadeBase[];
}

export const IMLS_BASE: Record<string, ImlsBase> = {
  SP: {
    total: 70,
    texto:
      "A perícia oficial paulista é da Superintendência da Polícia Técnico-Científica (Polícia Científica do Estado de São Paulo), que abriga o Instituto Médico Legal ao lado dos institutos de Criminalística e de Identificação. O IML se organiza em um Centro de Perícias na capital, um Núcleo de Perícias Médico-Legais (NPML) da Capital e Grande São Paulo e onze núcleos regionais no interior e litoral, aos quais se subordinam as Equipes de Perícias Médico-Legais (EPML) nos municípios-sede. A lista mostra apenas as sedes: a maioria dos 645 municípios paulistas não tem unidade própria e é atendida pela equipe ou núcleo da região. A estrutura completa (toxicologia, antropologia, odontologia legal, anatomia patológica) e o plantão ininterrupto se concentram na capital e nos núcleos maiores; equipes menores funcionam em regime reduzido ou por escala.",
    fonte:
      "Lista de Unidades do IML-SP publicada em PDF no site oficial da Polícia Científica do Estado de São Paulo / Superintendência da Polícia Técnico-Científica, versão de 01/10/2025, complementada pela página institucional de histórico do Instituto Médico Legal no mesmo site. Consulta em 08/2026.",
    unidades: [
      { cidade: "São Paulo", nome: "IML-CP – Centro de Perícias (sede)" },
      {
        cidade: "São Paulo",
        nome: "NPML-CAP – Núcleo de Perícias Médico-Legais da Capital e Grande São Paulo",
      },
      { cidade: "São Paulo", nome: "EPML-SPC – Equipe Centro" },
      { cidade: "São Paulo", nome: "EPML-SPS – Equipe Sul" },
      { cidade: "São Paulo", nome: "EPML-SPL1 – Equipe Leste" },
      { cidade: "São Paulo", nome: "EPML-SPO – Equipe Oeste" },
      { cidade: "São Paulo", nome: "EPML-SPN – Equipe Norte" },
      { cidade: "São Paulo", nome: "EPML-BMQ – Equipe Bem-Me-Quer" },
      { cidade: "São Paulo", nome: "EPML-HPP – Equipe DHPP" },
      { cidade: "Santo André", nome: "EPML-SAD – Equipe Santo André" },
      {
        cidade: "São Bernardo do Campo",
        nome: "EPML-SBC – Equipe São Bernardo do Campo",
      },
      { cidade: "Diadema", nome: "EPML-DIA – Equipe Diadema" },
      { cidade: "Franco da Rocha", nome: "EPML-FRO – Equipe Franco da Rocha" },
      { cidade: "Guarulhos", nome: "EPML-GRU – Equipe Guarulhos" },
      { cidade: "Mogi das Cruzes", nome: "EPML-MCR – Equipe Mogi das Cruzes" },
      { cidade: "Osasco", nome: "EPML-OSA – Equipe Osasco" },
      { cidade: "Taboão da Serra", nome: "EPML-TSE – Equipe Taboão da Serra" },
      { cidade: "Suzano", nome: "EPML-SUZ – Equipe Suzano" },
      { cidade: "Cotia", nome: "EPML-COT – Equipe Cotia" },
      { cidade: "Americana", nome: "NPML-AME – Núcleo de Americana" },
      { cidade: "Limeira", nome: "EPML-LIM – Equipe Limeira" },
      { cidade: "Piracicaba", nome: "EPML-PIR – Equipe Piracicaba" },
      { cidade: "Rio Claro", nome: "EPML-RCL – Equipe Rio Claro" },
      {
        cidade: "São João da Boa Vista",
        nome: "EPML-SBV – Equipe São João da Boa Vista",
      },
      { cidade: "Araçatuba", nome: "NPML-ARB – Núcleo de Araçatuba" },
      { cidade: "Andradina", nome: "EPML-AND – Equipe Andradina" },
      { cidade: "Lins", nome: "EPML-LIN – Equipe Lins" },
      { cidade: "Penápolis", nome: "EPML-PEN – Equipe Penápolis" },
      { cidade: "Araraquara", nome: "NPML-ARQ – Núcleo de Araraquara" },
      { cidade: "São Carlos", nome: "EPML-SCA – Equipe São Carlos" },
      { cidade: "Jaboticabal", nome: "EPML-JAB – Equipe Jaboticabal" },
      { cidade: "Bauru", nome: "NPML-BAU – Núcleo de Bauru" },
      { cidade: "Jaú", nome: "EPML-JAU – Equipe Jaú" },
      { cidade: "Marília", nome: "EPML-MAR – Equipe Marília" },
      { cidade: "Ourinhos", nome: "EPML-OUR – Equipe Ourinhos" },
      { cidade: "Tupã", nome: "EPML-TUP – Equipe Tupã" },
      { cidade: "Campinas", nome: "NPML-CPS – Núcleo de Campinas" },
      {
        cidade: "Bragança Paulista",
        nome: "EPML-BPA – Equipe Bragança Paulista",
      },
      { cidade: "Jundiaí", nome: "EPML-JUN – Equipe Jundiaí" },
      { cidade: "Mogi Guaçu", nome: "EPML-MGU – Equipe Mogi Guaçu" },
      {
        cidade: "Presidente Prudente",
        nome: "NPML-PPR – Núcleo de Presidente Prudente",
      },
      { cidade: "Assis", nome: "EPML-ASS – Equipe Assis" },
      {
        cidade: "Presidente Venceslau",
        nome: "EPML-PVE – Equipe Presidente Venceslau",
      },
      { cidade: "Dracena", nome: "EPML-DRA – Equipe Dracena" },
      { cidade: "Adamantina", nome: "EPML-ADA – Equipe Adamantina" },
      { cidade: "Ribeirão Preto", nome: "NPML-RPR – Núcleo de Ribeirão Preto" },
      { cidade: "Barretos", nome: "EPML-BAR – Equipe Barretos" },
      { cidade: "Franca", nome: "EPML-FRA – Equipe Franca" },
      { cidade: "Ituverava", nome: "EPML-ITV – Equipe Ituverava" },
      {
        cidade: "São Joaquim da Barra",
        nome: "EPML-JBA – Equipe São Joaquim da Barra",
      },
      { cidade: "Santos", nome: "NPML-SAN – Núcleo de Santos" },
      { cidade: "Guarujá", nome: "EPML-GJA – Equipe Guarujá" },
      { cidade: "Praia Grande", nome: "EPML-PGR – Equipe Praia Grande" },
      { cidade: "Registro", nome: "EPML-REG – Equipe Registro" },
      {
        cidade: "São José dos Campos",
        nome: "NPML-SJC – Núcleo de São José dos Campos",
      },
      { cidade: "Taubaté", nome: "EPML-TAU – Equipe Taubaté" },
      { cidade: "Cruzeiro", nome: "EPML-CRU – Equipe Cruzeiro" },
      { cidade: "Jacareí", nome: "EPML-JAC – Equipe Jacareí" },
      { cidade: "Guaratinguetá", nome: "EPML-GTG – Equipe Guaratinguetá" },
      { cidade: "Caraguatatuba", nome: "EPML-CAR – Equipe Caraguatatuba" },
      {
        cidade: "São José do Rio Preto",
        nome: "NPML-SRP – Núcleo de São José do Rio Preto",
      },
      { cidade: "Catanduva", nome: "EPML-CAT – Equipe Catanduva" },
      { cidade: "Fernandópolis", nome: "EPML-FER – Equipe Fernandópolis" },
      { cidade: "Jales", nome: "EPML-JAL – Equipe Jales" },
      { cidade: "Votuporanga", nome: "EPML-VOT – Equipe Votuporanga" },
      { cidade: "Sorocaba", nome: "NPML-SOR – Núcleo de Sorocaba" },
      { cidade: "Botucatu", nome: "EPML-BOT – Equipe Botucatu" },
      { cidade: "Itapetininga", nome: "EPML-ITI – Equipe Itapetininga" },
      { cidade: "Itapeva", nome: "EPML-IVA – Equipe Itapeva" },
      { cidade: "Avaré", nome: "EPML-AVA – Equipe Avaré" },
    ],
  },
  RJ: {
    total: 20,
    texto:
      "No Rio de Janeiro a perícia oficial fica dentro da Polícia Civil, no Departamento Geral de Polícia Técnico-Científica (DGPTC), que abriga o Instituto Médico-Legal Afrânio Peixoto (IMLAP) e os institutos de Criminalística e de Identificação. A rede médico-legal é fortemente centralizada: só o IMLAP, na capital, tem estrutura completa em divisões próprias (necropsia, clínica médica, antropologia e odontologia forenses, toxicologia, anatomopatologia). Fora da capital não existem IMLs autônomos — o atendimento é feito por Postos Regionais de Polícia Técnico-Científica, unidades mistas de criminalística e medicina legal agrupadas em cinco coordenadorias regionais. A lista não mostra que centenas de municípios dependem do posto regional mais próximo e que exames de maior complexidade acabam remetidos ao IMLAP.",
    fonte:
      "Decreto Estadual nº 47.490, de fevereiro de 2021, que dispõe sobre a estrutura básica da Secretaria de Estado de Polícia Civil do Rio de Janeiro (anexo com a estrutura do DGPTC, do IMLAP e das Coordenadorias e Postos Regionais de Polícia Técnico-Científica), complementado pela relação oficial de postos de coleta de DNA do estado. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Rio de Janeiro",
        nome: "Instituto Médico-Legal Afrânio Peixoto (IMLAP) – sede",
      },
      {
        cidade: "Rio de Janeiro",
        nome: "Posto Regional de Polícia Técnico-Científica de Campo Grande",
      },
      {
        cidade: "Duque de Caxias",
        nome: "Posto Regional de Polícia Técnico-Científica de Duque de Caxias",
      },
      {
        cidade: "Nova Iguaçu",
        nome: "Posto Regional de Polícia Técnico-Científica de Nova Iguaçu",
      },
      {
        cidade: "Niterói",
        nome: "Posto Regional de Polícia Técnico-Científica de Niterói",
      },
      {
        cidade: "São Gonçalo",
        nome: "Posto Regional de Polícia Técnico-Científica de São Gonçalo",
      },
      {
        cidade: "Araruama",
        nome: "Posto Regional de Polícia Técnico-Científica de Araruama",
      },
      {
        cidade: "Cabo Frio",
        nome: "Posto Regional de Polícia Técnico-Científica de Cabo Frio",
      },
      {
        cidade: "Angra dos Reis",
        nome: "Posto Regional de Polícia Técnico-Científica de Angra dos Reis",
      },
      {
        cidade: "Resende",
        nome: "Posto Regional de Polícia Técnico-Científica de Resende",
      },
      {
        cidade: "Volta Redonda",
        nome: "Posto Regional de Polícia Técnico-Científica de Volta Redonda",
      },
      {
        cidade: "Barra do Piraí",
        nome: "Posto Regional de Polícia Técnico-Científica de Barra do Piraí",
      },
      {
        cidade: "Teresópolis",
        nome: "Posto Regional de Polícia Técnico-Científica de Teresópolis",
      },
      {
        cidade: "Petrópolis",
        nome: "Posto Regional de Polícia Técnico-Científica de Petrópolis",
      },
      {
        cidade: "Três Rios",
        nome: "Posto Regional de Polícia Técnico-Científica de Três Rios",
      },
      {
        cidade: "Nova Friburgo",
        nome: "Posto Regional de Polícia Técnico-Científica de Nova Friburgo",
      },
      {
        cidade: "Campos dos Goytacazes",
        nome: "Posto Regional de Polícia Técnico-Científica de Campos dos Goytacazes",
      },
      {
        cidade: "Macaé",
        nome: "Posto Regional de Polícia Técnico-Científica de Macaé",
      },
      {
        cidade: "Santo Antônio de Pádua",
        nome: "Posto Regional de Polícia Técnico-Científica de Santo Antônio de Pádua",
      },
      {
        cidade: "Itaperuna",
        nome: "Posto Regional de Polícia Técnico-Científica de Itaperuna",
      },
    ],
  },
  MG: {
    total: null,
    texto:
      "Em Minas Gerais a perícia oficial continua integrada à Polícia Civil, sob a Superintendência de Polícia Técnico-Científica, que reúne o Instituto de Criminalística, o Instituto de Identificação e o Instituto Médico-Legal. A unidade de referência é o IML André Roquette, em Belo Horizonte, e o interior é atendido por postos médico-legais e serviços de medicina legal instalados nas delegacias regionais. Não foi possível confirmar em fonte oficial acessível nem o número total de unidades nem a relação completa de municípios, e por isso a lista ficou restrita à capital. Mesmo onde há posto médico-legal, o funcionamento costuma ser em horário administrativo, com plantão contínuo e perícias complexas concentrados em Belo Horizonte.",
    fonte:
      "Ficha da unidade 'Instituto Médico Legal André Roquette' no portal oficial do Governo de Minas Gerais e páginas 'Serviço de Medicina Legal' e 'Serviços – Instituto Médico Legal' do site da Polícia Civil de Minas Gerais; a relação completa de postos médico-legais não foi apurada em fonte oficial. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Belo Horizonte",
        nome: "Instituto Médico-Legal André Roquette",
      },
    ],
  },
  ES: {
    total: 5,
    texto:
      "No Espírito Santo a perícia oficial é da Polícia Científica do Estado do Espírito Santo (PCIES), órgão autônomo criado por lei complementar, com Perito Oficial Geral, corregedoria e academia próprios, que responde pelo Instituto Médico-Legal, pelo Instituto de Criminalística, pelo Instituto de Identificação e pelos laboratórios forenses. A medicina legal tem apenas cinco pontos fixos: o IML, em Vitória, e quatro Seções Regionais de Medicina Legal, articuladas às diretorias regionais Sul, Noroeste, Norte e Serrana. A lista esconde que cidades como São Mateus e Nova Venécia têm criminalística e identificação, mas não seção de medicina legal — os corpos seguem para Linhares ou Colatina. A estrutura laboratorial completa e o plantão permanente ficam concentrados em Vitória, com os 78 municípios capixabas divididos entre essas cinco unidades.",
    fonte:
      "Agenda de contatos e relação de unidades publicada no site oficial da Polícia Científica do Estado do Espírito Santo (PCIES), com as Seções Regionais de Medicina Legal e respectivos endereços, complementada pela lei complementar que organiza a PCIES. Consulta em 08/2026.",
    unidades: [
      { cidade: "Vitória", nome: "Instituto Médico-Legal (IML)" },
      {
        cidade: "Cachoeiro de Itapemirim",
        nome: "Seção Regional de Medicina Legal de Cachoeiro de Itapemirim",
      },
      {
        cidade: "Colatina",
        nome: "Seção Regional de Medicina Legal de Colatina (SML-COL)",
      },
      {
        cidade: "Linhares",
        nome: "Seção Regional de Medicina Legal de Linhares (SML-LIN)",
      },
      {
        cidade: "Venda Nova do Imigrante",
        nome: "Seção Regional de Medicina Legal de Venda Nova do Imigrante (SML-VNI)",
      },
    ],
  },
  RS: {
    total: 35,
    texto:
      "A perícia oficial gaúcha é do Instituto-Geral de Perícias (IGP/RS), órgão autônomo da Secretaria da Segurança Pública. A medicina legal se divide entre o Departamento Médico-Legal (DML), com as divisões de perícias da Capital e Metropolitana, e o Departamento de Perícias do Interior (DPI), organizado em sete coordenadorias regionais que administram os Postos Médico-Legais. Só Porto Alegre concentra a estrutura completa (tanatologia, clínica médico-legal, odontologia legal, sexologia e radiologia forenses, além do CRAI); vários PMLs do interior funcionam em horário administrativo e remetem necropsias e plantões ao posto regional de referência. A lista traz apenas as sedes: a maioria dos 497 municípios gaúchos não tem PML e depende do posto da região.",
    fonte:
      "Site oficial do Instituto-Geral de Perícias do Rio Grande do Sul, páginas 'Departamento Médico-Legal', 'Departamento de Perícias do Interior' e 'Onde tem Posto Médico-Legal / Lista de Postos'; postos assinalados como FECHADOS na lista oficial (Frederico Westphalen e Lagoa Vermelha) foram excluídos. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Porto Alegre",
        nome: "Departamento Médico-Legal (DML) – Divisão de Perícias da Capital",
      },
      { cidade: "Canoas", nome: "Posto Médico-Legal de Canoas" },
      { cidade: "Novo Hamburgo", nome: "Posto Médico-Legal de Novo Hamburgo" },
      { cidade: "São Leopoldo", nome: "Posto Médico-Legal de São Leopoldo" },
      { cidade: "Osório", nome: "Posto Médico-Legal de Osório" },
      { cidade: "Lajeado", nome: "Posto Médico-Legal de Lajeado" },
      { cidade: "São Jerônimo", nome: "Posto Médico-Legal de São Jerônimo" },
      { cidade: "Taquara", nome: "Posto Médico-Legal de Taquara" },
      { cidade: "Viamão", nome: "Posto Médico-Legal de Viamão" },
      { cidade: "Caxias do Sul", nome: "Posto Médico-Legal de Caxias do Sul" },
      {
        cidade: "Bento Gonçalves",
        nome: "Posto Médico-Legal de Bento Gonçalves",
      },
      { cidade: "Vacaria", nome: "Posto Médico-Legal de Vacaria" },
      { cidade: "Pelotas", nome: "Posto Médico-Legal de Pelotas" },
      { cidade: "Rio Grande", nome: "Posto Médico-Legal de Rio Grande" },
      { cidade: "Camaquã", nome: "Posto Médico-Legal de Camaquã" },
      { cidade: "Bagé", nome: "Posto Médico-Legal de Bagé" },
      { cidade: "Passo Fundo", nome: "Posto Médico-Legal de Passo Fundo" },
      { cidade: "Carazinho", nome: "Posto Médico-Legal de Carazinho" },
      { cidade: "Erechim", nome: "Posto Médico-Legal de Erechim" },
      { cidade: "Soledade", nome: "Posto Médico-Legal de Soledade" },
      {
        cidade: "Palmeira das Missões",
        nome: "Posto Médico-Legal de Palmeira das Missões",
      },
      { cidade: "Santa Maria", nome: "Posto Médico-Legal de Santa Maria" },
      {
        cidade: "Cachoeira do Sul",
        nome: "Posto Médico-Legal de Cachoeira do Sul",
      },
      { cidade: "Santiago", nome: "Posto Médico-Legal de Santiago" },
      { cidade: "Santo Ângelo", nome: "Posto Médico-Legal de Santo Ângelo" },
      { cidade: "Ijuí", nome: "Posto Médico-Legal de Ijuí" },
      { cidade: "Cruz Alta", nome: "Posto Médico-Legal de Cruz Alta" },
      { cidade: "Santa Rosa", nome: "Posto Médico-Legal de Santa Rosa" },
      {
        cidade: "São Luiz Gonzaga",
        nome: "Posto Médico-Legal de São Luiz Gonzaga",
      },
      { cidade: "Três Passos", nome: "Posto Médico-Legal de Três Passos" },
      { cidade: "São Borja", nome: "Posto Médico-Legal de São Borja" },
      {
        cidade: "Santana do Livramento",
        nome: "Posto Médico-Legal de Santana do Livramento",
      },
      { cidade: "Uruguaiana", nome: "Posto Médico-Legal de Uruguaiana" },
      { cidade: "Alegrete", nome: "Posto Médico-Legal de Alegrete" },
      { cidade: "São Gabriel", nome: "Posto Médico-Legal de São Gabriel" },
      {
        cidade: "Santa Cruz do Sul",
        nome: "Posto Médico-Legal de Santa Cruz do Sul",
      },
    ],
  },
  SC: {
    total: 27,
    texto:
      "Em Santa Catarina a perícia oficial é da Polícia Científica de Santa Catarina (ex-IGP/SC), organizada em quatro institutos — Medicina Legal, Criminalística, Análises Laboratoriais e Identificação — com uma Diretoria Técnico-Científica de Medicina Legal em Florianópolis. No território, o órgão se desconcentra em 30 unidades entre Superintendências Regionais e Núcleos Regionais a elas vinculados; a medicina legal não é unidade separada, mas um setor dentro de cada regional. A lista esconde que esses setores funcionam em horário limitado — em vários núcleos apenas quatro a seis horas por dia, de segunda a sexta — e que necropsias e casos fora do expediente vão para a superintendência de referência. Dos 30 endereços, 27 declaram expressamente setor de Medicina Legal; Chapecó, Porto União e São Joaquim não o listam e por isso ficaram fora.",
    fonte:
      "Site oficial da Polícia Científica de Santa Catarina, página institucional, página 'Diretoria de Medicina Legal' da estrutura administrativa e fichas individuais das 30 unidades no diretório 'Unidades'. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Florianópolis",
        nome: "Superintendência Regional de Polícia Científica em Florianópolis (PCI/SRFLN)",
      },
      {
        cidade: "Palhoça",
        nome: "Superintendência Regional de Polícia Científica em Palhoça (PCI/SRPAL)",
      },
      {
        cidade: "São José",
        nome: "Núcleo Regional de Polícia Científica em São José",
      },
      {
        cidade: "Joinville",
        nome: "Superintendência Regional de Polícia Científica em Joinville (PCI/SRJOI)",
      },
      {
        cidade: "Jaraguá do Sul",
        nome: "Núcleo Regional de Polícia Científica em Jaraguá do Sul",
      },
      {
        cidade: "São Bento do Sul",
        nome: "Núcleo Regional de Polícia Científica em São Bento do Sul",
      },
      {
        cidade: "Mafra",
        nome: "Núcleo Regional de Polícia Científica em Mafra",
      },
      {
        cidade: "Canoinhas",
        nome: "Núcleo Regional de Polícia Científica em Canoinhas",
      },
      {
        cidade: "Blumenau",
        nome: "Superintendência Regional de Polícia Científica em Blumenau (PCI/SRBLU)",
      },
      {
        cidade: "Rio do Sul",
        nome: "Núcleo Regional de Polícia Científica em Rio do Sul",
      },
      {
        cidade: "Balneário Camboriú",
        nome: "Superintendência Regional de Polícia Científica em Balneário Camboriú (PCI/SRBCA)",
      },
      {
        cidade: "Itajaí",
        nome: "Núcleo Regional de Polícia Científica em Itajaí",
      },
      {
        cidade: "Brusque",
        nome: "Núcleo Regional de Polícia Científica em Brusque",
      },
      {
        cidade: "Criciúma",
        nome: "Superintendência Regional de Polícia Científica em Criciúma (PCI/SRCRI)",
      },
      {
        cidade: "Araranguá",
        nome: "Núcleo Regional de Polícia Científica em Araranguá",
      },
      {
        cidade: "Tubarão",
        nome: "Núcleo Regional de Polícia Científica em Tubarão",
      },
      {
        cidade: "Laguna",
        nome: "Núcleo Regional de Polícia Científica em Laguna",
      },
      {
        cidade: "Lages",
        nome: "Superintendência Regional de Polícia Científica em Lages (PCI/SRLGS)",
      },
      {
        cidade: "Curitibanos",
        nome: "Núcleo Regional de Polícia Científica em Curitibanos",
      },
      {
        cidade: "Caçador",
        nome: "Superintendência Regional de Polícia Científica em Caçador (PCI/SRCDR)",
      },
      {
        cidade: "Campos Novos",
        nome: "Núcleo Regional de Polícia Científica em Campos Novos",
      },
      {
        cidade: "Joaçaba",
        nome: "Núcleo Regional de Polícia Científica em Joaçaba",
      },
      {
        cidade: "Videira",
        nome: "Núcleo Regional de Polícia Científica em Videira",
      },
      {
        cidade: "Concórdia",
        nome: "Núcleo Regional de Polícia Científica em Concórdia",
      },
      {
        cidade: "Xanxerê",
        nome: "Núcleo Regional de Polícia Científica em Xanxerê",
      },
      {
        cidade: "São Lourenço do Oeste",
        nome: "Núcleo Regional de Polícia Científica em São Lourenço do Oeste",
      },
      {
        cidade: "São Miguel do Oeste",
        nome: "Núcleo Regional de Polícia Científica em São Miguel do Oeste",
      },
    ],
  },
  PR: {
    total: null,
    texto:
      "No Paraná a perícia oficial é da Polícia Científica do Paraná, órgão da Secretaria da Segurança Pública composto pelo Instituto de Criminalística e pelo Instituto Médico Legal. A capilaridade não se dá por IMLs autônomos, e sim por Unidades de Execução Técnico-Científicas (UETC) instaladas nas maiores cidades, mais alguns postos avançados a elas vinculados. Só a UETC de Curitiba-Tarumã publica plantão de necrotério 24 horas; nas demais o atendimento divulgado é de expediente comercial, e municípios sem UETC são atendidos pela unidade regional de referência. O órgão não publica quais UETCs abrigam efetivamente setor de medicina legal nem um total oficial de unidades de IML, por isso a lista de cidades foi deixada vazia em vez de inferida.",
    fonte:
      "Site oficial da Polícia Científica do Paraná, páginas 'Unidades de Execução Técnico-Científicas' e 'Unidades Regionais'; a editoria oficial 'Instituto Médico Legal' estava indisponível e nenhuma fonte do órgão discrimina as unidades de medicina legal por município. Consulta em 08/2026.",
    unidades: [],
  },
  BA: {
    total: 33,
    texto:
      "A rede baiana é operada pelo Departamento de Polícia Técnica (DPT), da Secretaria da Segurança Pública, e não por um IML autônomo. Em Salvador fica a unidade central, o Instituto Médico Legal Nina Rodrigues, um dos institutos do DPT; no interior, a medicina legal é prestada pela Diretoria do Interior, que reúne 30 Coordenadorias Regionais de Polícia Técnica (CRPT) e postos avançados, distribuídos em sete divisões regionais. A CRPT não é um IML puro: é unidade multidisciplinar que junta criminalística, medicina legal e odontologia legal no mesmo prédio e cobre dezenas de municípios do entorno. A rede segue mudando — a Portaria DPT 037/2025 instituiu um posto avançado em Ribeira do Pombal, ainda fora da planilha oficial de endereços.",
    fonte:
      "Página institucional 'Diretoria do Interior' do site oficial do Departamento de Polícia Técnica da Bahia, cruzada com a 'Planilha de Endereços das CRPTs' publicada em PDF no mesmo portal e com a página oficial do Instituto Médico Legal Nina Rodrigues. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Salvador",
        nome: "Instituto Médico Legal Nina Rodrigues (IMLNR)",
      },
      { cidade: "Feira de Santana", nome: "CRPT Feira de Santana" },
      { cidade: "Alagoinhas", nome: "CRPT Alagoinhas" },
      { cidade: "Santo Antônio de Jesus", nome: "CRPT Santo Antônio de Jesus" },
      { cidade: "Santo Amaro", nome: "CRPT Santo Amaro" },
      { cidade: "Camaçari", nome: "CRPT Camaçari" },
      { cidade: "Vera Cruz", nome: "CRPT Ilha de Vera Cruz" },
      { cidade: "Serrinha", nome: "CRPT Serrinha" },
      { cidade: "Irecê", nome: "CRPT Irecê" },
      { cidade: "Jacobina", nome: "CRPT Jacobina" },
      { cidade: "Itaberaba", nome: "CRPT Itaberaba" },
      { cidade: "Seabra", nome: "CRPT Seabra" },
      { cidade: "Senhor do Bonfim", nome: "CRPT Senhor do Bonfim" },
      { cidade: "Euclides da Cunha", nome: "CRPT Euclides da Cunha" },
      { cidade: "Juazeiro", nome: "CRPT Juazeiro" },
      { cidade: "Paulo Afonso", nome: "CRPT Paulo Afonso" },
      { cidade: "Itabuna", nome: "CRPT Itabuna" },
      { cidade: "Ilhéus", nome: "CRPT Ilhéus" },
      { cidade: "Valença", nome: "CRPT Valença" },
      { cidade: "Porto Seguro", nome: "CRPT Porto Seguro" },
      { cidade: "Teixeira de Freitas", nome: "CRPT Teixeira de Freitas" },
      { cidade: "Eunápolis", nome: "CRPT Eunápolis" },
      {
        cidade: "Itamaraju",
        nome: "Posto Avançado de Polícia Técnica de Itamaraju",
      },
      { cidade: "Jequié", nome: "CRPT Jequié" },
      { cidade: "Itapetinga", nome: "CRPT Itapetinga" },
      { cidade: "Vitória da Conquista", nome: "CRPT Vitória da Conquista" },
      { cidade: "Brumado", nome: "CRPT Brumado" },
      { cidade: "Guanambi", nome: "CRPT Guanambi" },
      { cidade: "Barreiras", nome: "CRPT Barreiras" },
      { cidade: "Luís Eduardo Magalhães", nome: "CRPT Luís Eduardo Magalhães" },
      { cidade: "Santa Maria da Vitória", nome: "CRPT Santa Maria da Vitória" },
      { cidade: "Bom Jesus da Lapa", nome: "CRPT Bom Jesus da Lapa" },
      { cidade: "Barra", nome: "Posto Avançado de Polícia Técnica de Barra" },
    ],
  },
  PE: {
    total: 11,
    texto:
      "Em Pernambuco a perícia oficial é a Polícia Científica, vinculada à Secretaria de Defesa Social, e a medicina legal cabe ao Instituto de Medicina Legal Antônio Persivo Cunha, no Recife. Na Região Metropolitana há ainda um posto do IML em Paulista, além do Instituto de Genética Forense Eduardo Campos, em Jaboatão dos Guararapes, que faz identificação por DNA mas não é unidade de medicina legal. No interior o atendimento se dá por Unidades Regionais de Polícia Científica, complexos que reúnem IML e criminalística na mesma estrutura, na Mata, no Agreste e no Sertão. O número 11 é a contagem das unidades de medicina legal na relação oficial consultada, não um total divulgado pelo órgão estadual; cada regional cobre dezenas de municípios vizinhos.",
    fonte:
      "Relação oficial 'Endereços do Local de Coleta' publicada pelo Ministério da Justiça e Segurança Pública na seção de pessoas desaparecidas do portal gov.br, que discrimina por município as unidades de medicina legal e de polícia científica de Pernambuco, complementada por notícias oficiais da Secretaria de Defesa Social de PE sobre a expansão dos complexos no interior. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Recife",
        nome: "Instituto de Medicina Legal Antônio Persivo Cunha",
      },
      {
        cidade: "Paulista",
        nome: "Posto do Instituto de Medicina Legal Antônio Persivo Cunha",
      },
      {
        cidade: "Palmares",
        nome: "Unidade Regional de Polícia Científica de Palmares",
      },
      {
        cidade: "Nazaré da Mata",
        nome: "Unidade Regional de Polícia Científica de Nazaré da Mata",
      },
      {
        cidade: "Caruaru",
        nome: "Unidade Regional de Polícia Científica de Caruaru",
      },
      {
        cidade: "Garanhuns",
        nome: "Unidade Regional de Polícia Científica de Garanhuns",
      },
      {
        cidade: "Arcoverde",
        nome: "Unidade Regional de Polícia Científica de Arcoverde",
      },
      {
        cidade: "Afogados da Ingazeira",
        nome: "Unidade Regional de Polícia Científica de Afogados da Ingazeira",
      },
      {
        cidade: "Salgueiro",
        nome: "Unidade Regional de Polícia Científica de Salgueiro",
      },
      {
        cidade: "Ouricuri",
        nome: "Unidade Regional de Polícia Científica de Ouricuri",
      },
      {
        cidade: "Petrolina",
        nome: "Unidade Regional de Polícia Científica de Petrolina",
      },
    ],
  },
  AL: {
    total: 2,
    texto:
      "Alagoas concentra a medicina legal na Polícia Científica do Estado de Alagoas, órgão de perícia oficial que abriga o Instituto Médico Legal ao lado dos institutos de Criminalística e de Identificação. A rede é bastante centralizada: o IML Estácio de Lima, em Maceió, e o IML de Arapiraca, que atende o Agreste. A lista não conta que o IML mantém também atendimento em posto no Hospital da Mulher, em Maceió, voltado a vítimas de violência sexual. Os institutos irmãos têm capilaridade muito maior — o Instituto de Identificação opera dezenas de postos no interior, que não fazem perícia médico-legal e não devem ser confundidos com unidades de IML.",
    fonte:
      "Páginas institucionais do Instituto Médico Legal no site oficial da Polícia Científica do Estado de Alagoas e fichas das unidades no Portal Alagoas Digital do Governo de Alagoas, conferidas com a relação oficial 'Endereços do Local de Coleta' do Ministério da Justiça e Segurança Pública. Consulta em 08/2026.",
    unidades: [
      { cidade: "Maceió", nome: "Instituto Médico Legal Estácio de Lima" },
      {
        cidade: "Arapiraca",
        nome: "Instituto Médico Legal de Arapiraca Médico Legista Edvaldo Castro Alves",
      },
    ],
  },
  PB: {
    total: null,
    texto:
      "Na Paraíba a perícia oficial é feita pelo Instituto de Polícia Científica (IPC), órgão da Polícia Civil vinculado à Secretaria de Estado da Segurança e da Defesa Social; a medicina legal é executada pelos Núcleos de Medicina e Odontologia Legal (NUMOL), que reúnem no mesmo serviço medicina e odontologia legal. A rede se organiza a partir da unidade da capital, em João Pessoa, e de núcleos regionais que concentram necropsia, exame de lesão corporal e exame sexológico de macrorregiões inteiras. Municípios sem núcleo são atendidos por deslocamento de perito ou por remoção do corpo até o núcleo de referência. Não foi localizado documento oficial do IPC/PB com o rol completo e atualizado das unidades, por isso o total não é informado.",
    fonte:
      "Ministério da Justiça e Segurança Pública / SENASP, documento oficial 'Pontos de coleta — Campanha Nacional de Coleta de DNA de Familiares de Pessoas Desaparecidas 2025', que nomeia as unidades do IPC/PB e os NUMOLs por município; complementado pela Lei estadual nº 13.079, de 22/02/2024, que define o NUMOL como unidade responsável pela liberação de cadáver. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "João Pessoa",
        nome: "Núcleo de Medicina e Odontologia Legal (NUMOL) de João Pessoa",
      },
      {
        cidade: "Campina Grande",
        nome: "Núcleo de Medicina e Odontologia Legal (NUMOL) de Campina Grande",
      },
      { cidade: "Patos", nome: "Núcleo de Polícia Científica de Patos" },
      { cidade: "Guarabira", nome: "NUMOL de Guarabira" },
      { cidade: "Cajazeiras", nome: "NUMOL de Cajazeiras" },
    ],
  },
  RN: {
    total: 4,
    texto:
      "No Rio Grande do Norte a perícia oficial cabe ao ITEP — Instituto Técnico-Científico de Perícia, hoje estruturado como Polícia Científica do RN, que reúne na sede de Natal o Instituto de Medicina Legal, o Instituto de Criminalística, o Instituto de Identificação e o Laboratório de Genética Forense. Fora da capital a medicina legal é prestada por três Unidades Regionais integradas — Mossoró, Caicó e Pau dos Ferros —, que concentram necropsias e exames de corpo de delito das respectivas regiões. A lista mostra apenas quatro pontos físicos: os demais municípios dependem de remoção do corpo ou de deslocamento do perito até a regional de referência, o que explica distâncias longas no Oeste e no Seridó.",
    fonte:
      "Carta de Serviços ao Usuário da Polícia Científica do Rio Grande do Norte (ITEP/RN), publicada no Portal da Transparência do Governo do Estado, edição 2026, cruzada com o documento oficial de pontos de coleta de DNA do Ministério da Justiça e Segurança Pública (Campanha Nacional 2025). Consulta em 08/2026.",
    unidades: [
      { cidade: "Natal", nome: "Instituto de Medicina Legal (IML) — ITEP/RN" },
      { cidade: "Mossoró", nome: "Unidade Regional de Mossoró do ITEP/RN" },
      { cidade: "Caicó", nome: "Unidade Regional de Caicó do ITEP/RN" },
      {
        cidade: "Pau dos Ferros",
        nome: "Unidade Regional de Pau dos Ferros do ITEP/RN",
      },
    ],
  },
  CE: {
    total: 10,
    texto:
      "No Ceará a perícia oficial é da PEFOCE — Perícia Forense do Estado do Ceará, autarquia vinculada à Secretaria da Segurança Pública e Defesa Social, que concentra em Fortaleza a sede com medicina legal, criminalística, identificação e laboratórios. O interior é atendido por Núcleos de Perícia Forense regionais, unidades integradas que fazem tanto criminalística quanto medicina legal para macrorregiões inteiras. Há expansão em curso, como o núcleo de Tianguá, em obras em 2026, de modo que o número tende a mudar. Cada núcleo é referência para dezenas de municípios vizinhos, que remetem corpos e vítimas à cidade-polo.",
    fonte:
      "Ministério da Justiça e Segurança Pública / SENASP, documento oficial 'Pontos de coleta — Campanha Nacional de Coleta de DNA de Familiares de Pessoas Desaparecidas 2025', que nomeia a sede em Fortaleza e cada Núcleo de Perícia Forense regional por município, complementado por notícias institucionais da SSPDS/CE e da PEFOCE sobre a interiorização. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Fortaleza",
        nome: "Perícia Forense do Estado do Ceará (PEFOCE) — Sede",
      },
      { cidade: "Sobral", nome: "Núcleo de Perícia Forense da Região Norte" },
      {
        cidade: "Juazeiro do Norte",
        nome: "Núcleo de Perícia Forense da Região Sul",
      },
      {
        cidade: "Crateús",
        nome: "Núcleo de Perícia Forense dos Sertões de Crateús",
      },
      {
        cidade: "Quixeramobim",
        nome: "Núcleo de Perícia Forense da Região Central",
      },
      {
        cidade: "Iguatu",
        nome: "Núcleo de Perícia Forense da Região Centro Sul",
      },
      {
        cidade: "Russas",
        nome: "Núcleo de Perícia Forense da Região do Vale do Jaguaribe",
      },
      {
        cidade: "Itapipoca",
        nome: "Núcleo de Perícia Forense da Região do Vale do Curu",
      },
      {
        cidade: "Canindé",
        nome: "Núcleo de Perícia Forense dos Sertões de Canindé",
      },
      {
        cidade: "Tauá",
        nome: "Núcleo de Perícia Forense dos Sertões dos Inhamuns",
      },
    ],
  },
  PI: {
    total: 13,
    texto:
      "No Piauí a perícia oficial é do Departamento de Polícia Científica (DEPOC), órgão da Polícia Civil, que mantém em Teresina o Instituto de Medicina Legal, o Instituto de Criminalística, o Instituto de DNA Forense e o Departamento de Biometria Forense. Fora da capital a estrutura não se chama IML: são os Núcleos Regionais de Polícia Científica, unidades integradas que acumulam medicina legal e criminalística em doze municípios-polo. A lista não indica capacidade igual entre elas: o IML de Teresina concentra os casos complexos e os exames laboratoriais, enquanto os núcleos respondem por necropsias e exames de corpo de delito da sua área. Os demais municípios enviam corpos e vítimas ao polo mais próximo.",
    fonte:
      "Carta de Serviços ao Usuário do Departamento de Polícia Científica do Piauí (DEPOC/PC-PI), publicada no site oficial do órgão, com endereços do IML de Teresina e de cada Núcleo Regional, cruzada com a página 'Unidades da Polícia Científica' do Portal do Governo do Piauí e com os pontos de coleta de DNA do MJSP (2025). Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Teresina",
        nome: "Instituto de Medicina Legal (IML) — DEPOC/PI",
      },
      {
        cidade: "Parnaíba",
        nome: "Núcleo Regional de Polícia Científica de Parnaíba",
      },
      {
        cidade: "Picos",
        nome: "Núcleo Regional de Polícia Científica de Picos",
      },
      {
        cidade: "Floriano",
        nome: "Núcleo Regional de Polícia Científica de Floriano",
      },
      {
        cidade: "Piripiri",
        nome: "Núcleo Regional de Polícia Científica de Piripiri",
      },
      {
        cidade: "Campo Maior",
        nome: "Núcleo Regional de Polícia Científica de Campo Maior",
      },
      {
        cidade: "Esperantina",
        nome: "Núcleo Regional de Polícia Científica de Esperantina",
      },
      {
        cidade: "Oeiras",
        nome: "Núcleo Regional de Polícia Científica de Oeiras",
      },
      {
        cidade: "São Raimundo Nonato",
        nome: "Núcleo Regional de Polícia Científica de São Raimundo Nonato",
      },
      {
        cidade: "São João do Piauí",
        nome: "Núcleo Regional de Polícia Científica de São João do Piauí",
      },
      {
        cidade: "Bom Jesus",
        nome: "Núcleo Regional de Polícia Científica de Bom Jesus",
      },
      {
        cidade: "Corrente",
        nome: "Núcleo Regional de Polícia Científica de Corrente",
      },
      {
        cidade: "Uruçuí",
        nome: "Núcleo Regional de Polícia Científica de Uruçuí",
      },
    ],
  },
  MA: {
    total: null,
    texto:
      "No Maranhão a medicina legal é executada pela Superintendência de Polícia Técnico-Científica (SPTC), vinculada à Secretaria de Segurança Pública e à Polícia Civil, que reúne o IML ao lado dos institutos de Criminalística, de Identificação e de Genética Forense. A rede se organiza em IMLs sediados em São Luís, Imperatriz e Timon, complementados por postos avançados no interior e por um projeto de interiorização com centros regionais de perícia. Fontes oficiais informam 11 unidades de perícia oficial no estado (sete na Região Metropolitana e quatro no interior), mas esse número abrange também criminalística e identificação, e não só medicina legal — por isso o total ficou em branco. Municípios sem IML dependem de deslocamento de corpos ou de peritos até a unidade mais próxima.",
    fonte:
      "Site oficial da Secretaria de Segurança Pública do Maranhão e da Polícia Civil do Maranhão, matérias institucionais sobre os avanços das unidades da Superintendência de Polícia Técnico-Científica, os investimentos na perícia e o processo seletivo para os órgãos periciais da capital e do interior (esta última com a informação das 11 unidades). Consulta em 08/2026.",
    unidades: [
      { cidade: "São Luís", nome: "Instituto Médico Legal (IML)" },
      {
        cidade: "Imperatriz",
        nome: "Instituto Médico Legal (IML) de Imperatriz",
      },
      { cidade: "Timon", nome: "Instituto Médico Legal (IML) de Timon" },
      { cidade: "Codó", nome: "Posto Avançado do IML" },
      { cidade: "Chapadinha", nome: "Posto Avançado do IML" },
    ],
  },
  PA: {
    total: 11,
    texto:
      "No Pará a perícia oficial é feita pela Polícia Científica do Pará, órgão autônomo que sucedeu o Centro de Perícias Científicas Renato Chaves e mantém o nome do centro em sua identidade institucional. A sede fica em Belém, onde funcionam o Instituto de Criminalística e o Instituto de Medicina e Odontologia Legal (IMOL); o interior é coberto por quatro coordenadorias regionais — Castanhal, Marabá, Santarém e Altamira — e por seis núcleos avançados. Cada coordenadoria atende de 9 a 25 municípios vizinhos: a cidade sem unidade não fica sem perícia, mas o corpo ou o periciando percorre a distância até a regional. O total de 11 inclui criminalística junto com medicina legal, já que as unidades são integradas.",
    fonte:
      "Site oficial da Polícia Científica do Pará, páginas 'Coordenadorias Regionais' (Unidades) e 'Dúvidas' (Transparência Pública), que descrevem a sede em Belém, as quatro coordenadorias regionais e os núcleos avançados. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Belém",
        nome: "Sede — Instituto de Medicina e Odontologia Legal (IMOL)",
      },
      { cidade: "Castanhal", nome: "Coordenadoria Regional I" },
      { cidade: "Marabá", nome: "Coordenadoria Regional II" },
      { cidade: "Santarém", nome: "Coordenadoria Regional III" },
      { cidade: "Altamira", nome: "Coordenadoria Regional IV" },
      { cidade: "Abaetetuba", nome: "Núcleo Avançado" },
      { cidade: "Bragança", nome: "Núcleo Avançado" },
      { cidade: "Parauapebas", nome: "Núcleo Avançado" },
      { cidade: "Tucuruí", nome: "Núcleo Avançado" },
      { cidade: "Paragominas", nome: "Núcleo Avançado" },
      { cidade: "Itaituba", nome: "Núcleo Avançado" },
    ],
  },
  AM: {
    total: null,
    texto:
      "No Amazonas a medicina legal está a cargo do Instituto Médico Legal, integrante do Departamento de Polícia Técnico-Científica (DPTC), vinculado à Secretaria de Segurança Pública do Estado. A estrutura é fortemente concentrada em Manaus, no Complexo do IML na Cidade Nova, onde também funcionam o Instituto de Criminalística e as divisões de perícia externa. Não foi possível confirmar em fonte oficial do órgão a existência e a localização de unidades ou postos de medicina legal em municípios do interior, nem um número total. A lista registra apenas o confirmado e não descreve a cobertura real do interior, feita em boa parte por deslocamento de peritos e remoção de corpos até a capital ou cidades-polo.",
    fonte:
      "Site oficial da Secretaria de Segurança Pública do Amazonas (SSP-AM), matéria institucional 'Perícia do Amazonas ganha nova sede e R$ 2 milhões em investimentos', que identifica o DPTC e o Complexo do Instituto Médico Legal em Manaus. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Manaus",
        nome: "Instituto Médico Legal (IML) — Complexo do IML",
      },
    ],
  },
  RR: {
    total: null,
    texto:
      "Em Roraima a perícia oficial não é órgão autônomo: está dentro da Polícia Civil do Estado, que mantém três institutos técnico-científicos — Criminalística (ICPDA), Identificação (IIOC) e Medicina Legal (IML). A medicina legal é concentrada na capital, na sede do IML dentro da Cidade da Polícia Civil, em Boa Vista, e a interiorização se dá por núcleos regionais de perícia forense que abrigam os três institutos ao mesmo tempo, como o de Rorainópolis. A maior parte do interior roraimense não tem unidade própria de medicina legal: os dez municípios do interior contam com delegacias, e corpos e exames costumam ser deslocados para Boa Vista. O efetivo de médicos legistas e odontolegistas é pequeno e concentrado na capital.",
    fonte:
      "Site oficial da Polícia Civil do Estado de Roraima, páginas institucionais 'Conheça a Polícia Civil' (estrutura com ICPDA, IIOC e IML e endereço da Cidade da Polícia Civil) e a notícia institucional sobre o imóvel que abriga o Núcleo Regional de Perícia Forense de Rorainópolis, complementado por notícias do Portal Oficial do Governo de Roraima. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Boa Vista",
        nome: "Instituto de Medicina Legal (IML) – Cidade da Polícia Civil",
      },
      {
        cidade: "Rorainópolis",
        nome: "Núcleo Regional de Perícia Forense de Rorainópolis",
      },
    ],
  },
  GO: {
    total: 23,
    texto:
      "A perícia oficial de Goiás é exercida pela Polícia Científica do Estado de Goiás (antiga Superintendência de Polícia Técnico-Científica), que concentra a medicina legal no Instituto de Medicina Legal Aristoclides Teixeira (IMLAT), em Goiânia. No interior o serviço médico-legal não é prestado por IMLs autônomos, e sim dentro das 14 Coordenações Regionais de Polícia Técnico-Científica (CRPTC) e de seus Postos Avançados, que reúnem criminalística, identificação e medicina legal na mesma estrutura. A lista indica apenas as sedes: cada CRPTC responde por um conjunto de 5 a 24 municípios da sua área, de modo que uma cidade fora da lista é atendida pela regional a que está vinculada. A existência de legista residente varia de unidade para unidade.",
    fonte:
      "Site oficial da Polícia Científica do Estado de Goiás, páginas 'Unidades', 'Endereços, Telefones, E-mails e Horários de Atendimento' e 'Cargos e seus Ocupantes'. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Goiânia",
        nome: "Instituto de Medicina Legal Aristoclides Teixeira (IMLAT)",
      },
      { cidade: "Aparecida de Goiânia", nome: "1ª CRPTC" },
      { cidade: "Goiás", nome: "2ª CRPTC" },
      { cidade: "Formosa", nome: "3ª CRPTC" },
      { cidade: "Itumbiara", nome: "4ª CRPTC" },
      { cidade: "Caldas Novas", nome: "Posto Avançado da 4ª CRPTC" },
      { cidade: "Morrinhos", nome: "Posto Avançado da 4ª CRPTC" },
      { cidade: "Rio Verde", nome: "5ª CRPTC" },
      { cidade: "Quirinópolis", nome: "Posto Avançado da 5ª CRPTC" },
      { cidade: "Ceres", nome: "6ª CRPTC" },
      { cidade: "Uruaçu", nome: "7ª CRPTC" },
      { cidade: "Porangatu", nome: "Posto Avançado da 7ª CRPTC" },
      { cidade: "Catalão", nome: "8ª CRPTC" },
      { cidade: "Iporá", nome: "9ª CRPTC" },
      {
        cidade: "São Luís de Montes Belos",
        nome: "Posto Avançado da 9ª CRPTC",
      },
      { cidade: "Anápolis", nome: "10ª CRPTC" },
      { cidade: "Jataí", nome: "11ª CRPTC" },
      { cidade: "Mineiros", nome: "Posto Avançado da 11ª CRPTC" },
      { cidade: "Campos Belos", nome: "12ª CRPTC" },
      { cidade: "Posse", nome: "Posto Avançado da 12ª CRPTC" },
      { cidade: "Goianésia", nome: "13ª CRPTC" },
      { cidade: "Luziânia", nome: "14ª CRPTC" },
      { cidade: "Águas Lindas de Goiás", nome: "Posto Avançado da 14ª CRPTC" },
    ],
  },
  MT: {
    total: null,
    texto:
      "Em Mato Grosso a perícia oficial é feita pela Politec (Perícia Oficial e Identificação Técnica), órgão da Secretaria de Estado de Segurança Pública que reúne criminalística, medicina legal e identificação em uma só estrutura, com sede em Cuiabá e diretorias temáticas, entre elas a de Medicina Legal. No interior o serviço é prestado por gerências e unidades regionais instaladas em cidades-polo, que concentram o atendimento de vários municípios do entorno, e a rede vem sendo ampliada com novos complexos regionais. Não foi possível obter, em fonte oficial acessível, relação nominal e atualizada das cidades com unidade de medicina legal nem o total dessas unidades, razão pela qual a lista foi deixada vazia em vez de estimada.",
    fonte:
      "Páginas institucionais da Politec e da Polícia Judiciária Civil de Mato Grosso e decretos estaduais de estrutura da Politec publicados no Portal da Transparência de MT, com o detalhamento das unidades inacessível. Consulta em 08/2026.",
    unidades: [],
  },
  MS: {
    total: 15,
    texto:
      "Em Mato Grosso do Sul a perícia oficial cabe à Coordenadoria-Geral de Perícias (CGP), órgão da Secretaria de Estado de Justiça e Segurança Pública que funciona como polícia científica do estado. A medicina legal é dirigida pelo Instituto de Medicina e Odontologia Legal (IMOL), em Campo Grande, dividido nos Núcleos de Tanatologia e Antropologia Forenses e de Traumatologia e Sexologia Forenses. No interior o serviço é descentralizado em 14 Unidades Regionais de Perícia e Identificação, cada uma com Núcleo Regional de Criminalística, de Identificação e de Medicina Legal. A lista traz apenas as sedes; os mais de 90 postos de identificação civil espalhados pelo estado não fazem perícia médico-legal e não entram nessa contagem.",
    fonte:
      "Site oficial da Coordenadoria-Geral de Perícias de Mato Grosso do Sul, página 'A Coordenadoria-Geral' e organograma institucional publicado pelo próprio órgão. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Campo Grande",
        nome: "Instituto de Medicina e Odontologia Legal (IMOL)",
      },
      {
        cidade: "Amambai",
        nome: "Unidade Regional de Perícia e Identificação de Amambai",
      },
      {
        cidade: "Aquidauana",
        nome: "Unidade Regional de Perícia e Identificação de Aquidauana",
      },
      {
        cidade: "Bataguassu",
        nome: "Unidade Regional de Perícia e Identificação de Bataguassu",
      },
      {
        cidade: "Corumbá",
        nome: "Unidade Regional de Perícia e Identificação de Corumbá",
      },
      {
        cidade: "Costa Rica",
        nome: "Unidade Regional de Perícia e Identificação de Costa Rica",
      },
      {
        cidade: "Coxim",
        nome: "Unidade Regional de Perícia e Identificação de Coxim",
      },
      {
        cidade: "Dourados",
        nome: "Unidade Regional de Perícia e Identificação de Dourados",
      },
      {
        cidade: "Fátima do Sul",
        nome: "Unidade Regional de Perícia e Identificação de Fátima do Sul",
      },
      {
        cidade: "Jardim",
        nome: "Unidade Regional de Perícia e Identificação de Jardim",
      },
      {
        cidade: "Naviraí",
        nome: "Unidade Regional de Perícia e Identificação de Naviraí",
      },
      {
        cidade: "Nova Andradina",
        nome: "Unidade Regional de Perícia e Identificação de Nova Andradina",
      },
      {
        cidade: "Paranaíba",
        nome: "Unidade Regional de Perícia e Identificação de Paranaíba",
      },
      {
        cidade: "Ponta Porã",
        nome: "Unidade Regional de Perícia e Identificação de Ponta Porã",
      },
      {
        cidade: "Três Lagoas",
        nome: "Unidade Regional de Perícia e Identificação de Três Lagoas",
      },
    ],
  },
  DF: {
    total: 1,
    texto:
      "No Distrito Federal a medicina legal não é órgão autônomo: o Instituto de Medicina Legal Leonídio Ribeiro é uma unidade da Polícia Civil do Distrito Federal, vinculada à Secretaria de Estado de Segurança Pública. Como o DF é unidade federativa de município único, toda a atividade médico-legal do território é centralizada nessa única sede, sem IMLs regionais ou postos avançados nas regiões administrativas. O IML atende necropsias, exames de lesão corporal, sexologia forense, antropologia e odontologia legal para todo o DF. As demandas do entorno goiano são atendidas pela rede da Polícia Científica de Goiás, não pelo IML do DF.",
    fonte:
      "Base oficial 'Unidades de Segurança Pública no Distrito Federal' do catálogo de dados geoespaciais do GDF, que registra o IML Leonídio Ribeiro como única unidade de medicina legal da PCDF, complementada pela página institucional da Secretaria de Segurança Pública do DF e pela lista telefônica oficial da PCDF. Consulta em 08/2026.",
    unidades: [
      {
        cidade: "Brasília",
        nome: "Instituto de Medicina Legal Leonídio Ribeiro",
      },
    ],
  },
};
