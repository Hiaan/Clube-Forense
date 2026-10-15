// Do que a coleta encontra para o blog.
//
// POR QUE ISTO NÃO MORA DENTRO DE `coletar()`: a coleta roda em toda visita ao
// mapa, e gravar no banco como efeito de uma leitura de página é o caminho mais
// curto para uma tabela cheia de lixo e uma home lenta. Aqui é uma função
// explícita, chamada por quem tem o direito de escrever: o cron e o botão
// "Coletar agora" do painel.
//
// O QUE O ROBÔ FAZ E O QUE ELE NÃO FAZ. Ele monta o post com o que a fonte
// disse — entre aspas e creditado —, diz em que etapa o estado está no nosso
// mapa e aponta o caminho para quem está estudando. Ele NÃO escreve análise:
// não existe modelo de linguagem neste projeto, e inventar parágrafo a partir
// de uma manchete de RSS é como se fabrica notícia errada. O que é nosso no
// post é a etapa do funil, que a gente calcula, e o encaminhamento.
//
// A FILA DEIXOU DE SER OBRIGATÓRIA, E ESSA FOI A MUDANÇA MAIS DELICADA DAQUI.
// Todo rascunho nascia em revisão e ia ao ar quando alguém aprovava. Na
// prática, notícia de concurso apodrece em um dia e a fila só era esvaziada
// quando sobrava tempo. Agora o robô publica sozinho — mas só o post que nasce
// COMPLETO:
//
//   • tem o que citar — o resumo do feed, quando diz algo além da manchete, ou
//     a descrição que o veículo publicou na própria página (ver
//     materiaDeOrigem.ts) — OU ficha de curadoria suficiente para o post somar
//     à notícia o que a gente já sabia do estado. Post feito só de manchete é
//     eco, não é post;
//   • não repete assunto já publicado nos últimos dias (a mesma notícia sai em
//     vinte portais, com vinte links diferentes, e o índice único em fonte_url
//     não vê isso);
//   • tem estado identificado, para o gancho com o mapa fazer sentido;
//   • e o estado não está travado na curadoria — onde a gente já sabe que a
//     manchete engana, quem decide é gente.
//
// O que falha em qualquer um desses pontos continua indo para a fila de
// revisão, com o esqueleto de sempre. E tudo que vai ao ar é avisado por
// e-mail com o link, para a revisão acontecer depois em vez de antes.

import {
  gravarDoRobo,
  titulosRecentesDoRobo,
  type PostParaGravar,
} from "../../lib/postsRepo";
import { aSlug, estadoComArtigo, orgaoDaUf } from "../../blog/lib/taxonomia";
import { ESTADO_POR_UF } from "./estados";
import { lerMateria } from "./materiaDeOrigem";
import {
  NIVEL_LABEL,
  type EstadoStatus,
  type Mencao,
  type Nivel,
  type Relatorio,
} from "./tipos";

/** Quantos posts uma passada pode criar. */
const TETO_POR_RODADA = 6;

/**
 * Teto por rodada, e não "abra tudo que achar".
 *
 * Quando um edital sai, a mesma notícia aparece em vinte portais no mesmo dia.
 * Sem limite, seriam vinte posts da mesma coisa numa tarde. A semelhança de
 * títulos barra a maioria; o teto é o que segura o resto, inclusive no dia em
 * que a comparação de títulos não reconhecer duas manchetes muito diferentes
 * sobre o mesmo fato.
 */

/** Só notícia recente vira post. Concurso de três meses atrás não é notícia. */
const JANELA_DIAS = 21;

/** Por quantos dias um assunto já publicado bloqueia um parecido. */
const DIAS_SEM_REPETIR = 12;

/** Acima disto, dois títulos falam da mesma coisa. */
const SEMELHANCA_MAXIMA = 0.45;

/** Um resumo menor que isto não sustenta um post. */
const RESUMO_MINIMO = 60;

/**
 * Quantas horas um estado espera entre dois posts automáticos.
 *
 * Posto depois de uma passada de teste que publicou quatro notícias de São
 * Paulo e duas do Maranhão de uma vez: eram quatro ângulos do mesmo fato,
 * assinados por quatro veículos, e nenhum par era parecido o bastante para a
 * comparação de títulos barrar. Um blog que publica quatro vezes sobre o mesmo
 * concurso numa hora parece robô — e é. Os ângulos excedentes não se perdem:
 * vão para a fila, onde quem escreve decide se vale um segundo post.
 */
