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
//
// O CONSUMO É O PROJETO INTEIRO AQUI, e foi aprendido do jeito ruim. A versão
// anterior raspava 54 perfis (governo + governador das 27 UFs), 4 posts cada,
// todos os dias: ~6.500 resultados por mês. O Apify cobra por resultado e o
// crédito mensal da conta acabou no meio do mês — a partir dali TODO disparo
// voltava `403 platform-feature-disabled`, por mais de uma semana, sem nenhum
// sinal no site. Fonte que silencia sem avisar é pior que fonte que não existe.
//
// A conta que mantém a fonte viva, com folga:
//
//   29 perfis × 2 posts × 1 disparo/dia ≈ 1.740 resultados/mês
//
// O que saiu: as contas pessoais dos governadores. São metade do volume e a
// parte que menos rende — anúncio de concurso sai na conta institucional do
// governo, e a do governador repete o que já veio de lá. A tabela delas fica
// abaixo de propósito: serve de referência de quem é quem, e um post do
// governador que apareça no dataset por outro caminho continua sendo
// reconhecido.
//
// O que entrou: os perfis dos portais de concurso, que não têm UF e por isso
// têm o estado inferido do texto, como qualquer notícia.

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

/**
 * Perfis de portal de concurso: os que publicam notícia de edital no feed.
 *
 * Sem UF, porque não têm uma — o estado vem do texto do post, pelo mesmo
 * caminho de qualquer notícia (ver coletor.ts). Dois, e não cinco: cada perfil
 * é consumo fixo todo dia, e estes dois são os de maior alcance.
 *
 * O MedConcursos (Método Legista) não está aqui porque o handle dele não foi
 * confirmado em nenhuma fonte pública — e handle chutado é fonte que parece
 * ligada e nunca traz nada. Ele entra por caminho melhor: o feed do próprio
 * site, que o monitor lê de hora em hora (ver portais.ts).
 */
const PERFIS_CONCURSO = ["qconcursos", "grancursosonline"];

export interface PostInstagram {
  /** `null` nos perfis de portal, que não pertencem a um estado. */
  uf: string | null;
  tipo: "governo" | "governador" | "concurso";
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
const POR_USERNAME = new Map<
  string,
  { uf: string | null; tipo: "governo" | "governador" | "concurso" }
>();
for (const h of HANDLES) {
  POR_USERNAME.set(h.governo.toLowerCase(), { uf: h.uf, tipo: "governo" });
  POR_USERNAME.set(h.governador.toLowerCase(), { uf: h.uf, tipo: "governador" });
}
for (const perfil of PERFIS_CONCURSO) {
  POR_USERNAME.set(perfil.toLowerCase(), { uf: null, tipo: "concurso" });
}

/**
 * As URLs de perfil a raspar: a conta institucional das 27 UFs e os perfis de
 * portal. As contas de governador ficam de fora — ver a conta de consumo no
 * topo do arquivo.
 */
function todasAsUrls(): string[] {
  const urls = HANDLES.map((h) => `https://www.instagram.com/${h.governo}/`);
  for (const perfil of PERFIS_CONCURSO) {
    urls.push(`https://www.instagram.com/${perfil}/`);
  }
  return urls;
}

/** Data ISO de 2 anos atrás, para limitar o scraping (alinha com a janela). */
function doisAnosAtras(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Intervalo mínimo entre scrapes: um por dia, mesmo com o cron de hora em hora.
 *
 * 24 e não 20: a 20 horas, duas passadas caem no mesmo dia de vez em quando e
 * o consumo do mês estoura justamente no fim do mês, quando não há mais
 * crédito para recuperar. Perfil de governo publica concurso uma vez por
 * semana, não a cada hora — a frequência de hora em hora que o monitor tem é
 * entregue pelos feeds, que são de graça.
 */
const INTERVALO_MIN_HORAS = 24;

/**
 * O que aconteceu ao tentar disparar o scrape.
 *
 * A falha carrega o status HTTP porque as causas prováveis são bem diferentes
 * entre si e exigem ações opostas — 401 é token inválido, 402/403 costuma ser
 * crédito esgotado ou actor pago, 404 é slug de actor errado. Um "falha" seco
 * obriga a adivinhar, e adivinhar sai caro.
 */
export type ResultadoDisparo =
  | "disparado"
  | "aguardando-intervalo"
  | "nao-configurado"
  | `falha ${number}`
  | "falha de rede";

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
    // Por perfil. Dois cobre o dia de uma conta institucional com sobra, e é
    // metade do consumo de quatro — ver a conta no topo do arquivo.
    resultsLimit: 2,
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
    if (resp.ok) return "disparado";
    // O corpo diz o motivo em texto; vale o log, mesmo que a resposta do cron
    // só carregue o número.
    console.error(
      `Apify recusou o disparo (${resp.status}): ${(await resp.text()).slice(0, 300)}`,
    );
    return `falha ${resp.status}`;
  } catch (e) {
    console.error(`Apify inalcançável: ${e instanceof Error ? e.message : e}`);
    return "falha de rede";
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
