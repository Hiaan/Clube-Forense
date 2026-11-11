import "server-only";
import { randomBytes } from "node:crypto";
import { consulta, umaLinha } from "./db";

// Área comercial da T9: propostas e contratos gerados a partir das informações básicas do
// cliente, e o mural de pesquisa de mercado. Propostas e contratos têm valores: só o admin.

// ---------- Serviços ----------

export type Servico = { id: string; nome: string; descricao: string; entregas: string[] };

/** O que a T9 oferece. A proposta descreve, o contrato lista como objeto. */
export const SERVICOS: Servico[] = [
  {
    id: "trafego_meta",
    nome: "Gestão de tráfego no Instagram e Facebook",
    descricao: "Campanhas na Meta para atrair os contatos certos, com público, oferta e verba ajustados toda semana.",
    entregas: ["Estrutura de campanhas e públicos", "Pixel e API de Conversões configurados", "Otimização contínua da verba", "Relatório de resultados no painel"],
  },
  {
    id: "trafego_google",
    nome: "Gestão de tráfego no Google",
    descricao: "Anúncios para quem já está procurando o que a empresa vende, na pesquisa e no Maps.",
    entregas: ["Campanhas de pesquisa e Maps", "Palavras-chave e termos negativos", "Acompanhamento de conversões"],
  },
  {
    id: "criativos",
    nome: "Roteiros e criativos para anúncios (método AIDA)",
    descricao: "Vídeos e artes roteirizados a partir das dores do cliente: prendem a atenção, despertam interesse, criam desejo e levam à ação.",
    entregas: ["Roteiros de vídeo no método AIDA", "Artes e variações para teste", "Renovação dos criativos conforme os resultados"],
  },
  {
    id: "automacoes",
    nome: "Automações de atendimento e vendas",
    descricao: "Cada contato novo recebe resposta na hora e ninguém fica esquecido no caminho até a venda.",
    entregas: ["Mensagem automática no WhatsApp para cada lead", "Aviso imediato do lead para a equipe", "Acompanhamento de quem não fechou"],
  },
  {
    id: "crm",
    nome: "Painel de resultados e CRM",
    descricao: "Um painel com a marca T9 para acompanhar investimento, leads e vendas, com quadro de etapas do funil.",
    entregas: ["Painel com os números da conta de anúncios", "Quadro de leads com etapas", "Etapas de venda enviadas à Meta para otimizar as campanhas"],
  },
  {
    id: "pagina",
    nome: "Página de vendas (landing page)",
    descricao: "Uma página focada em uma oferta, feita para transformar visitas dos anúncios em contatos.",
    entregas: ["Página responsiva com a oferta e o botão do WhatsApp", "Integração com o pixel e o painel"],
  },
];

export const servicoPorId = (id: string) => SERVICOS.find((s) => s.id === id);

// ---------- Dados comerciais ----------

/** Campos que proposta e contrato compartilham (as informações básicas do cliente e do acordo). */
export type DadosComerciais = {
  cliente_nome: string;
  cliente_documento: string | null;
  cliente_responsavel: string | null;
  cliente_email: string | null;
  cliente_telefone: string | null;
  cliente_endereco: string | null;
  servicos: string[];
  valor_mensal: number;
  moeda: string;
  implantacao: number | null;
  prazo_minimo: number;
  multa_percentual: number;
  vencimento_dia: number;
  inicio: string | null;
  observacoes: string | null;
};

/** Dados da T9 que entram no contrato (guardados uma vez, na tabela ajustes). */
export type Contratada = { razao_social: string; documento: string; endereco: string; representante: string; foro: string };

const CHAVE_CONTRATADA = "comercial_contratada";

export async function dadosDaContratada(): Promise<Contratada> {
  const linha = await umaLinha<{ valor: string }>("select valor from ajustes where chave = $1", [CHAVE_CONTRATADA]);
  const vazio = { razao_social: "T9 ADS Company", documento: "", endereco: "", representante: "", foro: "" };
  try {
    return { ...vazio, ...(linha ? JSON.parse(linha.valor) : {}) };
  } catch {
    return vazio;
  }
}

