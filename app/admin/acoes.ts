"use server";

// Ações do painel administrativo.
//
// Toda ação que grava confere a sessão primeiro. Não basta a página checar: um
// formulário pode ser enviado direto, sem passar por ela.

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminConfigurado,
  credenciaisValidas,
  criarSessaoAdmin,
  NOME_COOKIE_ADMIN,
  sessaoAdminValida,
} from "../lib/admin";
import { apagarAprovado, salvarAprovado } from "../lib/aprovadosRepo";
import { salvarEstado, salvarVarios, type EstadoCuradoria } from "../lib/estadosRepo";
import { salvarImls, type Iml } from "../lib/imlsRepo";
import { salvarPlano, type ClassePlano } from "../lib/planoRepo";
import {
  apagarProva,
  lerProva,
  recorrigirProva,
  salvarGabarito,
  salvarMaterias,
  salvarProva,
} from "../lib/provasRepo";
import {
  apagarPost,
  gravarPost,
  lerPorId,
  publicarEmLote,
  slugOcupado,
  type OrigemPost,
  type StatusPost,
} from "../lib/postsRepo";
import { interpretarGabarito, type EstiloProva, type MateriaProva } from "../lib/ranking";
import { aSlug, categoriaPorSlug, orgaoDaUf } from "../blog/lib/taxonomia";
import { coletar } from "../monitor/lib/coletor";
import { importarBlogAntigo } from "../monitor/lib/blogAntigo";
import { abrirPautas, type ResultadoPautas } from "../monitor/lib/pautas";
import { ESTADO_POR_UF } from "../monitor/lib/estados";
import { lerPlanilha } from "../monitor/lib/planilha";
import { registrarColeta } from "../lib/sistemaRepo";
import { NIVEL_LABEL, type Nivel } from "../monitor/lib/tipos";

/** Garante que quem chamou está autenticado. Lança se não estiver. */
async function exigirAdmin(): Promise<void> {
  const jar = await cookies();
  if (!sessaoAdminValida(jar.get(NOME_COOKIE_ADMIN)?.value)) {
    throw new Error("Sessão expirada. Entre novamente.");
  }
}

export interface Resultado {
  ok: boolean;
  mensagem: string;
}

// ---------------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------------

