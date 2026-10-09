"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { empresaPermitidaPorId, ehEquipe, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar } from "@/lib/painel/db";
import { metaConfigurado, sincronizarEmpresa } from "@/lib/painel/meta";
import type { Estado } from "./admin/acoes";

// Liga as vendas da Eduzz para um cliente: gera o endereço do webhook e guarda a chave secreta.

const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });
const novoToken = () => randomBytes(24).toString("base64url");

async function empresaDaEquipe(f: FormData) {
  const u = await usuarioAtual();
  if (!u || !ehEquipe(u)) redirect("/painel");
  const empresa = await empresaPermitidaPorId(u, Number(f.get("empresa")));
  return empresa ? { u, empresa } : null;
}

export async function salvarEduzz(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDaEquipe(f);
  if (!r) return falha("Cliente não encontrado.");
  const ativo = f.get("ativo") === "on";
  const segredo = String(f.get("segredo") ?? "").trim();
  const removerSegredo = f.get("remover_segredo") === "on";

  await consulta(
    `update empresas set vendas_fonte = $2, eduzz_token = coalesce(eduzz_token, $3),
       eduzz_segredo = case when $5::boolean then null when $4::text <> '' then $4 else eduzz_segredo end
     where id = $1`,
    [r.empresa.id, ativo ? "eduzz" : null, novoToken(), segredo.slice(0, 200), removerSegredo],
  );
  await registrar(r.u.id, r.empresa.id, ativo ? "eduzz.ativar" : "eduzz.desativar");

  // Refaz os números da Meta: com a Eduzz ligada, vendas e receita do pixel deixam de contar.
  if (r.empresa.meta_conta && metaConfigurado() && (ativo ? "eduzz" : null) !== r.empresa.vendas_fonte) {
    await sincronizarEmpresa({ ...r.empresa, vendas_fonte: ativo ? "eduzz" : null }, 90).catch(() => undefined);
  }
  revalidatePath("/painel", "layout");
  return sucesso(ativo ? "Vendas da Eduzz ligadas. Copie o endereço abaixo para o webhook da Eduzz." : "Vendas da Eduzz desligadas.");
}

export async function trocarTokenEduzz(f: FormData) {
  const r = await empresaDaEquipe(f);
  if (!r) return;
  await consulta("update empresas set eduzz_token = $2 where id = $1", [r.empresa.id, novoToken()]);
  await registrar(r.u.id, r.empresa.id, "eduzz.novo-endereco");
  revalidatePath("/painel", "layout");
}
