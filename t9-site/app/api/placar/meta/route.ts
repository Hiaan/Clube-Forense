import { NextResponse } from "next/server";
import { usuarioAtual } from "@/lib/placar/conta";
import { conectarMeta, conferirEstado, linkDeLogin } from "@/lib/placar/meta";
import { q } from "@/lib/placar/banco";

// "Entrar com o Facebook" do Placar: ?iniciar=1 manda para o login da Meta; a Meta volta aqui com ?code&state.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const voltar = (erro?: string) => NextResponse.redirect(new URL(`/placar/app/comecar${erro ? `?erro=${encodeURIComponent(erro)}` : ""}`, url));
  const usuario = await usuarioAtual();
  if (!usuario) return NextResponse.redirect(new URL("/placar/entrar", url));

  if (url.searchParams.get("iniciar")) {
    try {
      return NextResponse.redirect(await linkDeLogin(usuario.agencia_id));
    } catch {
      return voltar("A conexão com o Facebook não está disponível agora. Tente de novo em instantes.");
    }
  }
  if (url.searchParams.get("error")) return voltar("A conexão foi cancelada no Facebook.");
  const agencia = conferirEstado(url.searchParams.get("state") ?? "");
  const codigo = url.searchParams.get("code");
  if (!agencia || agencia !== usuario.agencia_id || !codigo) return voltar("O link de conexão venceu. Tente de novo.");
  try {
    await conectarMeta(agencia, codigo);
    // Clientes que estavam com erro de conexão voltam a sincronizar na próxima rodada.
    await q("update placar.clientes set erro_meta = null, sincronizado_em = null where agencia_id = $1", [agencia]);
  } catch (e) {
    return voltar(`O Facebook não confirmou a conexão: ${e instanceof Error ? e.message : String(e)}`);
  }
  return voltar();
}
