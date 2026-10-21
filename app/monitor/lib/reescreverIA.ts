// A reescrita de verdade: a matéria colada passa pelo Claude e volta como post.
//
// POR QUE ISTO EXISTE AO LADO DO GERADOR DETERMINÍSTICO. O gerador monta o post
// a partir de campos — banca, vagas, salário, datas. Ele nunca erra o número e
// nunca inventa, mas também nunca diz nada que não caiba num campo: se a
// matéria contar que a contratação foi questionada, que o concurso saiu de um
// acordo com o sindicato ou que as vagas incluem o interior, isso se perde.
// Era a queixa, em uma frase: "muito resumida e às vezes nem tem a informação
// principal".
//
// A DIVISÃO DE TRABALHO. O extrator continua lendo os fatos e eles entram no
// pedido como verdade conferida; o modelo escreve o texto. Um não substitui o
// outro: o extrator é quem confere a aritmética da resposta, e é o gerador
// determinístico que assume quando a API falha, demora ou não está configurada.
// Nenhum caminho deixa o painel sem resposta.
//
// AS TRÊS COISAS QUE O PEDIDO PROÍBE, porque são as três que dariam vergonha:
// inventar número, copiar frase do jornalista e transformar previsão em data
// marcada. As duas primeiras são instrução; a terceira é instrução E
// conferência no código, porque foi onde o gerador determinístico escorregou
// primeiro — e o que um gerador erra, um modelo também erra.

import { MODELOS, pedirAoClaude, iaConfigurada } from "../../lib/ia";
import { ESTADO_POR_UF } from "./estados";
import { orgaoDaUf } from "../../blog/lib/taxonomia";
import { NIVEL_LABEL, type Nivel } from "./tipos";
import { type Ficha } from "./pautas";
import { type Fatos } from "./reescrever";

const SISTEMA = `Você escreve o blog do Clube Forense, um preparatório brasileiro para o concurso de MÉDICO-LEGISTA (perito médico-legal).

Quem lê é médico, adulto, decidindo se vale estudar para um concurso. Escreva de igual para igual: direto, sem euforia de anúncio, sem adjetivo que não carregue informação.

REGRAS ABSOLUTAS — quebrar qualquer uma destrói o texto:

1. NUNCA invente número, data, valor, nome de banca, de órgão ou de cargo. Use só o que estiver na FICHA ou na MATÉRIA que receber. Se um dado não existir, escreva o texto sem ele — nunca aproxime, nunca estime, nunca complete.
2. NUNCA copie frases da matéria. Os fatos são de domínio público, as palavras do jornalista não são. Reescreva tudo com as nossas palavras.
3. NUNCA transforme previsão em certeza. "A expectativa é", "deve sair", "previsto para" viram "a previsão é", nunca "as inscrições vão até". Data marcada só quando a matéria afirmar que está marcada.
4. NUNCA cite o nome do veículo, não use aspas de ninguém e não escreva "segundo a reportagem".
5. O recorte é SEMPRE o cargo de médico-legista. Se a matéria trouxer o total de vagas de todos os cargos do concurso, diga que é o total do certame — nunca apresente esse número como vagas de médico-legista.

FORMATO DA RESPOSTA — só um objeto JSON, sem cercas de código, sem texto antes ou depois:

{"titulo": "...", "resumo": "...", "corpo": "..."}

- titulo: até 95 caracteres, começa com "Concurso " seguido da sigla do órgão e dois-pontos. Diz o fato mais novo e concreto. Sem ponto final.
- resumo: uma ou duas frases, até 300 caracteres, que funcionem sozinhas no cartão da listagem. Sem markdown.
- corpo: markdown com exatamente estas quatro seções, nesta ordem e com estes títulos:

## O que mudou
O fato novo e o que ele significa, em dois ou três parágrafos curtos. É aqui que entra a informação principal da matéria — o ato, onde saiu e quando.

## O que já está definido
Uma tabela markdown com duas colunas ("O que" e "Hoje"), só com as linhas que tiverem dado de verdade. Depois da tabela, uma frase lembrando que o Clube acompanha e confere estado a estado, com link para o mapa em /?uf=UF.

## O que isso muda para quem estuda
O que a pessoa deve fazer agora, em função da etapa. Concreto, sem motivação genérica.

## Como se preparar
Um parágrafo sobre o preparatório do Clube Forense (https://app.clubeforense.com.br), que é feito para o cargo de médico-legista — aula, questão e revisão pelo recorte da prova de perícia. Sem promessa de aprovação.`;

