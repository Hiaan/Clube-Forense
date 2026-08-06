// Orquestrador da coleta do Monitor de Concursos — Médico-Legista.
//
// Pipeline:
//   Google Notícias (nacional + estados + portais)  ─┐
//                                                    ├─► filtro de cargo ─► UF pelo texto ─► nível ─► consolidação
//   Instagram (governos/governadores, via Apify)    ─┘
//
// Regras centrais:
//   • Janela de 2 anos: menções mais antigas são descartadas.
//   • A UF vem SEMPRE do conteúdo (nome do estado ou sigla), nunca da consulta
//     de origem — evita carimbar a mesma notícia em vários estados.
//   • O filtro de cargo (cargos.ts) exige concurso + envolvimento do legista,
//     direto ("legista", "medicina legal", IML) ou pelo guarda-chuva de
//     carreira (polícia científica, perícia oficial etc.).

import { obterCuradoria } from "./baseline";
import { avaliarMencao, classificarNivel, mencaoConclusiva } from "./cargos";
import { ESTADOS, ESTADO_POR_UF, normalizar } from "./estados";
import { montarConsultas } from "./fontes";
import { HISTORICO_CONCURSOS } from "./historico";
import { instagramConfigurado, lerPostsInstagram } from "./instagram";
import { parseRSS } from "./rss";
import { versaoAtual } from "./versao";
import {
  type EstadoStatus,
  type Mencao,
  type Nivel,
  NIVEL_PESO,
  type Relatorio,
} from "./tipos";

const TIMEOUT_MS = 12_000;
/** Corte duro: só entram menções dos últimos 2 anos. */
const JANELA_MAX_DIAS = 730;
/** Até aqui a menção pesa "cheio" no score; depois decai. */
const DIAS_RELEVANTES = 120;

// ---------------------------------------------------------------------------
// Busca de feeds
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Janela temporal e score
// ---------------------------------------------------------------------------

function idadeDias(dataISO: string): number {
  return (Date.now() - new Date(dataISO).getTime()) / 86_400_000;
}

/** True se a menção está dentro da janela de 2 anos (sem data = mantida). */
function dentroDaJanela(dataISO: string | null): boolean {
  if (!dataISO) return true;
  const t = new Date(dataISO).getTime();
  if (Number.isNaN(t)) return true;
  return idadeDias(dataISO) <= JANELA_MAX_DIAS;
}

/**
 * Peso da recência no score: 1.0 na primeira semana, decai a 0.4 até os 120
 * dias e continua caindo até 0.1 no fim da janela de 2 anos — um edital de 23
 * meses atrás não deve continuar "quente" no ranking.
 */
function fatorRecencia(dataISO: string | null): number {
  if (!dataISO) return 0.6;
  const idade = idadeDias(dataISO);
  if (idade <= 7) return 1;
  if (idade <= DIAS_RELEVANTES) {
    return 1 - (0.6 * (idade - 7)) / (DIAS_RELEVANTES - 7);
  }
  if (idade >= JANELA_MAX_DIAS) return 0.1;
  return 0.4 - (0.3 * (idade - DIAS_RELEVANTES)) / (JANELA_MAX_DIAS - DIAS_RELEVANTES);
}

// ---------------------------------------------------------------------------
// Atribuição de UF pelo texto
// ---------------------------------------------------------------------------

// Nomes de estado do mais longo para o mais curto ("Mato Grosso do Sul" antes
// de "Mato Grosso"), casados no texto ORIGINAL, sensível a acento e com
// limites que respeitam letras acentuadas — assim "Pará" (estado) não casa com
// a preposição "para", nem "Paraná"/"Paraíba" com "Pará".
const LETRA = "A-Za-zÀ-ÿ";
const NOMES_ORDENADOS: { re: RegExp; uf: string }[] = [...ESTADOS]
  .sort((a, b) => b.nome.length - a.nome.length)
  .map((e) => ({
    re: new RegExp(
      `(?<![${LETRA}])${e.nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![${LETRA}])`,
      "i",
    ),
    uf: e.uf,
  }));

// Siglas em caixa alta no texto original (ex.: "Concurso Polícia Científica ES").
// Sem flag "i": minúsculas seriam falso-positivo (preposições, siglas soltas).
const UF_SIGLA_REGEX =
  /\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/;

/**
 * Associa a menção a um estado SEMPRE pelo conteúdo (nome ou sigla). Retorna
 * null quando nenhum estado é identificável — a menção é descartada em vez de
 * arriscar o estado errado.
 */
