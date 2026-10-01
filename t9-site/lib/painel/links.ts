import "server-only";
import { headers } from "next/headers";

/** Endereço público do painel, para montar os links enviados por e-mail. */
export async function enderecoBase() {
  if (process.env.PAINEL_URL) return process.env.PAINEL_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocolo = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

export async function linkDeAcesso(token: string) {
  return `${await enderecoBase()}/painel/entrar/verificar?token=${encodeURIComponent(token)}`;
}
