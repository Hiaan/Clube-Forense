import { umaLinha, consulta } from "@/lib/painel/db";
import { verificarLeadsNovos } from "@/lib/painel/meta";
import { chamadaDaPonte } from "@/lib/painel/whatsapp";

// A ponte do WhatsApp (sempre ligada no PC da T9) chama esta rota de tempos em tempos:
// o painel busca os leads de formulário novos e manda o aviso, sem ninguém clicar em nada.
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!chamadaDaPonte(request)) return new Response("Não autorizado", { status: 401 });
  // Busca desde a última rotina (com folga): se o PC ficou suspenso a noite toda, nada se perde. Entre 3 e 48 horas.
  const ultima = await umaLinha<{ atualizado_em: string }>("select atualizado_em from ajustes where chave = 'whatsapp_ultima_rotina'");
  const horasParado = ultima ? (Date.now() - new Date(ultima.atualizado_em).getTime()) / 3_600_000 : 48;
  const horas = Math.min(48, Math.max(3, Math.ceil(horasParado + 1)));
  const resultado = await verificarLeadsNovos(horas);
  await consulta(
    `insert into ajustes (chave, valor, atualizado_em) values ('whatsapp_ultima_rotina', $1, now())
     on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`,
    [String(horas)],
  );
  const novos = resultado.reduce((s, r) => s + r.enviados, 0);
  if (novos || resultado.some((r) => r.erro) || horas > 3) console.log("[whatsapp] rotina", horas, "h", JSON.stringify(resultado));
  return Response.json({ ok: true, horas, resultado });
}
