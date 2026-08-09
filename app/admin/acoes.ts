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
import { lerPlanilha } from "../monitor/lib/planilha";
import type { Nivel } from "../monitor/lib/tipos";

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
