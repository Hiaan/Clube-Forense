// O e-mail que avisa o que o monitor fez na passada.
//
// POR QUE ESTE E-MAIL EXISTE. O robô passou a publicar sozinho, e publicar
// sozinho sem avisar ninguém é a definição de sistema sem dono: o post está no
// ar, a capa pode ser de uma agência, a manchete pode ter ficado seca, e nada
// disso aparece até alguém abrir o blog por outro motivo. O aviso é o que
// transforma a revisão de "antes, quando sobrar tempo" em "depois, em dois
// minutos, com o link na mão".
//
// SÓ QUANDO HOUVE NOVIDADE. A coleta roda de hora em hora, e vinte e quatro
// e-mails por dia dizendo "nada novo" é o caminho mais curto para a regra de
// caixa de entrada que manda tudo para o arquivo — e aí o aviso que importa
// também vai. Passada sem post não gera e-mail nenhum.
//
// NUNCA DERRUBA A COLETA. Mesma regra do e-mail de cadastro: falhar em enviar
// é aborrecimento, parar a coleta é perder a notícia do dia.

import { enviarEmail, emailConfigurado } from "../../lib/email";
import type { PostDoRobo, ResultadoPautas } from "./pautas";
import { baseDoSite } from "../../lib/site";

/**
 * Para quem vai o aviso, da variável `EMAIL_AVISOS`.
 *
 * Em variável de ambiente, e não no código: endereço de pessoa não é regra de
 * negócio, e trocar quem recebe não deveria exigir um deploy. Aceita mais de
 * um, separados por vírgula ou ponto e vírgula, porque uma equipe de duas
 * pessoas é o próximo passo natural.
 */
function destinatarios(): string[] {
  const bruto = process.env.EMAIL_AVISOS ?? "";
  return bruto
    .split(/[,;]/)
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));
}

/**
 * O endereço público do site, para os links do e-mail.
 *
 * A ordem tem motivo: `SITE_URL` é a palavra final de quem configurou;
 * `VERCEL_PROJECT_PRODUCTION_URL` é injetada pela própria Vercel e funciona
 * desde o primeiro deploy, sem ninguém criar variável; o domínio do blog é o
 * último recurso, porque ainda depende de o DNS ser apontado. Sem esta
 * escada, o aviso chegaria com link quebrado justamente nas primeiras semanas.
 */
function base(): string {
  const configurado = process.env.SITE_URL?.trim();
  if (configurado) return configurado.replace(/\/$/, "");

  const daVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (daVercel) return `https://${daVercel}`;

  return baseDoSite();
}

