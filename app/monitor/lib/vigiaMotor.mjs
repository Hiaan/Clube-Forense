// Motor de busca do vigia de editais de Médico-Legista: Google Notícias das
// últimas 48 h e os diários oficiais com busca automática.
//
// CÓPIA de monitor-legista/vigia.mjs (fora deste repositório), só a parte das
// buscas — sem arquivo, sem Instagram. Ao mexer num diário lá, copiar aqui.
// Usado por /api/cron/vigia (vigiaColeta.ts).

const ESTADOS = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
};

// ---------------------------------------------------------------------------
// Filtro: o que interessa ao cargo de médico-legista
// ---------------------------------------------------------------------------

const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Cita o cargo diretamente. */
// No PR e em SC o cargo é "Perito Oficial Criminal – Área 2 (Medicina)"; no RS,
// "Perito Médico – Legista".
const RE_CARGO =
  /legista|medicina legal|medic[oa][ -]legal|\biml\b|instituto medico|perit[oa][ -]medic|perito oficial criminal[^.]{0,60}(area 2|medicina)/;
/** Carreira que costuma levar o legista no mesmo edital. */
const RE_CARREIRA =
  /policia cientifica|tecnico.cientifica|pericia oficial|pericia forense|instituto geral de pericias|\bigp\b|politec|pefoce|\bperitos?\b|criminalistica/;
/** Fala de concurso ou de algum passo dele. */
const RE_CONCURSO =
  /concurso|edital|selecao|processo seletivo|vagas?\b|nomea|banca|comissao organizadora|autoriz|inscric|aprovados|cadastro reserva|provimento|recomposicao do efetivo/;

/** "direto" (cita o legista), "carreira" (perícia + concurso) ou null. */
function relevancia(texto) {
  const t = norm(texto);
  if (RE_CARGO.test(t)) return "direto";
  if (RE_CARREIRA.test(t) && RE_CONCURSO.test(t)) return "carreira";
  return null;
}

// ---------------------------------------------------------------------------
// Fontes que o próprio script consulta
// ---------------------------------------------------------------------------

