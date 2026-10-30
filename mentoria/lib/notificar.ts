// Avisa o Miguel, no WhatsApp dele, que alguém agendou uma reunião.
//
// Há três canais, e cada um liga sozinho quando suas variáveis existem:
//
// - CallMeBot: gratuito e feito para mandar mensagem para o próprio número.
//   O Miguel ativa uma vez (manda "I allow callmebot to send me messages" para
//   o número do CallMeBot) e recebe a apikey. Variáveis: CALLMEBOT_TELEFONE e
//   CALLMEBOT_APIKEY.
// - Z-API: pago, mais robusto, envia a partir de um número conectado.
//   Variáveis: ZAPI_INSTANCIA, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN e
//   WHATSAPP_MIGUEL (o número que recebe, com 55 e DDD).
// - Webhook genérico: recebe o agendamento em JSON, para quem quiser guardar
//   numa planilha ou CRM (Make, Zapier, n8n). Variável: AGENDAMENTO_WEBHOOK_URL.
//
// O agendamento só é dado como recebido se ao menos um canal entregou. Sem
// banco de dados, a mensagem é o único registro do contato; dizer "agendado"
// quando nada chegou seria perder o lead em silêncio.

export interface Agendamento {
  nome: string;
  email: string;
  telefone: string;
  situacao: string;
  concurso: string;
  data: string;
  horario: string;
  dataLegivel: string;
}

type Canal = { nome: string; enviar: () => Promise<void> };

async function exigirOk(resposta: Response, canal: string) {
  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    throw new Error(`${canal} respondeu ${resposta.status}: ${corpo.slice(0, 200)}`);
  }
}

function canais(texto: string, agendamento: Agendamento): Canal[] {
  const lista: Canal[] = [];
  const env = process.env;

  if (env.CALLMEBOT_TELEFONE && env.CALLMEBOT_APIKEY) {
    lista.push({
      nome: "CallMeBot",
      enviar: async () => {
        const url = new URL("https://api.callmebot.com/whatsapp.php");
        url.searchParams.set("phone", env.CALLMEBOT_TELEFONE!);
        url.searchParams.set("text", texto);
        url.searchParams.set("apikey", env.CALLMEBOT_APIKEY!);
        await exigirOk(await fetch(url, { cache: "no-store" }), "CallMeBot");
      },
    });
  }

  if (env.ZAPI_INSTANCIA && env.ZAPI_TOKEN && env.WHATSAPP_MIGUEL) {
    lista.push({
      nome: "Z-API",
      enviar: async () => {
        const url = `https://api.z-api.io/instances/${env.ZAPI_INSTANCIA}/token/${env.ZAPI_TOKEN}/send-text`;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (env.ZAPI_CLIENT_TOKEN) headers["Client-Token"] = env.ZAPI_CLIENT_TOKEN;
        const resposta = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ phone: env.WHATSAPP_MIGUEL, message: texto }),
          cache: "no-store",
        });
        await exigirOk(resposta, "Z-API");
      },
    });
  }

  if (env.AGENDAMENTO_WEBHOOK_URL) {
    lista.push({
      nome: "Webhook",
      enviar: async () => {
        const resposta = await fetch(env.AGENDAMENTO_WEBHOOK_URL!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...agendamento, recebidoEm: new Date().toISOString() }),
          cache: "no-store",
        });
        await exigirOk(resposta, "Webhook");
      },
    });
  }

  return lista;
}

export function montarMensagem(a: Agendamento): string {
  const telefone = a.telefone.startsWith("55") ? a.telefone : `55${a.telefone}`;
  return [
    "*Nova reunião agendada — Mentoria*",
    "",
    `*${a.dataLegivel}*`,
    "",
    `Nome: ${a.nome}`,
    `Situação: ${a.situacao}`,
    `Concurso: ${a.concurso || "não informou"}`,
    `E-mail: ${a.email}`,
    `WhatsApp: https://wa.me/${telefone}`,
  ].join("\n");
}

/**
 * Envia por todos os canais configurados.
 *
 * Devolve `true` se ao menos um entregou. Sem canal configurado, em
 * desenvolvimento a mensagem vai para o terminal e conta como entregue, para o
 * formulário poder ser testado sem credenciais.
 */
export async function notificarMiguel(agendamento: Agendamento): Promise<boolean> {
  const texto = montarMensagem(agendamento);
  const lista = canais(texto, agendamento);

  if (lista.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[agendamento] nenhum canal configurado; mensagem:\n${texto}`);
      return true;
    }
    console.error("[agendamento] nenhum canal de WhatsApp configurado");
    return false;
  }

  const resultados = await Promise.allSettled(lista.map((c) => c.enviar()));
  resultados.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[agendamento] ${lista[i].nome} falhou:`, r.reason);
    }
  });
  return resultados.some((r) => r.status === "fulfilled");
}
