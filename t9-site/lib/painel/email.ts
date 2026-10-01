import "server-only";

// E-mails do painel saem pelo Resend (https://resend.com). Sem RESEND_API_KEY,
// o link vai para os logs da Vercel, que só a equipe da T9 acessa.

type Mensagem = { para: string; assunto: string; html: string; texto: string };

export const emailConfigurado = () => Boolean(process.env.RESEND_API_KEY);

export async function enviarEmail({ para, assunto, html, texto }: Mensagem) {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    console.info(`[painel] RESEND_API_KEY ausente. E-mail para ${para}: ${assunto}\n${texto}`);
    return;
  }
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.PAINEL_EMAIL_REMETENTE ?? "T9 ADS Company <painel@t9company.com.br>",
      to: [para],
      subject: assunto,
      html,
      text: texto,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(`Resend respondeu ${resposta.status}: ${detalhe.slice(0, 300)}`);
  }
}

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** HTML simples, com a cara da T9, que funciona nos clientes de e-mail. */
export function emailComBotao({ titulo, texto, botao, link, rodape }: { titulo: string; texto: string; botao: string; link: string; rodape: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f6f3f3;font-family:Arial,Helvetica,sans-serif;color:#0b0b0b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#7c0409;padding:18px 28px;color:#fff;font-weight:800;font-size:18px;letter-spacing:.02em">T9 ADS Company</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font-size:22px">${escapar(titulo)}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#3d3535">${escapar(texto)}</p>
<a href="${escapar(link)}" style="display:inline-block;background:#e3121c;color:#fff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:999px">${escapar(botao)}</a>
<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#8a8080">${escapar(rodape)}</p>
</td></tr></table></td></tr></table></body></html>`;
}