async function buscar(url, init = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const r = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AprovaLegistaVigia/1.0", ...(init.headers ?? {}) },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

const desescapar = (s) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const semTags = (s) => desescapar(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const tag = (item, nome) => (item.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`)) ?? [])[1] ?? "";

const CONSULTA =
  '("médico legista" OR "perito médico legista" OR "medicina legal" OR "polícia científica" OR "perícia oficial" OR "polícia técnico-científica")';

/** Google Notícias das últimas 48 h: uma busca nacional e uma por estado. */
async function noticias() {
  const consultas = [["", `concurso ${CONSULTA} when:2d`]];
  for (const [uf, nome] of Object.entries(ESTADOS)) consultas.push([uf, `concurso ${CONSULTA} "${nome}" when:2d`]);
  const itens = [];
  let ok = 0;
  await Promise.all(
    consultas.map(async ([uf, q]) => {
      try {
        const xml = await buscar(
          `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`,
        );
        ok++;
        for (const it of xml.split("<item>").slice(1)) {
          const titulo = semTags(tag(it, "title"));
          const resumo = semTags(tag(it, "description"));
          const data = tag(it, "pubDate");
          itens.push({
            canal: "noticia",
            ufConsulta: uf,
            fonte: semTags(tag(it, "source")) || "Google Notícias",
            titulo,
            texto: `${titulo} ${resumo}`,
            link: semTags(tag(it, "link")),
            data: data ? new Date(data).toISOString() : null,
          });
        }
      } catch {}
    }),
  );
  return { itens, ok, total: consultas.length };
}

/** UF pelo texto da notícia (nome do estado ou sigla em caixa alta). */
function ufDoTexto(texto) {
  const nomes = Object.entries(ESTADOS).sort((a, b) => b[1].length - a[1].length);
  for (const [uf, nome] of nomes) {
    if (new RegExp(`(?<![A-Za-zÀ-ÿ])${nome}(?![A-Za-zÀ-ÿ])`, "i").test(texto)) return uf;
  }
  // Sigla em caixa alta no texto original ("Perícia Oficial MA"). Sem "i":
  // minúscula seria preposição ("se", "to", "pa").
  const m = texto.match(/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/);
  return m ? m[1] : null;
}

// Diários oficiais com busca automática. Um por estado; cada um devolve itens
// { canal: "diario", uf, fonte, titulo, texto, link, data }.
const hojeISO = () => new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);
const JANELA = Number(process.env.VIGIA_JANELA || 3);
const diasAtras = (n) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const br = (iso) => iso.split("-").reverse().join("/");

/** Trecho em volta do termo: a página do diário inteira não cabe no relatório. */
function trecho(texto, termos) {
  const t = String(texto ?? "").replace(/\s+/g, " ");
  // Letra a letra, para a posição no texto sem acento valer no original
  // (tirar acento com NFD de uma vez muda o comprimento).
  const n = [...t].map((ch) => norm(ch)[0] ?? " ").join("");
  let pos = -1;
  for (const termo of termos) {
    pos = n.indexOf(norm(termo));
    if (pos >= 0) break;
  }
  if (pos < 0) return t.slice(0, 500);
  return t.slice(Math.max(0, pos - 250), pos + 450);
}

/** Primeiro array de objetos dentro da resposta — cada API chama a lista de um jeito. */
function listaDe(j) {
  if (Array.isArray(j)) return j;
  for (const v of Object.values(j ?? {})) {
    if (Array.isArray(v) && v.length && typeof v[0] === "object") return v;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const dentro = listaDe(v);
      if (dentro.length) return dentro;
    }
  }
  return [];
}

/** ES, GO e PR usam o mesmo sistema de busca (Elasticsearch por página do PDF). */
function elastic(uf, base, termos) {
  return async () => {
    const itens = [];
    for (const termo of termos) {
      const q = encodeURIComponent(`"${termo}"`);
      const j = JSON.parse(await buscar(`${base}/busca/busca/buscar/query/0/di:${diasAtras(JANELA)}/df:${hojeISO()}/?1=1&q=${q}`));
      for (const h of j?.hits?.hits ?? []) {
        const s = h._source ?? {};
        const data = s.data ?? (s.year ? `${s.year}-${String(s.month).padStart(2, "0")}-${String(s.day).padStart(2, "0")}` : null);
        // A página escreve o cargo do seu jeito ("Perito médico-legista"):
        // se a frase exata não aparecer, centra na palavra mais distintiva.
        const texto = trecho(s.conteudo, [termo, "legista", "medicina legal", "medico-legal", "medico legal", ...termo.split(" ").reverse()]);
        itens.push({
          canal: "diario", uf, fonte: `Diário Oficial ${uf}`,
          titulo: `${termo} — DOE ${data ? br(String(data).slice(0, 10)) : ""} p. ${s.pagina ?? "?"}`,
          texto, link: `${base}/`, data,
        });
      }
    }
    return itens;
  };
}

/** PE e RN: sistema SDOE, exige Referer. */
function sdoe(uf, host, codigoDiario, termos) {
  return async () => {
    const itens = [];
    for (const termo of termos) {
      const j = JSON.parse(
        await buscar(`https://${host}/diariooficial/public/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Referer: `https://${host}/diariooficialweb/`, Origin: `https://${host}` },
          body: JSON.stringify({
            first: 0, maxResults: 30, palavras: termo, dataInicial: br(diasAtras(JANELA)), dataFinal: br(hojeISO()),
            intervaloAno: `${br(diasAtras(JANELA))}-${br(hojeISO())}`, codigoDiario: String(codigoDiario),
          }),
        }),
      );
      for (const m of j.list ?? []) {
        const titulo = semTags(`${m.nomeCategoria ?? ""} — ${m.resumo ?? ""}`).slice(0, 200);
        itens.push({
          canal: "diario", uf, fonte: `Diário Oficial ${uf}`, titulo,
          texto: semTags(`${titulo} ${m.texto ?? ""}`), link: `https://${host}/diariooficialweb/`, data: m.dataPublicacao ?? null,
        });
      }
    }
    return itens;
  };
}