export async function salvarContratada(c: Contratada) {
  await consulta(
    `insert into ajustes (chave, valor, atualizado_em) values ($1, $2, now())
     on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`,
    [CHAVE_CONTRATADA, JSON.stringify(c)],
  );
}

/** Endereço público de proposta e contrato: difícil de adivinhar, sem login. */
export const novoToken = () => randomBytes(18).toString("base64url");

// ---------- Valores por extenso ----------

const dinheiroBR = (v: number, moeda: string) =>
  new Intl.NumberFormat(moeda === "BRL" ? "pt-BR" : "en-US", { style: "currency", currency: moeda }).format(v);

export const valorFormatado = dinheiroBR;

const UNIDADES = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function ate999(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c) partes.push(CENTENAS[c]);
  if (resto < 20) {
    if (resto) partes.push(UNIDADES[resto]);
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    partes.push(u ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d]);
  }
  return partes.join(" e ");
}

/** 3500 → "três mil e quinhentos". Até 999.999.999 (o bastante para mensalidades). */
export function numeroPorExtenso(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n === 0) return "zero";
  const milhoes = Math.floor(n / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (milhoes) partes.push(milhoes === 1 ? "um milhão" : `${ate999(milhoes)} milhões`);
  if (milhares) partes.push(milhares === 1 ? "mil" : `${ate999(milhares)} mil`);
  if (resto) partes.push(ate999(resto));
  // "e" antes do último grupo quando ele é redondo ou menor que cem (mil e quinhentos, mil e vinte).
  if (partes.length > 1 && resto && (resto < 100 || resto % 100 === 0)) {
    const ultimo = partes.pop()!;
    return `${partes.join(", ")} e ${ultimo}`;
  }
  return partes.join(" ");
}

export function valorPorExtenso(v: number, moeda: string) {
  const inteiro = Math.floor(v);
  const centavos = Math.round((v - inteiro) * 100);
  const [singular, plural] = moeda === "USD" ? ["dólar", "dólares"] : moeda === "EUR" ? ["euro", "euros"] : ["real", "reais"];
  let texto = `${numeroPorExtenso(inteiro)} ${inteiro === 1 ? singular : plural}`;
  if (centavos) texto += ` e ${numeroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`;
  return texto;
}

const dataLongaBR = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

// ---------- Contrato ----------

/**
 * Texto do contrato a partir dos dados básicos. Fica guardado e pode ser editado antes de enviar:
 * mudar este modelo não altera contratos já gerados. Linhas que começam com "## " são títulos.
 */
