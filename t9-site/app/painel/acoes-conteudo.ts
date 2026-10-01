"use server";

import { del, put } from "@vercel/blob";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE_MODO_CLIENTE, empresaPermitidaPorId, ehEquipe, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar, umaLinha } from "@/lib/painel/db";
import { lerData, lerNumero } from "@/lib/painel/csv";
import { semearDemo } from "@/lib/painel/demo";
import { FORMATOS_CRIATIVO, STATUS_CRIATIVO, TEXTOS_PAINEL, type FormatoCriativo, type StatusCriativo } from "@/lib/painel/textos";
import type { Estado } from "./admin/acoes";

// Criativos, arquivos, reuniões e relatórios. Arquivos podem ser enviados pelo
// cliente; o resto só a equipe da T9 altera. Tudo conferido no servidor.

const txt = (f: FormData, campo: string, max = 300) => String(f.get(campo) ?? "").trim().slice(0, max);
const id = (f: FormData, campo: string) => {
  const n = Number(f.get(campo));
  return Number.isInteger(n) && n > 0 ? n : 0;
};
const numOuNulo = (f: FormData, campo: string) => (txt(f, campo) ? lerNumero(txt(f, campo)) : null);
const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });
const linkValido = (url: string) => /^https:\/\/[^\s]+\.[^\s]+$/.test(url);

async function contexto(f: FormData, exigirEquipe: boolean) {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/painel/entrar");
  if (exigirEquipe && !ehEquipe(usuario)) throw new Error("Só a equipe da T9 pode fazer isso.");
  const empresa = await empresaPermitidaPorId(usuario, id(f, "empresa"));
  if (!empresa) throw new Error("Sem acesso a esta empresa.");
  return { usuario, empresa };
}

const atualizar = () => revalidatePath("/painel", "layout");

// ---------- Modo "ver como cliente" ----------

export async function alternarModoCliente(f: FormData) {
  const usuario = await usuarioAtual();
  if (!usuario || !ehEquipe(usuario)) redirect("/painel");
  const loja = await cookies();
  if (loja.get(COOKIE_MODO_CLIENTE)?.value === "1") loja.delete(COOKIE_MODO_CLIENTE);
  else loja.set(COOKIE_MODO_CLIENTE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  const voltar = txt(f, "voltar");
  redirect(voltar.startsWith("/painel/") && !voltar.startsWith("//") ? voltar : "/painel");
}

// ---------- Arquivos (links do Drive) ----------

export async function adicionarArquivo(_: Estado, f: FormData): Promise<Estado> {
  try {
    const { usuario, empresa } = await contexto(f, false);
    const t = TEXTOS_PAINEL[usuario.idioma].arquivos;
    const titulo = txt(f, "titulo", 150);
    const url = txt(f, "url", 1000);
    if (!titulo) return falha(t.nomeObrigatorio);
    if (!linkValido(url)) return falha(t.linkInvalido);
    await consulta("insert into arquivos (empresa_id, usuario_id, titulo, url, nota) values ($1, $2, $3, $4, $5)", [
      empresa.id,
      usuario.id,
      titulo,
      url,
      txt(f, "nota", 500) || null,
    ]);
    await registrar(usuario.id, empresa.id, "arquivo.adicionar", titulo);
    atualizar();
    return sucesso(t.sucesso);
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : "Erro");
  }
}

export async function removerArquivo(f: FormData) {
  const usuario = await usuarioAtual();
  if (!usuario) return;
  const arquivo = await umaLinha<{ empresa_id: number; usuario_id: number | null; titulo: string }>(
    "select empresa_id, usuario_id, titulo from arquivos where id = $1",
    [id(f, "arquivo")],
  );
  if (!arquivo || !(await empresaPermitidaPorId(usuario, arquivo.empresa_id))) return;
  // O cliente remove só o que ele mesmo enviou; a equipe remove qualquer um.
  if (!ehEquipe(usuario) && arquivo.usuario_id !== usuario.id) return;
  await consulta("delete from arquivos where id = $1", [id(f, "arquivo")]);
  await registrar(usuario.id, arquivo.empresa_id, "arquivo.remover", arquivo.titulo);
  atualizar();
}

