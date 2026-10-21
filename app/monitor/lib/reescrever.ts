// Transformar a matéria dos outros no post do Clube.
//
// O PROBLEMA QUE ISTO RESOLVE. O robô só conhece a etapa do estado e a ficha
// que nós preenchemos. Quando sai uma notícia com um fato novo e concreto — "o
// Diário Oficial de hoje trouxe o contrato da FGV para a PCERJ" —, o texto que
// ele monta fica certo e genérico ao mesmo tempo: anuncia "banca definida" sem
// dizer que a banca acabou de ser contratada nem quando. É o "muito resumido e
// às vezes nem tem a informação principal".
//
// O CAMINHO ESCOLHIDO: NÃO REESCREVER A MATÉRIA, EXTRAIR OS FATOS DELA. Um
// parafraseador trocaria as palavras do jornalista pelas nossas e continuaria
// sendo o texto dele — com o risco de direito autoral junto. O que este módulo
// faz é ler o texto colado atrás de FATOS (banca, vagas, salário, carga
// horária, datas, etapa, publicação em Diário Oficial), jogar esses fatos na
// ficha do estado e mandar o nosso gerador de sempre escrever o post. O texto
// que sai é 100% nosso, no mesmo modelo dos outros; o que veio de fora são
// números e nomes próprios, que não pertencem a ninguém.
//
// ONDE ISTO PARA, E ESTÁ DECLARADO NA TELA. Ele extrai o que cabe em campo:
// não entende contexto, não resume argumento e não inventa. Se a matéria disser
// algo relevante que não seja um desses campos, isso não entra sozinho — quem
// revisa escreve. Um reescritor de verdade, que lê qualquer texto e devolve
// qualquer texto, é trabalho de modelo de linguagem e exige chave de API, que
// este projeto não tem.

import { corpoDoPost, resumoDoPost, tituloDoPost, type Ficha } from "./pautas";
import { ESTADO_POR_UF } from "./estados";
import { estadoComArtigo, orgaoDaUf } from "../../blog/lib/taxonomia";
import { type Nivel } from "./tipos";

/** O que deu para ler no texto colado. `null` é "não achei", nunca "não tem". */
export interface Fatos {
  banca: string | null;
  vagasImediatas: number | null;
  vagasCr: number | null;
  salarioInicial: number | null;
  cargaHoraria: number | null;
  /** ISO curto (yyyy-mm-dd). Só data firme — previsão vai em `previsao`. */
  inscricoesAte: string | null;
  dataProva: string | null;
  /** O que o texto trata como expectativa, em palavras, nunca como data certa. */
  previsao: string | null;
  /** A etapa que o texto descreve, quando ele é explícito. */
  etapa: Nivel | null;
  /** O texto fala em publicação no Diário Oficial / extrato de contrato. */
  noDiarioOficial: boolean;
  /** A UF que o texto cita, para avisar quando não bate com a escolhida. */
  uf: string | null;
  /**
   * Se o número de vagas estava colado na palavra "legista".
   *
   * É A DIFERENÇA ENTRE UM POST CERTO E UM POST VERGONHOSO. Matéria de
   * concurso de polícia civil abre com o total do certame — "329 vagas" —, e
   * as de médico-legista são uma fração disso: no último concurso da PCERJ
   * foram 25 de 350. Publicar "329 vagas para médico-legista" seria mentira
   * nossa, não do jornalista. Quando o número não vem junto da palavra, ele
   * ainda é usado, mas a tela avisa em letras grandes.
   */
  vagasDeLegista: boolean;
}

// ----------------------------------------------------------------- bancas

/**
 * As bancas que cobram o cargo, com as grafias que aparecem na imprensa.
 *
 * Lista fechada de propósito: "a banca será definida" não pode virar banca
 * chamada "será". Nome que não está aqui simplesmente não é reconhecido, e
 * quem revisa digita — que é melhor do que o campo nascer errado.
 */
