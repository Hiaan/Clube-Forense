// Do que a coleta encontra para o blog.
//
// POR QUE ISTO NÃO MORA DENTRO DE `coletar()`: a coleta roda em toda visita ao
// mapa, e gravar no banco como efeito de uma leitura de página é o caminho mais
// curto para uma tabela cheia de lixo e uma home lenta. Aqui é uma função
// explícita, chamada por quem tem o direito de escrever: o cron e o botão
// "Coletar agora" do painel.
//
// O TEXTO É DO CLUBE, E NÃO DE QUEM NOTICIOU. O post não cita, não credita e
// não reaproveita frase de portal nenhum. O que a coleta traz é o SINAL de que
// algo se moveu num estado; o conteúdo do post vem da nossa própria base — a
// etapa que o monitor calcula, e a ficha do estado conferida à mão no painel
// (vagas, salário, banca, inscrições, prova, matérias). Fato não tem dono:
// "edital publicado com 76 vagas" é informação pública. A redação é nossa.
//
// SÓ LEGISTA ENTRA — E QUEM DECIDE ISSO É A NOSSA CURADORIA, NÃO A MANCHETE.
// A primeira tentativa foi exigir que a menção nomeasse o cargo. Testada
// contra as fontes de verdade, ela rejeitava a notícia mais importante do dia:
// "Concurso Perícia Oficial MA: edital publicado com 76 vagas" não escreve
// "legista" em lugar nenhum, e é o edital que tem as vagas de médico-legista.
// Manchete fala do concurso inteiro; o cargo está no edital.
//
// Então o critério é outro, e mais forte: só vira pauta a notícia de um estado
// cuja FICHA confirma vagas de médico-legista — vagas, salário, banca, datas
// conferidos à mão no painel. É a nossa apuração que responde "isto é de
// legista?", e não o título de terceiro. Por isso "Polícia Científica do Pará
// abre seleção para 182 temporários" não entra: é temporário, e o Pará não tem
// ficha que sustente post nenhum.
//
// NADA VAI AO AR SOZINHO. A pauta nasce pronta para publicar — título, texto,
// ficha e capa — e espera um clique no painel. Quem escolhe o que vira post é
// gente; o trabalho que o robô tira da frente é o de escrever.

import {
  gravarDoRobo,
  titulosRecentesDoRobo,
  type PostParaGravar,
} from "../../lib/postsRepo";
import { aSlug, estadoComArtigo, orgaoDaUf } from "../../blog/lib/taxonomia";
import { ESTADO_POR_UF } from "./estados";
import { triarNoticias } from "./triagem";
import {
  NIVEL_LABEL,
  type EstadoStatus,
  type Mencao,
  type Nivel,
  type Relatorio,
} from "./tipos";

/** Quantas pautas uma passada pode abrir. */
const TETO_POR_RODADA = 6;

/** Quantas pautas uma passada pode abrir para o mesmo estado. */
const PAUTAS_POR_UF_POR_RODADA = 1;

/**
 * Teto por rodada, e não "abra tudo que achar".
 *
 * Quando um edital sai, a mesma notícia aparece em vinte portais no mesmo dia.
 * Sem limite, a fila receberia vinte pautas da mesma coisa e a pessoa
 * desistiria de olhar — que é o fim de qualquer fila. A semelhança de títulos
 * barra a maioria; o teto segura o resto.
 */

/** Só notícia recente vira pauta. Concurso de três meses atrás não é notícia. */
const JANELA_DIAS = 21;

/** Por quantos dias um assunto já pautado bloqueia um parecido. */
const DIAS_SEM_REPETIR = 12;

/** Quantos fatos da ficha sustentam um post. */
const FATOS_MINIMOS = 2;

/**
 * Qual categoria do blog a pauta é.
 *
 * O estágio do funil já carrega essa informação: se o robô classificou a
 * notícia como "edital", é matéria de edital. O resto é notícia de andamento.
 */
export function categoriaDoNivel(nivel: Nivel): string {
  return nivel === "edital" ? "edital" : "noticia";
}

function recente(iso: string | null): boolean {
  if (!iso) return false;
  const dias = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return dias >= 0 && dias <= JANELA_DIAS;
}