const HORAS_ENTRE_POSTS_DA_UF = 6;

/** Quantos posts uma passada pode criar para o mesmo estado. */
const POSTS_POR_UF_POR_RODADA = 1;

/**
 * Teto de publicações automáticas em 24 horas.
 *
 * Vinte e quatro passadas por dia, até seis pautas em cada, é aritmética que
 * pode virar quarenta posts num dia de edital — e um blog com quarenta posts
 * num dia não é um blog, é um despejo. O teto segura isso num número que uma
 * pessoa consegue revisar depois. O que passa do teto não se perde: vai para a
 * fila, que é onde excesso deve esperar.
 */
const PUBLICADOS_POR_DIA = 8;

/**
 * Qual categoria do blog a notícia é.
 *
 * O estágio do funil já carrega essa informação: se o robô classificou a
 * notícia como "edital", é matéria de edital. O resto é notícia de andamento.
 */
function categoriaDoNivel(nivel: Nivel): string {
  return nivel === "edital" ? "edital" : "noticia";
}

function recente(iso: string | null): boolean {
  if (!iso) return false;
  const dias = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return dias >= 0 && dias <= JANELA_DIAS;
}

/**
 * Slug a partir do título, com a UF e a data na frente para não colidir.
 *
 * "Concurso PC-TO: edital sai em novembro" é manchete que se repete a cada
 * certame. Sem o prefixo, o segundo post com esse título seria recusado pelo
 * índice único e a pauta se perderia em silêncio.
 */
