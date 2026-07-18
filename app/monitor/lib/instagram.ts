// Fonte: Instagram das contas oficiais de governo e dos governadores.
//
// O Instagram não tem feed público, então usamos o Apify (serviço de scraping).
// Desenho DESACOPLADO para caber nos limites de tempo do serverless:
//
//   • dispararColetaInstagram()  -> inicia um run do actor de forma ASSÍNCRONA
//     (retorna na hora). Chamado 1x/dia pelo cron em /api/cron.
//   • lerPostsInstagram()        -> apenas LÊ o dataset do último run que teve
//     sucesso (rápido, é só JSON). Chamado pela coletar() a cada geração.
//
// Assim o scraping (lento) roda em background no Apify e a página nunca trava.
// Os dados ficam no máximo ~1 dia atrasados — adequado a um monitor diário.
//
// Configuração (Vercel → Settings → Environment Variables):
//   APIFY_TOKEN   (obrigatório) token da conta Apify.
//   APIFY_ACTOR   (opcional) slug do actor; padrão apify~instagram-scraper.
//
// Handles verificados via busca web em jul/2026 (mandato 2023–2026). Reveja
// após cada eleição. Handle errado apenas devolve vazio — nunca injeta dado
// falso, pois toda menção ainda passa pelo filtro de cargo e pela janela de 2
// anos no coletor.

/** Handles por UF: conta institucional do governo + conta pessoal do governador. */
const HANDLES: { uf: string; governo: string; governador: string }[] = [
  { uf: "AC", governo: "governodoacre", governador: "gladsoncameli" },
  { uf: "AL", governo: "governoalagoas", governador: "paulodantasalagoas" },
  { uf: "AP", governo: "governodoamapa", governador: "clecioluis_" },
  { uf: "AM", governo: "governoam", governador: "wilsonlimaam" },
  { uf: "BA", governo: "governoba", governador: "jeronimorodriguesba" },
  { uf: "CE", governo: "governodoceara", governador: "elmanofreitas" },
  { uf: "DF", governo: "governodf", governador: "ibaneisoficial" },
  { uf: "ES", governo: "governoes", governador: "casagrande_es" },
  { uf: "GO", governo: "governodegoias", governador: "ronaldocaiado" },
  { uf: "MA", governo: "governodomaranhao", governador: "carlosbrandaoma" },
  { uf: "MT", governo: "governomt", governador: "mauromendesoficial" },
  { uf: "MS", governo: "governoms", governador: "eduardoriedel" },
  { uf: "MG", governo: "governomg", governador: "romeuzemaoficial" },
  { uf: "PA", governo: "governodopara", governador: "helderbarbalho" },
  { uf: "PB", governo: "governodaparaiba", governador: "joaoazevedolins" },
  { uf: "PR", governo: "governoparana", governador: "ratinho_junior" },
  { uf: "PE", governo: "governodepernambuco", governador: "raquellyraoficial" },
  { uf: "PI", governo: "governodopiaui", governador: "rafael.fonteles" },
  { uf: "RJ", governo: "governodorj", governador: "claudiocastrorj" },
  { uf: "RN", governo: "governodorn", governador: "fatimabezerra13" },
  { uf: "RS", governo: "governodors", governador: "eduardoleite" },
  { uf: "RO", governo: "governorondonia", governador: "celmarcosrocha" },
  { uf: "RR", governo: "governoderoraima", governador: "antoniodenariumrr" },
  { uf: "SC", governo: "governosc", governador: "jorginhomello" },
  { uf: "SP", governo: "governosp", governador: "tarcisiogdf" },
  { uf: "SE", governo: "governodesergipe", governador: "fabiogov55" },
  { uf: "TO", governo: "governodotocantins", governador: "wanderlei__barbosa" },
];

export interface PostInstagram {
  uf: string;
  tipo: "governo" | "governador";
  handle: string;
  titulo: string;
  resumo: string;
  link: string;
  data: string | null;
}

const APIFY_BASE = "https://api.apify.com/v2";

function actorSlug(): string {
  return process.env.APIFY_ACTOR?.trim() || "apify~instagram-scraper";
}

/** True se o token do Apify está configurado. */
export function instagramConfigurado(): boolean {
  return Boolean(process.env.APIFY_TOKEN?.trim());
}

/** Mapa username(minúsculo) -> {uf, tipo}, para associar cada post. */
const POR_USERNAME = new Map<string, { uf: string; tipo: "governo" | "governador" }>();
for (const h of HANDLES) {
  POR_USERNAME.set(h.governo.toLowerCase(), { uf: h.uf, tipo: "governo" });
  POR_USERNAME.set(h.governador.toLowerCase(), { uf: h.uf, tipo: "governador" });
}

