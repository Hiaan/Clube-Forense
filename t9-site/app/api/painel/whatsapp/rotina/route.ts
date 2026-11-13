import { umaLinha, consulta } from "@/lib/painel/db";
import { verificarLeadsNovos } from "@/lib/painel/meta";
import { chamadaDaPonte } from "@/lib/painel/whatsapp";
import { enviarPendentes } from "@/lib/painel/crm";
import { chamarTodos } from "@/lib/painel/whatsappCliente";
import { enviarRelatoriosDevidos } from "@/lib/painel/relatorioWhatsapp";
import { verificarAlertas } from "@/lib/painel/alertasConta";

// A ponte do WhatsApp (sempre ligada no PC da T9) chama esta rota de tempos em tempos:
// o painel busca os leads de formulário novos e manda o aviso, sem ninguém clicar em nada.
export const maxDuration = 300;

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
  // Aproveita a rotina para reenviar à Meta as etapas do CRM que ficaram pendentes (falha de rede, token).
  const crm = await enviarPendentes().catch((e) => [{ empresa: "-", enviados: 0, erro: e instanceof Error ? e.message : String(e) }]);
  if (crm.length) console.log("[crm] etapas para a Meta", JSON.stringify(crm));
  // Leads que chegaram por outros caminhos (CSV, site) também recebem a primeira mensagem do cliente.
  const chamadas = await chamarTodos().catch((e) => [{ empresa: "-", enviados: 0, erro: e instanceof Error ? e.message : String(e) }]);
  if (chamadas.some((c) => c.enviados)) console.log("[whatsapp] primeiras mensagens", JSON.stringify(chamadas));
  // Relatórios agendados no WhatsApp dos clientes e alertas das contas de anúncios (saldo, pagamento, queda).
  const relatorios = await enviarRelatoriosDevidos(50_000).catch((e) => [{ empresa: "-", ok: false, erro: e instanceof Error ? e.message : String(e) }]);
  if (relatorios.length) console.log("[relatorio] envios", JSON.stringify(relatorios));
  const alertas = await verificarAlertas(30_000).catch((e) => [{ empresa: "-", alertas: [], erro: e instanceof Error ? e.message : String(e) }]);
  if (alertas.some((a) => a.alertas.length || a.erro)) console.log("[alertas]", JSON.stringify(alertas));
  const novos = resultado.reduce((s, r) => s + r.enviados, 0);
  if (novos || resultado.some((r) => r.erro) || horas > 3) console.log("[whatsapp] rotina", horas, "h", JSON.stringify(resultado));
  return Response.json({ ok: true, horas, resultado, chamadas, relatorios: relatorios.length, alertas: alertas.length });
}