/** O resultado da reescrita por IA, ou o motivo de ela não ter saído. */
export interface ReescritaIA {
  titulo: string;
  resumo: string;
  corpo: string;
  /** Números do texto que não aparecem nem na matéria nem na nossa ficha. */
  suspeitos: string[];
}

/** Os valores em reais e as contagens de vaga que existem na origem. */
function numerosConfiaveis(texto: string, ficha: Ficha | null, fatos: Fatos): Set<string> {
  const conjunto = new Set<string>();
  // Tudo que parece dinheiro ou contagem dentro da matéria colada.
  for (const m of texto.matchAll(/R\$ ?([\d.]+(?:,\d{2})?)|(\d{1,5})/g)) {
    const bruto = (m[1] ?? m[2] ?? "").replace(/\./g, "").replace(",", ".");
    if (bruto) conjunto.add(String(Math.round(Number(bruto))));
  }
  for (const v of [
    ficha?.vagasImediatas,
    ficha?.vagasCr,
    ficha?.salarioInicial,
    ficha?.salarioFinal,
    ficha?.cargaHoraria,
    fatos.vagasImediatas,
    fatos.vagasCr,
    fatos.salarioInicial,
    fatos.cargaHoraria,
  ]) {
    if (typeof v === "number" && Number.isFinite(v)) conjunto.add(String(Math.round(v)));
  }
  return conjunto;
}

/**
 * Procura, no texto gerado, dinheiro e vagas que não vieram de lugar nenhum.
 *
 * NÃO É PARANOIA: número inventado é o erro que um modelo comete sem dar
 * sinal, escrito com a mesma confiança do número certo, e é justamente o tipo
 * de dado que leva alguém a estudar para um concurso. A conferência é estreita
 * de propósito — só valores em reais e contagens de vaga —, porque é onde o
 * estrago é grande e a checagem é confiável. Ela não bloqueia nada: avisa, e
 * quem revisa decide.
 */
function conferirNumeros(gerado: string, confiaveis: Set<string>): string[] {
  const suspeitos: string[] = [];

  for (const m of gerado.matchAll(/R\$ ?([\d.]+(?:,\d{2})?)/g)) {
    const n = String(Math.round(Number(m[1].replace(/\./g, "").replace(",", "."))));
    // Arredondamento nosso de sempre (R$ 10.149,55 vira R$ 10.150) não é
    // invenção: aceita o vizinho imediato.
    if (!confiaveis.has(n) && !confiaveis.has(String(Number(n) - 1)) && !confiaveis.has(String(Number(n) + 1))) {
      suspeitos.push(`R$ ${m[1]}`);
    }
  }

  for (const m of gerado.matchAll(/(\d{1,5})\s*vagas?/gi)) {
    if (!confiaveis.has(String(Number(m[1])))) suspeitos.push(`${m[1]} vagas`);
  }

  return [...new Set(suspeitos)];
}

