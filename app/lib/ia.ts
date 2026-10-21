// A ponte com o Claude, usada para reescrever matéria no modelo do blog.
//
// SEM BIBLIOTECA, DE PROPÓSITO. O SDK oficial resolveria o mesmo com um
// `npm install` a mais; a API são três cabeçalhos e um POST, e uma dependência
// que entra no bundle de um projeto pequeno é uma dependência para manter.
//
// A CHAVE NUNCA SAI DAQUI, e o que garante isso é o nome dela. O Next só
// embute no pacote do navegador as variáveis que começam com NEXT_PUBLIC_;
// qualquer outra existe apenas no servidor, e `ANTHROPIC_API_KEY` lida do lado
// do cliente seria string vazia. Some-se a isso que este arquivo só é
// alcançado por server action. Ela também não vai para log: erro de
// autenticação é relatado como "chave recusada", sem ecoar o valor.
//
// SEM CHAVE, NADA QUEBRA. `iaConfigurada()` responde false e quem chama cai no
// caminho determinístico. Foi assim que o recurso nasceu e é assim que ele
// continua funcionando se a chave for revogada, expirar ou estourar o crédito.

/**
 * Um modelo por tarefa, e cada um numa variável de ambiente própria.
 *
 * A IDEIA É DE CUSTO x BENEFÍCIO, E ELA SÓ VALE ONDE O VOLUME EXISTE. Escrever
 * um post custa centavos e acontece uma dezena de vezes por mês: a diferença
 * entre o modelo mais caro e o mais barato é de poucos reais no mês inteiro, e
 * economizar aí é economizar no texto que vende um curso de milhares de reais.
 * Auditar é outra história — é tarefa curta, mecânica e repetida, exatamente o
 * feitio do modelo pequeno, e barata o bastante para rodar em toda reescrita
 * sem ninguém pensar duas vezes.
 *
 * Em variáveis separadas porque a escolha muda com a conta de luz: trocar o
 * modelo de uma tarefa não deveria exigir publicar código, e nem arrastar as
 * outras junto.
 */
export const MODELOS = {
  /** Quem escreve o post a partir da matéria colada. */
  escrita: process.env.IA_MODELO_ESCRITA ?? process.env.IA_MODELO ?? "claude-haiku-5-5",
  /** Quem confere o post contra a matéria antes de ele aparecer na tela. */
  auditoria: process.env.IA_MODELO_AUDITORIA ?? "claude-haiku-5-5",
} as const;

/** True quando há chave configurada. */
export function iaConfigurada(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export interface RespostaIA {
  texto: string | null;
  /** Em português, para a tela. `null` quando deu tudo certo. */
  erro: string | null;
}

/**
 * Uma pergunta ao Claude. Nunca lança: devolve `erro` preenchido.
 *
 * O prazo existe porque isto roda dentro de um clique no painel — uma chamada
 * pendurada deixaria a pessoa olhando para "Reescrevendo…" sem fim, e o certo
 * nesse caso é cair no gerador determinístico, que responde na hora.
 */
export async function pedirAoClaude({
  modelo,
  sistema,
  prompt,
  maxTokens = 8000,
  prazoMs = 90_000,
}: {
  /** Um dos valores de `MODELOS` — a tarefa escolhe, não esta função. */
  modelo: string;
  sistema: string;
  prompt: string;
  maxTokens?: number;
  prazoMs?: number;
}): Promise<RespostaIA> {
  const chave = process.env.ANTHROPIC_API_KEY?.trim();
  if (!chave) return { texto: null, erro: "sem chave configurada" };

  const corte = AbortSignal.timeout(prazoMs);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: corte,
      headers: {
        "x-api-key": chave,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: modelo,
        max_tokens: maxTokens,
        // SEM `temperature`, E ISSO NÃO É DESCUIDO. A primeira versão mandava
        // `temperature: 0` — o reflexo de quem quer resposta previsível — e a
        // API devolvia 400 em todas as chamadas: os modelos atuais recusam
        // qualquer valor de amostragem que não seja o padrão. O que controla a
        // profundidade neles é `output_config.effort`, não a temperatura.
        system: sistema,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!r.ok) {
      // O MOTIVO PRECISA CHEGAR A QUEM ESTÁ OLHANDO. Sem ele, um 400 por nome
      // de modelo errado é indistinguível de um 400 por pedido mal formado, e
      // a única pista na tela seria "erro 400". A resposta de erro da
      // Anthropic traz tipo e explicação — e nunca a chave, que não é ecoada.
      let detalhe = "";
      try {
        const bruto = await r.text();
        try {
          const corpo = JSON.parse(bruto) as { error?: { type?: string; message?: string } };
          detalhe = [corpo.error?.type, corpo.error?.message].filter(Boolean).join(": ");
        } catch {
          // Corpo que não é JSON é quase sempre um intermediário no caminho —
          // proxy, firewall, página de erro — e não a API. Um pedaço curto do
          // texto já diz qual, e é o que separa "o pedido está errado" de "a
          // chamada nem chegou lá".
          detalhe = bruto.replace(/\s+/g, " ").slice(0, 160);
        }
      } catch {
        detalhe = "";
      }

      const tipo = r.status === 401 ? "chave recusada" : `erro ${r.status}`;
      return {
        texto: null,
        erro: `a API do Claude respondeu ${tipo} (modelo ${modelo})${detalhe ? ` — ${detalhe}` : ""}`,
      };
    }

    const dados = (await r.json()) as {
      content?: { type: string; text?: string }[];
    };
    const texto = (dados.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("")
      .trim();

    return texto ? { texto, erro: null } : { texto: null, erro: "resposta vazia" };
  } catch (e) {
    const nome = e instanceof Error ? e.name : "";
    return {
      texto: null,
      erro: nome === "TimeoutError" ? "a API do Claude demorou demais" : "falha de rede",
    };
  }
}