function inferirUf(texto: string): string | null {
  for (const { re, uf } of NOMES_ORDENADOS) {
    if (re.test(texto)) return uf;
  }
  const m = texto.match(UF_SIGLA_REGEX);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Consolidação
// ---------------------------------------------------------------------------

function nivelMaisAvancado(a: Nivel, b: Nivel): Nivel {
  return NIVEL_PESO[a] >= NIVEL_PESO[b] ? a : b;
}

/** Coleta e consolida o relatório completo. */
export async function coletar(): Promise<Relatorio> {
  // Curadoria, Google Notícias e Instagram (posts já raspados) em paralelo.
  const [curadoria, feeds, postsInstagram] = await Promise.all([
    obterCuradoria(),
    Promise.all(montarConsultas().map(buscarFeed)),
    instagramConfigurado() ? lerPostsInstagram() : Promise.resolve([]),
  ]);

  const googleRespondeu = feeds.some((xml) => xml !== null);
  const instaRespondeu = postsInstagram.length > 0;
  const mencoesPorUf = new Map<string, Mencao[]>();

  function registrar(m: Mencao) {
    const lista = mencoesPorUf.get(m.uf) ?? [];
    // Evita duplicar a mesma manchete dentro do estado.
    if (lista.some((x) => normalizar(x.titulo) === normalizar(m.titulo))) return;
    lista.push(m);
    mencoesPorUf.set(m.uf, lista);
  }

  // Curadoria Clube Forense: piso verificado por estado. Registrada primeiro
  // para prevalecer em caso de manchete idêntica; as notícias abaixo só
  // acrescentam ou elevam o estágio.
  for (const m of curadoria.mencoes) registrar(m);

  // Google Notícias.
  for (const xml of feeds) {
    if (!xml) continue;
    for (const item of parseRSS(xml)) {
      if (!dentroDaJanela(item.data)) continue;
      const texto = `${item.titulo} ${item.resumo}`;
      const avaliacao = avaliarMencao(texto);
      if (!avaliacao.manter) continue;
      const uf = inferirUf(texto);
      if (!uf || !ESTADO_POR_UF[uf]) continue;
      registrar({
        uf,
        titulo: item.titulo,
        link: item.link,
        fonte: item.fonte,
        data: item.data,
        nivel: classificarNivel(texto, avaliacao.cargoDireto),
        resumo: item.resumo,
        conclusiva: avaliacao.cargoDireto && mencaoConclusiva(texto),
      });
    }
  }

  // Instagram (governo/governador): a UF é a da conta, sem inferência.
  for (const post of postsInstagram) {
    if (!ESTADO_POR_UF[post.uf]) continue;
    if (!dentroDaJanela(post.data)) continue;
    const texto = `${post.titulo} ${post.resumo}`;
    const avaliacao = avaliarMencao(texto);
    if (!avaliacao.manter) continue;
    registrar({
      uf: post.uf,
      titulo: post.titulo,
      link: post.link,
      fonte: `Instagram ${post.tipo === "governo" ? "Governo" : "Governador"} @${post.handle}`,
      data: post.data,
      nivel: classificarNivel(texto, avaliacao.cargoDireto),
      resumo: post.resumo,
      conclusiva: avaliacao.cargoDireto && mencaoConclusiva(texto),
    });
  }

  // Sem fonte externa acessível (ex.: dev com rede restrita), o painel segue
  // funcionando só com a curadoria — o aviso fonteIndisponivel sinaliza isso.
  const algumaFonteRespondeu = googleRespondeu || instaRespondeu;

  const estados: EstadoStatus[] = ESTADOS.map((estado) => {
    const mencoes = (mencoesPorUf.get(estado.uf) ?? []).sort(
      (a, b) => (b.data ? Date.parse(b.data) : 0) - (a.data ? Date.parse(a.data) : 0),
    );

    // Fecho de ciclo: a menção conclusiva mais recente (resultado final,
    // homologação, posse) encerra o certame a que ela pertence. Tudo que é
    // ANTERIOR a ela descreve um concurso acabado e não pode mais definir o
    // estágio — senão um estado que já publicou edital, aplicou prova e
    // homologou continua marcado como "Edital publicado" pelos 2 anos da
    // janela. Menções posteriores começam o ciclo seguinte e contam normalmente.
    const fechamento = mencoes.find((m) => m.conclusiva && m.data)?.data ?? null;
    const limite = fechamento ? Date.parse(fechamento) : null;

    // Estado travado na planilha: a curadoria manda, ponto. Nenhuma notícia
    // eleva o estágio. É a válvula para casos como o concurso da Polícia
    // Científica SP/2026 — manchete de avanço, mas sem vaga de legista.
    const travado = curadoria.travadas.has(estado.uf);
    const detalhe = curadoria.detalhes.get(estado.uf);
    const daCuradoria = mencoes.find((m) => m.daCuradoria);

    let nivel: Nivel = "sem";
    let score = 0;
    for (const m of mencoes) {
      if (travado && m !== daCuradoria) continue;
      // Sem data não dá para ordenar em relação ao fechamento: mantemos.
      if (limite !== null && m.data && Date.parse(m.data) < limite) continue;
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
      historico: HISTORICO_CONCURSOS[estado.uf] ?? null,
      curadoria: detalhe
        ? {
            previsao: detalhe.previsao,
            vagasImediatas: detalhe.vagasImediatas,
            vagasCr: detalhe.vagasCr,
            salarioInicial: detalhe.salarioInicial,
            cargaHoraria: detalhe.cargaHoraria,
            especialidades: detalhe.especialidades,
            banca: detalhe.banca,
            inscricoesAte: detalhe.inscricoesAte,
            dataProva: detalhe.dataProva,
            confianca: detalhe.confianca,
            travado: detalhe.travado,
          }
        : null,
    };
  });

  estados.sort((a, b) => b.score - a.score || a.nome.localeCompare(b.nome));

  const resumo: Record<Nivel, number> = {
    edital: 0,
    banca: 0,
    comissao: 0,
    autorizado: 0,
    solicitado: 0,
    estudo: 0,
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
    origemCuradoria: curadoria.origem,
    versao: (({ commit, branch, ondeRoda }) => ({ commit, branch, ondeRoda }))(versaoAtual()),
  };
}