function slugDaPauta(m: Mencao, titulo: string): string {
  const quando = (m.data ?? new Date().toISOString()).slice(0, 10);
  return aSlug(`${m.uf} ${quando} ${titulo}`).slice(0, 80);
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
 * True quando o "resumo" é a manchete de novo, com outras palavras.
 *
 * O RSS do Google Notícias preenche a descrição do item com o próprio título
 * mais o nome do veículo — e isso passava no corte de tamanho mínimo, porque
 * manchete de concurso tem mais de sessenta caracteres. O resultado era um post
 * cuja citação em destaque repetia o título dele, palavra por palavra. Antes de
 * publicar qualquer coisa, o resumo tem de dizer algo que o título não diga.
 */
function ehSoOTitulo(resumo: string, titulo: string, fonte: string): boolean {
  const t = palavras(titulo);
  const doVeiculo = palavras(fonte);

  // O nome do veículo é descontado, e essa linha é o conserto de um caso real:
  // o resumo "Concurso Perícia Oficial MA: edital publicado com 76 vagas
  // Monster Concursos" é a manchete mais a assinatura, e a palavra "Monster"
  // bastava para o resumo parecer trazer informação nova.
  const r = new Set([...palavras(resumo)].filter((p) => !doVeiculo.has(p)));
  if (r.size === 0) return true;

  let repetidas = 0;
  for (const p of r) if (t.has(p)) repetidas += 1;
  return repetidas / r.size >= 0.8;
}

interface Publicado {
  uf: string | null;
  em: string | null;
  palavras: Set<string>;
}

/**
 * True quando este assunto já saiu.
 *
 * O estado entra na conta: "Concurso Polícia Científica: 55 vagas" em SP e em
 * GO são duas notícias, e as palavras que sobram podem ser as mesmas. Com UFs
 * diferentes, nunca é repetição.
 */
function jaSaiu(m: Mencao, anteriores: Publicado[]): boolean {
  const atual = palavras(m.titulo);
  return anteriores.some(
    (p) =>
      (p.uf === null || p.uf === m.uf) &&
      semelhanca(atual, p.palavras) >= SEMELHANCA_MAXIMA,
  );
}

// ------------------------------------------------------------------- texto

/**
 * O que dizer a quem está estudando, pela etapa em que o estado está.
 *
 * É a parte do post que é nossa e que não depende de ninguém escrever: a etapa
 * sai do funil que o monitor calcula, e o que fazer em cada etapa não muda de
 * um estado para o outro.
 */
const ORIENTACAO: Record<Nivel, string> = {
  edital:
    "Com edital publicado, o conteúdo programático está definido e o prazo é curto: daqui para a frente o que decide é treino em cima do que a banca cobra.",
  banca:
    "Com banca definida, já dá para estudar pelo estilo de prova dela — as questões anteriores da mesma banca valem mais que qualquer resumo genérico.",
  comissao:
    "Comissão formada é o passo que antecede o edital, e costuma dar poucos meses de intervalo. É a hora de estar com a base de medicina legal pronta, não começando.",
  autorizado:
    "Autorizado, o edital é questão de prazo administrativo. Quem começa agora chega com a base formada; quem espera o edital estuda com o cronômetro ligado.",
  solicitado:
    "O pedido feito é o primeiro sinal público de que o concurso vem. Nada garante data, mas é o momento mais barato de começar.",
  estudo:
    "Ainda em estudo interno, sem data definida. Vale acompanhar: é desta fase que saem as autorizações.",
  noticia:
    "Notícia de andamento, sem mudança de etapa. Serve para acompanhar o ritmo do estado.",
  sem: "Sem movimentação registrada no estado até agora.",
};

/**
 * Tira do título o nome do veículo que o Google Notícias cola no fim.
 *
 * O feed entrega "Concurso Perícia Oficial MA: edital publicado - Monster
 * Concursos", e o crédito já aparece logo abaixo da citação no post. Repetido
 * no título, vira um blog nosso anunciando a marca de outro.
 */
function tituloLimpo(titulo: string, fonte: string): string {
  const bruto = titulo.trim();
  if (!fonte) return bruto;
  const sufixo = ` - ${fonte.trim()}`;
  return bruto.toLowerCase().endsWith(sufixo.toLowerCase())
    ? bruto.slice(0, -sufixo.length).trim()
    : bruto;
}

/** Data em português, para o corpo do post. */
function emPortugues(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
}

type Ficha = NonNullable<EstadoStatus["curadoria"]>;

/** "14600" → "R$ 14.600". Sem centavos: salário de edital é número redondo. */
function reais(v: number | null): string | null {
  if (v === null || !Number.isFinite(v) || v <= 0) return null;
  return `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
}

/**
 * "2026-11-20" → "20/11/2026", e `null` quando a data já passou.
 *
 * O corte no passado é o que evita a ficha mentir por omissão: o campo
 * "inscrições até 05/10" numa tabela chamada "o que sabemos hoje" lê-se como
 * prazo em aberto, quando o prazo acabou na semana anterior. Prazo vencido não
 * é informação sobre hoje — e quem precisa dele acha no mapa, com a história
 * completa do estado.
 */
function dataFutura(v: string | null): string | null {
  if (!v?.trim()) return null;
  const d = new Date(v.length <= 10 ? `${v}T12:00:00Z` : v);
  if (Number.isNaN(d.getTime())) return v.trim();
  return d.getTime() >= Date.now() ? d.toLocaleDateString("pt-BR") : null;
}

/**
 * O que a curadoria tem confirmado sobre o estado, em pares rótulo/valor.
 *
 * ESTA É A PARTE QUE TORNA O POST PUBLICÁVEL QUANDO NÃO HÁ O QUE CITAR. A maior
 * parte das notícias chega pelo Google Notícias, que entrega manchete, data e um
 * link de redirecionamento — nenhum parágrafo para citar, e nenhuma página de
 * onde tirar um (o endereço aponta para uma tela de redirecionamento em
 * JavaScript, sem metadado nenhum; foi verificado). Um post feito só com isso
 * seria a manchete de outro veículo repetida. Mas a gente tem o que o veículo
 * não tem: a ficha do estado, conferida à mão no painel — vagas, salário,
 * banca, data de prova. Com ela, o post deixa de ser eco e passa a ser a
 * notícia somada ao que a gente já sabia.
 *
 * A etapa não entra na contagem de fatos: é derivada da própria coleta e existe
 * em todo estado, então contá-la deixaria passar post com tabela de uma linha.
 */
function fichaDoEstado(c: Ficha | null): string[][] {
  if (!c) return [];
  const linhas: string[][] = [];

  const vagas: string[] = [];
  if (c.vagasImediatas) vagas.push(`${c.vagasImediatas} imediatas`);
  if (c.vagasCr) vagas.push(`${c.vagasCr} em cadastro de reserva`);
  if (vagas.length > 0) linhas.push(["Vagas", vagas.join(" + ")]);
  else if (c.vagasDetalhe?.trim()) linhas.push(["Vagas", c.vagasDetalhe.trim()]);

  const salario = reais(c.salarioInicial);
  if (salario) linhas.push(["Salário inicial", salario]);

  if (c.cargaHoraria) linhas.push(["Carga horária", `${c.cargaHoraria}h semanais`]);
  if (c.banca?.trim()) linhas.push(["Banca", c.banca.trim()]);

  const inscricoes = dataFutura(c.inscricoesAte);
  if (inscricoes) linhas.push(["Inscrições até", inscricoes]);

  const prova = dataFutura(c.dataProva);
  if (prova) linhas.push(["Prova", prova]);

  if (c.previsao?.trim()) linhas.push(["Previsão do edital", c.previsao.trim()]);

  return linhas;
}

/** Quantos fatos da ficha sustentam um post sem citação. */
const FATOS_MINIMOS = 2;

/**
 * O resumo do cartão quando não há citação: a etapa e os primeiros fatos.
 *
 * Montado a partir da ficha, e não da notícia: é tudo dado nosso, conferido, e
 * é o que o cartão da listagem precisa para dizer algo em uma linha.
 */
function resumoDaFicha(etapa: Nivel, uf: string, ficha: string[][]): string {
  const fatos = ficha
    .slice(0, 3)
    .map(([rotulo, valor]) => `${rotulo.toLowerCase()}: ${valor}`)
    .join("; ");
  // Travessão, e não ponto: depois de ponto a primeira palavra do fato ficava
  // minúscula ("Edital publicado (MA). vagas: 76 imediatas"), e dava a
  // impressão de texto cortado pela metade.
  return `${NIVEL_LABEL[etapa]} (${uf}) — ${fatos}.`;
}

/**
 * O corpo do post que vai ao ar sem passar pela fila.
 *
 * Duas aberturas possíveis, e a escolha não é de estilo. Quando existe um
 * parágrafo do veículo para citar, ele abre o post entre aspas e creditado: o
 * que é de outro fica visivelmente de outro. Quando não existe — e é o caso da
 * maioria das notícias que chegam pelo Google Notícias —, a abertura é a
 * manchete atribuída em itálico, que é a forma honesta de dizer "isto quem
 * disse foi eles".
 *
 * Depois vem o que é nosso: a ficha do estado em tabela, ou, na falta dela, a
 * etapa em uma frase. E no fim a nota dizendo que o post foi aberto pelo
 * monitor — que não é disclaimer defensivo, e sim o que permite publicar rápido
 * sem fingir uma apuração que não houve.
 */
function corpoDoPost(
  m: Mencao,
  nomeEstado: string,
  etapa: Nivel,
  citacao: string | null,
  ficha: string[][],
): string {
  const quando = emPortugues(m.data);
  const fonte = m.fonte || "A fonte";
  const link = `[Ler a matéria original](${m.link})`;

  const abertura = citacao
    ? [
        `> ${citacao}`,
        "",
        `— ${fonte}${quando ? `, ${quando}` : ""}. ${link}`,
      ]
    : [
        `**${fonte}** publicou${quando ? `, em ${quando}` : ""}: ` +
          `*${tituloLimpo(m.titulo, m.fonte)}*. ${link}`,
      ];

  const nosso =
    ficha.length > 0
      ? [
          // "sobre o Maranhão", "sobre a Bahia", "sobre São Paulo": o artigo
          // vem da tabela do blog, que já resolve os 27 casos.
          `## O que o Clube Forense tem confirmado sobre ${estadoComArtigo(m.uf) ?? nomeEstado}`,
          "",
          "| O que | Hoje |",
          "| --- | --- |",
          `| Etapa no mapa | ${NIVEL_LABEL[etapa]} |`,
          ...ficha.map(([rotulo, valor]) => `| ${rotulo} | ${valor} |`),
          "",
          "Esses dados são da nossa curadoria — conferidos um a um, e não " +
            "recortados da notícia. O estado inteiro, com histórico, IMLs e as " +
            `últimas movimentações, está no [mapa dos concursos](/?uf=${m.uf}).`,
        ]
      : [
          `## Onde ${nomeEstado} está hoje`,
          "",
          `No mapa do Clube Forense, ${estadoComArtigo(m.uf) ?? nomeEstado} ` +
            `aparece hoje como **${NIVEL_LABEL[etapa].toLowerCase()}**. As vagas, ` +
            "o salário e as últimas notícias do estado ficam no " +
            `[mapa dos concursos](/?uf=${m.uf}), atualizado de hora em hora.`,
        ];

  return [
    ...abertura,
    "",
    ...nosso,
    "",
    "## Para quem está estudando",
    "",
    ORIENTACAO[etapa],
    "",
    "No [preparatório do Clube Forense](https://app.clubeforense.com.br) o curso " +
      "de medicina legal é feito para este cargo — e não adaptado de outra carreira.",
    "",
    "---",
    "",
    "*Este post foi aberto pelo monitor do Clube Forense no dia em que a fonte " +
      "citada publicou, para a notícia não chegar atrasada. A leitura do Clube " +
      "entra na revisão.*",
  ].join("\n");
}


