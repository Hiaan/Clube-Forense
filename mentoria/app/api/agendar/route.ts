// Recebe o formulário de agendamento e avisa o Miguel no WhatsApp.

import {
  dataPorExtenso,
  dataValida,
  horarioCurto,
  horarioValido,
} from "../../../lib/agenda";
import { lerContato } from "../../../lib/contato";
import { notificarMiguel } from "../../../lib/notificar";

export const dynamic = "force-dynamic";

const SITUACOES: Record<string, string> = {
  medico: "Já é médico(a)",
  formando: "Ainda está se formando",
};

const ESTUDA: Record<string, string> = {
  sim: "Sim",
  nao: "Ainda não",
};

interface Corpo {
  id?: string;
  nome?: string;
  email?: string;
  telefone?: string;
  situacao?: string;
  /** Se já estuda para se tornar legista: "sim" ou "nao". */
  estuda?: string;
  concurso?: string;
  data?: string;
  horario?: string;
  /** Armadilha para robô: campo invisível que gente não preenche. */
  site?: string;
}

function erro(mensagem: string, status = 400) {
  return Response.json({ ok: false, mensagem }, { status });
}

export async function POST(request: Request) {
  let corpo: Corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro("Não consegui ler os dados enviados.");
  }

  // Robô recebe "ok" e segue a vida; avisar que foi pego só ensina a desviar.
  if (corpo.site) return Response.json({ ok: true });

  const contato = lerContato(corpo);
  const situacao = SITUACOES[corpo.situacao ?? ""];
  const estuda = ESTUDA[corpo.estuda ?? ""];
  const concurso = (corpo.concurso ?? "").trim().slice(0, 400);
  const data = corpo.data ?? "";
  const horario = corpo.horario ?? "";

  if (typeof contato === "string") return erro(contato);
  if (!situacao) return erro("Conte se você já é médico(a) ou se está se formando.");
  if (!estuda) return erro("Conte se você já estuda para se tornar legista.");
  if (corpo.estuda === "sim" && !concurso) return erro("Escolha o concurso que te interessa.");
  if (!dataValida(data)) return erro("Escolha um dia a partir de amanhã.");
  if (!horarioValido(horario)) return erro("Escolha um horário.");

  const entregue = await notificarMiguel({
    ...contato,
    situacao,
    estuda,
    concurso,
    data,
    horario,
    dataLegivel: `${dataPorExtenso(data)}, às ${horarioCurto(horario)}`,
  });

  if (!entregue) {
    return erro(
      "Não conseguimos registrar seu agendamento agora. Tente de novo em instantes.",
      502,
    );
  }

  return Response.json({ ok: true });
}