// ---------- Criativos ----------

const TIPOS_IMAGEM = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function salvarCriativo(_: Estado, f: FormData): Promise<Estado> {
  try {
    const { usuario, empresa } = await contexto(f, true);
    const titulo = txt(f, "titulo", 150);
    if (!titulo) return falha("Dê um nome ao criativo.");
    const status = (STATUS_CRIATIVO as readonly string[]).includes(txt(f, "status")) ? (txt(f, "status") as StatusCriativo) : "teste";
    const formato = (FORMATOS_CRIATIVO as readonly string[]).includes(txt(f, "formato")) ? (txt(f, "formato") as FormatoCriativo) : "imagem";
    const link = txt(f, "link", 1000);
    if (link && !linkValido(link)) return falha("O link precisa começar com https://");

    let imagem: string | null = null;
    const arquivo = f.get("imagem");
    if (arquivo instanceof File && arquivo.size > 0) {
      if (!TIPOS_IMAGEM.has(arquivo.type)) return falha("A imagem precisa ser JPG, PNG, WEBP ou GIF.");
      if (arquivo.size > 4 * 1024 * 1024) return falha("Imagem grande demais (máximo 4 MB). Para vídeos, use o link.");
      const nome = arquivo.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
      const salvo = await put(`criativos/${empresa.id}/${nome}`, arquivo, { access: "private", addRandomSuffix: true, contentType: arquivo.type });
      imagem = salvo.pathname;
    }

    await consulta(
      `insert into criativos (empresa_id, titulo, status, formato, plataforma, link, imagem, gasto, resultados, ctr, nota, inicio)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        empresa.id,
        titulo,
        status,
        formato,
        txt(f, "plataforma", 40) || null,
        link || null,
        imagem,
        numOuNulo(f, "gasto"),
        txt(f, "resultados") ? Math.round(lerNumero(txt(f, "resultados"))) : null,
        numOuNulo(f, "ctr"),
        txt(f, "nota", 1000) || null,
        lerData(txt(f, "inicio")),
      ],
    );
    await registrar(usuario.id, empresa.id, "criativo.adicionar", titulo);
    atualizar();
    return sucesso("Criativo adicionado.");
  } catch (erro) {
    console.error("[painel] criativo", erro);
    return falha(erro instanceof Error ? erro.message : "Não foi possível salvar.");
  }
}

async function criativoDaEquipe(f: FormData) {
  const usuario = await usuarioAtual();
  if (!usuario || !ehEquipe(usuario)) return null;
  const criativo = await umaLinha<{ id: number; empresa_id: number; imagem: string | null; titulo: string }>(
    "select id, empresa_id, imagem, titulo from criativos where id = $1",
    [id(f, "criativo")],
  );
  if (!criativo || !(await empresaPermitidaPorId(usuario, criativo.empresa_id))) return null;
  return { usuario, criativo };
}

export async function mudarStatusCriativo(f: FormData) {
  const c = await criativoDaEquipe(f);
  const status = txt(f, "status");
  if (!c || !(STATUS_CRIATIVO as readonly string[]).includes(status)) return;
  await consulta("update criativos set status = $2, atualizado_em = now() where id = $1", [c.criativo.id, status]);
  await registrar(c.usuario.id, c.criativo.empresa_id, "criativo.status", `${c.criativo.titulo} → ${status}`);
  atualizar();
}

export async function salvarNotaCriativo(f: FormData) {
  const c = await criativoDaEquipe(f);
  if (!c) return;
  await consulta("update criativos set nota = $2, gasto = $3, resultados = $4, ctr = $5, atualizado_em = now() where id = $1", [
    c.criativo.id,
    txt(f, "nota", 1000) || null,
    numOuNulo(f, "gasto"),
    txt(f, "resultados") ? Math.round(lerNumero(txt(f, "resultados"))) : null,
    numOuNulo(f, "ctr"),
  ]);
  atualizar();
}

export async function excluirCriativo(f: FormData) {
  const c = await criativoDaEquipe(f);
  if (!c) return;
  await consulta("delete from criativos where id = $1", [c.criativo.id]);
  if (c.criativo.imagem?.startsWith("criativos/")) await del(c.criativo.imagem).catch(() => undefined);
  await registrar(c.usuario.id, c.criativo.empresa_id, "criativo.excluir", c.criativo.titulo);
  atualizar();
}

// ---------- Reuniões ----------

/** "2026-10-08T15:00" digitado no horário de Brasília → instante UTC. */
function horarioDeBrasilia(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) return null;
  const d = new Date(`${valor}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function salvarReuniao(_: Estado, f: FormData): Promise<Estado> {
  try {
    const { usuario, empresa } = await contexto(f, true);
    const quando = horarioDeBrasilia(txt(f, "quando"));
    const titulo = txt(f, "titulo", 150);
    if (!quando) return falha("Informe a data e o horário.");
    if (!titulo) return falha("Dê um título à reunião.");
    const link = txt(f, "link", 500);
    const gravacao = txt(f, "gravacao", 500);
    if ((link && !linkValido(link)) || (gravacao && !linkValido(gravacao))) return falha("Os links precisam começar com https://");
    const reuniao = id(f, "reuniao");
    const valores = [quando, titulo, link || null, gravacao || null, txt(f, "resumo", 4000) || null, txt(f, "proximos_passos", 4000) || null];
    if (reuniao) {
      await consulta(
        "update reunioes set quando = $3, titulo = $4, link = $5, gravacao = $6, resumo = $7, proximos_passos = $8 where id = $1 and empresa_id = $2",
        [reuniao, empresa.id, ...valores],
      );
    } else {
      await consulta(
        "insert into reunioes (empresa_id, quando, titulo, link, gravacao, resumo, proximos_passos) values ($1, $2, $3, $4, $5, $6, $7)",
        [empresa.id, ...valores],
      );
    }
    await registrar(usuario.id, empresa.id, reuniao ? "reuniao.editar" : "reuniao.adicionar", titulo);
    atualizar();
    return sucesso(reuniao ? "Reunião atualizada." : "Reunião adicionada.");
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : "Não foi possível salvar.");
  }
}

export async function excluirReuniao(f: FormData) {
  const usuario = await usuarioAtual();
  if (!usuario || !ehEquipe(usuario)) return;
  const r = await umaLinha<{ empresa_id: number; titulo: string }>("select empresa_id, titulo from reunioes where id = $1", [id(f, "reuniao")]);
  if (!r || !(await empresaPermitidaPorId(usuario, r.empresa_id))) return;
  await consulta("delete from reunioes where id = $1", [id(f, "reuniao")]);
  await registrar(usuario.id, r.empresa_id, "reuniao.excluir", r.titulo);
  atualizar();
}

// ---------- Relatório mensal ----------

export async function salvarRelatorio(_: Estado, f: FormData): Promise<Estado> {
  try {
    const { usuario, empresa } = await contexto(f, true);
    const mes = txt(f, "mes", 7);
    if (!/^\d{4}-\d{2}$/.test(mes)) return falha("Mês inválido.");
    const publicado = f.get("publicado") === "on";
    await consulta(
      `insert into relatorios (empresa_id, mes, resumo, destaques, proximos_passos, publicado) values ($1, $2, $3, $4, $5, $6)
       on conflict (empresa_id, mes) do update set resumo = excluded.resumo, destaques = excluded.destaques,
         proximos_passos = excluded.proximos_passos, publicado = excluded.publicado, atualizado_em = now()`,
      [empresa.id, mes, txt(f, "resumo", 6000) || null, txt(f, "destaques", 4000) || null, txt(f, "proximos_passos", 4000) || null, publicado],
    );
    await registrar(usuario.id, empresa.id, "relatorio.salvar", `${mes}${publicado ? " (publicado)" : ""}`);
    atualizar();
    return sucesso(publicado ? "Análise publicada para o cliente." : "Rascunho salvo (o cliente ainda não vê).");
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : "Não foi possível salvar.");
  }
}

// ---------- Cliente de demonstração ----------

export async function recriarDemo() {
  const usuario = await usuarioAtual();
  if (!usuario || usuario.perfil !== "admin") redirect("/painel");
  const slug = await semearDemo();
  await registrar(usuario.id, null, "demo.recriar", slug);
  atualizar();
  redirect(`/painel/${slug}`);
}
