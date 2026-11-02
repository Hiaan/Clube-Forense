// Primeiro passo do formulário: guarda o contato assim que a pessoa deixa
// nome, e-mail e WhatsApp, antes das perguntas e da agenda.

import { lerContato, type CorpoContato } from "../../../lib/contato";
import { notificarContato } from "../../../lib/notificar";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let corpo: CorpoContato & { site?: string };
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ ok: false, mensagem: "Não consegui ler os dados enviados." }, { status: 400 });
  }

  // Robô recebe "ok" e segue a vida; avisar que foi pego só ensina a desviar.
  if (corpo.site) return Response.json({ ok: true });

  const contato = lerContato(corpo);
  if (typeof contato === "string") {
    return Response.json({ ok: false, mensagem: contato }, { status: 400 });
  }

  // Se o aviso falhar, a pessoa segue mesmo assim: os dados vão de novo, com
  // o resto, no fim do agendamento. Travar aqui só faria perder o contato.
  const entregue = await notificarContato(contato);
  return Response.json({ ok: true, guardado: entregue });
}
