// Importação de métricas por planilha CSV.
// Aceita o modelo da T9 e também exportações do Gerenciador de Anúncios da Meta e do
// Google Ads (em português, inglês ou espanhol), reconhecendo as colunas pelo nome.

export type LinhaMetrica = {
  data: string;
  plataforma: string;
  campanha: string;
  gasto: number;
  impressoes: number;
  cliques: number;
  leads: number;
  conversoes: number;
  receita: number;
};

export const CABECALHO_MODELO = "data;plataforma;campanha;gasto;impressoes;cliques;leads;conversoes;receita";

const semAcento = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const ALIASES: Record<keyof LinhaMetrica, string[]> = {
  data: ["data", "date", "dia", "day", "fecha", "inicio dos relatorios", "reporting starts", "inicio del informe"],
  plataforma: ["plataforma", "platform", "rede", "canal", "fonte", "source"],
  campanha: ["campanha", "campaign", "campana", "nome da campanha", "campaign name", "nombre de la campana"],
  gasto: ["gasto", "investimento", "valor usado", "amount spent", "importe gastado", "custo", "cost", "costo", "spend"],
  impressoes: ["impressoes", "impressions", "impresiones", "impr."],
  cliques: ["cliques", "clicks", "clics", "cliques no link", "link clicks", "clics en el enlace"],
  leads: ["leads", "contatos", "cadastros", "leads no site", "website leads", "clientes potenciales"],
  conversoes: ["conversoes", "conversions", "conversiones", "compras", "purchases", "vendas", "ventas"],
  receita: [
    "receita",
    "faturamento",
    "revenue",
    "ingresos",
    "valor de conversao",
    "valor de conversao da compra",
    "purchases conversion value",
    "conv. value",
    "valor de conv.",
  ],
};

/** Divide o texto em linhas e colunas, respeitando aspas. Detecta ; , ou tab como separador. */
export function lerCsv(texto: string) {
  const limpo = texto.replace(/^﻿/, "");
  const primeira = limpo.split(/\r?\n/, 1)[0] ?? "";
  const separador = [";", "\t", ","].reduce((melhor, s) => (primeira.split(s).length > primeira.split(melhor).length ? s : melhor), ",");

  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let aspas = false;
  for (let i = 0; i < limpo.length; i++) {
    const c = limpo[i];
    if (aspas) {
      if (c === '"' && limpo[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === separador) {
      linha.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && limpo[i + 1] === "\n") i++;
      linha.push(campo);
      if (linha.some((v) => v.trim())) linhas.push(linha);
      linha = [];
      campo = "";
    } else campo += c;
  }
  linha.push(campo);
  if (linha.some((v) => v.trim())) linhas.push(linha);
  return linhas;
}

/** "R$ 1.234,56", "1,234.56", "1234,5" → número. */
export function lerNumero(valor: string | undefined) {
  if (!valor) return 0;
  let s = valor.replace(/[^\d,.-]/g, "");
  if (!s || s === "-") return 0;
  const virgula = s.lastIndexOf(",");
  const ponto = s.lastIndexOf(".");
  if (virgula > -1 && ponto > -1) {
    s = virgula > ponto ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (virgula > -1) {
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) && !/,\d{1,2}$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** "2026-09-30", "30/09/2026", "30/09/26" → "2026-09-30". */
export function lerData(valor: string | undefined) {
  const s = (valor ?? "").trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return montarData(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) return montarData(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
  return null;
}

function montarData(ano: number, mes: number, dia: number) {
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  if (ano < 2015 || ano > 2100) return null;
  return d.toISOString().slice(0, 10);
}

export type ResultadoImportacao = { linhas: LinhaMetrica[]; erros: string[]; colunas: string[] };

export function interpretarPlanilha(texto: string, plataformaPadrao: string): ResultadoImportacao {
  const tabela = lerCsv(texto);
  const erros: string[] = [];
  if (tabela.length < 2) return { linhas: [], erros: ["A planilha está vazia ou só tem o cabeçalho."], colunas: [] };

  const cabecalho = tabela[0].map(semAcento);
  const indice = {} as Record<keyof LinhaMetrica, number>;
  for (const [campo, nomes] of Object.entries(ALIASES) as [keyof LinhaMetrica, string[]][]) {
    indice[campo] = cabecalho.findIndex((c) => nomes.includes(c));
  }
  const colunas = (Object.keys(indice) as (keyof LinhaMetrica)[]).filter((c) => indice[c] >= 0);
  if (indice.data < 0) return { linhas: [], erros: ['Não encontrei a coluna de data ("data").'], colunas };
  if (indice.gasto < 0) return { linhas: [], erros: ['Não encontrei a coluna de investimento ("gasto").'], colunas };

  const pegar = (linha: string[], campo: keyof LinhaMetrica) => (indice[campo] >= 0 ? linha[indice[campo]]?.trim() ?? "" : "");
  const linhas: LinhaMetrica[] = [];
  tabela.slice(1).forEach((linha, i) => {
    const bruto = pegar(linha, "data");
    // Exportações da Meta terminam com uma linha de totais sem data.
    if (!bruto && !pegar(linha, "campanha")) return;
    const data = lerData(bruto);
    if (!data) {
      if (erros.length < 10) erros.push(`Linha ${i + 2}: data "${bruto}" não reconhecida.`);
      return;
    }
    linhas.push({
      data,
      plataforma: (pegar(linha, "plataforma") || plataformaPadrao).slice(0, 40),
      campanha: pegar(linha, "campanha").slice(0, 200),
      gasto: lerNumero(pegar(linha, "gasto")),
      impressoes: Math.round(lerNumero(pegar(linha, "impressoes"))),
      cliques: Math.round(lerNumero(pegar(linha, "cliques"))),
      leads: Math.round(lerNumero(pegar(linha, "leads"))),
      conversoes: Math.round(lerNumero(pegar(linha, "conversoes"))),
      receita: lerNumero(pegar(linha, "receita")),
    });
  });
  return { linhas, erros, colunas };
}

/** Junta linhas repetidas (mesmo dia, plataforma e campanha) somando os valores. */
export function consolidar(linhas: LinhaMetrica[]) {
  const mapa = new Map<string, LinhaMetrica>();
  for (const l of linhas) {
    const chave = `${l.data}|${l.plataforma}|${l.campanha}`;
    const atual = mapa.get(chave);
    if (!atual) mapa.set(chave, { ...l });
    else {
      atual.gasto += l.gasto;
      atual.impressoes += l.impressoes;
      atual.cliques += l.cliques;
      atual.leads += l.leads;
      atual.conversoes += l.conversoes;
      atual.receita += l.receita;
    }
  }
  return [...mapa.values()];
}
