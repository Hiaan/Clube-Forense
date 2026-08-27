// Cliente da API da Eduzz (api.eduzz.com), usado para puxar as vendas dos
// infoprodutos.
//
// A autenticação é em duas etapas: as credenciais fixas (public key + api key,
// tiradas do painel da Eduzz em Ferramentas → API) trocam por um token de
// curta duração, e é o token que assina cada consulta. Por isso este arquivo
// guarda o token em memória: sem cache, uma sincronização de 12 páginas pediria
// 12 tokens novos, e a Eduzz limita.
//
// Nada aqui lança para quem chama: devolve `null` com o motivo no log. Uma
// instabilidade da Eduzz não pode derrubar o painel inteiro.

const BASE = process.env.EDUZZ_API_URL || "https://api.eduzz.com";

/** True quando as credenciais estão no ambiente. */
export function eduzzConfigurada(): boolean {
  return Boolean(process.env.EDUZZ_PUBLIC_KEY && process.env.EDUZZ_API_KEY);
}

/**
 * Uma fatura como a Eduzz devolve, com só os campos que usamos tipados. O resto
 * fica no índice aberto e vai inteiro para a coluna `bruto` do banco.
 */
export interface FaturaEduzz {
  sale_id?: number | string;
  product_id?: number | string;
  product_name?: string;
  client_name?: string;
  client_email?: string;
  sale_status?: number | string;
  sale_status_name?: string;
  /** Líquido do produtor. */
  sale_amount_win?: number | string;
  /** Valor pago pelo cliente. */
  sale_amount?: number | string;
  date_create?: string;
  date_payment?: string;
  [campo: string]: unknown;
}

let token: { valor: string; expiraEm: number } | null = null;

/**
 * Token válido, reaproveitado enquanto durar.
 *
 * A margem de um minuto existe porque o token pode vencer entre a checagem e a
 * chegada da requisição na Eduzz — um vencimento no meio de uma varredura
 * derrubaria a página inteira, e não só a página em curso.
 */
async function obterToken(): Promise<string | null> {
  if (token && token.expiraEm > Date.now() + 60_000) return token.valor;

  const publickey = process.env.EDUZZ_PUBLIC_KEY;
  const apikey = process.env.EDUZZ_API_KEY;
  if (!publickey || !apikey) return null;

  try {
    const resposta = await fetch(`${BASE}/credential/generate_token`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        publickey,
        apikey,
        // A Eduzz aceita o campo vazio; ele só é exigido em contas antigas, em
        // que o e-mail do produtor faz parte da credencial.
        email: process.env.EDUZZ_EMAIL || "",
      }),
      cache: "no-store",
    });

    const corpo = (await resposta.json().catch(() => null)) as {
      data?: { token?: string; token_valid_until?: string };
      details?: unknown;
    } | null;

    const valor = corpo?.data?.token;
    if (!resposta.ok || !valor) {
      console.error(
        "Eduzz: falha ao gerar token",
        resposta.status,
        JSON.stringify(corpo?.details ?? corpo)?.slice(0, 300),
      );
      return null;
    }

    // Sem data de validade declarada, assume uma hora — é o que a Eduzz pratica
    // hoje, e errar para menos só custa um token a mais.
    const ate = corpo?.data?.token_valid_until
      ? new Date(corpo.data.token_valid_until).getTime()
      : Date.now() + 3_600_000;

    token = { valor, expiraEm: Number.isNaN(ate) ? Date.now() + 3_600_000 : ate };
    return valor;
  } catch (e) {
    console.error("Eduzz: erro ao gerar token:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Data no formato que a API espera (AAAA-MM-DD). */
function dia(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Quantas páginas uma varredura pode pedir, para um período largo não virar um loop infinito. */
const MAX_PAGINAS = 60;

/**
 * Faturas criadas no período, já paginadas até o fim.
 *
 * O filtro é por data de criação da fatura, não de pagamento: um boleto emitido
 * ontem e pago hoje precisa ser revisitado para o status mudar no nosso banco,
 * e é o `sale_id` repetido que faz a atualização cair na linha certa.
 *
 * Devolve `null` quando a Eduzz não respondeu — diferente de `[]`, que é
 * "respondeu e não houve venda". Quem chama não pode confundir os dois: gravar
 * um período vazio por causa de erro apagaria o faturamento do painel.
 */
export async function buscarFaturas(inicio: Date, fim: Date): Promise<FaturaEduzz[] | null> {
  const chave = await obterToken();
  if (!chave) return null;

  const todas: FaturaEduzz[] = [];

  for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
    const url = new URL("/sale/get_sale_list", BASE);
    url.searchParams.set("start_date", dia(inicio));
    url.searchParams.set("end_date", dia(fim));
    url.searchParams.set("page", String(pagina));

    try {
      const resposta = await fetch(url, {
        headers: { token: chave, accept: "application/json" },
        cache: "no-store",
      });

      if (!resposta.ok) {
        console.error("Eduzz: falha ao listar vendas", resposta.status, await resposta.text().then((t) => t.slice(0, 300)).catch(() => ""));
        // Página 1 falhou: não há nada confiável a devolver. Falha no meio da
        // paginação: devolve o que já veio, que é melhor que perder tudo — as
        // faturas que faltam voltam na próxima sincronização.
        return pagina === 1 ? null : todas;
      }

      const corpo = (await resposta.json()) as {
        data?: FaturaEduzz[];
        paginator?: { total_pages?: number; page?: number };
      };

      const lote = corpo.data ?? [];
      todas.push(...lote);

      const totalPaginas = corpo.paginator?.total_pages ?? 1;
      if (lote.length === 0 || pagina >= totalPaginas) break;
    } catch (e) {
      console.error("Eduzz: erro ao listar vendas:", e instanceof Error ? e.message : e);
      return pagina === 1 ? null : todas;
    }
  }

  return todas;
}

/** Faturas dos últimos `dias` dias, contando hoje. */
export function buscarFaturasRecentes(dias = 30): Promise<FaturaEduzz[] | null> {
  const fim = new Date();
  const inicio = new Date(fim.getTime() - (dias - 1) * 86_400_000);
  return buscarFaturas(inicio, fim);
}
