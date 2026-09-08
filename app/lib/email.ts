// E-mail de boas-vindas de quem se cadastra pelo mapa.
//
// REGRA QUE MANDA AQUI: falhar em enviar NUNCA pode derrubar um cadastro. A
// conta já foi criada na plataforma e a pessoa já tem direito de entrar; um
// erro no e-mail é um aborrecimento, recusar o cadastro de quem fez tudo certo
// é perder o lead. É a mesma regra de leadsRepo, pelo mesmo motivo.
//
// Sem SDK: a Resend é uma chamada HTTP com um Bearer, e este projeto tem cinco
// dependências no total. Uma biblioteca para montar um POST seria a sexta.

const ENDPOINT = "https://api.resend.com/emails";

/** Onde a pessoa assiste as aulas. Um lugar só, para trocar numa linha. */
const PLATAFORMA = "https://app.clubeforense.com.br";

/** True quando dá para enviar. Sem isto, o cadastro segue e o log avisa. */
export function emailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_REMETENTE);
}

/**
 * "Ana Maria de Souza" → "Ana". Cabeçalho de e-mail com o nome inteiro soa
 * formulário, não conversa.
 *
 * A caixa é normalizada, e isso não é preciosismo: o campo de nome é livre e
 * quem preenche está no celular. "ana maria" e "ANA MARIA" chegam o tempo todo,
 * e as duas viravam a primeira linha do e-mail — "Olá, Dr.(a) ana!" e "Olá,
 * Dr.(a) ANA!". Primeira letra maiúscula, o resto minúsculo, com as regras do
 * português para os acentuados.
 */
function primeiroNome(nome: string): string {
  const bruto = nome.trim().split(/\s+/)[0] ?? "";
  if (!bruto) return "";
  return (
    bruto.charAt(0).toLocaleUpperCase("pt-BR") +
    bruto.slice(1).toLocaleLowerCase("pt-BR")
  );
}

/** Escapa o que vem do formulário antes de entrar no HTML do e-mail. */
function escapar(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Versão em texto puro.
 *
 * Não é enfeite: parte dos clientes bloqueia HTML por padrão, e um e-mail sem
 * alternativa em texto é lido pelos filtros como sinal de spam — justamente o
 * que não pode acontecer com a mensagem que confirma um cadastro.
 */
function corpoTexto(nome: string): string {
  return `Olá, Dr.(a) ${primeiroNome(nome)}!

Seu cadastro no Mapa dos Concursos está confirmado. Um radar dos 26 estados e
do Distrito Federal já está liberado para você.

E tem mais: você ganhou um ACESSO GRATUITO à Plataforma Aprova Legista.

Entre com este mesmo e-mail e a senha que você acabou de criar: lá você assiste
gratuitamente a algumas das nossas aulas e conhece todos os recursos do nosso
preparatório, como o banco de questões.

Entrar na Plataforma Aprova Legista: ${PLATAFORMA}

Bons estudos,
Clube Forense
`;
}

function corpoHtml(nome: string): string {
  const ola = escapar(primeiroNome(nome));
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px 12px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;">

        <tr><td style="background:#0b0b0d;padding:22px 28px;">
          <span style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
            <span style="color:#ffcd07;">Clube</span>Forense
          </span>
        </td></tr>

        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:16px;color:#111827;">Olá, Dr.(a) ${ola}!</p>

          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
            Seu cadastro no <strong>Mapa dos Concursos</strong> está confirmado.
            Um radar dos 26 estados e do Distrito Federal já está liberado para
            você.
          </p>

          <div style="margin:0 0 20px;padding:16px 18px;background:#fffbeb;border-left:3px solid #ffcd07;border-radius:8px;">
            <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#111827;">
              E tem mais: você ganhou um acesso gratuito à Plataforma Aprova Legista.
            </p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#4b5563;">
              Entre com <strong>este mesmo e-mail</strong> e a senha que você
              acabou de criar: lá você assiste gratuitamente a algumas das nossas
              aulas e conhece todos os recursos do nosso preparatório, como o
              banco de questões.
            </p>
          </div>

          <p style="margin:0 0 24px;">
            <a href="${PLATAFORMA}" style="display:inline-block;padding:13px 26px;background:#ffcd07;color:#111827;font-size:15px;font-weight:700;text-decoration:none;border-radius:999px;">
              Entrar na Plataforma Aprova Legista
            </a>
          </p>

          <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
            Se o botão não abrir, copie este endereço no navegador:<br>
            <a href="${PLATAFORMA}" style="color:#111827;">${PLATAFORMA}</a>
          </p>
        </td></tr>

        <tr><td style="padding:18px 28px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
            Você recebeu este e-mail porque se cadastrou no Mapa dos Concursos
            do Clube Forense.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Manda o e-mail de boas-vindas. Nunca lança; devolve `false` quando não deu,
 * para quem chamou apenas registrar no log e seguir.
 */
export async function enviarBoasVindas(nome: string, email: string): Promise<boolean> {
  if (!emailConfigurado()) return false;

  // Curto de propósito: isto roda DENTRO da requisição de cadastro, e a pessoa
  // está olhando um botão girando. Melhor perder o e-mail que fazer o cadastro
  // parecer travado.
  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), 8_000);

  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      signal: controlador.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_REMETENTE,
        to: [email],
        subject: "Seu acesso está liberado — e a Plataforma Aprova Legista também (Bônus)",
        html: corpoHtml(nome),
        text: corpoTexto(nome),
      }),
    });

    if (!resp.ok) {
      // O corpo da Resend diz o motivo (domínio não verificado, remetente
      // inválido, chave sem permissão) e cada um pede uma ação diferente.
      console.error(
        `Resend respondeu ${resp.status}: ${(await resp.text()).slice(0, 300)}`,
      );
      return false;
    }
    return true;
  } catch (e) {
    console.error(`Falha ao enviar boas-vindas: ${e instanceof Error ? e.message : e}`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
