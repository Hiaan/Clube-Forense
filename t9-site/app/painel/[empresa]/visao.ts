import "server-only";
import type { Empresa } from "@/lib/painel/auth";
import { listarLeads, porPlataforma, progressoDoMes, serieDiaria, totais, ultimaData, type Periodo } from "@/lib/painel/dados";

/** Tudo o que a visão geral precisa, buscado em paralelo. */
export async function carregarVisao(empresa: Empresa, p: Periodo) {
  const [atual, anterior, serie, plataformas, ultima, mes, leads] = await Promise.all([
    totais(empresa.id, p.inicio, p.fim),
    totais(empresa.id, p.anteriorInicio, p.anteriorFim),
    serieDiaria(empresa.id, p.inicio, p.fim),
    porPlataforma(empresa.id, p.inicio, p.fim),
    ultimaData(empresa.id),
    progressoDoMes(empresa),
    listarLeads(empresa.id, undefined, 5),
  ]);
  return { atual, anterior, serie, plataformas, ultima, mes, leads };
}