function escapar(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Onde a pessoa vai para ver (ou consertar) o post. */
function endereco(p: PostDoRobo): string {
  return p.publicado ? `${base()}/blog/${p.slug}` : `${base()}/admin/posts`;
}

/** "3 pautas prontas (MA, PE)" — o que espera um clique no painel. */
function assunto(r: ResultadoPautas): string {
  const ufs = [...new Set(r.posts.map((p) => p.uf))].join(", ");
  const quantas = r.abertas;
  return `Monitor: ${quantas} ${quantas === 1 ? "pauta pronta" : "pautas prontas"} (${ufs})`;
}

function corpoTexto(r: ResultadoPautas): string {
  const linhas = r.posts.map((p) =>
    [
      p.publicado ? "NO AR" : "NA FILA",
      `${p.titulo}`,
      `${p.estado} · ${p.etapa} · via ${p.fonte}`,
      endereco(p),
      "",
    ].join("\n"),
  );

  return `O monitor do Clube Forense passou pelas fontes e encontrou isto:

${linhas.join("\n")}
Os posts "no ar" já estão publicados, com a citação creditada à fonte. Vale
abrir para conferir a capa e acrescentar a leitura do Clube.

Os "na fila" estão em Blog > Para revisar. Vão para lá quando não há o que
citar nem ficha de curadoria para somar à notícia, quando o estado está
travado na planilha, ou quando o dia já teve publicação demais.

${base()}/admin/posts
`;
}

function corpoHtml(r: ResultadoPautas): string {
  const cartoes = r.posts
    .map((p) => {
      const etiqueta = p.publicado
        ? '<span style="background:#dcfce7;color:#166534;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">No ar</span>'
        : '<span style="background:#fff9db;color:#8a6d00;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Na fila</span>';

      return `<tr><td style="padding:14px 0;border-bottom:1px solid #e5e7eb;">
        ${etiqueta}
        <span style="font-size:11px;font-weight:700;color:#9ca3af;margin-left:6px;">
          ${escapar(p.estado)} · ${escapar(p.etapa)}
        </span>
        <p style="margin:6px 0 4px;font-size:15px;font-weight:700;line-height:1.4;color:#111827;">
          ${escapar(p.titulo)}
        </p>
        <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">via ${escapar(p.fonte)}</p>
        <a href="${escapar(endereco(p))}" style="font-size:13px;font-weight:700;color:#111827;">
          ${p.publicado ? "Ver no blog &rarr;" : "Abrir no painel &rarr;"}
        </a>
      </td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px 12px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">

        <tr><td style="background:#0b0b0d;padding:20px 28px;">
          <span style="font-size:17px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
            <span style="color:#ffcd07;">Clube</span>Forense
          </span>
          <span style="font-size:12px;font-weight:700;color:#9ca3af;margin-left:8px;">Monitor</span>
        </td></tr>

        <tr><td style="padding:24px 28px 8px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
            A passada das fontes de agora encontrou
            <strong>${r.publicadas > 0 ? `${r.publicadas} ${r.publicadas === 1 ? "notícia que já está no ar" : "notícias que já estão no ar"}` : "nada para publicar"}</strong>${
              r.naFila > 0
                ? ` e ${r.naFila} ${r.naFila === 1 ? "pauta na fila de revisão" : "pautas na fila de revisão"}`
                : ""
            }.
          </p>
        </td></tr>

        <tr><td style="padding:0 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${cartoes}
          </table>
        </td></tr>

        <tr><td style="padding:20px 28px 26px;">
          <p style="margin:0 0 14px;font-size:13px;line-height:1.7;color:#6b7280;">
            O que está no ar foi publicado com a fonte creditada e o gancho
            para o mapa. Falta a leitura do Clube — e conferir a capa, que vem
            do veículo de origem.
          </p>
          <a href="${escapar(base())}/admin/posts" style="display:inline-block;padding:11px 22px;background:#ffcd07;color:#111827;font-size:14px;font-weight:700;text-decoration:none;border-radius:999px;">
            Abrir o painel do blog
          </a>
        </td></tr>

        <tr><td style="padding:16px 28px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
            Aviso automático do monitor de concursos. Só chega quando há post
            novo — passada sem novidade não gera e-mail.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export type ResultadoAviso =
  | "enviado"
  | "nada-novo"
  | "sem-destinatario"
  | "email-nao-configurado"
  | "falhou";

/**
 * Avisa por e-mail o que a passada criou. Nunca lança.
 *
 * O retorno é detalhado de propósito: o cron devolve esse valor no JSON, e
 * "falhou" e "sem-destinatario" pedem ações completamente diferentes — uma é
 * olhar o log da Resend, a outra é criar a variável `EMAIL_AVISOS`. Um
 * booleano obrigaria a adivinhar qual das duas.
 */
export async function avisarNovidades(r: ResultadoPautas): Promise<ResultadoAviso> {
  if (r.abertas === 0) return "nada-novo";
  if (!emailConfigurado()) return "email-nao-configurado";

  const para = destinatarios();
  if (para.length === 0) return "sem-destinatario";

  const ok = await enviarEmail({
    para,
    // Remetente próprio quando configurado. Ver a explicação em email.ts: é o
    // que faz o aviso chegar antes de o domínio estar verificado na Resend.
    de: process.env.EMAIL_REMETENTE_AVISOS?.trim() || undefined,
    assunto: assunto(r),
    html: corpoHtml(r),
    texto: corpoTexto(r),
    // Mais folgado que o do cadastro: aqui ninguém está olhando a tela, e
    // perder o aviso é perder a revisão do post que acabou de ir ao ar.
    prazoMs: 15_000,
  });

  return ok ? "enviado" : "falhou";
}
