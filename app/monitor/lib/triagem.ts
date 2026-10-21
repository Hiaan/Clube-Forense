// A leitura das manchetes: quais delas falam de vaga de médico-legista.
//
// O PROBLEMA QUE ISTO RESOLVE, E ELE É O MAIS CARO DO SISTEMA. O blog só pode
// publicar sobre concurso que tenha o nosso cargo. "Polícia Científica do Pará
// abre seleção para 182 temporários" não tem; "Concurso Perícia Oficial MA:
// edital publicado com 76 vagas" tem, e a manchete não diz. Até aqui, quem
// respondia essa pergunta era a nossa própria ficha: se o estado tivesse dois
// fatos conferidos à mão, a notícia passava; senão, era recusada. Funcionava
// como prova de relevância e tinha um efeito colateral grande — estado cuja
// ficha ninguém preencheu ficava mudo no blog para sempre, por mais notícia
// que saísse. Foi o que manteve a fila parada por semanas em sete estados.
//
// A PERGUNTA CERTA É OUTRA. Não é "a nossa planilha está preenchida?", é "esta
// notícia fala de vaga de médico-legista?". Quem sabe responder isso lendo um
// título e uma linha de resumo é um modelo de linguagem, e é só isso que ele
// faz aqui: responde sim ou não, com um motivo de uma frase. Ele não escreve
// post, não extrai número e não decide publicar — o que passa vai para a fila
// de revisão, onde uma pessoa lê.
//
// NA DÚVIDA, NÃO. É a regra mais importante do pedido. Um falso positivo vira
// post sobre concurso que não tem o cargo — ruído na cara do leitor que paga.
// Um falso negativo vira uma pauta a menos numa fila que uma pessoa revisa de
// qualquer jeito. Os dois erros não custam o mesmo, e o pedido diz isso.
//
// EM LOTE, E UMA VEZ POR NOTÍCIA. As candidatas vão todas numa chamada só, e o
// veredito fica guardado por link (triagemRepo) — a mesma manchete reaparece
// nos feeds de hora em hora por semanas, e pagar por ela toda vez seria jogar
// dinheiro fora para ouvir sempre a mesma resposta.

import { MODELOS, pedirAoClaude, iaConfigurada } from "../../lib/ia";
import { gravarTriagens, lerTriagens, type Veredito } from "../../lib/triagemRepo";
import { ESTADO_POR_UF } from "./estados";
import { orgaoDaUf } from "../../blog/lib/taxonomia";

/**
 * Teto de notícias julgadas por passada.
 *
 * Com o cache, uma passada normal tem uma mão-cheia de notícias novas. O teto
 * existe para o dia anormal: uma fonte que volta do ar despejando um mês de
 * atraso de uma vez não pode virar uma conta inesperada.
 */
const TETO_POR_RODADA = 25;

const SISTEMA = `Você faz a triagem das notícias que chegam ao Clube Forense, um preparatório para o concurso de MÉDICO-LEGISTA (também chamado de perito médico-legal, perito médico, ou perito oficial na área de Medicina).

Para cada notícia, responda uma única pergunta: ela trata de um concurso público — ou do andamento de um — que inclui vaga para esse cargo?

RESPONDA SIM quando a notícia for sobre concurso de polícia civil, polícia científica, perícia oficial, instituto médico-legal ou secretaria de segurança QUE INCLUA o cargo de médico-legista / perito médico-legal / perito oficial área Medicina — ainda que a manchete não diga o nome do cargo, desde que o corpo da notícia ou o contexto deixe claro que o cargo está no certame.

RESPONDA NÃO quando:
- o concurso for só de outros cargos (delegado, investigador, escrivão, papiloscopista, perito criminal não-médico, auxiliar ou técnico de necropsia, agente);
- for seleção temporária, PSS, credenciamento ou contrato por tempo determinado;
- for notícia de outra carreira, de outro país, ou que não trate de concurso;
- for sobre um caso policial, uma perícia específica ou o trabalho do IML, sem concurso envolvido;
- NÃO DER PARA SABER pelo que você recebeu.

Essa última regra é a mais importante. Na dúvida, responda NÃO. Um "sim" errado vira post público sobre um concurso que não tem o cargo, na cara de quem paga para estudar para ele; um "não" errado é só uma pauta a menos numa fila que uma pessoa revisa de qualquer jeito. Os dois erros não custam o mesmo.

Responda só com um objeto JSON, sem cercas de código, com um item por notícia recebida, na mesma ordem:
{"vereditos": [{"n": 1, "relevante": true, "motivo": "frase curta"}, {"n": 2, "relevante": false, "motivo": "frase curta"}]}`;