/** Todas as URLs de perfil a raspar (governo + governador das 27 UFs). */
function todasAsUrls(): string[] {
  const urls: string[] = [];
  for (const h of HANDLES) {
    urls.push(`https://www.instagram.com/${h.governo}/`);
    urls.push(`https://www.instagram.com/${h.governador}/`);
  }
  return urls;
}

/** Data ISO de 2 anos atrás, para limitar o scraping (alinha com a janela). */
function doisAnosAtras(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Intervalo mínimo entre scrapes: ~1/dia, mesmo se o cron for acionado de hora em hora. */
const INTERVALO_MIN_HORAS = 20;

export type ResultadoDisparo = "disparado" | "aguardando-intervalo" | "nao-configurado" | "falha";

/** Consulta quando começou o último run (qualquer status). Null se nunca rodou. */
async function inicioDoUltimoRun(token: string): Promise<number | null> {
  try {
    const resp = await fetch(
      `${APIFY_BASE}/acts/${actorSlug()}/runs/last?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (!resp.ok) return null;
    const corpo = (await resp.json()) as { data?: { startedAt?: string } };
    const inicio = corpo.data?.startedAt;
    if (!inicio) return null;
    const t = new Date(inicio).getTime();
    return Number.isNaN(t) ? null : t;
  } catch {
    return null;
  }
}

/**
 * Inicia (assíncrono) um run do actor para raspar todos os perfis. Não espera o
 * término — o resultado é lido no próximo ciclo por lerPostsInstagram().
 *
 * Trava de custo: se o último run começou há menos de INTERVALO_MIN_HORAS, não
 * dispara de novo. Assim o agendador pode chamar o cron de hora em hora sem
 * multiplicar o consumo de créditos do Apify. Falhas são silenciosas para
 * nunca quebrar o cron.
 */
export async function dispararColetaInstagram(): Promise<ResultadoDisparo> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return "nao-configurado";

  const ultimoInicio = await inicioDoUltimoRun(token);
  if (ultimoInicio !== null) {
    const horas = (Date.now() - ultimoInicio) / 3_600_000;
    if (horas < INTERVALO_MIN_HORAS) return "aguardando-intervalo";
  }

  const input = {
    directUrls: todasAsUrls(),
    resultsType: "posts",
    resultsLimit: 4, // por perfil
    onlyPostsNewerThan: doisAnosAtras(),
    addParentData: false,
  };

  try {
    const resp = await fetch(
      `${APIFY_BASE}/acts/${actorSlug()}/runs?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        cache: "no-store",
      },
    );
    return resp.ok ? "disparado" : "falha";
  } catch {
    return "falha";
  }
}

/**
 * Lê os posts do último run BEM-SUCEDIDO do actor e devolve as menções já
 * associadas a UF/tipo. Rápido (só JSON). Vazio se nada disponível ainda.
 */
export async function lerPostsInstagram(): Promise<PostInstagram[]> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return [];

  let itens: unknown[] = [];
  try {
    const resp = await fetch(
      `${APIFY_BASE}/acts/${actorSlug()}/runs/last/dataset/items` +
        `?token=${encodeURIComponent(token)}&status=SUCCEEDED&clean=true`,
      { cache: "no-store" },
    );
    if (!resp.ok) return [];
    itens = (await resp.json()) as unknown[];
  } catch {
    return [];
  }
  if (!Array.isArray(itens)) return [];

  const posts: PostInstagram[] = [];
  for (const raw of itens) {
    const it = raw as Record<string, unknown>;
    const username = String(it.ownerUsername ?? "").toLowerCase();
    const dono = POR_USERNAME.get(username);
    if (!dono) continue; // post de conta que não está na nossa lista

    const legenda = String(it.caption ?? "").trim();
    if (!legenda) continue;
    const titulo = legenda.split("\n")[0].slice(0, 160);

    let data: string | null = null;
    const ts = it.timestamp;
    if (typeof ts === "string" || typeof ts === "number") {
      const d = new Date(ts);
      if (!Number.isNaN(d.getTime())) data = d.toISOString();
    }

    posts.push({
      uf: dono.uf,
      tipo: dono.tipo,
      handle: username,
      titulo,
      resumo: legenda.slice(0, 400),
      link: String(it.url ?? `https://www.instagram.com/${username}/`),
      data,
    });
  }
  return posts;
}
