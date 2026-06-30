// Orquestrador da coleta: busca as fontes, filtra pelos cargos-alvo, classifica
// o nível de andamento e consolida a situação por estado.

import { ehCargoAlvo, classificarNivel } from "./cargos";
import { ESTADOS, ESTADO_POR_UF, NOME_PARA_UF, normalizar } from "./estados";
import { montarConsultas } from "./fontes";
import { parseRSS } from "./rss";
import { MENCOES_DEMO } from "./seed";
import {
  type EstadoStatus,
  type Mencao,
  type Nivel,
  NIVEL_PESO,
  type Relatorio,
} from "./tipos";

const TIMEOUT_MS = 12_000;
/** Janela de relevância: menções mais antigas que isto entram, mas pesam menos. */
const DIAS_RELEVANTES = 120;

async function buscarFeed(url: string): Promise<string | null> {
  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controlador.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AprovaLegistaMonitor/1.0)" },
      // Cache do Next: revalida de hora em hora.
      next: { revalidate: 3600 },
    });
    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Tenta associar uma menção a um estado pelo nome citado no texto. */
function inferirUf(texto: string, ufConsulta: string): string | null {
  if (ufConsulta !== "BR") return ufConsulta;
  const t = normalizar(texto);
  for (const [nome, uf] of Object.entries(NOME_PARA_UF)) {
    if (t.includes(nome)) return uf;
  }
  return null;
}

function nivelMaisAvancado(a: Nivel, b: Nivel): Nivel {
  return NIVEL_PESO[a] >= NIVEL_PESO[b] ? a : b;
}

function fatorRecencia(dataISO: string | null): number {
  if (!dataISO) return 0.6;
  const idadeDias = (Date.now() - new Date(dataISO).getTime()) / 86_400_000;
  if (idadeDias <= 7) return 1;
  if (idadeDias >= DIAS_RELEVANTES) return 0.4;
  // Decaimento linear de 1 -> 0.4 ao longo da janela.
  return 1 - (0.6 * (idadeDias - 7)) / (DIAS_RELEVANTES - 7);
}

/** Coleta e consolida o relatório completo. */
export async function coletar(): Promise<Relatorio> {
  const consultas = montarConsultas();

  const resultados = await Promise.all(
    consultas.map(async (c) => ({ uf: c.uf, xml: await buscarFeed(c.url) })),
  );

  const algumaFonteRespondeu = resultados.some((r) => r.xml !== null);
  const mencoesPorUf = new Map<string, Mencao[]>();

  function registrar(m: Mencao) {
    const lista = mencoesPorUf.get(m.uf) ?? [];
    // Evita duplicar a mesma manchete dentro do estado.
    if (lista.some((x) => normalizar(x.titulo) === normalizar(m.titulo))) return;
    lista.push(m);
    mencoesPorUf.set(m.uf, lista);
  }

  if (algumaFonteRespondeu) {
    for (const { uf, xml } of resultados) {
      if (!xml) continue;
      for (const item of parseRSS(xml)) {
        const texto = `${item.titulo} ${item.resumo}`;
        if (!ehCargoAlvo(texto)) continue;
        const ufFinal = inferirUf(texto, uf);
        if (!ufFinal || !ESTADO_POR_UF[ufFinal]) continue; // descarta nacional sem UF identificável
        registrar({
          uf: ufFinal,
          titulo: item.titulo,
          link: item.link,
          fonte: item.fonte,
          data: item.data,
          nivel: classificarNivel(texto),
          resumo: item.resumo,
        });
      }
    }
  } else {
    // Nenhuma fonte acessível: usa dados de demonstração.
    for (const m of MENCOES_DEMO) registrar(m);
  }

  const estados: EstadoStatus[] = ESTADOS.map((estado) => {
    const mencoes = (mencoesPorUf.get(estado.uf) ?? []).sort(
      (a, b) => (b.data ? Date.parse(b.data) : 0) - (a.data ? Date.parse(a.data) : 0),
    );

    let nivel: Nivel = "sem";
    let score = 0;
    for (const m of mencoes) {
      nivel = nivelMaisAvancado(nivel, m.nivel);
      score = Math.max(score, NIVEL_PESO[m.nivel] * fatorRecencia(m.data));
    }

    return {
      uf: estado.uf,
      nome: estado.nome,
      nivel,
      score: Math.round(score),
      ultimaMencao: mencoes[0]?.data ?? null,
      mencoes: mencoes.slice(0, 8),
      diarioOficial: estado.diarioOficial,
    };
  });

  estados.sort((a, b) => b.score - a.score || a.nome.localeCompare(b.nome));

  const resumo: Record<Nivel, number> = {
    edital: 0,
    banca: 0,
    previsto: 0,
    noticia: 0,
    sem: 0,
  };
  let totalMencoes = 0;
  for (const e of estados) {
    resumo[e.nivel] += 1;
    totalMencoes += e.mencoes.length;
  }

  return {
    atualizadoEm: new Date().toISOString(),
    estados,
    resumo,
    totalMencoes,
    fonteIndisponivel: !algumaFonteRespondeu,
  };
}
