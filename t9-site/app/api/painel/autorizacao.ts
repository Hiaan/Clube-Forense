import { timingSafeEqual } from "node:crypto";

/** Chamadas automáticas (Cron da Vercel) chegam com "Authorization: Bearer <CRON_SECRET>". */
export function chamadaAutorizada(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  const recebido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${segredo}`);
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}
