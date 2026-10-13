import { chamadaDaPonte, guardarEnderecoDaPonte } from "@/lib/painel/whatsapp";

/** A ponte do WhatsApp informa o endereço público dela (o túnel muda de endereço a cada reinício). */
export async function POST(request: Request) {
  if (!chamadaDaPonte(request)) return new Response("Não autorizado", { status: 401 });
  const { url } = (await request.json().catch(() => ({}))) as { url?: string };
  let endereco: URL;
  try {
    endereco = new URL(String(url ?? ""));
  } catch {
    return Response.json({ ok: false, erro: "endereço inválido" }, { status: 400 });
  }
  if (endereco.protocol !== "https:" || endereco.pathname !== "/" || endereco.search) {
    return Response.json({ ok: false, erro: "use um endereço https sem caminho" }, { status: 400 });
  }
  await guardarEnderecoDaPonte(endereco.origin);
  return Response.json({ ok: true });
}
