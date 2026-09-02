// Cadastro do visitante na plataforma do Clube Forense.
//
// Encaminha o formulário para o webhook `external-register` da API de alunos e,
// dando certo, abre a sessão que libera o detalhe dos estados no mapa.
//
// O token da API vai na variável CLUBE_FORENSE_TOKEN. Este é segredo de
// verdade — ele autoriza criar contas — então, diferente da URL da planilha,
// não pode ser embutido no código.

import { registrarLead } from "../../lib/leadsRepo";
import { criarSessao } from "../../lib/sessao";

export const dynamic = "force-dynamic";

const ENDPOINT = "https://api.clubeforense.com.br/api/v1/webhooks/external-register";
const ORIGEM = "mapa-concursos";

interface Corpo {
  nome?: string;
  email?: string;
  celular?: string;
  senha?: string;
  /** Estado que a pessoa tentou abrir quando o cadastro apareceu. */
  uf?: string;
}

/** Só os dígitos: a API espera o celular sem máscara. */
function apenasDigitos(s: string): string {
  return s.replace(/\D/g, "");
}

function erro(mensagem: string, status: number) {
  return Response.json({ ok: false, mensagem }, { status });
}

export async function POST(request: Request) {
  let corpo: Corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro("Não consegui ler os dados enviados.", 400);
  }

  const nome = (corpo.nome ?? "").trim();
  const email = (corpo.email ?? "").trim().toLowerCase();
  const celular = apenasDigitos(corpo.celular ?? "");
  const senha = corpo.senha ?? "";

  if (nome.length < 2) return erro("Informe seu nome completo.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erro("E-mail inválido.", 400);
  if (celular.length < 10 || celular.length > 11) {
    return erro("Celular inválido. Use DDD + número.", 400);
  }
  if (senha.length < 8) return erro("A senha precisa ter ao menos 8 caracteres.", 400);

  // Só depois de validar: assim um dado errado recebe a mensagem que ajuda a
  // corrigi-lo, em vez de um "indisponível" que não diz nada. A mensagem ao
  // visitante é genérica de propósito; o motivo real fica no log.
  const token = process.env.CLUBE_FORENSE_TOKEN;
  if (!token) {
    console.error("CLUBE_FORENSE_TOKEN não configurada — cadastro indisponível.");
    return erro("Cadastro temporariamente indisponível. Tente mais tarde.", 503);
  }

  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), 15_000);

  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      signal: controlador.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: nome,
        email,
        cell_phone: celular,
        password: senha,
        password_confirmation: senha,
        source: ORIGEM,
        token,
      }),
    });

    const texto = await resp.text();

    if (!resp.ok) {
      // A API pode recusar por e-mail já cadastrado ou validação. Repassamos a
      // mensagem dela quando houver — ela conhece o motivo melhor que nós.
      let mensagem = "Não consegui concluir o cadastro. Confira os dados e tente de novo.";
      try {
        const json = JSON.parse(texto);
        if (typeof json?.message === "string" && json.message.trim()) mensagem = json.message;
      } catch {
        // resposta não era JSON — fica a mensagem genérica
      }
      console.error(`external-register respondeu ${resp.status}: ${texto.slice(0, 300)}`);
      // 409 sinaliza ao front que provavelmente é e-mail repetido.
      return erro(mensagem, resp.status === 422 || resp.status === 409 ? 409 : 502);
    }

    // A conta já foi criada na plataforma. Guardar o lead aqui é secundário e
    // não pode atrapalhar: `registrarLead` engole os próprios erros, então uma
    // falha de banco custa o lead, nunca o cadastro.
    const uf = String(corpo.uf ?? "").trim().toUpperCase();
    const gravou = await registrarLead({
      nome,
      email,
      celular,
      ufInteresse: /^[A-Z]{2}$/.test(uf) ? uf : null,
    });
    if (!gravou) {
      console.error(`Lead não registrado (cadastro seguiu normalmente): ${email}`);
    }

    // Com o e-mail: é ele que o ranking usa para saber de quem é cada
    // cartão-resposta e mostrar "sua posição".
    const sessao = criarSessao(email);
    return Response.json(
      { ok: true, mensagem: "Cadastro realizado com sucesso." },
      {
        headers: {
          "Set-Cookie":
            `${sessao.nome}=${sessao.valor}; Path=/; Max-Age=${sessao.maxAge}; ` +
            `HttpOnly; SameSite=Lax; Secure`,
        },
      },
    );
  } catch (e) {
    const detalhe = e instanceof Error ? e.message : String(e);
    console.error(`Falha ao chamar external-register: ${detalhe}`);
    return erro("O cadastro não respondeu a tempo. Tente novamente em instantes.", 504);
  } finally {
    clearTimeout(timer);
  }
}
