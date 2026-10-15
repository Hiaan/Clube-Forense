// Do que a coleta encontra para a fila de revisão do blog.
//
// POR QUE ISTO NÃO MORA DENTRO DE `coletar()`: a coleta roda em toda visita ao
// mapa, e gravar no banco como efeito de uma leitura de página é o caminho mais
// curto para uma tabela cheia de lixo e uma home lenta. Aqui é uma função
// explícita, chamada por quem tem o direito de escrever: o cron e o botão
// "Coletar agora" do painel.
//
// O QUE O ROBÔ FAZ E O QUE ELE NÃO FAZ. Ele monta um rascunho: título, resumo,
// um esqueleto de texto com o que a fonte disse, a procedência e o gancho para
// o mapa. Ele NÃO escreve a matéria — não existe modelo de linguagem neste
// projeto, e inventar parágrafo a partir de uma manchete de RSS é como se
// fabrica notícia errada. O rascunho nasce em "revisao" e só vai ao ar quando
// alguém aprova.

import { abrirRascunhoDoRobo, type PostParaGravar } from "../../lib/postsRepo";
import { aSlug, orgaoDaUf } from "../../blog/lib/taxonomia";
import { ESTADO_POR_UF } from "./estados";
import { buscarImagemDaMateria } from "./imagemDaMateria";
import { NIVEL_LABEL, type Mencao, type Nivel, type Relatorio } from "./tipos";

/** Quantas pautas uma passada pode abrir. */
const TETO_POR_RODADA = 6;

/**
 * Teto por rodada, e não "abra tudo que achar".
 *
 * Quando um edital sai, a mesma notícia aparece em vinte portais no mesmo dia.
 * Sem limite, a fila de revisão receberia vinte rascunhos da mesma coisa e a
 * pessoa desistiria de olhar — que é o fim de qualquer fila. Seis por rodada,
 * de hora em hora, dá vazão de sobra e mantém a tela legível.
 */

/** Só notícia recente vira pauta. Concurso de três meses atrás não é post. */
const JANELA_DIAS = 21;

/**
 * Qual categoria do blog a notícia é.
 *
 * O estágio do funil já carrega essa informação: se o robô classificou a
 * notícia como "edital", é matéria de edital. O resto é notícia de andamento.
 */
function categoriaDoNivel(nivel: Nivel): string {
  return nivel === "edital" ? "edital" : "noticia";
}

function recente(iso: string | null): boolean {
  if (!iso) return false;
  const dias = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return dias >= 0 && dias <= JANELA_DIAS;
}

/**
 * Slug a partir do título, com a UF e a data na frente para não colidir.
 *
 * "Concurso PC-TO: edital sai em novembro" é manchete que se repete a cada
 * certame. Sem o prefixo, o segundo post com esse título seria recusado pelo
 * índice único e a pauta se perderia em silêncio.
 */
function slugDaPauta(m: Mencao): string {
  const quando = (m.data ?? new Date().toISOString()).slice(0, 10);
  return aSlug(`${m.uf} ${quando} ${m.titulo}`).slice(0, 80);
}

/**
 * O esqueleto do texto.
 *
 * Markdown, com três partes: o que a fonte disse (entre aspas e creditado, para
 * ninguém confundir com texto nosso), um lugar marcado para a análise do Clube
 * e o gancho para o mapa. Quem revisa reescreve a primeira parte e preenche a
 * segunda; o que não for reescrito continua honesto, porque está atribuído.
 */
function esqueleto(m: Mencao, nomeEstado: string): string {
  const resumo = m.resumo?.trim();
  const estagio = NIVEL_LABEL[m.nivel];

  return [
    resumo ? `> ${resumo}` : `> ${m.titulo}`,
    "",
    `Segundo ${m.fonte || "a fonte"}${m.data ? `, em ${new Date(m.data).toLocaleDateString("pt-BR")}` : ""}.`,
    "",
    "## O que isso muda",
    "",
    "<!-- Escreva aqui a leitura do Clube: o que a notícia significa para quem",
    "     está estudando, o que já era sabido e o que é novo. Sem esta parte, o",
    "     post é só a manchete de outro veículo repetida. -->",
    "",
    "## Onde o estado está hoje",
    "",
    `No nosso monitor, ${nomeEstado} aparece como **${estagio}**. ` +
      `Veja a etapa, as vagas e o salário no [mapa dos concursos](/?uf=${m.uf}).`,
  ].join("\n");
}

export interface ResultadoPautas {
  /** Quantos rascunhos nasceram nesta passada. */
  abertas: number;
  /** Títulos abertos, para o painel poder dizer o que apareceu. */
  titulos: string[];
}

/**
 * Abre pauta para as notícias novas e relevantes do relatório.
 *
 * Nunca lança: a coleta e o cron não podem quebrar porque o blog teve um
 * problema. O que falhar fica de fora e a próxima passada tenta de novo — o
 * índice único em `fonte_url` é o que garante que tentar de novo não duplica.
 */
export async function abrirPautas(relatorio: Relatorio): Promise<ResultadoPautas> {
  const candidatas: Mencao[] = [];

  for (const estado of relatorio.estados) {
    for (const m of estado.mencoes) {
      // Curadoria é texto nosso, escrito no painel: virar "pauta do robô" seria
      // o sistema se citando como se fosse fonte externa.
      if (m.daCuradoria) continue;
      if (!m.link?.startsWith("http")) continue;
      if (!recente(m.data)) continue;
      candidatas.push(m);
    }
  }

  // Mais recente primeiro: se o teto cortar, que corte o mais velho.
  candidatas.sort((a, b) => (b.data ?? "").localeCompare(a.data ?? ""));

  const titulos: string[] = [];
  for (const m of candidatas) {
    if (titulos.length >= TETO_POR_RODADA) break;

    const estado = ESTADO_POR_UF[m.uf];
    if (!estado) continue;

    // A imagem é tentada por último e nunca bloqueia: pauta sem capa é pauta,
    // e o cartão da listagem já sabe se virar com a sigla do órgão.
    const capa = await buscarImagemDaMateria(m.link).catch(() => null);

    const pauta: PostParaGravar = {
      slug: slugDaPauta(m),
      titulo: m.titulo.trim().slice(0, 200),
      resumo: (m.resumo ?? "").trim().slice(0, 400),
      corpo: esqueleto(m, estado.nome),
      capaUrl: capa?.url ?? null,
      capaCredito: capa ? (m.fonte || null) : null,
      uf: m.uf,
      orgao: orgaoDaUf(m.uf)?.slug ?? null,
      categoria: categoriaDoNivel(m.nivel),
      origem: "robo",
      fonteNome: m.fonte || null,
      fonteUrl: m.link,
      status: "revisao",
      publicadoEm: null,
    };

    if (await abrirRascunhoDoRobo(pauta)) titulos.push(pauta.titulo);
  }

  return { abertas: titulos.length, titulos };
}