// --------------------------------------------------------------- repetição

/**
 * Palavras que não ajudam a distinguir uma manchete de outra.
 *
 * "Concurso" está na lista, e é o caso que explica por que a lista existe:
 * aparece em todos os títulos que a gente coleta, então contá-la aproximaria
 * duas notícias de estados diferentes.
 */
const VAZIAS = new Set([
  "a", "as", "o", "os", "um", "uma", "de", "da", "do", "das", "dos", "e", "em",
  "na", "no", "nas", "nos", "para", "por", "com", "sem", "sobre", "que", "ao",
  "aos", "seu", "sua", "ja", "mais", "veja", "confira", "saiba", "tudo",
  "concurso", "concursos", "publico", "publicos", "edital", "editais", "vagas",
]);

/** Título em palavras comparáveis: sem acento, sem pontuação, sem as vazias. */
function palavras(titulo: string): Set<string> {
  const limpo = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
  return new Set(limpo.split(/\s+/).filter((p) => p.length > 2 && !VAZIAS.has(p)));
}

/**
 * Quanto dois títulos se parecem, de 0 a 1 (palavras em comum sobre o total).
 *
 * É o índice de Jaccard, simples o bastante para se entender lendo e forte o
 * bastante para o problema: "Concurso PC-MG: edital com 3.000 vagas" e "PC-MG
 * anuncia 3.000 vagas em edital" compartilham quase todas as palavras que
 * sobram depois da limpeza.
 */
function semelhanca(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let juntos = 0;
  for (const p of a) if (b.has(p)) juntos += 1;
  return juntos / (a.size + b.size - juntos);
}

/**
 * Notícia que o robô não tem como escrever.
 *
 * Fraude, suspensão judicial, anulação: são fatos importantes e são
 * exatamente os que o nosso texto não cobre — ele conta em que etapa o
 * concurso está e manda estudar. Um post animado disparado por uma notícia de
 * fraude é o pior resultado possível. Fica para quem escreve à mão.
 */
const NOTICIA_DELICADA =
  /fraude|fraudad|manipulac|suspens|suspend|anulad|anulac|liminar|justica (determinou|suspendeu)|investigac|cancelad|adiad|irregularidade/;

interface JaPautado {
  uf: string | null;
  palavras: Set<string>;
}

/**
 * True quando esta pauta repete uma que já existe.
 *
 * A comparação é feita com o NOSSO título, e esse é o ponto. O título que a
 * gente gera é um resumo do que se sabe do estado — etapa, vagas, prazo. Se
 * duas notícias diferentes produzem o mesmo título, elas dizem a mesma coisa
 * para o leitor, e o segundo post seria o primeiro de novo. Se produzem
 * títulos diferentes, alguma coisa mudou de verdade (saiu o edital, marcaram a
 * prova, definiram a banca) — e aí é pauta nova, mesmo que seja do mesmo
 * estado na mesma semana.
 *
 * Comparar as manchetes dos portais, como era antes, não resolvia isto: vinte
 * veículos escrevem vinte manchetes diferentes sobre o mesmo fato, e passavam
 * várias.
 *
 * O limite é alto (0,8) porque os nossos títulos compartilham a estrutura;
 * é a diferença de conteúdo que tem de pesar.
 */
function jaSaiu(uf: string, titulo: string, anteriores: JaPautado[]): boolean {
  const atual = palavras(titulo);
  return anteriores.some(
    (p) => (p.uf === null || p.uf === uf) && semelhanca(atual, p.palavras) >= 0.8,
  );
}

// ------------------------------------------------------------------- dados

export type Ficha = NonNullable<EstadoStatus["curadoria"]>;