/** A ficha em texto, para o modelo poder usar sem interpretar JSON cru. */
function fichaEmTexto(ficha: Ficha | null, fatos: Fatos): string {
  const linhas: string[] = [];
  const p = (r: string, v: unknown) => {
    if (v !== null && v !== undefined && String(v).trim() !== "") linhas.push(`- ${r}: ${v}`);
  };
  p("Vagas imediatas (conferidas por nós)", ficha?.vagasImediatas);
  p("Vagas em cadastro de reserva", ficha?.vagasCr);
  p("Salário inicial", ficha?.salarioInicial);
  p("Carga horária semanal", ficha?.cargaHoraria);
  p("Banca", ficha?.banca);
  p("Inscrições até", ficha?.inscricoesAte);
  p("Data da prova", ficha?.dataProva);
  p("Previsão do edital", ficha?.previsao);
  p("Etapas do concurso", ficha?.etapasConcurso);
  p("O que cai de medicina legal", ficha?.materias);

  const lidos: string[] = [];
  const q = (r: string, v: unknown) => {
    if (v !== null && v !== undefined && String(v).trim() !== "") lidos.push(`- ${r}: ${v}`);
  };
  q("Banca", fatos.banca);
  q(
    fatos.vagasDeLegista
      ? "Vagas de médico-legista"
      : "Vagas citadas (ATENÇÃO: pode ser o total do concurso, de todos os cargos)",
    fatos.vagasImediatas,
  );
  q("Vagas em cadastro de reserva", fatos.vagasCr);
  q("Salário inicial", fatos.salarioInicial);
  q("Carga horária semanal", fatos.cargaHoraria);
  q("Inscrições até (data firme)", fatos.inscricoesAte);
  q("Prova em (data firme)", fatos.dataProva);
  q("Previsão (NÃO é data marcada)", fatos.previsao);
  if (fatos.noDiarioOficial) lidos.push("- O ato foi publicado no Diário Oficial");

  return [
    linhas.length ? `FICHA DO ESTADO (base do Clube, conferida):\n${linhas.join("\n")}` : "FICHA DO ESTADO: vazia.",
    "",
    lidos.length
      ? `FATOS LIDOS NA MATÉRIA (confirmados por extração automática):\n${lidos.join("\n")}`
      : "FATOS LIDOS NA MATÉRIA: nenhum campo reconhecido automaticamente.",
  ].join("\n");
}

/**
 * Manda a matéria para o Claude e devolve o post. `null` quando não deu.
 *
 * Quem chama trata o `null` caindo no gerador determinístico — nunca mostrando
 * erro no lugar do texto.
 */
export async function reescreverComIA({
  texto,
  uf,
  ficha,
  etapaAtual,
  fatos,
}: {
  texto: string;
  uf: string;
  ficha: Ficha | null;
  etapaAtual: Nivel;
  fatos: Fatos;
}): Promise<{ post: ReescritaIA | null; erro: string | null }> {
  if (!iaConfigurada()) return { post: null, erro: "sem chave configurada" };

  const estado = ESTADO_POR_UF[uf];
  const nomeEstado = estado?.nome ?? uf;
  const nomeOrgao = orgaoDaUf(uf)?.curto ?? nomeEstado;

  const prompt = [
    `ESTADO: ${nomeEstado} (${uf}). ÓRGÃO: ${nomeOrgao}.`,
    `ETAPA EM QUE O NOSSO MONITOR CLASSIFICA O CONCURSO HOJE: ${NIVEL_LABEL[etapaAtual]}.`,
    `LINK DO MAPA PARA ESTE ESTADO: /?uf=${uf}`,
    "",
    fichaEmTexto(ficha, fatos),
    "",
    "MATÉRIA DE REFERÊNCIA (material de apoio — extraia os fatos, não reaproveite as frases):",
    "<<<",
    texto.slice(0, 12000),
    ">>>",
    "",
    "Escreva o post. Responda só com o JSON.",
  ].join("\n");

  const r = await pedirAoClaude({
    modelo: MODELOS.escrita,
    sistema: SISTEMA,
    prompt,
    // Somados, escrita e auditoria têm de caber com folga no teto da função
    // (ver maxDuration na página do editor) — estourar lá não dá mensagem
    // nenhuma, e é o pior fim possível para um clique.
    prazoMs: 60_000,
  });
  if (!r.texto) return { post: null, erro: r.erro };

  // O modelo às vezes embrulha o JSON em cercas de código, mesmo proibido.
  const limpo = r.texto
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const d = JSON.parse(limpo) as { titulo?: string; resumo?: string; corpo?: string };
    if (!d.titulo?.trim() || !d.corpo?.trim()) {
      return { post: null, erro: "a resposta veio sem título ou sem texto" };
    }
    const confiaveis = numerosConfiaveis(texto, ficha, fatos);
    return {
      post: {
        titulo: d.titulo.trim().slice(0, 200),
        resumo: (d.resumo ?? "").trim().slice(0, 400),
        corpo: d.corpo.trim(),
        suspeitos: conferirNumeros(`${d.titulo} ${d.resumo ?? ""} ${d.corpo}`, confiaveis),
      },
      erro: null,
    };
  } catch {
    return { post: null, erro: "a resposta não veio em JSON" };
  }
}