export async function entrar(_anterior: Resultado | null, dados: FormData): Promise<Resultado> {
  if (!adminConfigurado()) {
    return {
      ok: false,
      mensagem:
        "Painel não configurado. Defina ADMIN_EMAIL e ADMIN_SENHA nas variáveis de ambiente do projeto na Vercel.",
    };
  }

  const email = String(dados.get("email") ?? "");
  const senha = String(dados.get("senha") ?? "");

  if (!credenciaisValidas({ email, senha })) {
    // Mensagem única para e-mail e senha: dizer qual errou entrega
    // ao atacante a informação de que um dos dois está certo.
    return { ok: false, mensagem: "E-mail ou senha incorretos." };
  }

  const sessao = criarSessaoAdmin();
  const jar = await cookies();
  jar.set(sessao.nome, sessao.valor, {
    path: "/",
    maxAge: sessao.maxAge,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin");
}

export async function sair(): Promise<void> {
  const jar = await cookies();
  jar.delete(NOME_COOKIE_ADMIN);
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Edição
// ---------------------------------------------------------------------------

const ETAPAS: Nivel[] = [
  "estudo", "solicitado", "autorizado", "comissao", "banca", "edital", "noticia", "sem",
];

/** Campo de texto: string vazia vira null, para não gravar "" no banco. */
function texto(dados: FormData, campo: string): string | null {
  const v = String(dados.get(campo) ?? "").trim();
  return v === "" ? null : v;
}

function numero(dados: FormData, campo: string): number | null {
  const v = String(dados.get(campo) ?? "").trim().replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * As classes do plano viajam como JSON num campo escondido, montado pelo editor
 * no navegador. É uma tabela de tamanho variável dentro de um formulário: como
 * campos soltos, cada linha viraria três nomes numerados, e remover a do meio
 * exigiria renumerar tudo.
 *
 * JSON quebrado não derruba o salvamento do estado — devolve lista vazia, e o
 * plano fica como está para ser corrigido.
 */
function lerClasses(dados: FormData): ClassePlano[] {
  const cru = String(dados.get("planoClasses") ?? "").trim();
  if (!cru) return [];
  try {
    const lista = JSON.parse(cru);
    if (!Array.isArray(lista)) return [];
    return lista
      .map((c): ClassePlano => {
        const valor = Number(c?.subsidio);
        return {
          classe: String(c?.classe ?? "").trim(),
          subsidio: Number.isFinite(valor) && c?.subsidio !== null ? valor : null,
        };
      })
      .filter((c) => c.classe);
  } catch {
    return [];
  }
}

/** Mesma ideia do plano: a lista viaja como JSON num campo escondido. */
function lerImls(dados: FormData): Iml[] {
  const cru = String(dados.get("imls") ?? "").trim();
  if (!cru) return [];
  try {
    const lista = JSON.parse(cru);
    if (!Array.isArray(lista)) return [];
    return lista
      .map((i): Iml => ({
        cidade: String(i?.cidade ?? "").trim(),
        nome: String(i?.nome ?? "").trim() || null,
      }))
      .filter((i) => i.cidade);
  } catch {
    return [];
  }
}

export async function salvarEstadoAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const uf = String(dados.get("uf") ?? "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(uf)) return { ok: false, mensagem: "UF inválida." };

    const etapaBruta = String(dados.get("etapa") ?? "sem");
    const etapa = (ETAPAS.includes(etapaBruta as Nivel) ? etapaBruta : "sem") as Nivel;

    const confiancaBruta = String(dados.get("confianca") ?? "media");
    const confianca = (["alta", "media", "baixa"].includes(confiancaBruta)
      ? confiancaBruta
      : "media") as "alta" | "media" | "baixa";

    const estado: EstadoCuradoria = {
      uf,
      etapa,
      andamento: String(dados.get("andamento") ?? "").trim(),
      previsao: texto(dados, "previsao"),
      vagasImediatas: numero(dados, "vagasImediatas"),
      vagasCr: numero(dados, "vagasCr"),
      salarioInicial: numero(dados, "salarioInicial"),
      cargaHoraria: numero(dados, "cargaHoraria"),
      especialidades: texto(dados, "especialidades"),
      banca: texto(dados, "banca"),
      inscricoesAte: texto(dados, "inscricoesAte"),
      dataProva: texto(dados, "dataProva"),
      ultimoEdital: texto(dados, "ultimoEdital"),
      ultimaProva: texto(dados, "ultimaProva"),
      bancaAnterior: texto(dados, "bancaAnterior"),
      validadeCertameAnterior: texto(dados, "validadeCertameAnterior"),
      confianca,
      fonteUrl: texto(dados, "fonteUrl"),
      verificadoEm: texto(dados, "verificadoEm"),
      travado: dados.get("travado") === "on",
      observacao: texto(dados, "observacao"),
      noticiaTitulo: texto(dados, "noticiaTitulo"),
      noticiaResumo: texto(dados, "noticiaResumo"),
      noticiaFonte: texto(dados, "noticiaFonte"),
      noticiaLink: texto(dados, "noticiaLink"),
      imagemUrl: texto(dados, "imagemUrl"),
      planoOrgao: texto(dados, "planoOrgao"),
      planoAno: numero(dados, "planoAno"),
      planoFonte: texto(dados, "planoFonte"),
      imlsTotal: numero(dados, "imlsTotal"),
      imlsTexto: texto(dados, "imlsTexto"),
      imlsFonte: texto(dados, "imlsFonte"),
      editalUrl: texto(dados, "editalUrl"),
      editalPdfUrl: texto(dados, "editalPdfUrl"),
      notaCorte: numero(dados, "notaCorte"),
      notaCorteRotulo: texto(dados, "notaCorteRotulo"),
      notaCorteVisivel: dados.get("notaCorteVisivel") === "on",
      salarioFinal: numero(dados, "salarioFinal"),
      vagasDetalhe: texto(dados, "vagasDetalhe"),
      // A lista suspensa manda "sim", "nao" ou "" — e o vazio precisa chegar ao
      // banco como null, que é o "não conferimos".
      taf: (() => {
        const v = String(dados.get("taf") ?? "");
        return v === "sim" ? true : v === "nao" ? false : null;
      })(),
      materias: texto(dados, "materias"),
      etapasConcurso: texto(dados, "etapasConcurso"),
      infoAnterior: dados.get("infoAnterior") === "on",
      atualizadoEm: null,
    };

    await salvarEstado(estado);
    await salvarPlano(uf, lerClasses(dados));
    await salvarImls(uf, lerImls(dados));

    // O site inteiro depende desta curadoria; sem isto a mudança só apareceria
    // quando o cache de 5 minutos vencesse.
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/estados");
    revalidatePath(`/admin/estados/${uf}`);

    return { ok: true, mensagem: `${uf} salvo.` };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao salvar." };
  }
}

// ---------------------------------------------------------------------------
// Aprovados
// ---------------------------------------------------------------------------

export async function salvarAprovadoAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const uf = String(dados.get("uf") ?? "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(uf)) return { ok: false, mensagem: "Escolha o estado." };

    const nome = String(dados.get("nome") ?? "").trim();
    if (!nome) return { ok: false, mensagem: "O nome é obrigatório." };

    const idBruto = String(dados.get("id") ?? "").trim();

    await salvarAprovado({
      id: idBruto ? Number(idBruto) : undefined,
      uf,
      nome,
      titulo: texto(dados, "titulo"),
      orgao: texto(dados, "orgao"),
      ano: numero(dados, "ano"),
      fotoUrl: texto(dados, "fotoUrl"),
      ordem: numero(dados, "ordem") ?? 0,
    });

    revalidatePath("/");
    revalidatePath("/admin/aprovados");

    return { ok: true, mensagem: `${nome} salvo.` };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao salvar." };
  }
}

export async function apagarAprovadoAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const id = Number(String(dados.get("id") ?? ""));
    if (!Number.isInteger(id) || id <= 0) return { ok: false, mensagem: "Registro inválido." };

    const foto = await apagarAprovado(id);

    // A imagem no Blob não some sozinha quando a linha some. Se falhar, o
    // registro já foi apagado e o arquivo fica ocupando espaço — vale um log,
    // não vale desfazer a exclusão que a pessoa pediu.
    if (foto) {
      try {
        const { del } = await import("@vercel/blob");
        await del(foto);
      } catch (e) {
        console.error("Aprovado apagado, mas a foto ficou no Blob:", e);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/aprovados");

    return { ok: true, mensagem: "Aprovado removido." };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao remover." };
  }
}

// ---------------------------------------------------------------------------
// Importação da planilha (uma vez, na migração)
// ---------------------------------------------------------------------------

export async function importarPlanilhaAcao(): Promise<Resultado> {
  try {
    await exigirAdmin();

    const r = await lerPlanilha();
    if (!r.ok) return { ok: false, mensagem: `Não consegui ler a planilha: ${r.motivo}` };

    // A notícia principal não existe na planilha — é escolha editorial feita
    // aqui. Por isso `salvarVarios` preserva esses campos ao reimportar; sem
    // isso, uma reimportação apagaria em silêncio o que você escolheu.
    const estados: EstadoCuradoria[] = r.linhas.map((l) => ({
      uf: l.uf,
      etapa: l.etapa,
      andamento: l.andamento,
      previsao: l.previsao,
      vagasImediatas: l.vagasImediatas,
      vagasCr: l.vagasCr,
      salarioInicial: l.salarioInicial,
      cargaHoraria: l.cargaHoraria,
      especialidades: l.especialidades,
      banca: l.banca,
      inscricoesAte: l.inscricoesAte,
      dataProva: l.dataProva,
      ultimoEdital: l.ultimoEdital,
      ultimaProva: l.ultimaProva,
      bancaAnterior: l.bancaAnterior,
      validadeCertameAnterior: l.validadeCertameAnterior,
      confianca: l.confianca,
      fonteUrl: l.fonteUrl,
      verificadoEm: l.verificadoEm,
      travado: l.travado,
      observacao: l.observacao,
      noticiaTitulo: null,
      noticiaResumo: null,
      noticiaFonte: null,
      noticiaLink: null,
      imagemUrl: null,
      planoOrgao: null,
      planoAno: null,
      planoFonte: null,
      imlsTotal: null,
      imlsTexto: null,
      imlsFonte: null,
      editalUrl: null,
      editalPdfUrl: null,
      notaCorte: null,
      notaCorteRotulo: null,
      notaCorteVisivel: false,
      salarioFinal: null,
      vagasDetalhe: null,
      taf: null,
      materias: null,
      etapasConcurso: null,
      infoAnterior: false,
      atualizadoEm: null,
    }));

    const gravados = await salvarVarios(estados);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/estados");

    const aviso = r.avisos.length ? ` Avisos: ${r.avisos.join("; ")}` : "";
    return { ok: true, mensagem: `${gravados} estados importados da planilha.${aviso}` };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha na importação." };
  }
}

// ---------------------------------------------------------------------------
// Provas do ranking
// ---------------------------------------------------------------------------

const ESTILOS: EstiloProva[] = ["abcde", "abcd", "ce"];

/**
 * As matérias viajam como JSON num campo escondido — mesma solução do plano de
 * carreira e da lista de IMLs, pelo mesmo motivo: é uma tabela de tamanho
 * variável dentro de um formulário.
 */
function lerMaterias(dados: FormData): MateriaProva[] {
  const cru = String(dados.get("materias") ?? "").trim();
  if (!cru) return [];
  try {
    const lista = JSON.parse(cru);
    if (!Array.isArray(lista)) return [];
    return lista
      .map((m): MateriaProva => {
        const peso = Number(m?.peso);
        return {
          nome: String(m?.nome ?? "").trim(),
          questaoDe: Math.max(1, Math.trunc(Number(m?.questaoDe) || 0)),
          questaoAte: Math.max(1, Math.trunc(Number(m?.questaoAte) || 0)),
          peso: Number.isFinite(peso) && peso > 0 ? peso : 1,
        };
      })
      .filter((m) => m.nome && m.questaoAte >= m.questaoDe);
  } catch {
    return [];
  }
}

/** Cria a prova só com o essencial e leva para a tela de edição. */
export async function criarProvaAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  let id: number;
  try {
    await exigirAdmin();

    const uf = String(dados.get("uf") ?? "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(uf)) return { ok: false, mensagem: "Escolha o estado." };

    const titulo = String(dados.get("titulo") ?? "").trim();
    if (!titulo) return { ok: false, mensagem: "Dê um nome à prova." };

    id = await salvarProva(null, {
      uf,
      titulo,
      dataProva: texto(dados, "dataProva"),
      estilo: "abcde",
      penalidade: false,
      tipos: "",
      // Nasce fechada: abrir é o que faz o botão aparecer no mapa, e isso
      // precisa ser um ato deliberado, depois de as matérias existirem.
      aberta: false,
      vagas: null,
      inscritos: null,
    });
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao criar." };
  }

  // Fora do try: `redirect` funciona lançando, e o catch acima o engoliria.
  revalidatePath("/admin/provas");
  redirect(`/admin/provas/${id}`);
}

export async function salvarProvaAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const id = Number(String(dados.get("id") ?? ""));
    if (!Number.isInteger(id) || id <= 0) return { ok: false, mensagem: "Prova inválida." };

    const uf = String(dados.get("uf") ?? "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(uf)) return { ok: false, mensagem: "Escolha o estado." };

    const titulo = String(dados.get("titulo") ?? "").trim();
    if (!titulo) return { ok: false, mensagem: "Dê um nome à prova." };

    const estiloBruto = String(dados.get("estilo") ?? "abcde");
    const estilo = (ESTILOS.includes(estiloBruto as EstiloProva)
      ? estiloBruto
      : "abcde") as EstiloProva;

    const materias = lerMaterias(dados);
    const aberta = dados.get("aberta") === "on";
    if (aberta && materias.length === 0) {
      return {
        ok: false,
        mensagem:
          "Cadastre ao menos uma matéria antes de abrir a prova — sem elas não há cartão-resposta para preencher.",
      };
    }

    await salvarProva(id, {
      uf,
      titulo,
      dataProva: texto(dados, "dataProva"),
      estilo,
      penalidade: dados.get("penalidade") === "on",
      tipos: String(dados.get("tipos") ?? "").trim(),
      aberta,
      vagas: numero(dados, "vagas"),
      inscritos: numero(dados, "inscritos"),
    });
    await salvarMaterias(id, materias);

    // Peso, faixa de questões e penalidade entram na conta da nota: mexer neles
    // sem recorrigir deixaria o ranking mostrando notas de uma regra que não
    // vale mais.
    const corrigidos = await recorrigirProva(id);

    revalidatePath("/");
    revalidatePath("/ranking");
    revalidatePath(`/ranking/${uf}`);
    revalidatePath("/admin/provas");
    revalidatePath(`/admin/provas/${id}`);

    return {
      ok: true,
      mensagem: corrigidos
        ? `Prova salva. ${corrigidos} cartão(ões) recorrigido(s).`
        : "Prova salva.",
    };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao salvar." };
  }
}

/**
 * Cola o gabarito de um tipo de prova e recorrige todo mundo.
 *
 * É a ação que fecha o ciclo: as respostas chegam no domingo, o gabarito na
 * quarta, e ninguém precisa reenviar nada.
 */
export async function salvarGabaritoAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const id = Number(String(dados.get("id") ?? ""));
    if (!Number.isInteger(id) || id <= 0) return { ok: false, mensagem: "Prova inválida." };

    const prova = await lerProva(id);
    if (!prova) return { ok: false, mensagem: "Prova não encontrada." };

    const tipo = String(dados.get("tipo") ?? "").trim();
    if (tipo && !prova.tipos.includes(tipo)) {
      return { ok: false, mensagem: `“${tipo}” não é um tipo desta prova.` };
    }

    const primeira = prova.materias.length
      ? Math.min(...prova.materias.map((m) => m.questaoDe))
      : 1;
    const { gabarito, ignorados } = interpretarGabarito(
      String(dados.get("gabarito") ?? ""),
      prova.estilo,
      primeira,
    );

    await salvarGabarito(id, tipo, gabarito);
    const corrigidos = await recorrigirProva(id);

    revalidatePath("/ranking");
    revalidatePath(`/ranking/${prova.uf}`);
    revalidatePath(`/admin/provas/${id}`);

    const quantas = Object.keys(gabarito).length;
    if (quantas === 0) {
      return { ok: true, mensagem: "Gabarito apagado. Os cartões ficaram sem nota." };
    }

    // Os ignorados são mostrados, e não engolidos: é assim que se descobre que
    // o PDF da banca trouxe um "12 X" no meio das respostas.
    const aviso = ignorados.length
      ? ` Não entendi: ${ignorados.slice(0, 8).join(", ")}${ignorados.length > 8 ? "…" : ""}.`
      : "";
    return {
      ok: true,
      mensagem: `${quantas} questões no gabarito, ${corrigidos} cartão(ões) corrigido(s).${aviso}`,
    };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao salvar." };
  }
}

