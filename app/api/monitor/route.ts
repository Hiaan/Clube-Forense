// Endpoint JSON com o relatório consolidado do monitor.
// Revalida de hora em hora (cache do Next).

import { coletar } from "../../monitor/lib/coletor";

export const revalidate = 3600;

export async function GET() {
  const relatorio = await coletar();
  return Response.json(relatorio, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
