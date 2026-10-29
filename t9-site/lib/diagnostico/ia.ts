import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Diagnostico } from "./regras";

// A IA reescreve o texto do diagnóstico para soar pessoal (cita a área, a cidade, o que a
// pessoa respondeu). As regras já decidiram as notas, as prioridades e a ordem: a IA não
// inventa ação nova nem promete número. Sem chave, com erro ou com resposta fora do
// formato, o diagnóstico sai com o texto das regras.

const MODELO = "claude-haiku-5-5";

export const iaConfigurada = () => Boolean(process.env.ANTHROPIC_API_KEY);

const Texto = z.object({
  resumo: z.string(),
  prioridades: z.array(z.object({ titulo: z.string(), texto: z.string() })),
  comoAT9Ajuda: z.string(),
});

const SISTEMA = `Você escreve o diagnóstico gratuito da T9, uma agência de marketing que faz gestão de anúncios (tráfego pago no Instagram, Facebook e Google) e automações de atendimento e vendas (WhatsApp automático, acompanhamento de quem não fechou, quadro de vendas).

Você recebe as respostas do dono da empresa e um rascunho já pronto (resumo, prioridades e "como a T9 ajuda"). Reescreva o rascunho em português do Brasil para que ele soe feito para essa empresa:
- Linguagem simples, de conversa, sem termos técnicos (nada de "CTR", "CPL", "funil", "lead"; diga "contato", "cliente", "custo de cada cliente").
- Cite a área de atuação, a cidade e o que a pessoa respondeu quando ajudar a explicar.
- Mantenha exatamente as mesmas prioridades, na mesma ordem e com o mesmo sentido. Não acrescente nem tire ações.
- Não prometa números, prazos ou resultados garantidos. Não cite concorrentes nem outras agências.
- "comoAT9Ajuda" sempre termina convidando para a reunião gratuita e deixa claro que a T9 cuida dos anúncios e das automações.
- Resumo com até 3 frases; cada prioridade com título curto (até 10 palavras) e texto de 2 a 4 frases; "comoAT9Ajuda" com até 4 frases.`;

let cliente: Anthropic | null = null;

/** Reescreve o texto com a IA. Devolve null se não der (o diagnóstico usa o texto das regras). */
export async function personalizar(respostas: Record<string, string>, rascunho: Diagnostico) {
  if (!iaConfigurada()) return null;
  cliente ??= new Anthropic({ timeout: 25_000, maxRetries: 1 });
  try {
    const resposta = await cliente.messages.parse({
      model: MODELO,
      max_tokens: 4000,
      output_config: { effort: "low", format: zodOutputFormat(Texto) },
      system: SISTEMA,
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            respostas,
            rascunho: {
              resumo: rascunho.resumo,
              prioridades: rascunho.prioridades.map((p) => ({ titulo: p.titulo, texto: p.texto })),
              comoAT9Ajuda: rascunho.comoAT9Ajuda,
            },
          }),
        },
      ],
    });
    if (resposta.stop_reason === "refusal") return null;
    const texto = resposta.parsed_output;
    // Mesmo número de prioridades, ou a IA mudou o conteúdo: fica o rascunho.
    if (!texto || texto.prioridades.length !== rascunho.prioridades.length) return null;
    return texto;
  } catch (erro) {
    console.error("[diagnostico] IA indisponível, usando o texto das regras:", erro instanceof Error ? erro.message : erro);
    return null;
  }
}