/**
 * O esqueleto, para o que vai à fila.
 *
 * Markdown, com três partes: o que a fonte disse (entre aspas e creditado, para
 * ninguém confundir com texto nosso), um lugar marcado para a análise do Clube
 * e o gancho para o mapa. Quem revisa reescreve a primeira parte e preenche a
 * segunda; o que não for reescrito continua honesto, porque está atribuído.
 *
 * O aviso de texto faltando é texto normal, e não comentário de HTML: o
 * renderizador do blog monta elementos React a partir do Markdown e não
 * esconde comentário nenhum — se este post fosse ao ar por engano, o
 * comentário apareceria na tela do leitor. Em texto, ele é reconhecido pelo
 * painel, que marca o post como "Falta texto" e o mantém fora da publicação em
 * massa.
 */
function esqueleto(m: Mencao, nomeEstado: string, etapa: Nivel): string {
  const resumo = m.resumo?.trim();
  const estagio = NIVEL_LABEL[etapa];

  return [
    resumo ? `> ${resumo}` : `> ${m.titulo}`,
    "",
    `Segundo ${m.fonte || "a fonte"}${m.data ? `, em ${emPortugues(m.data)}` : ""}. ` +
      `[Ler a matéria original](${m.link})`,
    "",
    "## O que isso muda",
    "",
    "TEXTO INCOMPLETO — escreva aqui a leitura do Clube: o que a notícia",
    "significa para quem está estudando, o que já era sabido e o que é novo.",
    "Sem esta parte, o post é só a manchete de outro veículo repetida.",
    "",
    "## Onde o estado está hoje",
    "",
    `No nosso monitor, ${nomeEstado} aparece como **${estagio}**. ` +
      `Veja a etapa, as vagas e o salário no [mapa dos concursos](/?uf=${m.uf}).`,
  ].join("\n");
}

