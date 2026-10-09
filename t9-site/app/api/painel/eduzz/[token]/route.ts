import { consulta } from "@/lib/painel/db";
import { assinaturaValida, processarEvento } from "@/lib/painel/eduzz";

// Endereço que vai no webhook da Eduzz: /api/painel/eduzz/<token do cliente>.
// O token identifica o cliente; com a chave secreta configurada, a assinatura também é conferida.
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[\w-]{20,80}$/.test(token)) return new Response("Não encontrado", { status: 404 });
  const [empresa] = await consulta<{ id: number; nome: string; eduzz_segredo: string | null }>(
    "select id, nome, eduzz_segredo from empresas where eduzz_token = $1",
    [token],
  );
  if (!empresa) return new Response("Não encontrado", { status: 404 });

  const corpo = await request.text();
  if (empresa.eduzz_segredo && !assinaturaValida(corpo, request.headers.get("x-signature"), empresa.eduzz_segredo)) {
    console.warn("[eduzz] assinatura inválida para", empresa.nome);
    return new Response("Assinatura inválida", { status: 401 });
  }

  let evento: unknown;
  try {
    evento = JSON.parse(corpo);
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
  try {
    const resultado = await processarEvento(empresa, evento as Parameters<typeof processarEvento>[1]);
    console.info("[eduzz]", empresa.nome, JSON.stringify(resultado));
    return Response.json({ ok: true });
  } catch (erro) {
    console.error("[eduzz] falha ao registrar evento", empresa.nome, erro);
    // 500 faz a Eduzz tentar de novo mais tarde.
    return new Response("Erro ao registrar", { status: 500 });
  }
}