const DIARIOS = {
  ES: elastic("ES", "https://ioes.dio.es.gov.br", ["médico legista", "medicina legal"]),
  GO: elastic("GO", "https://diariooficial.abc.go.gov.br", ["legista"]),
  PR: elastic("PR", "https://dioe.pr.gov.br", ["Perito Oficial Criminal", "legista"]),
  BA: elastic("BA", "https://dool.egba.ba.gov.br", ["Perito Médico Legista", "medicina legal"]),
  // Em SE o cargo é "Perito Médico-Legal".
  SE: elastic("SE", "https://iose.se.gov.br", ["Perito Médico", "legista"]),

  async AL() {
    // O índice deste diário anda semanas atrasado: janela maior que a dos outros.
    const itens = [];
    for (const termo of ["legista", "medicina legal"]) {
      const corpo = new URLSearchParams();
      corpo.append("keywords", termo);
      corpo.append("range[]", diasAtras(Math.max(JANELA, 30)));
      corpo.append("range[]", hojeISO());
      corpo.append("edition_number", "");
      corpo.append("searchType", "frase_exata");
      corpo.append("order", "novo");
      const j = JSON.parse(
        await buscar("https://diario.imprensaoficial.al.gov.br/apinova/api/editions/searchES?page=1&bucket_size=20", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
          body: corpo,
        }),
      );
      for (const m of j.items ?? listaDe(j)) {
        const texto = semTags([].concat(m.highlight ?? "").join(" "));
        itens.push({
          canal: "diario", uf: "AL", fonte: "Diário Oficial AL",
          titulo: `${termo} — DOE ${m.publication_date ? br(String(m.publication_date).slice(0, 10)) : ""} p. ${m.page_number ?? "?"}: ${texto.slice(0, 110)}`,
          texto, link: "https://diario.imprensaoficial.al.gov.br/", data: m.publication_date ?? null,
        });
      }
    }
    return itens;
  },

  async AM() {
    // No AM o cargo é "Perito Legista". A API às vezes demora.
    const dmy = (iso) => iso.split("-").reverse().join("-");
    const j = JSON.parse(
      await buscar(
        `https://diario.imprensaoficial.am.gov.br/apibusca/multidiarios/busca?page=1&q=legista&data_init=${dmy(diasAtras(JANELA))}&data_end=${dmy(hojeISO())}`,
      ),
    );
    return (j?.data?.resultados ?? []).map((m) => {
      const texto = semTags([].concat(m.highlight ?? "").join(" "));
      return {
        canal: "diario", uf: "AM", fonte: "Diário Oficial AM",
        titulo: `legista — DOE ${m.publicado_em ? br(m.publicado_em) : ""}: ${texto.slice(0, 120)}`,
        texto, link: "https://diario.imprensaoficial.am.gov.br/", data: m.publicado_em ?? null,
      };
    });
  },

  AP: elastic("AP", "https://diofe.portal.ap.gov.br", ["legista", "medicina legal"]),

  async MA() {
    // Sem filtro de data: vem do mais novo para o mais antigo, em cartões HTML.
    const j = JSON.parse(await buscar("https://diariooficial.ma.gov.br/ajax.busca.php?termo=legista"));
    const limite = diasAtras(JANELA);
    const itens = [];
    for (const card of String(j?.busca?.es_html ?? "").split('<div class="card ').slice(1)) {
      const [, d, m, a] = card.match(/Publicado em (\d{2})\/(\d{2})\/(\d{4})/) ?? [];
      if (!a) continue;
      const data = `${a}-${m}-${d}`;
      if (data < limite) continue;
      const texto = semTags((card.match(/<p class="card-text mb-auto">([\s\S]*?)<\/p>/) ?? [])[1] ?? "");
      const pagina = (card.match(/P&aacute;gina: <\/strong>(\d+)/) ?? [])[1] ?? "?";
      itens.push({
        canal: "diario", uf: "MA", fonte: "Diário Oficial MA",
        titulo: `legista — DOE ${br(data)} p. ${pagina}: ${trecho(texto, ["edital", "concurso", "legista"]).slice(0, 120)}`,
        texto: trecho(texto, ["legista"]), link: "https://diariooficial.ma.gov.br/", data,
      });
    }
    return itens;
  },

  // MT: o firewall barra termo com acento.
  MT: elastic("MT", "https://www.iomat.mt.gov.br", ["legista", "medicina legal"]),
  PE: sdoe("PE", "diariooficial.cepe.com.br", 1, ["legista", "medicina legal"]),
  RN: sdoe("RN", "deirn.sdoe.com.br", 121, ["legista", "medicina legal"]),

  async MG() {
    const tok = JSON.parse(
      await buscar("https://www.jornalminasgerais.mg.gov.br/api/v1/Autenticacao/Autenticar", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
      }),
    ).dados;
    const itens = [];
    for (const termo of ['"médico legista"', '"medicina legal"']) {
      const q = new URLSearchParams({
        DataPublicacaoInicial: diasAtras(JANELA), DataPublicacaoFinal: hojeISO(), TextoPesquisa: termo,
        DiarioExecutivo: "true", DiarioMunicipios: "false", DiarioTerceiros: "false", EdicaoExtra: "true",
        PaginaAtual: "1", TamanhoPagina: "30",
      });
      const j = JSON.parse(
        await buscar(`https://www.jornalminasgerais.mg.gov.br/api/v1/Pesquisa/PesquisarJornaisPaginados?${q}`, {
          headers: { Authorization: `Bearer ${tok}` },
        }),
      );
      for (const m of listaDe(j)) {
        const texto = semTags(m.textoResultado ?? "");
        itens.push({
          canal: "diario", uf: "MG", fonte: "Diário Oficial MG",
          titulo: `${termo.replace(/"/g, "")} — ${m.tipoCaderno ?? "DOE"} p. ${m.pagina ?? "?"}: ${texto.slice(0, 120)}`,
          texto, link: "https://www.jornalminasgerais.mg.gov.br/", data: m.dataPublicacao ?? null,
        });
      }
    }
    return itens;
  },

  async RS() {
    const itens = [];
    for (const termo of ["legista", "medicina legal"]) {
      const j = JSON.parse(
        await buscar(
          `https://doe-backend.pro.rs.gov.br/public/materias/?page=1&tipoDiario=doe&queryString=${encodeURIComponent(termo)}&dataIni=${diasAtras(JANELA)}&dataFim=${hojeISO()}`,
        ),
      );
      for (const m of j.collection ?? []) {
        const texto = semTags(m.texto ?? "");
        const titulo = `${m.tipoMateria ?? "Matéria"} — ${texto.replace(/^\.+/, "").slice(0, 150)}`;
        const [d, mes, a] = String(m.data ?? "").split("/");
        itens.push({
          canal: "diario", uf: "RS", fonte: "Diário Oficial RS", titulo, texto,
          link: m.id ? `https://www.diariooficial.rs.gov.br/materia?id=${m.id}` : "https://www.diariooficial.rs.gov.br/",
          data: a ? `${a}-${mes}-${d}` : null,
        });
      }
    }
    return itens;
  },

  async SC() {
    const itens = [];
    for (const termo of ["legista", "Medicina Legal", "Perito Oficial Criminal"]) {
      const j = JSON.parse(
        await buscar("https://portal.doe.sea.sc.gov.br/apis/busca-materia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            busca: termo, dtIni: diasAtras(JANELA), dtFim: hojeISO(), tipoBusca: 2,
            pagination: { from: 0, size: 30 }, resumo: false, aCdAssunto: [], aCdCategoria: [],
          }),
        }),
      );
      for (const m of j.materias ?? []) {
        const resumo = semTags(m.resumo ?? "");
        const titulo = `${m.categoria ?? ""} — ${resumo.slice(0, 150)}`;
        itens.push({
          canal: "diario", uf: "SC", fonte: "Diário Oficial SC", titulo,
          texto: trecho(`${m.categoria ?? ""} ${resumo}`, [termo]),
          link: m.extrato ?? m.preview ?? "https://portal.doe.sea.sc.gov.br/",
          data: m.publicacao ?? null,
        });
      }
    }
    return itens;
  },

  async SP() {
    const itens = [];
    for (const termo of ["legista", "medicina legal"]) {
      const j = JSON.parse(
        await buscar(
          `https://do-api-web-search.doe.sp.gov.br/v2/advanced-search/publications?Terms%5B0%5D=${encodeURIComponent(termo)}&FromDate=${diasAtras(JANELA)}&ToDate=${hojeISO()}&PageNumber=1&PageSize=30&SortField=Date`,
        ),
      );
      for (const m of j.items ?? []) {
        itens.push({
          canal: "diario", uf: "SP", fonte: "Diário Oficial SP", titulo: semTags(m.title ?? "").slice(0, 200),
          texto: semTags(`${m.title ?? ""} ${m.excerpt ?? ""} ${(m.hierarchy ?? []).join?.(" ") ?? ""}`),
          link: m.slug ? `https://doe.sp.gov.br/${m.slug}` : "https://www.doe.sp.gov.br/", data: m.date ?? null,
        });
      }
    }
    return itens;
  },

  async DF() {
    const itens = [];
    for (const termo of ["legista", "medicina legal"]) {
      const corpo = new URLSearchParams({
        termo, tpBusca: "exata", tpLocalBusca: "tudo", tpJornal: "Todos", tpSecao: "Todas",
        pagina: "1", dtInicial: diasAtras(JANELA), dtFinal: hojeISO(),
      });
      const j = JSON.parse(
        await buscar("https://dodf.df.gov.br/dodf/materia/listar", {
          method: "POST",
          headers: { "X-Requested-With": "XMLHttpRequest", "Content-Type": "application/x-www-form-urlencoded" },
          body: corpo,
        }),
      );
      const lista = j.listaMaterias ?? listaDe(j);
      for (const m of lista) {
        const titulo = semTags(`${m.ds_titulo ?? ""} — ${m.ds_nome ?? ""}`);
        itens.push({
          canal: "diario", uf: "DF", fonte: "Diário Oficial DF",
          titulo, texto: `${titulo} ${semTags(m.tx_resumo ?? "")}`,
          link: m.slug ? `https://dodf.df.gov.br/dodf/materia/visualizar?co_data=${m.co_data ?? ""}&p=${m.slug}` : "https://dodf.df.gov.br/dodf/materia/busca?termo=" + termo,
          data: m.dt_previsao_publicacao ?? null,
        });
      }
    }
    return itens;
  },
};

async function diarios() {
  const itens = [];
  const falhas = [];
  await Promise.all(
    Object.entries(DIARIOS).map(async ([uf, f]) => {
      try {
        itens.push(...(await f()));
      } catch (e) {
        falhas.push(`${uf} (${e.message})`);
      }
    }),
  );
  return { itens, ok: Object.keys(DIARIOS).length - falhas.length, total: Object.keys(DIARIOS).length, falhas };
}


export { ESTADOS, relevancia, noticias, diarios, ufDoTexto };