const BANCAS: { nome: string; padrao: RegExp }[] = [
  { nome: "FGV", padrao: /\bFGV\b|Funda[çc][ãa]o Get[úu]lio Vargas/i },
  { nome: "Cebraspe", padrao: /\bCEBRASPE\b|\bCESPE\b/i },
  { nome: "Cesgranrio", padrao: /\bCESGRANRIO\b/i },
  { nome: "Vunesp", padrao: /\bVUNESP\b/i },
  { nome: "FCC", padrao: /\bFCC\b|Funda[çc][ãa]o Carlos Chagas/i },
  { nome: "IBFC", padrao: /\bIBFC\b/i },
  { nome: "Quadrix", padrao: /\bQUADRIX\b/i },
  { nome: "AOCP", padrao: /\bAOCP\b/i },
  { nome: "Idecan", padrao: /\bIDECAN\b/i },
  { nome: "Fundatec", padrao: /\bFUNDATEC\b/i },
  { nome: "Iades", padrao: /\bIADES\b/i },
  { nome: "Ibade", padrao: /\bIBADE\b/i },
  { nome: "Selecon", padrao: /\bSELECON\b/i },
  { nome: "Consulplan", padrao: /\bCONSULPLAN\b/i },
  { nome: "Legalle", padrao: /\bLEGALLE\b/i },
  { nome: "Instituto Access", padrao: /\bINSTITUTO ACCESS\b|\bACCESS\b/i },
  { nome: "NC-UFPR", padrao: /\bNC-?UFPR\b/i },
  { nome: "Instituto Avalia", padrao: /\bAVALIA\b/i },
  { nome: "Instituto Consulpam", padrao: /\bCONSULPAM\b/i },
];

function acharBanca(t: string): string | null {
  return BANCAS.find((b) => b.padrao.test(t))?.nome ?? null;
}

// ------------------------------------------------------------------ datas

const MESES: Record<string, number> = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

/** "10 de janeiro de 2027" e "10/01/2027" viram "2027-01-10". */
function lerDatas(t: string): { iso: string; posicao: number }[] {
  const achadas: { iso: string; posicao: number }[] = [];
  const ano = new Date().getFullYear();

  const porExtenso = /(\d{1,2})\s*de\s*([a-zç]{3,9})(?:\s*de\s*(\d{4}))?/gi;
  for (const m of t.matchAll(porExtenso)) {
    const mes = MESES[m[2].slice(0, 3).toLowerCase()];
    if (!mes) continue;
    const dia = Number(m[1]);
    if (dia < 1 || dia > 31) continue;
    const a = m[3] ? Number(m[3]) : ano;
    achadas.push({
      iso: `${a}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      posicao: m.index ?? 0,
    });
  }

  const barras = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g;
  for (const m of t.matchAll(barras)) {
    const dia = Number(m[1]);
    const mes = Number(m[2]);
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12) continue;
    const a = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    achadas.push({
      iso: `${a}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      posicao: m.index ?? 0,
    });
  }

  return achadas.sort((a, b) => a.posicao - b.posicao);
}

/**
 * A data que uma palavra-chave manda, lida dentro da oração dela.
 *
 * DUAS ARMADILHAS, AS DUAS PEGARAM NO PRIMEIRO TESTE.
 *
 * A primeira é a vizinhança. "Inscrições até 15 de janeiro de 2027 e prova
 * prevista para 22 de março de 2027" tem duas datas a poucos caracteres uma da
 * outra; uma janela de caracteres pega as duas e qualquer critério entre elas
 * é chute. A oração resolve: o trecho vai da palavra-chave até o ponto, o
 * ponto e vírgula ou o "e" que emenda o próximo assunto. Dentro da oração, a
 * última data é a certa — porque "de 5 a 30 de março" é um prazo, e o que
 * importa num prazo é quando ele fecha.
 *
 * A segunda é o tempo verbal. "A expectativa é de que as inscrições comecem em
 * janeiro" não é prazo aberto, é palpite do jornalista, e virava no nosso
 * título "inscrições abertas até 15 de janeiro" — uma informação falsa escrita
 * com todas as letras no lugar mais visível do post. Oração com marca de
 * previsão não vira data; vira texto na linha "Previsão do edital".
 */