/** "14600" → "R$ 14.600". Sem centavos: salário de edital é número redondo. */
function reais(v: number | null): string | null {
  if (v === null || !Number.isFinite(v) || v <= 0) return null;
  return `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
}

/**
 * "2026-11-20" → "20/11/2026", e `null` quando a data já passou.
 *
 * O corte no passado evita a ficha mentir por omissão: "inscrições até 05/10"
 * numa tabela do que vale hoje lê-se como prazo em aberto, quando o prazo
 * acabou na semana anterior.
 */
function dataFutura(v: string | null): string | null {
  if (!v?.trim()) return null;
  const d = new Date(v.length <= 10 ? `${v}T12:00:00Z` : v);
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime() >= Date.now() ? d.toLocaleDateString("pt-BR") : null;
}

/** "20/11/2026" → "20 de novembro". Para escrever a data dentro da frase. */
function porExtenso(v: string | null): string | null {
  if (!v?.trim()) return null;
  const d = new Date(v.length <= 10 ? `${v}T12:00:00Z` : v);
  if (Number.isNaN(d.getTime()) || d.getTime() < Date.now()) return null;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

/** A ficha do estado em pares rótulo/valor, só com o que está preenchido. */
function fichaDoEstado(c: Ficha | null): string[][] {
  if (!c) return [];
  const linhas: string[][] = [];

  const vagas: string[] = [];
  if (c.vagasImediatas) vagas.push(`${c.vagasImediatas} imediatas`);
  if (c.vagasCr) vagas.push(`${c.vagasCr} em cadastro de reserva`);
  if (vagas.length > 0) linhas.push(["Vagas", vagas.join(" + ")]);
  else if (c.vagasDetalhe?.trim()) linhas.push(["Vagas", c.vagasDetalhe.trim()]);

  const salario = reais(c.salarioInicial);
  const teto = reais(c.salarioFinal);
  if (salario) {
    linhas.push(["Salário inicial", teto ? `${salario} (até ${teto})` : salario]);
  }

  if (c.cargaHoraria) linhas.push(["Carga horária", `${c.cargaHoraria}h semanais`]);
  if (c.banca?.trim()) linhas.push(["Banca", c.banca.trim()]);

  const inscricoes = dataFutura(c.inscricoesAte);
  if (inscricoes) linhas.push(["Inscrições até", inscricoes]);

  const prova = dataFutura(c.dataProva);
  if (prova) linhas.push(["Prova", prova]);

  if (c.previsao?.trim()) linhas.push(["Previsão do edital", c.previsao.trim()]);
  if (c.etapasConcurso?.trim()) linhas.push(["Etapas", c.etapasConcurso.trim()]);

  return linhas;
}

// ------------------------------------------------------------------- texto

/**
 * O título, montado do que a gente tem CONFERIDO — e não traduzido da manchete
 * de outro veículo.
 *
 * A ordem é de prioridade jornalística, e cada opção só é usada quando o dado
 * que ela promete existe de verdade: prazo aberto ganha de data de prova, que
 * ganha da etapa do funil. No fim da fila fica o título de situação, que é
 * sempre verdadeiro e sempre útil — "como está o concurso hoje".
 */
export function tituloDoPost(
  nomeOrgao: string,
  etapa: Nivel,
  ficha: Ficha | null,
  nomeEstado: string,
): string {
  const vagas = ficha?.vagasImediatas ? ` com ${ficha.vagasImediatas} vagas` : "";
  const inscricoes = porExtenso(ficha?.inscricoesAte ?? null);
  const prova = porExtenso(ficha?.dataProva ?? null);
  const banca = ficha?.banca?.trim();

  if (inscricoes) {
    return `Concurso ${nomeOrgao}: inscrições abertas até ${inscricoes} para médico-legista`;
  }
  if (etapa === "edital") {
    return `Concurso ${nomeOrgao}: edital publicado${vagas} para médico-legista`;
  }
  if (prova) {
    return `Concurso ${nomeOrgao}: prova marcada para ${prova}`;
  }
  if (etapa === "banca" && banca) {
    return `Concurso ${nomeOrgao}: ${banca} é a banca do certame`;
  }
  if (etapa === "banca") {
    return `Concurso ${nomeOrgao}: banca definida e edital no horizonte`;
  }
  if (etapa === "comissao") {
    return `Concurso ${nomeOrgao}: comissão formada e edital em preparação`;
  }
  if (etapa === "autorizado") {
    return `Concurso ${nomeOrgao} autorizado${vagas} para médico-legista`;
  }
  if (etapa === "solicitado") {
    return `Concurso ${nomeOrgao}: pedido de autorização em andamento`;
  }
  if (etapa === "estudo") {
    return `Concurso ${nomeOrgao}: novo edital em estudo`;
  }
  return `Concurso ${nomeOrgao}: como está o concurso de médico-legista em ${nomeEstado}`;
}

/**
 * A abertura do post: o que mudou, em uma ou duas frases nossas.
 *
 * Construída da etapa e dos números da ficha, nesta ordem — primeiro o fato,
 * depois o que ele vale. É o parágrafo que o leitor lê na listagem e no
 * compartilhamento, então ele carrega o número quando existe número.
 */
function abertura(
  nomeOrgao: string,
  comArtigo: string,
  etapa: Nivel,
  ficha: Ficha | null,
): string {
  const vagas = ficha?.vagasImediatas
    ? `${ficha.vagasImediatas} vaga${ficha.vagasImediatas > 1 ? "s" : ""} imediata${ficha.vagasImediatas > 1 ? "s" : ""}`
    : null;
  const cr = ficha?.vagasCr ? `${ficha.vagasCr} em cadastro de reserva` : null;
  const salario = reais(ficha?.salarioInicial ?? null);
  const banca = ficha?.banca?.trim();

  const numeros: string[] = [];
  if (vagas) numeros.push(vagas);
  if (cr) numeros.push(cr);

  const frases: string[] = [];

  switch (etapa) {
    case "edital":
      frases.push(
        `O concurso ${nomeOrgao} está com **edital publicado**, e a disputa pelas vagas de médico-legista ${comArtigo} começou de verdade.`,
      );
      break;
    case "banca":
      frases.push(
        `O concurso ${nomeOrgao} já tem **banca definida**${banca ? ` — é a ${banca}` : ""}. É a última etapa antes de o edital sair.`,
      );
      break;
    case "comissao":
      frases.push(
        `O concurso ${nomeOrgao} está com **comissão formada**: o grupo que organiza o certame já trabalha, e o edital costuma vir poucos meses depois.`,
      );
      break;
    case "autorizado":
      frases.push(
        `O concurso ${nomeOrgao} está **autorizado**. A decisão política já foi tomada; o que falta agora é cronograma.`,
      );
      break;
    case "solicitado":
      frases.push(
        `O concurso ${nomeOrgao} foi **solicitado** pelo órgão. É o primeiro sinal público de que o certame vem.`,
      );
      break;
    case "estudo":
      frases.push(
        `O concurso ${nomeOrgao} está **em estudo** dentro do órgão — a fase em que nascem as autorizações.`,
      );
      break;
    default:
      frases.push(
        `O concurso ${nomeOrgao} teve movimentação nesta semana, e vale olhar em que pé está a vaga de médico-legista ${comArtigo}.`,
      );
  }

  if (numeros.length > 0 && salario) {
    frases.push(`São ${numeros.join(" e ")}, com salário inicial de ${salario}.`);
  } else if (numeros.length > 0) {
    frases.push(`São ${numeros.join(" e ")}.`);
  } else if (salario) {
    frases.push(`O salário inicial do cargo é de ${salario}.`);
  }

  return frases.join(" ");
}

/**
 * O que dizer a quem está estudando, pela etapa em que o estado está.
 *
 * É a parte do post que não depende de ninguém escrever: a etapa sai do funil
 * que o monitor calcula, e o que fazer em cada etapa não muda de um estado
 * para o outro.
 */
const ORIENTACAO: Record<Nivel, string> = {
  edital:
    "Com o edital na mão, o conteúdo programático deixa de ser suposição. A partir daqui o que decide é treino no recorte que a banca cobra — e tempo, que passou a ser curto.",
  banca:
    "Banca definida é a hora de estudar pelo estilo dela. Prova anterior da mesma banca vale mais que qualquer resumo genérico: é ali que aparecem o nível de detalhe e o tipo de pegadinha que você vai encontrar.",
  comissao:
    "Comissão formada costuma dar poucos meses até o edital. É o momento de chegar com a base de medicina legal pronta — tanatologia, traumatologia, sexologia forense e perícia médico-legal — em vez de começar do zero com o cronômetro ligado.",
  autorizado:
    "Autorizado, o edital vira questão de prazo administrativo. Quem começa agora chega com a base formada; quem espera a publicação estuda correndo atrás.",
  solicitado:
    "Pedido feito é expectativa, não data. Mas é o momento mais barato de começar: a base de medicina legal leva meses para assentar e não muda de um edital para o outro.",
  estudo:
    "Ainda em estudo interno, sem data. Vale acompanhar de perto — é desta fase que saem as autorizações, e quem já está estudando ganha a dianteira.",
  noticia:
    "Sem mudança de etapa por enquanto. Serve para acompanhar o ritmo do estado e manter a preparação em dia.",
  sem: "Sem movimentação registrada até agora. Vale acompanhar o estado pelo mapa.",
};

/**
 * O corpo do post, inteiro escrito a partir da nossa base.
 *
 * Quatro blocos, na ordem em que a pessoa decide se continua lendo: o que
 * mudou, os números, o que isso muda para ela, e como se preparar. Sem
 * citação, sem crédito a veículo e sem frase reaproveitada de ninguém.
 */
export function corpoDoPost(
  uf: string,
  nomeEstado: string,
  nomeOrgao: string,
  etapa: Nivel,
  ficha: Ficha | null,
  /**
   * Uma frase a mais no primeiro bloco, quando existe um ato concreto para
   * noticiar (o contrato da banca saiu no Diário Oficial de hoje, por
   * exemplo). O robô não tem isso — ele só conhece a etapa. Quem cola a
   * matéria de referência tem, e era justamente o que faltava no texto.
   */
  fatoNovo?: string | null,
): string {
  const comArtigo = (() => {
    const nome = estadoComArtigo(uf);
    if (!nome) return `em ${nomeEstado}`;
    // "o Maranhão" → "no Maranhão"; "a Bahia" → "na Bahia"; "São Paulo" → "em São Paulo".
    if (nome.startsWith("o ")) return `n${nome}`;
    if (nome.startsWith("a ")) return `n${nome}`;
    return `em ${nome}`;
  })();

  const linhas: string[] = [
    "## O que mudou",
    "",
    abertura(nomeOrgao, comArtigo, etapa, ficha),
  ];

  if (fatoNovo?.trim()) linhas.push("", fatoNovo.trim());

  const tabela = fichaDoEstado(ficha);
  if (tabela.length > 0) {
    linhas.push(
      "",
      "## O que já está definido",
      "",
      "| O que | Hoje |",
      "| --- | --- |",
      `| Etapa | ${NIVEL_LABEL[etapa]} |`,
      ...tabela.map(([rotulo, valor]) => `| ${rotulo} | ${valor} |`),
      "",
      "Os números acima são os que o Clube Forense acompanha e confere estado a " +
        "estado. Quando algum deles mudar, o [mapa dos concursos]" +
        `(/?uf=${uf}) muda junto — ele é atualizado de hora em hora.`,
    );
  }

  if (ficha?.materias?.trim()) {
    linhas.push(
      "",
      "## O que cai de medicina legal",
      "",
      ficha.materias.trim(),
    );
  }

  linhas.push(
    "",
    "## O que isso muda para quem estuda",
    "",
    ORIENTACAO[etapa],
    "",
    "## Como se preparar",
    "",
    "O [preparatório do Clube Forense](https://app.clubeforense.com.br) é feito " +
      "para o cargo de médico-legista — aula, questão e revisão pelo recorte que " +
      "cai na prova de perícia, e não um curso de outra carreira adaptado. " +
      `A etapa atualizada ${comArtigo} fica sempre no ` +
      `[mapa dos concursos](/?uf=${uf}).`,
  );

  return linhas.join("\n");
}

/** O resumo do cartão: a abertura, cortada no tamanho da listagem. */
export function resumoDoPost(
  nomeOrgao: string,
  comArtigo: string,
  etapa: Nivel,
  ficha: Ficha | null,
): string {
  return abertura(nomeOrgao, comArtigo, etapa, ficha)
    .replace(/\*\*/g, "")
    .slice(0, 400);
}

// ------------------------------------------------------------------ rodada

/** Uma pauta que o robô acabou de abrir. */
export interface PostDoRobo {
  titulo: string;
  slug: string;
  uf: string;
  estado: string;
  fonte: string;
  etapa: string;
  publicado: boolean;
}

export interface ResultadoPautas {
  /** Quantas pautas nasceram nesta passada. */
  abertas: number;
  /** Quantas foram direto ao ar. Hoje sempre zero — ver o topo do arquivo. */
  publicadas: number;
  /** Quantas esperam um clique no painel. */
  naFila: number;
  /** Títulos, para o painel poder dizer o que apareceu. */
  titulos: string[];
  /** O detalhe de cada uma, para o aviso. */
  posts: PostDoRobo[];
  /**
   * Por que as notícias que NÃO viraram pauta ficaram de fora.
   *
   * EXISTE PORQUE "nenhuma pauta nova" é a resposta mais comum do robô e a
   * mais difícil de interpretar: não dá para saber se a busca falhou, se não
   * saiu notícia nenhuma ou se saiu e foi recusada — e as três pedem atitudes
   * diferentes. Com a contagem, o painel diz qual das três foi.
   */
  motivos: Motivos;
}

/** Quantas candidatas morreram em cada peneira, na ordem em que elas correm. */
export interface Motivos {
  /** Notícias de fora examinadas nesta passada. */
  examinadas: number;
  /** Mais velhas que a janela de 21 dias. */
  antigas: number;
  /** Seleção temporária — o blog não cobre. */
  temporarias: number;
  /** Fraude, suspensão, liminar e afins: assunto de gente, não de robô. */
  delicadas: number;
  /** Estado travado no painel, onde a manchete engana. */
  travadas: number;
  /** Ficha do estado com menos de dois fatos conferidos por nós. */
  fichaMagra: number;
  /**
   * Em quais estados isso aconteceu.
   *
   * É a única recusa que quem lê pode DESFAZER: basta preencher vagas,
   * salário, banca ou data da prova na ficha daquele estado, em Estados, e a
   * próxima passada já abre a pauta. Sem os nomes, o número é só um lamento.
   */
  fichaMagraUfs: string[];
  /** Pauta igual já publicada nos últimos dias. */
  repetidas: number;
  /** E de quais estados — útil para saber que o assunto já está no blog. */
  repetidasUfs: string[];
  /** Barradas pelo teto da rodada ou pelo limite de uma por estado. */
  limite: number;
  /** Lidas pela triagem e recusadas: a notícia não é do cargo de legista. */
  foraDoCargo: number;
  /** Quantas manchetes foram perguntadas ao modelo nesta passada. */
  triadas: number;
}

/**
 * Abre pauta para as notícias novas e relevantes do relatório.
 *
 * Nunca lança: a coleta e o cron não podem quebrar porque o blog teve um
 * problema. O que falhar fica de fora e a próxima passada tenta de novo — o
 * índice único em `fonte_url` é o que garante que tentar de novo não duplica.
 */
export async function abrirPautas(relatorio: Relatorio): Promise<ResultadoPautas> {
  const candidatas: { m: Mencao; etapa: Nivel; ficha: Ficha | null }[] = [];
  const motivos: Motivos = {
    examinadas: 0,
    antigas: 0,
    temporarias: 0,
    delicadas: 0,
    travadas: 0,
    fichaMagra: 0,
    fichaMagraUfs: [],
    repetidas: 0,
    repetidasUfs: [],
    limite: 0,
    foraDoCargo: 0,
    triadas: 0,
  };

  for (const estado of relatorio.estados) {
    for (const m of estado.mencoes) {
      // Curadoria é texto nosso, escrito no painel: virar pauta do robô seria o
      // sistema se citando como se fosse descoberta de fora.
      if (m.daCuradoria) continue;
      if (!m.link?.startsWith("http")) continue;
      motivos.examinadas++;
      if (!recente(m.data)) {
        motivos.antigas++;
        continue;
      }
      // Os cortes que o blog exige e o mapa não.
      if (m.temporaria) {
        motivos.temporarias++;
        continue;
      }
      if (NOTICIA_DELICADA.test(m.titulo.toLowerCase())) {
        motivos.delicadas++;
        continue;
      }
      // Estado travado na planilha é onde a gente já sabe que a manchete
      // engana. Post sobre ele é decisão de quem escreve, nunca do robô.
      if (estado.curadoria?.travado) {
        motivos.travadas++;
        continue;
      }

      candidatas.push({
        m,
        // A etapa que o post anuncia é a DO ESTADO, consolidada pelo monitor, e
        // não a da menção isolada: uma notícia sobre convocação de aprovados é
        // classificada como "menção recente" enquanto o estado está com edital
        // publicado, e anunciar a menor das duas seria informar menos do que a
        // gente sabe.
        etapa: estado.nivel,
        ficha: estado.curadoria,
      });
    }
  }

  // Mais recente primeiro: se o teto cortar, que corte o mais velho.
  candidatas.sort((a, b) => (b.m.data ?? "").localeCompare(a.m.data ?? ""));

  // O que já virou pauta nos últimos dias. Falha de banco devolve lista vazia,
  // e o pior que acontece é uma pauta repetida na fila.
  const anteriores: JaPautado[] = (await titulosRecentesDoRobo(DIAS_SEM_REPETIR)).map(
    (p) => ({ uf: p.uf, palavras: palavras(p.titulo) }),
  );

  // A TRIAGEM, ANTES DO SEGUNDO LAÇO E SÓ UMA VEZ. Vai em lote para o modelo
  // responder tudo numa chamada; o que já tem veredito guardado nem sai daqui.
  const triagem = await triarNoticias(
    candidatas.map(({ m }) => ({
      link: m.link,
      titulo: m.titulo,
      resumo: m.resumo,
      fonte: m.fonte,
      uf: m.uf,
    })),
  );
  motivos.triadas = triagem.perguntadas;

  const posts: PostDoRobo[] = [];
  const nestaRodadaPorUf = new Map<string, number>();

  for (const { m, etapa, ficha } of candidatas) {
    if (posts.length >= TETO_POR_RODADA) {
      motivos.limite++;
      break;
    }

    const estado = ESTADO_POR_UF[m.uf];
    if (!estado) continue;
    if ((nestaRodadaPorUf.get(m.uf) ?? 0) >= PAUTAS_POR_UF_POR_RODADA) {
      motivos.limite++;
      continue;
    }

    // A FICHA MAGRA DEIXOU DE SER VETO E VIROU PERGUNTA. Ela nasceu fazendo
    // dois trabalhos ao mesmo tempo: garantir que o post teria números para
    // mostrar, e servir de prova de que o concurso inclui o nosso cargo. O
    // segundo trabalho ela fazia mal — estado cuja ficha ninguém preencheu
    // ficava mudo no blog para sempre, por mais notícia que saísse, e foi o
    // que travou sete estados por semanas. Agora quem responde "isso é de
    // médico-legista?" é a triagem, que leu a manchete; a ficha volta a
    // responder só o que ela sabe, que é se há número para publicar.
    const tabela = fichaDoEstado(ficha);
    const magra = tabela.length < FATOS_MINIMOS;
    const veredito = triagem.vereditos.get(m.link);

    if (magra && !veredito?.relevante) {
      // Sem ficha E sem um "sim" da triagem — inclusive quando não houve
      // triagem nenhuma, por falta de chave ou de rede. O comportamento aqui é
      // exatamente o de antes, que é o que se quer de um caminho de falha.
      motivos.fichaMagra++;
      if (!motivos.fichaMagraUfs.includes(m.uf)) motivos.fichaMagraUfs.push(m.uf);
      continue;
    }

    if (!magra && veredito && !veredito.relevante) {
      // Ficha cheia mas a triagem leu a notícia e disse que não é do cargo.
      // A ficha descreve o ESTADO; a triagem leu ESTA notícia, e entre as duas
      // quem fala da notícia tem a palavra final sobre ela.
      motivos.foraDoCargo++;
      continue;
    }

    const orgao = orgaoDaUf(m.uf);
    const nomeOrgao = orgao?.curto ?? estado.nome;

    const comArtigo = estadoComArtigo(m.uf) ?? estado.nome;
    const titulo = tituloDoPost(nomeOrgao, etapa, ficha, estado.nome).slice(0, 200);

    // O título é gerado ANTES da checagem de repetição porque é ele que diz se
    // esta pauta acrescenta algo — ver jaSaiu.
    if (jaSaiu(m.uf, titulo, anteriores)) {
      motivos.repetidas++;
      if (!motivos.repetidasUfs.includes(m.uf)) motivos.repetidasUfs.push(m.uf);
      continue;
    }

    const pauta: PostParaGravar = {
      // A data entra no slug para a pauta do mês que vem não colidir com a
      // deste mês: os títulos são padronizados por etapa e se repetem.
      slug: aSlug(`${m.uf} ${(m.data ?? new Date().toISOString()).slice(0, 10)} ${titulo}`).slice(0, 80),
      titulo,
      resumo: resumoDoPost(
        nomeOrgao,
        comArtigo.startsWith("o ") || comArtigo.startsWith("a ")
          ? `n${comArtigo}`
          : `em ${comArtigo}`,
        etapa,
        ficha,
      ),
      corpo:
        corpoDoPost(m.uf, estado.nome, nomeOrgao, etapa, ficha) +
        // A pauta que entrou pela triagem não tem número nosso para mostrar, e
        // o texto sai curto. A marca é a mesma convenção do resto do painel:
        // ela não aparece para o leitor, mantém o post fora do "publicar
        // todos" e acende o aviso "Falta texto" na lista. O caminho de saída
        // está escrito nela — é a caixa de colar a matéria, logo acima.
        (magra
          ? `\n\n<!-- TEXTO INCOMPLETO. A ficha de ${estado.nome} ainda não tem\n` +
            `     os números deste concurso, então o texto acima só conta a etapa.\n` +
            `     Abra ${m.link}, copie a matéria e cole em "Colar a referência",\n` +
            `     no topo desta página: o texto é reescrito com os dados dela. -->`
          : ""),
      // A CAPA É NOSSA, E ISSO MUDOU POR UM MOTIVO SÉRIO. Antes o robô baixava a
      // foto de abertura da matéria de origem e guardava uma cópia, creditando
      // o veículo. Com o texto passando a ser escrito por nós e sem crédito a
      // ninguém, usar a foto do outro ficou pior e não melhor: fato é de
      // domínio público, fotografia tem dono. A capa passa a ser a imagem do
      // próprio estado, escolhida no painel — a mesma que o mapa mostra. Sem
      // imagem cadastrada, o post sai sem capa e o cartão se vira com a sigla
      // do órgão.
      capaUrl: ficha?.imagemUrl ?? null,
      capaCredito: null,
      uf: m.uf,
      orgao: orgao?.slug ?? null,
      // A categoria segue a ETAPA que o post anuncia, e não a classificação da
      // manchete que disparou a pauta: o texto fala do edital publicado, então
      // é matéria de edital — ainda que a notícia de origem fosse sobre a data
      // da prova.
      categoria: categoriaDoNivel(etapa),
      origem: "robo",
      // O nome do veículo NÃO vai para o post — o texto é nosso. O link fica
      // gravado porque é ele que impede a mesma notícia de virar duas pautas, e
      // porque quem revisa precisa poder conferir o fato na origem. O painel
      // mostra; a página pública, não.
      fonteNome: null,
      fonteUrl: m.link,
      publicadoEm: null,
      status: "revisao",
    };

    if (!(await gravarDoRobo(pauta, "revisao"))) continue;

    // Entra na comparação da própria rodada: duas manchetes parecidas vindas de
    // portais diferentes chegam na mesma passada, e sem isto as duas passariam.
    anteriores.push({ uf: m.uf, palavras: palavras(titulo) });
    nestaRodadaPorUf.set(m.uf, (nestaRodadaPorUf.get(m.uf) ?? 0) + 1);

    posts.push({
      titulo,
      slug: pauta.slug,
      uf: m.uf,
      estado: estado.nome,
      fonte: m.fonte || "fonte não identificada",
      etapa: NIVEL_LABEL[etapa],
      publicado: false,
    });
  }

  return {
    abertas: posts.length,
    publicadas: 0,
    naFila: posts.length,
    titulos: posts.map((p) => p.titulo),
    posts,
    motivos,
  };
}
