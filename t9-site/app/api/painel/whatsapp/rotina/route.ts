import { verificarLeadsNovos } from "@/lib/painel/meta";
import { chamadaDaPonte } from "@/lib/painel/whatsapp";

// A ponte do WhatsApp (sempre ligada no PC da T9) chama esta rota de tempos em tempos:
// o painel busca os leads de formulário novos e manda o aviso, sem ninguém clicar em nada.
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!chamadaDaPonte(request)) return new Response("Não autorizado", { status: 401 });
  const resultado = await verificarLeadsNovos();
  const novos = resultado.reduce((s, r) => s + r.enviados, 0);
  if (novos || resultado.some((r) => r.erro)) console.log("[whatsapp] rotina", JSON.stringify(resultado));
  return Response.json({ ok: true, resultado });
}
