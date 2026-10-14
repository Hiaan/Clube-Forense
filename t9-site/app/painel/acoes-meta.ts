"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { empresaPermitidaPorId, ehEquipe, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar } from "@/lib/painel/db";
import { conectarPaginasPorToken, metaConfigurado, normalizarConta, removerPaginaConectada, sincronizarEmpresa } from "@/lib/painel/meta";
import type { Estado } from "./admin/acoes";

// Vincular a conta de anúncio da Meta a um cliente e sincronizar sob demanda.

const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });

async function empresaDaEquipe(f: FormData) {
  const u = await usuarioAtual();
  if (!u || !ehEquipe(u)) redirect("/painel");
  const empresa = await empresaPermitidaPorId(u, Number(f.get("empresa")));
  return empresa ? { u, empresa } : null;
}

export async function vincularContaMeta(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDaEquipe(f);
  if (!r) return falha("Cliente não encontrado.");
  const bruto = String(f.get("conta") ?? "").trim();

  if (!bruto) {
    await consulta("update empresas set meta_conta = null, meta_erro = null where id = $1", [r.empresa.id]);
    await registrar(r.u.id, r.empresa.id, "meta.desvincular");
    revalidatePath("/painel", "layout");
    return sucesso("Conta da Meta desvinculada. Os dados já importados continuam no painel.");
  }

  const conta = normalizarConta(bruto);
  if (!conta) return falha("ID inválido. Use o número da conta de anúncio (ex.: act_123456789 ou 123456789).");
  await consulta("update empresas set meta_conta = $2, meta_erro = null where id = $1", [r.empresa.id, conta]);
  await registrar(r.u.id, r.empresa.id, "meta.vincular", conta);
  if (!metaConfigurado()) {
    revalidatePath("/painel", "layout");
    return sucesso(`Conta ${conta} vinculada. A sincronização começa quando o token da Meta (META_ACCESS_TOKEN) for configurado.`);
  }

  // Primeira sincronização traz os últimos 90 dias.
  try {
    const res = await sincronizarEmpresa({ ...r.empresa, meta_conta: conta }, 90);
    revalidatePath("/painel", "layout");
    return sucesso(`Conta ${conta} vinculada. Importados ${res.linhas} dias × campanhas, ${res.anuncios} criativos e ${res.leadsFormulario} contatos de formulário (últimos 90 dias).`);
  } catch (erro) {
    revalidatePath("/painel", "layout");
    return falha(`Conta vinculada, mas a sincronização falhou: ${erro instanceof Error ? erro.message : erro}`);
  }
}

export async function sincronizarMetaAgora(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDaEquipe(f);
  if (!r) return falha("Cliente não encontrado.");
  if (!metaConfigurado()) return falha("O token da Meta (META_ACCESS_TOKEN) ainda não foi configurado na Vercel.");
  try {
    const res = await sincronizarEmpresa(r.empresa, 30);
    await registrar(r.u.id, r.empresa.id, "meta.sincronizar", `${res.linhas} linhas, ${res.anuncios} criativos, ${res.leadsFormulario} leads de formulário`);
    revalidatePath("/painel", "layout");
    return sucesso(`Atualizado (últimos 30 dias): ${res.linhas} dias × campanhas, ${res.anuncios} criativos e ${res.leadsFormulario} contatos de formulário.`);
  } catch (erro) {
    revalidatePath("/painel", "layout");
    return falha(erro instanceof Error ? erro.message : "Falha ao sincronizar.");
  }
}

async function soAdmin() {
  const u = await usuarioAtual();
  if (!u || u.perfil !== "admin") redirect("/painel");
  return u;
}

/** Conecta Páginas por um token de usuário (contorno quando a Página não pode ir para a BM da T9). */
export async function conectarPaginaPorToken(_: Estado, f: FormData): Promise<Estado> {
  const u = await soAdmin();
  const token = String(f.get("token") ?? "").trim();
  if (token.length < 50) return falha("Cole o token inteiro gerado no Explorador da Graph API.");
  try {
    const r = await conectarPaginasPorToken(token);
    await registrar(u.id, null, "meta.pagina-token", r.conectadas.map((p) => p.nome).join(", "));
    revalidatePath("/painel/admin/whatsapp");
    if (!r.conectadas.length) return falha(`O perfil ${r.pessoa} não tem nenhuma Página com acesso a leads nesse token. Marque a Página na hora de gerar.`);
    return sucesso(
      `Conectado pelo perfil ${r.pessoa}: ${r.conectadas.map((p) => p.nome).join(", ")}.` +
        (r.semLeads.length ? ` Sem acesso a leads: ${r.semLeads.join(", ")}.` : ""),
    );
  } catch (e) {
    return falha(e instanceof Error ? e.message : String(e));
  }
}

export async function removerPaginaPorToken(f: FormData) {
  const u = await soAdmin();
  const id = String(f.get("pagina") ?? "");
  await removerPaginaConectada(id);
  await registrar(u.id, null, "meta.pagina-token-remover", id);
  revalidatePath("/painel/admin/whatsapp");
}