// --------------------------------------------------------------- auditoria

const SISTEMA_AUDITOR = `Você confere textos do blog do Clube Forense ANTES de eles irem ao ar. O blog fala de concursos para MÉDICO-LEGISTA e é lido por médicos que decidem, a partir dele, estudar meses para uma prova.

Você recebe a MATÉRIA (o material de origem), a FICHA (a base conferida pelo Clube) e o POST escrito a partir das duas. Sua única tarefa é apontar o que o post AFIRMA e as duas fontes NÃO sustentam.

Procure, nesta ordem de gravidade:
1. Número, valor, data ou nome próprio que não aparece na matéria nem na ficha.
2. Previsão apresentada como certeza ("as inscrições vão até X" quando a origem diz "a expectativa é").
3. Vaga, salário ou exigência de OUTRO cargo apresentada como sendo de médico-legista — matéria de polícia civil traz vários cargos juntos, e esse é o erro mais fácil de cometer.
4. Frase copiada da matéria em vez de reescrita.
5. Qualquer afirmação sobre o concurso que a origem não faça.

Não comente estilo, tamanho, tom, ordem das seções ou escolha de palavras. Não sugira melhorias. Se o post estiver sustentado, devolva a lista vazia — lista vazia é a resposta esperada na maioria das vezes, e inventar problema para parecer útil é pior do que não conferir.

Responda só com um objeto JSON, sem cercas de código:
{"problemas": ["frase curta dizendo o que o post afirma e a origem não sustenta", "..."]}`;

/**
 * Uma segunda leitura, por um modelo pequeno, antes do texto chegar à tela.
 *
 * POR QUE UM AUDITOR SEPARADO, E NÃO MAIS REGRAS NO PEDIDO DE ESCRITA. Quem
 * escreve está ocupado escrevendo: as cinco proibições do pedido competem com
 * formato, ordem das seções e fluidez, e é assim que uma delas escorrega. O
 * auditor não tem nada para escrever — ele compara duas coisas e responde uma
 * lista. É tarefa curta, mecânica e repetida, que é exatamente onde um modelo
 * pequeno trabalha bem e custa quase nada.
 *
 * E ELE PEGA O QUE O CÓDIGO NÃO PEGA. A conferência em `conferirNumeros` é
 * aritmética: dinheiro e contagem de vaga. Previsão virando data marcada, vaga
 * de outro cargo apresentada como nossa, frase copiada do jornalista — nada
 * disso tem forma de número, e é só lendo que se percebe.
 *
 * NUNCA BLOQUEIA. Devolve uma lista de avisos; publicar continua sendo decisão
 * de quem revisa. Falha de rede, resposta torta ou chave ausente devolvem
 * lista vazia: um auditor que cai não pode impedir o post de existir.
 */
export async function auditarComIA({
  texto,
  ficha,
  fatos,
  post,
}: {
  texto: string;
  ficha: Ficha | null;
  fatos: Fatos;
  post: { titulo: string; resumo: string; corpo: string };
}): Promise<string[]> {
  if (!iaConfigurada()) return [];

  const prompt = [
    fichaEmTexto(ficha, fatos),
    "",
    "MATÉRIA:",
    "<<<",
    texto.slice(0, 12000),
    ">>>",
    "",
    "POST A CONFERIR:",
    "<<<",
    `${post.titulo}\n\n${post.resumo}\n\n${post.corpo}`.slice(0, 12000),
    ">>>",
    "",
    "Responda só com o JSON.",
  ].join("\n");

  const r = await pedirAoClaude({
    modelo: MODELOS.auditoria,
    sistema: SISTEMA_AUDITOR,
    prompt,
    maxTokens: 1500,
    esforco: "low",
    // Mais curto que o da escrita: o post já está pronto e quem está esperando
    // já esperou uma vez. Estourou o prazo, o texto vai sem a segunda leitura.
    prazoMs: 25_000,
  });
  if (!r.texto) return [];

  try {
    const limpo = r.texto.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const d = JSON.parse(limpo) as { problemas?: unknown };
    if (!Array.isArray(d.problemas)) return [];
    return d.problemas
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim())
      .slice(0, 8);
  } catch {
    return [];
  }
}
