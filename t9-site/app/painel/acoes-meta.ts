"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { empresaPermitidaPorId, ehEquipe, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar } from "@/lib/painel/db";
import { metaConfigurado, normalizarConta, sincronizarEmpresa } from "@/lib/painel/meta";
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
