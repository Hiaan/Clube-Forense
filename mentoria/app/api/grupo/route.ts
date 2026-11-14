// Inscrição no grupo Dose Diária: guarda o contato e avisa o Miguel.

import { lerContato, type CorpoContato } from "../../../lib/contato";
import { notificarInscricaoGrupo } from "../../../lib/notificar";
import { LINK_GRUPO_CASOS } from "../../../lib/site";

export const dynamic = "force-dynamic";

/** Por ora o grupo aceita só médicos e estudantes de Medicina. */
const PERFIS: Record<string, string> = {
  medico: "Médico(a)",
  estudante: "Estudante de Medicina",
};

export async function POST(request: Request) {
  let corpo: CorpoContato & {
    site?: string;
    perfil?: string;
    crm?: string;
    uf?: string;
    faculdade?: string;
    declaro?: boolean;
  };
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
      { ok: false, mensagem: "Por enquanto, o Dose Diária é exclusivo para médicos e estudantes de Medicina." },
      { status: 403 },
    );
  }

  // Com o link do grupo configurado, a pessoa entra mesmo se o aviso falhar:
  // perder alguém na porta do grupo é pior que perder a notificação. Sem o
  // link, o aviso é o único jeito de o Miguel mandar o convite depois, então
  // falhar aqui precisa aparecer para a pessoa.
  // Médico confirma com CRM e UF; estudante, com a faculdade. Os dois
  // declaram que é verdade. O CRM não é consultado no CFM: fica registrado
  // para o Miguel conferir quando quiser.
  let registro: string;
  if (corpo.perfil === "medico") {
    const crm = String(corpo.crm ?? "").replace(/\D/g, "").slice(0, 8);
    const uf = String(corpo.uf ?? "").toUpperCase();
    if (crm.length < 3 || !/^[A-Z]{2}$/.test(uf)) {
      return Response.json({ ok: false, mensagem: "Informe o número do seu CRM e o estado." }, { status: 400 });
    }
    registro = `CRM-${uf} ${crm}`;
  } else {
    const faculdade = String(corpo.faculdade ?? "").trim().slice(0, 120);
    if (faculdade.length < 3) {
      return Response.json({ ok: false, mensagem: "Informe a sua faculdade de Medicina." }, { status: 400 });
    }
    registro = faculdade;
  }
  if (corpo.declaro !== true) {
    return Response.json({ ok: false, mensagem: "Confirme a declaração para entrar no grupo." }, { status: 400 });
  }

  const guardado = await notificarInscricaoGrupo({ ...contato, perfil, registro });
  if (!guardado && !LINK_GRUPO_CASOS) {
    return Response.json(
      { ok: false, mensagem: "Não conseguimos registrar sua inscrição agora. Tente de novo em instantes." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true, link: LINK_GRUPO_CASOS || null });
}