export async function apagarProvaAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const id = Number(String(dados.get("id") ?? ""));
    if (!Number.isInteger(id) || id <= 0) return { ok: false, mensagem: "Prova inválida." };

    await apagarProva(id);
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao remover." };
  }

  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/admin/provas");
  redirect("/admin/provas");
}

// ---------------------------------------------------------------------------
// Coleta manual
// ---------------------------------------------------------------------------

/**
 * Roda a coleta agora, ignorando o cache de uma hora dos feeds.
 *
 * Existe para a pergunta "saiu alguma coisa e o monitor não pegou?": o botão
 * de pesquisar mostra o que HÁ nas fontes, este diz o que o robô FEZ com isso,
 * sem esperar o ciclo do agendador.
 *
 * Custa uma requisição ao Google Notícias por consulta — hoje dezenas — e por
 * isso é um clique deliberado de quem administra, e não algo que a página faça
 * sozinha.
 *
 * A resposta fala do estado que está aberto, e não do país: quem clicou está
 * olhando um estado e quer saber daquele.
 */
/** Frase que avisa sobre a fila do blog. Vazia quando não nasceu pauta nenhuma. */
function avisoPautas(r: ResultadoPautas): string {
  if (r.abertas === 0) return "";

  const partes: string[] = [];
  if (r.publicadas > 0) {
    partes.push(
      r.publicadas === 1
        ? "Um post novo foi publicado no blog"
        : `${r.publicadas} posts novos foram publicados no blog`,
    );
  }
  if (r.naFila > 0) {
    partes.push(
      r.naFila === 1
        ? "uma pauta entrou na fila, em Blog › Para revisar"
        : `${r.naFila} pautas entraram na fila, em Blog › Para revisar`,
    );
  }
  return ` ${partes.join(" e ")}.`;
}

