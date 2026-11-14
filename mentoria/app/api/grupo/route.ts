// Inscrição no grupo Dose Diária: guarda o contato e avisa o Miguel.

import { lerContato, type CorpoContato } from "../../../lib/contato";
import { notificarInscricaoGrupo } from "../../../lib/notificar";
import { LINK_GRUPO_CASOS } from "../../../lib/site";

export const dynamic = "force-dynamic";

/** Por ora o grupo aceita só médicos e estudantes de Medicina. */
const PERFIS: Record<string, string> = {
  medico: "Médico(a) ou estudante de Medicina",
};

export async function POST(request: Request) {
  let corpo: CorpoContato & { site?: string; perfil?: string };
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
  const perfil = PERFIS[corpo.perfil ?? ""];
  if (!perfil) {
    return Response.json(
      { ok: false, mensagem: "Infelizmente, este grupo está aberto apenas para médicos no momento." },
      { status: 403 },
    );
  }

  // Com o link do grupo configurado, a pessoa entra mesmo se o aviso falhar:
  // perder alguém na porta do grupo é pior que perder a notificação. Sem o
  // link, o aviso é o único jeito de o Miguel mandar o convite depois, então
  // falhar aqui precisa aparecer para a pessoa.
  const guardado = await notificarInscricaoGrupo({ ...contato, perfil });
  if (!guardado && !LINK_GRUPO_CASOS) {
    return Response.json(
      { ok: false, mensagem: "Não conseguimos registrar sua inscrição agora. Tente de novo em instantes." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true, link: LINK_GRUPO_CASOS || null });
}