const PREVISAO = /expectativa|previs[ãa]o|previst[ao]|dever[áa]|deve ser|prev[êe]|estimativa|provavelmente|possivelmente|aguarda/i;

function dataDaChave(
  t: string,
  datas: { iso: string; posicao: number }[],
  chave: RegExp,
): { iso: string; ehPrevisao: boolean } | null {
  for (const m of t.matchAll(new RegExp(chave.source, "gi"))) {
    const i = m.index ?? 0;
    const bruto = t.slice(i, i + 220);
    // O fim da oração: pontuação, ou o "e" que começa outro assunto.
    const corte = bruto.slice(1).search(/[.;:]|\se\s+(?:a|o|as|os|com)?\s*(?:prova|edital|resultado|publica|inscri|posse|curso)/i);
    const trecho = corte > 0 ? bruto.slice(0, corte + 1) : bruto;

    const dentro = datas.filter((d) => d.posicao >= i && d.posicao < i + trecho.length);
    if (dentro.length === 0) continue;

    // A marca de previsão pode estar logo antes da palavra-chave ("há
    // expectativa de inscrições em…"), por isso a sobra de 80 à esquerda.
    const contexto = t.slice(Math.max(0, i - 80), i + trecho.length);
    return {
      iso: dentro.map((d) => d.iso).sort().at(-1)!,
      ehPrevisao: PREVISAO.test(contexto),
    };
  }
  return null;
}

// ------------------------------------------------------------------ etapa

/**
 * A etapa que o texto descreve.
 *
 * A ordem importa: ela vai da mais avançada para a menos, porque uma matéria
 * sobre edital publicado quase sempre relembra que o concurso foi autorizado
 * antes. Quem casa primeiro, vence.
 */
const ETAPAS: { nivel: Nivel; padrao: RegExp }[] = [
  { nivel: "edital", padrao: /edital\s+(?:foi\s+)?(?:publicado|divulgado|lan[çc]ado)|publica[çc][ãa]o do edital|sa[íi]u o edital/i },
  // "contrato com a FGV é publicado" e "a FGV, banca organizadora do certame"
  // são as duas formas que mais aparecem quando a banca sai, e nenhuma das
  // duas usa o verbo que a primeira versão esperava — o fato ficava de fora.
  { nivel: "banca", padrao: /banca\s+(?:foi\s+)?(?:definida|escolhida|contratada|confirmada|anunciada)|contrata[çc][ãa]o da banca|organizadora\s+(?:foi\s+)?(?:definida|escolhida|contratada)|banca organizadora|contrato[^.]{0,60}(?:banca|organizadora)|(?:banca|organizadora)[^.]{0,60}contrato/i },
  { nivel: "comissao", padrao: /comiss[ãa]o\s+(?:organizadora\s+)?(?:foi\s+)?(?:formada|criada|constitu[íi]da|nomeada|designada)/i },
  { nivel: "autorizado", padrao: /(?:concurso|certame)\s+(?:foi\s+)?autorizad|autoriza[çc][ãa]o (?:do|para o) (?:concurso|certame)|governador autorizou/i },
  { nivel: "solicitado", padrao: /pedido de autoriza[çc][ãa]o|solicitou (?:a )?autoriza[çc][ãa]o|of[íi]cio.{0,40}solicit/i },
];

/**
 * A frase da previsão, quando as datas do texto são palpite e não calendário.
 *
 * Vai para a linha "Previsão do edital" da ficha, que é onde o nosso modelo
 * guarda o que ainda não está marcado. Dizer "previsto para março de 2027"
 * continua informando, sem prometer.
 */
