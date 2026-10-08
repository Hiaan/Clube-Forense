import { acoesDaConta, diagnosticoMeta, metaConfigurado, normalizarConta } from "@/lib/painel/meta";
import { chamadaAutorizada } from "../autorizacao";

/** Diagnóstico da conexão com a Meta (protegido pelo CRON_SECRET). Não expõe o token. */
export async function GET(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  if (!metaConfigurado()) return Response.json({ ok: false, erro: "META_ACCESS_TOKEN não configurado" }, { status: 503 });
  try {
    // ?conta=act_123 mostra como a Meta reporta as ações (leads, compras...) dessa conta.
    const conta = normalizarConta(new URL(request.url).searchParams.get("conta") ?? "");
    if (conta) return Response.json({ ok: true, conta, acoes: await acoesDaConta(conta) });
    return Response.json({ ok: true, ...(await diagnosticoMeta()) });
  } catch (erro) {
    return Response.json({ ok: false, erro: erro instanceof Error ? erro.message : String(erro) }, { status: 502 });
  }
}
