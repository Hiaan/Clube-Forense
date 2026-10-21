// Recebe a batida de leitura do blog.
//
// Endpoint aberto, de propósito: quem o chama é o navegador de um leitor
// anônimo. O que ele aceita é mínimo — um tipo de uma lista fechada e um slug
// curto —, não devolve nada e não lê nada do banco. O pior que alguém
// mal-intencionado consegue fazer aqui é inflar um contador de leitura, que é
// ruim para a nossa estatística e inofensivo para todo o resto.
//
// Sem cookie, sem IP, sem identificador: o que fica gravado é "mais uma
// leitura deste post hoje". Não dá para saber quem leu, e não é para dar.

import { registrarVisita, type TipoVisita } from "../../lib/visitasRepo";

export const dynamic = "force-dynamic";

const TIPOS: TipoVisita[] = ["post", "blog", "saida"];

export async function POST(request: Request) {
  try {
    const corpo = (await request.json()) as { tipo?: string; slug?: string };
    const tipo = TIPOS.find((t) => t === corpo.tipo);
    if (!tipo) return new Response(null, { status: 204 });

    await registrarVisita(tipo, String(corpo.slug ?? ""));
  } catch {
    // Corpo torto é batida perdida, não erro: o leitor não tem o que fazer com
    // uma mensagem nossa, e a página dele já está na tela.
  }
  return new Response(null, { status: 204 });
}