function previsao(
  ...candidatas: ({ iso: string; ehPrevisao: boolean } | null)[]
): string | null {
  const previstas = candidatas.filter((c) => c?.ehPrevisao).map((c) => c!.iso).sort();
  if (previstas.length === 0) return null;
  const d = new Date(`${previstas[0]}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return `previsto para ${d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;
}

// ----------------------------------------------------------------- extração

export function extrairFatos(texto: string): Fatos {
  const t = texto.replace(/\s+/g, " ");
  const datas = lerDatas(t);

  // Vagas do NOSSO cargo primeiro: "25 vagas para perito legista" e "perito
  // legista: 25 vagas" são as duas formas que a imprensa usa. Só quando
  // nenhuma delas casa é que vale o número solto, que costuma ser o total do
  // concurso inteiro — ver `vagasDeLegista`.
  const CARGO = "(?:m[ée]dico[- ]legista|perito[- ]legista|legista|perito m[ée]dico)";
  // O VÃO ENTRE O NÚMERO E O CARGO NÃO PODE PULAR OUTRO "VAGAS", e foi esse
  // detalhe que fez o primeiro teste publicar o número errado. Em "São 329
  // vagas no total, sendo 25 vagas para Perito Legista", um vão frouxo casa
  // "329 … Perito Legista" porque não há ponto no caminho — e o post sairia
  // anunciando 329 vagas de médico-legista. Proibido atravessar a palavra.
  const VAO = "(?:(?!vagas?)[^.])";
  const vagasDoCargo =
    new RegExp(`(\\d{1,4})\\s*(?:\\([^)]{0,30}\\)\\s*)?vagas?${VAO}{0,60}?${CARGO}`, "i").exec(t) ??
    new RegExp(`${CARGO}${VAO}{0,60}?(\\d{1,4})\\s*(?:\\([^)]{0,30}\\)\\s*)?vagas?`, "i").exec(t) ??
    new RegExp(`${CARGO}${VAO}{0,20}?:\\s*(\\d{1,4})\\s*vagas?`, "i").exec(t);

  // "60 vagas", "60 (sessenta) vagas". O limite de quatro dígitos evita que um
  // CEP ou um número de processo vire vaga.
  const vagas = vagasDoCargo ?? /(\d{1,4})\s*(?:\([^)]{0,30}\)\s*)?vagas?/i.exec(t);
  const cr = /(\d{1,4})\s*(?:\([^)]{0,30}\)\s*)?(?:vagas?\s*)?(?:para|em|no)?\s*cadastro de reserva/i.exec(t);

  // Salário: o valor mais perto da palavra, e não o maior do texto — matéria de
  // concurso costuma citar também o teto da carreira e o salário de outro cargo.
  let salario: number | null = null;
  const perto = /(?:sal[áa]rio|remunera[çc][ãa]o|vencimento|subs[íi]dio)[^.]{0,80}?R\$ ?([\d.]+,\d{2}|[\d.]+)/i.exec(t);
  if (perto) {
    const n = Number(perto[1].replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(n) && n > 1000) salario = n;
  }

  const carga = /(\d{2})\s*(?:horas?|h)\s*semanais/i.exec(t);

  const inscricoes = dataDaChave(t, datas, /inscri[çc][õo]es?/);
  const prova = dataDaChave(t, datas, /prova|aplica[çc][ãa]o/);
  const edital = dataDaChave(t, datas, /edital/);

  const uf = acharUf(t);

  return {
    banca: acharBanca(t),
    vagasImediatas: vagas ? Number(vagas[1]) : null,
    vagasCr: cr ? Number(cr[1]) : null,
    salarioInicial: salario,
    cargaHoraria: carga ? Number(carga[1]) : null,
    inscricoesAte: inscricoes && !inscricoes.ehPrevisao ? inscricoes.iso : null,
    dataProva: prova && !prova.ehPrevisao ? prova.iso : null,
    previsao: previsao(inscricoes, prova, edital),
    etapa: ETAPAS.find((e) => e.padrao.test(t))?.nivel ?? null,
    noDiarioOficial: /di[áa]rio oficial|\bDOE\b|\bDOU\b|extrato de contrato|homologa[çc][ãa]o do contrato/i.test(t),
    uf,
    vagasDeLegista: Boolean(vagasDoCargo),
  };
}

