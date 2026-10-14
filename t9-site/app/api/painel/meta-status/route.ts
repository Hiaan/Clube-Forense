import { acoesDaConta, diagnosticoMeta, estruturaDaConta, leadsPorAnuncioDaConta, situacaoTempoReal, metaConfigurado, normalizarConta } from "@/lib/painel/meta";
import { consulta } from "@/lib/painel/db";
import { enderecoDaPonte, estadoDaPonte, numeroLegivel } from "@/lib/painel/whatsapp";
import { chamadaAutorizada } from "../autorizacao";

/** Diagnóstico da conexão com a Meta (protegido pelo CRON_SECRET). Não expõe o token. */
export async function GET(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  if (!metaConfigurado()) return Response.json({ ok: false, erro: "META_ACCESS_TOKEN não configurado" }, { status: 503 });
  try {
    // ?conta=act_123 mostra como a Meta reporta as ações (leads, compras...) dessa conta.
    const endereco = new URL(request.url);
    const parametros = endereco.searchParams;
    // ?estrutura=act_123: raio-x das campanhas ativas (só leitura).
    const contaEstrutura = normalizarConta(parametros.get("estrutura") ?? "");
    if (contaEstrutura) return Response.json({ ok: true, conta: contaEstrutura, ...(await estruturaDaConta(contaEstrutura)) });
    // ?whatsapp=1 mostra como está a ponte do WhatsApp (sem o QR em si).
    if (parametros.get("whatsapp")) {
      const { qr, ...estado } = await estadoDaPonte();
      const endereco = await enderecoDaPonte().catch(() => "");
      const clientes = await consulta<{ slug: string; meta_conta: string | null; whatsapp_leads: string }>("select slug, meta_conta, whatsapp_leads from empresas where whatsapp_leads is not null");
      return Response.json({
        ok: true,
        ...estado,
        temQr: Boolean(qr),
        endereco: endereco ? new URL(endereco).host : "",
        clientes: clientes.map((c) => ({ slug: c.slug, conta: c.meta_conta, numeros: c.whatsapp_leads.split(",").map((n) => `${numeroLegivel(n)} [${n.length} dígitos]`) })),
      });
    }
    // ?tempoReal=1 mostra se o webhook de leads está assinado no app e em cada Página (só leitura).
    if (parametros.get("tempoReal")) return Response.json({ ok: true, ...(await situacaoTempoReal(`${endereco.origin}/api/painel/meta-webhook`)) });
    // ?leads=act_123 confere, anúncio por anúncio, se a Meta libera os contatos dos formulários.
    const contaLeads = normalizarConta(parametros.get("leads") ?? "");
    if (contaLeads) return Response.json({ ok: true, conta: contaLeads, anuncios: await leadsPorAnuncioDaConta(contaLeads) });
    const conta = normalizarConta(parametros.get("conta") ?? "");
    if (conta) return Response.json({ ok: true, conta, acoes: await acoesDaConta(conta) });
    return Response.json({ ok: true, ...(await diagnosticoMeta()) });
  } catch (erro) {
    return Response.json({ ok: false, erro: erro instanceof Error ? erro.message : String(erro) }, { status: 502 });
  }
}