// ------------------------------------------------------------------ rodada

/** Um post que o robô acabou de criar. */
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
  /** Quantos posts nasceram nesta passada, somando os dois destinos. */
  abertas: number;
  /** Quantos foram direto ao ar. */
  publicadas: number;
  /** Quantos ficaram na fila por não estarem completos. */
  naFila: number;
  /** Títulos, para o painel poder dizer o que apareceu. */
  titulos: string[];
  /** O detalhe de cada um, para o aviso por e-mail. */
  posts: PostDoRobo[];
}

/**
 * Transforma as notícias novas e relevantes do relatório em posts.
 *
 * Nunca lança: a coleta e o cron não podem quebrar porque o blog teve um
 * problema. O que falhar fica de fora e a próxima passada tenta de novo — o
 * índice único em `fonte_url` é o que garante que tentar de novo não duplica.
 */
/** True quando o resumo do feed diz algo além da manchete. */
function resumoAproveitavel(m: Mencao): boolean {
  const doFeed = (m.resumo ?? "").trim();
  if (doFeed.length < RESUMO_MINIMO) return false;
  return !ehSoOTitulo(doFeed, tituloLimpo(m.titulo, m.fonte), m.fonte);
}

export async function abrirPautas(relatorio: Relatorio): Promise<ResultadoPautas> {
  const candidatas: {
    m: Mencao;
    travado: boolean;
    etapa: Nivel;
    ficha: string[][];
    publicavel: boolean;
  }[] = [];

  for (const estado of relatorio.estados) {
    // Estado travado na planilha é o caso que mais pede olho humano, e por
    // isso nenhuma notícia dele vai ao ar sozinha. O travamento existe
    // justamente onde a manchete engana: a Polícia Científica SP teve 55 vagas
    // autorizadas e nenhuma de médico-legista, e um post automático dizendo
    // "55 vagas autorizadas" seria uma promessa falsa assinada por nós. A
    // pauta continua nascendo — na fila, onde dá para escrever o que a manchete
    // não diz.
    const travado = estado.curadoria?.travado === true;

    // A ficha é a mesma para todas as notícias do estado: vale calcular uma vez.
    const ficha = fichaDoEstado(estado.curadoria);

    for (const m of estado.mencoes) {
      // Curadoria é texto nosso, escrito no painel: virar "pauta do robô" seria
      // o sistema se citando como se fosse fonte externa.
      if (m.daCuradoria) continue;
      if (!m.link?.startsWith("http")) continue;
      if (!recente(m.data)) continue;
      // A etapa que o post anuncia é a DO ESTADO, consolidada pelo monitor, e
      // não a da menção isolada. Uma manchete sobre convocação de aprovados é
      // classificada como "menção recente" e o estado pode estar com edital
      // publicado; dizer "o estado aparece como menção recente" seria informar
      // menos do que a gente sabe, e soar como erro para quem acompanha.
      candidatas.push({
        m,
        travado,
        etapa: estado.nivel,
        ficha,
        // "Dá para publicar sozinho?" é o que ordena a lista, e por isso o
        // travamento entra na conta aqui: notícia de estado travado nunca vai
        // ao ar sozinha, e deixá-la na frente faria o estado gastar a vaga da
        // rodada com uma pauta que ia para a fila de qualquer jeito.
        publicavel:
          !travado && (resumoAproveitavel(m) || ficha.length >= FATOS_MINIMOS),
      });
    }
  }

  // A ordem decide quem fica com a vaga do estado na rodada, e por isso a
  // notícia COM RESUMO vem antes da mais recente. A mesma história chega por
  // vários caminhos: pelo feed do portal, com o parágrafo que o veículo
  // escreveu, e pelo Google Notícias, cuja descrição é a própria manchete
  // repetida. Ordenando só por data, a versão pobre chegava primeiro e levava
  // a vaga; a boa ia para a fila. Agora é o contrário, e a repetida é
  // justamente a que a comparação de títulos descarta.
  candidatas.sort(
    (a, b) =>
      Number(b.publicavel) - Number(a.publicavel) ||
      (b.m.data ?? "").localeCompare(a.m.data ?? ""),
  );

  // O que o robô publicou nos últimos dias, para não repetir assunto. Falha de
  // banco devolve lista vazia, e o pior que acontece é um post repetido.
  const anteriores: Publicado[] = (await titulosRecentesDoRobo(DIAS_SEM_REPETIR)).map(
    (p) => ({ uf: p.uf, em: p.em, palavras: palavras(p.titulo) }),
  );

  /** Quantos posts o robô publicou nas últimas 24 horas. */
  function publicadosHoje(): number {
    const corte = Date.now() - 86_400_000;
    return anteriores.filter((p) => {
      if (!p.em) return false;
      const t = new Date(p.em).getTime();
      return !Number.isNaN(t) && t >= corte;
    }).length;
  }

  /** Horas desde o último post do robô sobre este estado. */
  function horasDesdeOUltimoDaUf(uf: string): number {
    const datas = anteriores
      .filter((p) => p.uf === uf && p.em)
      .map((p) => new Date(p.em as string).getTime())
      .filter((t) => !Number.isNaN(t));
    if (datas.length === 0) return Infinity;
    return (Date.now() - Math.max(...datas)) / 3_600_000;
  }

  const posts: PostDoRobo[] = [];
  const nestaRodadaPorUf = new Map<string, number>();

  // `publicavel` só serve para ordenar: aqui a decisão é refeita com o que a
  // matéria de origem tiver trazido, que a ordenação não podia saber.
  for (const { m, travado, etapa, ficha } of candidatas) {
    if (posts.length >= TETO_POR_RODADA) break;

    const estado = ESTADO_POR_UF[m.uf];
    if (!estado) continue;
    if (jaSaiu(m, anteriores)) continue;
    if ((nestaRodadaPorUf.get(m.uf) ?? 0) >= POSTS_POR_UF_POR_RODADA) continue;

    const titulo = tituloLimpo(m.titulo, m.fonte).slice(0, 200);

    // A matéria de origem é lida por último e nunca bloqueia: dela vêm a capa e
    // o resumo que o veículo escreveu para si. Sem ela o post vive — mas vai
    // para a fila em vez de ir ao ar, porque falta o que citar.
    const materia = await lerMateria(m.link).catch(() => ({
      capaUrl: null,
      descricao: null,
    }));

    // O resumo do feed vale quando diz algo além da manchete; quando não, vale
    // o que o próprio veículo publicou como descrição da matéria. Sem nenhum
    // dos dois, não há o que citar — e sem citação o post vai para a fila.
    // Duas formas de ter o que citar: o resumo do feed, quando diz algo além da
    // manchete, ou a descrição que o próprio veículo publicou na página.
    const bruto = resumoAproveitavel(m)
      ? (m.resumo ?? "").trim()
      : (materia.descricao ?? "");
    const citacao =
      bruto.length >= RESUMO_MINIMO && !ehSoOTitulo(bruto, titulo, m.fonte)
        ? bruto
        : null;

    // Vai ao ar quando há o que citar OU ficha suficiente para o post dizer
    // algo que a manchete não diz. Sem nenhum dos dois, fila.
    const completo =
      !travado &&
      (citacao !== null || ficha.length >= FATOS_MINIMOS) &&
      horasDesdeOUltimoDaUf(m.uf) >= HORAS_ENTRE_POSTS_DA_UF &&
      publicadosHoje() < PUBLICADOS_POR_DIA;
    const status = completo ? "publicado" : "revisao";

    // O resumo do cartão da listagem: a citação quando há, a ficha quando não,
    // e o resumo cru do feed como último recurso — para a pauta na fila não
    // aparecer no painel só com o título.
    const resumoDoCartao =
      citacao ??
      (ficha.length >= FATOS_MINIMOS
        ? resumoDaFicha(etapa, m.uf, ficha)
        : (m.resumo ?? "").trim());

    const pauta: PostParaGravar = {
      slug: slugDaPauta(m, titulo),
      titulo,
      resumo: resumoDoCartao.slice(0, 400),
      corpo: completo
        ? corpoDoPost(m, estado.nome, etapa, citacao, ficha)
        : esqueleto(m, estado.nome, etapa),
      capaUrl: materia.capaUrl,
      capaCredito: materia.capaUrl ? m.fonte || null : null,
      uf: m.uf,
      orgao: orgaoDaUf(m.uf)?.slug ?? null,
      // A categoria vem da menção, e não do estado: um post sobre a publicação
      // do edital é matéria de edital mesmo num estado cuja etapa já avançou.
      categoria: categoriaDoNivel(m.nivel),
      origem: "robo",
      fonteNome: m.fonte || null,
      fonteUrl: m.link,
      // A data da notícia, e não a de agora: o post sai com o dia do fato.
      publicadoEm: completo ? (m.data ?? null) : null,
      status,
    };

    if (!(await gravarDoRobo(pauta, status))) continue;

    // Entra na comparação da própria rodada: duas manchetes parecidas vindas de
    // portais diferentes chegam na mesma passada, e sem isto as duas passariam.
    // Só o que foi publicado conta como "último post do estado" — o que está na
    // fila não saiu, e não deve impedir o próximo de sair.
    anteriores.push({
      uf: m.uf,
      em: completo ? (m.data ?? new Date().toISOString()) : null,
      palavras: palavras(titulo),
    });
    // Conta publicada e enfileirada: uma pauta por estado por rodada. A
    // ordenação acima é o que torna isso seguro — a vaga do estado fica com a
    // melhor versão da notícia, e não com a primeira que apareceu. Sem o teto,
    // uma autorização em São Paulo enchia a rodada com quatro versões da mesma
    // coisa, assinadas por quatro veículos.
    nestaRodadaPorUf.set(m.uf, (nestaRodadaPorUf.get(m.uf) ?? 0) + 1);

    posts.push({
      titulo,
      slug: pauta.slug,
      uf: m.uf,
      estado: estado.nome,
      fonte: m.fonte || "fonte não identificada",
      etapa: NIVEL_LABEL[etapa],
      publicado: completo,
    });
  }

  return {
    abertas: posts.length,
    publicadas: posts.filter((p) => p.publicado).length,
    naFila: posts.filter((p) => !p.publicado).length,
    titulos: posts.map((p) => p.titulo),
    posts,
  };
}
