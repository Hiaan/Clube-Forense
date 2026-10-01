import { get } from "@vercel/blob";
import { empresaPermitidaPorId, usuarioAtual } from "@/lib/painel/auth";

// Imagens dos criativos ficam no Blob privado. Esta rota só entrega o arquivo
// para quem tem acesso à empresa dona dele (caminho: criativos/<empresa>/<arquivo>).
export async function GET(_: Request, { params }: { params: Promise<{ caminho: string[] }> }) {
  const caminho = (await params).caminho;
  const usuario = await usuarioAtual();
  if (!usuario) return new Response("Não autorizado", { status: 401 });
  if (caminho[0] !== "criativos" || caminho.length !== 3) return new Response("Não encontrado", { status: 404 });
  if (!(await empresaPermitidaPorId(usuario, Number(caminho[1])))) return new Response("Não encontrado", { status: 404 });

  const arquivo = await get(caminho.join("/"), { access: "private" }).catch(() => null);
  if (!arquivo || arquivo.statusCode !== 200) return new Response("Não encontrado", { status: 404 });
  return new Response(arquivo.stream, {
    headers: {
      "Content-Type": arquivo.blob.contentType,
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