export function textoDoContrato(d: DadosComerciais, t9: Contratada) {
  const valor = `${dinheiroBR(d.valor_mensal, d.moeda)} (${valorPorExtenso(d.valor_mensal, d.moeda)})`;
  const servicos = d.servicos.map(servicoPorId).filter((s): s is Servico => Boolean(s));
  const contratante = [
    d.cliente_nome,
    d.cliente_documento ? `inscrito(a) no CPF/CNPJ sob o nº ${d.cliente_documento}` : null,
    d.cliente_endereco ? `com endereço em ${d.cliente_endereco}` : null,
    d.cliente_responsavel ? `neste ato representado(a) por ${d.cliente_responsavel}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const contratada = [
    t9.razao_social || "T9 ADS Company",
    t9.documento ? `inscrita no CNPJ sob o nº ${t9.documento}` : null,
    t9.endereco ? `com sede em ${t9.endereco}` : null,
    t9.representante ? `neste ato representada por ${t9.representante}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const inicio = d.inicio ? dataLongaBR(d.inicio) : "na data da assinatura deste contrato";
  const meses = `${d.prazo_minimo} (${numeroPorExtenso(d.prazo_minimo)}) ${d.prazo_minimo === 1 ? "mês" : "meses"}`;

  const linhas = [
    "## CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING DIGITAL",
    `CONTRATANTE: ${contratante}.`,
    `CONTRATADA: ${contratada}.`,
    "As partes acima identificadas têm entre si justo e contratado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas a seguir.",
    "## CLÁUSULA 1ª – DO OBJETO",
    "1.1. A CONTRATADA prestará à CONTRATANTE os seguintes serviços:",
    ...servicos.map((s, i) => `${String.fromCharCode(97 + i)}) ${s.nome}: ${s.descricao}`),
    "1.2. Os serviços são de meio: a CONTRATADA se compromete a empregar as melhores técnicas e esforços, não garantindo quantidade de vendas, contatos ou faturamento, que dependem também de fatores fora do seu controle, como mercado, oferta, preço e atendimento da CONTRATANTE.",
    "## CLÁUSULA 2ª – DAS OBRIGAÇÕES DA CONTRATADA",
    "2.1. Executar os serviços com zelo e dentro das políticas das plataformas de anúncio.",
    "2.2. Manter a CONTRATANTE informada dos resultados, por meio do painel de acompanhamento e de reuniões periódicas.",
    "2.3. Guardar sigilo sobre as informações da CONTRATANTE a que tiver acesso.",
    "## CLÁUSULA 3ª – DAS OBRIGAÇÕES DA CONTRATANTE",
    "3.1. Fornecer os acessos (contas de anúncio, páginas, site e redes sociais), materiais e informações necessários à execução dos serviços.",
    "3.2. Aprovar ou pedir ajustes nos materiais em até 3 (três) dias úteis; a demora na aprovação suspende os prazos de entrega pelo mesmo período.",
    "3.3. Pagar diretamente às plataformas (Meta, Google e outras) o investimento em mídia, que não está incluído no valor deste contrato.",
    "3.4. Atender os contatos gerados pelas campanhas, sendo responsável pelo atendimento comercial e pelo fechamento das vendas.",
    "## CLÁUSULA 4ª – DO VALOR E DA FORMA DE PAGAMENTO",
    `4.1. Pelos serviços, a CONTRATANTE pagará à CONTRATADA o valor mensal de ${valor}, com vencimento todo dia ${d.vencimento_dia} de cada mês.`,
    ...(d.implantacao
      ? [`4.2. Pela implantação (estrutura inicial de campanhas, configurações e integrações), será pago o valor único de ${dinheiroBR(d.implantacao, d.moeda)} (${valorPorExtenso(d.implantacao, d.moeda)}), junto com a primeira mensalidade.`]
      : []),
    `4.${d.implantacao ? 3 : 2}. O atraso no pagamento sujeita a CONTRATANTE a multa de 2% (dois por cento) e juros de 1% (um por cento) ao mês sobre o valor devido. Após 7 (sete) dias de atraso, a CONTRATADA poderá suspender os serviços até a regularização, sem prejuízo das mensalidades.`,
    `4.${d.implantacao ? 4 : 3}. O valor mensal será reajustado a cada 12 (doze) meses pela variação do IPCA, ou outro índice que o substitua.`,
    "## CLÁUSULA 5ª – DO PRAZO E DA PERMANÊNCIA MÍNIMA",
    `5.1. Este contrato vigora a partir de ${inicio}, com prazo mínimo de permanência de ${meses}.`,
    "5.2. Encerrado o prazo mínimo, o contrato é renovado automaticamente por prazo indeterminado, podendo ser encerrado por qualquer das partes mediante aviso por escrito com 30 (trinta) dias de antecedência.",
    `5.3. A rescisão pela CONTRATANTE antes do fim do prazo mínimo, sem justa causa, sujeita a CONTRATANTE ao pagamento de multa de ${d.multa_percentual}% (${numeroPorExtenso(d.multa_percentual)} por cento) sobre o total das mensalidades restantes até o fim do prazo mínimo.`,
    "5.4. O contrato poderá ser rescindido por qualquer das partes, sem multa, em caso de descumprimento de obrigação contratual não corrigido em até 10 (dez) dias após notificação.",
    "## CLÁUSULA 6ª – DA PROPRIEDADE E DOS ACESSOS",
    "6.1. As contas de anúncio, páginas e perfis são da CONTRATANTE. Ao fim do contrato, a CONTRATADA remove os próprios acessos e entrega as campanhas em funcionamento.",
    "6.2. Os criativos produzidos e pagos durante o contrato podem ser usados livremente pela CONTRATANTE.",
    "## CLÁUSULA 7ª – DA PROTEÇÃO DE DADOS",
    "7.1. As partes cumprirão a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Os dados dos contatos gerados pelas campanhas pertencem à CONTRATANTE, e a CONTRATADA os trata apenas para executar este contrato.",
    ...(d.observacoes ? ["## CLÁUSULA 8ª – DISPOSIÇÕES ESPECÍFICAS", `8.1. ${d.observacoes}`] : []),
    `## CLÁUSULA ${d.observacoes ? "9ª" : "8ª"} – DO FORO`,
    `${d.observacoes ? "9" : "8"}.1. Fica eleito o foro da comarca de ${t9.foro || "domicílio da CONTRATADA"} para dirimir quaisquer dúvidas oriundas deste contrato.`,
    "E, por estarem de acordo, as partes assinam o presente contrato.",
  ];
  return linhas.join("\n\n");
}

// ---------- Leitura ----------

export type Proposta = DadosComerciais & {
  id: number;
  token: string;
  titulo: string | null;
  objetivo: string | null;
  validade_dias: number;
  status: "rascunho" | "enviada" | "aceita" | "recusada";
  aceite_nome: string | null;
  aceite_em: string | null;
  contrato_id: number | null;
  criado_em: string;
};

export type Contrato = DadosComerciais & {
  id: number;
  token: string;
  texto: string;
  status: "rascunho" | "enviado" | "assinado" | "cancelado";
  proposta_id: number | null;
  aceite_nome: string | null;
  aceite_documento: string | null;
  aceite_em: string | null;
  criado_em: string;
};

export const listarPropostas = () => consulta<Proposta>("select * from propostas order by criado_em desc limit 200");
export const listarContratos = () => consulta<Contrato>("select * from contratos order by criado_em desc limit 200");
export const propostaPorId = (id: number) => umaLinha<Proposta>("select * from propostas where id = $1", [id]);
export const propostaPorToken = (t: string) => umaLinha<Proposta>("select * from propostas where token = $1", [t]);
export const contratoPorId = (id: number) => umaLinha<Contrato>("select * from contratos where id = $1", [id]);
export const contratoPorToken = (t: string) => umaLinha<Contrato>("select * from contratos where token = $1", [t]);

/** Proposta vencida: passou a validade sem ser aceita. */
export function propostaVencida(p: Pick<Proposta, "criado_em" | "validade_dias" | "status">, agora = Date.now()) {
  return p.status !== "aceita" && agora > new Date(p.criado_em).getTime() + p.validade_dias * 86_400_000;
}

// ---------- Pesquisa de mercado ----------

export type Referencia = {
  id: number;
  titulo: string;
  link: string | null;
  imagem: string | null;
  nicho: string | null;
  anunciante: string | null;
  observacao: string | null;
  criado_em: string;
  autor: string | null;
};

export const listarReferencias = (busca?: string) =>
  consulta<Referencia>(
    `select r.id, r.titulo, r.link, r.imagem, r.nicho, r.anunciante, r.observacao, r.criado_em, coalesce(u.nome, u.email) as autor
       from referencias r left join usuarios u on u.id = r.usuario_id
      where $1::text is null or (r.titulo || ' ' || coalesce(r.nicho, '') || ' ' || coalesce(r.anunciante, '') || ' ' || coalesce(r.observacao, '')) ilike '%' || $1 || '%'
      order by r.criado_em desc limit 300`,
    [busca?.trim() || null],
  );

/** Endereço da Biblioteca de Anúncios da Meta já com os filtros. */
export function linkBibliotecaMeta(termo: string, pais: string, somenteAtivos = true) {
  const p = new URLSearchParams({
    active_status: somenteAtivos ? "active" : "all",
    ad_type: "all",
    country: pais || "ALL",
    media_type: "all",
    q: termo,
    search_type: "keyword_unordered",
  });
  return `https://www.facebook.com/ads/library/?${p.toString()}`;
}
