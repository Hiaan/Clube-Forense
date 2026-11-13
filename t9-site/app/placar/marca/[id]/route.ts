import { get } from "@vercel/blob";
import { uma } from "@/lib/placar/banco";

// Logo da agência (aparece no painel do cliente e no app). Público: é a marca dela.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await uma<{ logo: string | null }>("select logo from placar.agencias where id = $1", [Number((await params).id)]);
  if (!a?.logo) return new Response("Não encontrado", { status: 404 });
  const arquivo = await get(a.logo, { access: "private" }).catch(() => null);
  if (!arquivo || arquivo.statusCode !== 200) return new Response("Não encontrado", { status: 404 });
  return new Response(arquivo.stream, {
    headers: {
      "Content-Type": arquivo.blob.contentType,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