/** A UF citada no texto — pelo nome do estado ou pela sigla do órgão. */
function acharUf(t: string): string | null {
  for (const [uf, e] of Object.entries(ESTADO_POR_UF)) {
    if (new RegExp(`\\b${e.nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(t)) {
      return uf;
    }
    const orgao = orgaoDaUf(uf);
    if (orgao?.curto && new RegExp(`\\b${orgao.curto.replace(/[-/]/g, "[-/ ]?")}\\b`, "i").test(t)) {
      return uf;
    }
  }
  return null;
}

// ---------------------------------------------------------------- reescrita

export interface Reescrito {
  titulo: string;
  resumo: string;
  corpo: string;
  fatos: Fatos;
  /** O que foi aproveitado do texto colado, em português, para a tela. */
  encontrados: string[];
  /** Avisos: o que não deu para ler, e o que conflita com o que a gente tem. */
  avisos: string[];
  /** A etapa que o post anuncia — a nossa, ou a da matéria quando é mais avançada. */
  etapa: Nivel;
}

/** "2027-01-10" → "10 de janeiro de 2027". */
function porExtensoCompleto(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * A frase do fato novo — a informação principal, que é o que faltava.
 *
 * Escrita por nós, a partir dos campos lidos. Só nasce quando há um ato
 * concreto para contar; sem isso, o post fica como o robô faria e não ganha uma
 * frase inventada só para parecer mais completo.
 */
function fraseDoFato(f: Fatos, nomeOrgao: string, etapa: Nivel): string | null {
  // SÓ O ATO, NUNCA O ESTADO — e esta foi a terceira correção do teste. A
  // primeira versão devolvia "A banca do concurso PCERJ é a FGV", logo abaixo
  // de um parágrafo que já dizia "o concurso PCERJ já tem banca definida — é a
  // FGV". Dois parágrafos seguidos com a mesma informação é o que faz um texto
  // parecer escrito por máquina. O que o nosso gerador NÃO sabe, e a matéria
  // sabe, é o ato: o que foi assinado, publicado ou homologado, e onde. É isso,
  // e só isso, que esta frase acrescenta.
  if (!f.noDiarioOficial) return null;

  if (f.banca && (etapa === "banca" || f.etapa === "banca")) {
    return `O contrato com a ${f.banca} foi publicado no Diário Oficial.`;
  }
  if (etapa === "edital" || f.etapa === "edital") {
    return "O edital foi publicado no Diário Oficial.";
  }
  if (etapa === "comissao" || f.etapa === "comissao") {
    return "A portaria da comissão organizadora foi publicada no Diário Oficial.";
  }
  if (etapa === "autorizado" || f.etapa === "autorizado") {
    return "A autorização do concurso foi publicada no Diário Oficial.";
  }
  return "O ato foi publicado no Diário Oficial.";
}

/**
 * Pega o texto colado e devolve o post pronto, no nosso modelo.
 *
 * A ficha do estado entra como base e os fatos lidos sobrescrevem campo a
 * campo — o que a matéria traz é mais novo do que o que está na nossa planilha,
 * e é exatamente por isso que alguém foi colar a matéria.
 */
export function reescrever({
  texto,
  uf,
  ficha,
  etapaAtual,
}: {
  texto: string;
  uf: string;
  ficha: Ficha | null;
  etapaAtual: Nivel;
}): Reescrito {
  const fatos = extrairFatos(texto);
  const estado = ESTADO_POR_UF[uf];
  const nomeEstado = estado?.nome ?? uf;
  const nomeOrgao = orgaoDaUf(uf)?.curto ?? nomeEstado;

  // A ficha que o texto vai usar: a nossa, com o que a matéria trouxe por cima.
  const mesclada = {
    ...(ficha ?? ({} as Ficha)),
    ...(fatos.banca ? { banca: fatos.banca } : {}),
    ...(fatos.vagasImediatas ? { vagasImediatas: fatos.vagasImediatas } : {}),
    ...(fatos.vagasCr ? { vagasCr: fatos.vagasCr } : {}),
    ...(fatos.salarioInicial ? { salarioInicial: fatos.salarioInicial } : {}),
    ...(fatos.cargaHoraria ? { cargaHoraria: fatos.cargaHoraria } : {}),
    ...(fatos.inscricoesAte ? { inscricoesAte: fatos.inscricoesAte } : {}),
    ...(fatos.dataProva ? { dataProva: fatos.dataProva } : {}),
    ...(fatos.previsao && !ficha?.previsao ? { previsao: fatos.previsao } : {}),
  } as Ficha;

  // A etapa do texto só ganha da nossa quando ela ANDA PARA A FRENTE. Matéria
  // antiga, ou matéria que relembra a autorização, não pode fazer o post
  // anunciar uma fase anterior à que o estado já alcançou.
  const ordem: Nivel[] = ["sem", "noticia", "estudo", "solicitado", "autorizado", "comissao", "banca", "edital"];
  const etapa =
    fatos.etapa && ordem.indexOf(fatos.etapa) > ordem.indexOf(etapaAtual)
      ? fatos.etapa
      : etapaAtual;

  const comArtigo = (() => {
    const nome = estadoComArtigo(uf);
    if (!nome) return `em ${nomeEstado}`;
    if (nome.startsWith("o ") || nome.startsWith("a ")) return `n${nome}`;
    return `em ${nome}`;
  })();

  const encontrados: string[] = [];
  if (fatos.banca) encontrados.push(`banca: ${fatos.banca}`);
  if (fatos.vagasImediatas)
    encontrados.push(
      `vagas: ${fatos.vagasImediatas}${fatos.vagasDeLegista ? "" : " (do concurso todo)"}`,
    );
  if (fatos.vagasCr) encontrados.push(`cadastro de reserva: ${fatos.vagasCr}`);
  if (fatos.salarioInicial)
    encontrados.push(
      `salário: R$ ${fatos.salarioInicial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    );
  if (fatos.cargaHoraria) encontrados.push(`carga horária: ${fatos.cargaHoraria}h`);
  if (fatos.inscricoesAte)
    encontrados.push(`inscrições até ${porExtensoCompleto(fatos.inscricoesAte)}`);
  if (fatos.dataProva) encontrados.push(`prova em ${porExtensoCompleto(fatos.dataProva)}`);
  if (fatos.previsao) encontrados.push(fatos.previsao);
  if (fatos.etapa) encontrados.push(`etapa: ${fatos.etapa}`);
  if (fatos.noDiarioOficial) encontrados.push("publicado no Diário Oficial");

  const avisos: string[] = [];
  if (encontrados.length === 0) {
    avisos.push(
      "Não reconheci nenhum dado no texto colado — nem banca, nem vagas, nem data. O post saiu com o que já tínhamos do estado; confira antes de publicar.",
    );
  }
  if (fatos.vagasImediatas && !fatos.vagasDeLegista) {
    avisos.push(
      `CONFIRA AS VAGAS: peguei ${fatos.vagasImediatas}, mas esse número não estava colado na palavra "legista" — em concurso de polícia civil ele costuma ser o total de todos os cargos. Corrija no texto antes de publicar.`,
    );
  }
  if (fatos.uf && fatos.uf !== uf) {
    avisos.push(
      `O texto fala de ${ESTADO_POR_UF[fatos.uf]?.nome ?? fatos.uf}, mas o post está marcado como ${nomeEstado}. Confira o estado antes de salvar.`,
    );
  }
  if (fatos.etapa && ordem.indexOf(fatos.etapa) < ordem.indexOf(etapaAtual)) {
    avisos.push(
      "O texto descreve uma fase anterior à que o estado já alcançou no monitor. Mantive a nossa, que é a mais avançada.",
    );
  }

  return {
    etapa,
    titulo: tituloDoPost(nomeOrgao, etapa, mesclada, nomeEstado),
    resumo: resumoDoPost(nomeOrgao, comArtigo, etapa, mesclada),
    corpo: corpoDoPost(
      uf,
      nomeEstado,
      nomeOrgao,
      etapa,
      mesclada,
      fraseDoFato(fatos, nomeOrgao, etapa),
    ),
    fatos,
    encontrados,
    avisos,
  };
}