export async function coletarAgoraAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const uf = String(dados.get("uf") ?? "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(uf)) return { ok: false, mensagem: "UF inválida." };

    const relatorio = await coletar({ semCache: true });

    // Mesmo registro que o cron faz: sem isto, o "Notícias checadas em" do
    // site continuaria mostrando a hora da última passada automática.
    await registrarColeta({
      em: relatorio.atualizadoEm,
      estadosComNovidade: relatorio.estados.filter((e) => e.nivel !== "sem").length,
      fonteIndisponivel: relatorio.fonteIndisponivel,
    });

    // A coleta manual também abre pauta: é o mesmo robô, e quem apertou o
    // botão é quem tem permissão de escrever.
    const pautas = await abrirPautas(relatorio);

    revalidatePath("/");
    revalidatePath("/monitor");
    revalidatePath("/blog");
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/estados/${uf}`);

    if (relatorio.fonteIndisponivel) {
      return {
        ok: false,
        mensagem:
          "Nenhuma fonte externa respondeu agora. Não é conclusão sobre o estado — é a busca que não chegou. Tente de novo em alguns minutos.",
      };
    }

    const doEstado = relatorio.estados.find((e) => e.uf === uf);
    const nome = ESTADO_POR_UF[uf]?.nome ?? uf;
    // Descontadas as menções da curadoria: o que interessa aqui é o que o robô
    // trouxe de fora, e não o que nós mesmos escrevemos.
    const coletadas = (doEstado?.mencoes ?? []).filter((m) => !m.daCuradoria);

    if (coletadas.length === 0) {
      return {
        ok: true,
        mensagem:
          `Coleta refeita. Nenhuma notícia sobre ${nome} nas fontes agora — ` +
          `use "Pesquisar notícias" acima para conferir por fora.${avisoPautas(pautas)}`,
      };
    }

    const maisNova = coletadas
      .map((m) => m.data)
      .filter((d): d is string => Boolean(d))
      .sort()
      .pop();
    const quando = maisNova
      ? ` A mais recente é de ${new Date(maisNova).toLocaleDateString("pt-BR")}.`
      : "";

    return {
      ok: true,
      mensagem:
        `Coleta refeita: ${coletadas.length} notícia(s) sobre ${nome}.${quando} ` +
        `O robô classificou o estado como “${NIVEL_LABEL[doEstado!.nivel]}”. ` +
        "Recarregue a página para ver as manchetes na lista de sugestões." +
        avisoPautas(pautas),
    };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha na coleta." };
  }
}

/**
 * Explica, em uma frase, por que a passada não rendeu pauta nenhuma.
 *
 * O PORQUÊ VALE MAIS QUE O NÚMERO. "Nenhuma pauta nova" é a resposta mais
 * frequente do robô e também a mais ambígua: pode ser que a busca falhou, que
 * não saiu notícia nenhuma ou que saiu e foi recusada — e cada uma pede uma
 * atitude diferente de quem está olhando. Sem esta frase, a única saída era
 * abrir o log da Vercel.
 */
function listaUfs(ufs: string[]): string {
  return ufs.length ? ` (${ufs.join(", ")})` : "";
}

function porQueNadaVirouPauta(m: ResultadoPautas["motivos"]): string {
  if (m.examinadas === 0) {
    return "Nenhuma notícia nova nas fontes desde a última passada — as buscas rodaram e voltaram vazias.";
  }
  const recusadas: string[] = [];
  if (m.repetidas > 0)
    recusadas.push(
      `${m.repetidas} porque o blog já publicou essa mesma pauta nos últimos dias${listaUfs(m.repetidasUfs)}`,
    );
  if (m.fichaMagra > 0)
    recusadas.push(
      `${m.fichaMagra} porque a ficha do estado ainda não tem dois fatos conferidos por nós${listaUfs(m.fichaMagraUfs)} — preencha vagas, salário, banca ou data da prova em Estados e a próxima busca já abre a pauta`,
    );
  if (m.antigas > 0) recusadas.push(`${m.antigas} por serem mais velhas que três semanas`);
  if (m.travadas > 0) recusadas.push(`${m.travadas} por serem de estado travado no painel`);
  if (m.delicadas > 0)
    recusadas.push(`${m.delicadas} por falarem de fraude, suspensão ou liminar`);
  if (m.temporarias > 0) recusadas.push(`${m.temporarias} por serem seleção temporária`);
  if (m.limite > 0) recusadas.push(`${m.limite} pelo limite de uma pauta por estado na rodada`);

  if (recusadas.length === 0) {
    return `${m.examinadas} notícia(s) examinada(s), nenhuma sobre concurso de médico-legista.`;
  }
  return `${m.examinadas} notícia(s) examinada(s). Ficaram de fora: ${recusadas.join("; ")}.`;
}

/**
 * Roda a passada completa do robô agora, a pedido.
 *
 * É EXATAMENTE O QUE O CRON FAZ — lê as fontes sem cache, grava a hora da
 * checagem e abre pauta —, e existe porque até aqui a única forma de forçar
 * uma busca era pelo botão de um estado específico, dentro de Estados. Quem
 * está no Blog olhando uma fila parada não tem por que saber disso, nem por
 * que adivinhar em qual estado clicar.
 *
 * Diferente do botão de estado, este devolve o balanço da rodada inteira, com
 * o motivo de cada recusa.
 */
// Sem parâmetros de propósito: a passada é a mesma para todo mundo, não há
// campo nenhum no formulário. `useActionState` chama com (estado, FormData) e
// ignorar os dois aqui é o que diz isso em código.
export async function pesquisarAgoraAcao(): Promise<Resultado> {
  try {
    await exigirAdmin();

    const relatorio = await coletar({ semCache: true });

    await registrarColeta({
      em: relatorio.atualizadoEm,
      estadosComNovidade: relatorio.estados.filter((e) => e.nivel !== "sem").length,
      fonteIndisponivel: relatorio.fonteIndisponivel,
    });

    const pautas = await abrirPautas(relatorio);

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/monitor");
    revalidatePath("/admin");
    revalidatePath("/admin/posts");

    if (relatorio.fonteIndisponivel) {
      return {
        ok: false,
        mensagem:
          "Nenhuma fonte externa respondeu agora. Não é conclusão sobre os concursos — é a busca que não chegou. Tente de novo em alguns minutos.",
      };
    }

    if (pautas.abertas > 0) {
      return {
        ok: true,
        mensagem:
          `Busca refeita agora.${avisoPautas(pautas)} ` +
          "Recarregue a página para ver a fila.",
      };
    }

    return {
      ok: true,
      mensagem: `Busca refeita agora, nenhuma pauta nova. ${porQueNadaVirouPauta(pautas.motivos)}`,
    };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha na busca." };
  }
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

/**
 * Slug a partir do título, quando o campo vem vazio.
 *
 * O slug é a identidade pública do post, e trocar depois de publicado quebra
 * todo link que já saiu por aí. Por isso ele é gerado uma vez, na criação, e
 * daí em diante só muda se alguém digitar — o formulário não reescreve sozinho
 * a cada edição do título.
 */
function slugDoTitulo(titulo: string): string {
  const base = aSlug(titulo);
  return base || `post-${Date.now()}`;
}

export async function salvarPostAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const id = Number(dados.get("id") ?? 0) || null;
    const titulo = String(dados.get("titulo") ?? "").trim();
    if (!titulo) return { ok: false, mensagem: "O título é obrigatório." };

    const slug = aSlug(String(dados.get("slug") ?? "")) || slugDoTitulo(titulo);
    if (await slugOcupado(slug, id)) {
      return {
        ok: false,
        mensagem: `Já existe outro post com o endereço “${slug}”. Mude o campo Endereço.`,
      };
    }

    const status = String(dados.get("status") ?? "rascunho") as StatusPost;
    if (!["rascunho", "revisao", "publicado"].includes(status)) {
      return { ok: false, mensagem: "Status inválido." };
    }

    const categoria = String(dados.get("categoria") ?? "noticia");
    if (!categoriaPorSlug(categoria)) {
      return { ok: false, mensagem: "Categoria inválida." };
    }

    const uf = texto(dados, "uf");
    // O órgão acompanha o estado: são o mesmo certame visto de dois ângulos, e
    // deixar o painel escolher um sem o outro criaria post do Pará marcado como
    // Politec-PE. Quando a UF vem vazia, o post é nacional e não tem órgão.
    const orgao = uf ? (orgaoDaUf(uf)?.slug ?? null) : null;

    const gravado = await gravarPost({
      id,
      slug,
      titulo,
      resumo: String(dados.get("resumo") ?? "").trim(),
      corpo: String(dados.get("corpo") ?? ""),
      capaUrl: texto(dados, "capaUrl"),
      capaCredito: texto(dados, "capaCredito"),
      uf,
      orgao,
      categoria,
      origem: (texto(dados, "origem") ?? "manual") as OrigemPost,
      fonteNome: texto(dados, "fonteNome"),
      fonteUrl: texto(dados, "fonteUrl"),
      status,
      publicadoEm: texto(dados, "publicadoEm"),
    });

    if (!gravado) {
      return { ok: false, mensagem: "Banco não configurado — nada foi gravado." };
    }

    // O blog é force-dynamic, mas a revalidação continua valendo para o cache
    // de dados da Vercel na borda, que é quem responde primeiro.
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/admin/posts");

    if (!id) redirect(`/admin/posts/${gravado}`);

    return {
      ok: true,
      mensagem:
        status === "publicado"
          ? "Publicado. Já está no ar em /blog."
          : status === "revisao"
            ? "Salvo e marcado para revisão."
            : "Rascunho salvo.",
    };
  } catch (e) {
    // redirect() funciona lançando — deixar passar é o que faz a navegação
    // acontecer. Tratar como erro mostraria "falha ao salvar" depois de salvar.
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    if (typeof e === "object" && e && "digest" in e) throw e;
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao salvar." };
  }
}

/** Aprova e põe no ar — o botão da fila de revisão. */
export async function publicarPostAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();
    const id = Number(dados.get("id") ?? 0);
    const post = id ? await lerPorId(id) : null;
    if (!post) return { ok: false, mensagem: "Post não encontrado." };

    if (!post.titulo.trim() || !post.corpo.trim()) {
      return {
        ok: false,
        mensagem: "Falta título ou texto. Abra o post, complete e publique de lá.",
      };
    }

    await gravarPost({ ...post, status: "publicado", publicadoEm: post.publicadoEm });
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin/posts");
    return { ok: true, mensagem: `“${post.titulo}” está no ar.` };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao publicar." };
  }
}

/** Tira do ar sem apagar: volta para rascunho. */
export async function despublicarPostAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();
    const id = Number(dados.get("id") ?? 0);
    const post = id ? await lerPorId(id) : null;
    if (!post) return { ok: false, mensagem: "Post não encontrado." };

    await gravarPost({ ...post, status: "rascunho" });
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin/posts");
    return { ok: true, mensagem: "Saiu do ar e voltou para rascunho." };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao despublicar." };
  }
}

export async function apagarPostAcao(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = Number(dados.get("id") ?? 0);
  if (id) await apagarPost(id);
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  redirect("/admin/posts");
}

/**
 * Traz o blog antigo (Wix) para a fila de revisão.
 *
 * Fica numa ação própria, e não dentro da coleta: é operação de mudança, feita
 * uma vez e repetida só quando sai post novo lá. Pendurar isso no cron faria o
 * sistema buscar um feed de vinte itens de hora em hora para, na esmagadora
 * maioria das vezes, não fazer nada.
 */
export async function importarBlogAntigoAcao(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    // Endereço alternativo do feed, para o dia em que o Wix mudar o caminho.
    // Limitado ao domínio do Clube: esta função busca uma URL do lado do
    // servidor, e um campo livre aqui viraria uma forma de fazer o nosso
    // servidor alcançar o que só ele alcança.
    const pedido = String(dados.get("feed") ?? "").trim();
    let feed: string | undefined;
    if (pedido) {
      let host = "";
      try {
        host = new URL(pedido).hostname.toLowerCase();
      } catch {
        return { ok: false, mensagem: "Endereço de feed inválido." };
      }
      if (host !== "clubeforense.com.br" && host !== "www.clubeforense.com.br") {
        return { ok: false, mensagem: "O feed precisa ser do domínio clubeforense.com.br." };
      }
      feed = pedido;
    }

    const r = await importarBlogAntigo(feed);

    if (r.encontrados === 0) {
      return {
        ok: false,
        mensagem:
          "Não consegui ler o feed do blog antigo (clubeforense.com.br/blog-feed.xml). " +
          "Pode ser instabilidade do Wix — tente de novo em alguns minutos.",
      };
    }

    revalidatePath("/admin/posts");

    const comTexto = r.comTexto
      ? ` ${r.comTexto} ${r.comTexto === 1 ? "já veio" : "já vieram"} com o texto completo.`
      : "";

    if (r.importados === 0) {
      return {
        ok: true,
        mensagem: `Nada novo: os ${r.encontrados} posts do blog antigo já estão aqui.${comTexto}`,
      };
    }

    return {
      ok: true,
      mensagem:
        `${r.importados} de ${r.encontrados} posts importados para “Para revisar”` +
        `${r.jaExistiam ? ` (${r.jaExistiam} já estavam aqui)` : ""}.` +
        `${comTexto} Nos demais falta colar o texto, que o Wix não entrega de fora.`,
    };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha na importação." };
  }
}

/**
 * Publica tudo o que está em revisão e pronto.
 *
 * Existe porque a migração do blog antigo trouxe vinte de uma vez, e aprovar um
 * a um é onde a migração morre. O que o botão NÃO faz é tão importante quanto:
 * rascunho sem texto fica para trás, e a mensagem diz quantos.
 */
export async function publicarTodosAcao(
  // A assinatura é ditada pelo useActionState, que sempre entrega o estado
  // anterior; esta ação não tem o que fazer com ele, e tirar o parâmetro
  // quebraria o encaixe.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _anterior: Resultado | null,
): Promise<Resultado> {
  try {
    await exigirAdmin();

    const r = await publicarEmLote();

    revalidatePath("/blog");
    revalidatePath("/admin/posts");

    if (r.publicados === 0) {
      return {
        ok: false,
        mensagem:
          r.semTexto > 0
            ? `Nenhum post pronto para publicar. ${r.semTexto} ainda estão sem o texto completo — abra e cole o conteúdo antes.`
            : "Nenhum post em revisão para publicar.",
      };
    }

    const ficaram = r.semTexto
      ? ` ${r.semTexto} ${r.semTexto === 1 ? "ficou" : "ficaram"} para trás por falta de texto.`
      : "";

    return {
      ok: true,
      mensagem: `${r.publicados} ${r.publicados === 1 ? "post publicado" : "posts publicados"}.${ficaram}`,
    };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha ao publicar." };
  }
}