export interface Candidata {
  link: string;
  titulo: string;
  resumo: string;
  fonte: string;
  uf: string;
}

export interface ResultadoTriagem {
  /** O veredito de cada link examinado — do cache ou recém-perguntado. */
  vereditos: Map<string, Veredito>;
  /** Quantas foram perguntadas ao modelo nesta passada (as outras vieram do cache). */
  perguntadas: number;
  /** Em português, quando a triagem não pôde rodar. */
  erro: string | null;
}

/**
 * Tria as candidatas. Nunca lança.
 *
 * Sem chave de IA, devolve só o que estiver no cache — e quem chama trata o
 * link sem veredito como "não sei", caindo na regra anterior. É o que mantém o
 * sistema funcionando igual ao de antes se a chave sumir.
 */
export async function triarNoticias(candidatas: Candidata[]): Promise<ResultadoTriagem> {
  const vereditos = await lerTriagens(candidatas.map((c) => c.link));

  const novas = candidatas
    .filter((c) => !vereditos.has(c.link))
    .slice(0, TETO_POR_RODADA);

  if (novas.length === 0) return { vereditos, perguntadas: 0, erro: null };
  if (!iaConfigurada()) {
    return { vereditos, perguntadas: 0, erro: "sem chave configurada" };
  }

  const lista = novas
    .map((c, i) => {
      const estado = ESTADO_POR_UF[c.uf]?.nome ?? c.uf;
      const orgao = orgaoDaUf(c.uf)?.curto;
      return [
        `${i + 1}. ESTADO: ${estado}${orgao ? ` (órgão: ${orgao})` : ""}`,
        `   TÍTULO: ${c.titulo}`,
        c.resumo.trim() ? `   RESUMO: ${c.resumo.trim().slice(0, 600)}` : null,
        `   FONTE: ${c.fonte}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const r = await pedirAoClaude({
    modelo: MODELOS.pesquisa,
    sistema: SISTEMA,
    prompt: `${novas.length} notícia(s) para triar:\n\n${lista}\n\nResponda só com o JSON.`,
    maxTokens: 2000,
    esforco: "low",
    // Isto roda dentro do cron, sem ninguém esperando na tela; mas um pedido
    // pendurado seguraria a passada inteira, e a passada é de hora em hora.
    prazoMs: 60_000,
  });

  if (!r.texto) return { vereditos, perguntadas: 0, erro: r.erro };

  try {
    const limpo = r.texto.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const d = JSON.parse(limpo) as {
      vereditos?: { n?: number; relevante?: boolean; motivo?: string }[];
    };
    if (!Array.isArray(d.vereditos)) {
      return { vereditos, perguntadas: 0, erro: "a resposta não veio em JSON" };
    }

    const paraGravar: Parameters<typeof gravarTriagens>[0] = [];
    for (const v of d.vereditos) {
      // `n` é 1-based e é o que amarra a resposta à notícia. Índice fora da
      // lista é descartado em silêncio: melhor uma notícia sem veredito, que
      // volta na próxima passada, do que o veredito de uma colado em outra.
      const i = Number(v.n) - 1;
      const c = novas[i];
      if (!c || typeof v.relevante !== "boolean") continue;
      const veredito: Veredito = {
        relevante: v.relevante,
        motivo: String(v.motivo ?? "").slice(0, 300),
      };
      vereditos.set(c.link, veredito);
      paraGravar.push({ link: c.link, uf: c.uf, modelo: MODELOS.pesquisa, veredito });
    }

    await gravarTriagens(paraGravar);
    return { vereditos, perguntadas: paraGravar.length, erro: null };
  } catch {
    return { vereditos, perguntadas: 0, erro: "a resposta não veio em JSON" };
  }
}
