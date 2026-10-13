"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { empresaPermitidaPorId, ehEquipe, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar, umaLinha } from "@/lib/painel/db";
import { enderecoBase } from "@/lib/painel/links";
import { ativarTempoReal } from "@/lib/painel/meta";
import { desconectarPonte, enviarLead, enviarTeste, numeroLegivel, numerosDe, reconectarPonte } from "@/lib/painel/whatsapp";
import type { Estado } from "./admin/acoes";

// WhatsApp: números de cada cliente que recebem os leads, teste de envio e a conexão do número da T9.

const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });
const erroDe = (e: unknown) => (e instanceof Error ? e.message : String(e));

async function empresaDaEquipe(f: FormData) {
  const u = await usuarioAtual();
  if (!u || !ehEquipe(u)) redirect("/painel");
  const empresa = await empresaPermitidaPorId(u, Number(f.get("empresa")));
  return empresa ? { u, empresa } : null;
}

async function admin() {
  const u = await usuarioAtual();
  if (!u || u.perfil !== "admin") redirect("/painel");
  return u;
}

export async function salvarWhatsapp(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDaEquipe(f);
  if (!r) return falha("Cliente não encontrado.");
  const bruto = String(f.get("numeros") ?? "").slice(0, 500);
  const numeros = numerosDe(bruto);
  if (bruto.trim() && !numeros.length) return falha("Não reconheci nenhum número. Use DDD + número, por exemplo (83) 99999-9999.");

  // Ligando agora: os leads que já estão no painel não viram aviso; só os que chegarem daqui em diante.
  if (numeros.length && !numerosDe(r.empresa.whatsapp_leads).length) {
    await consulta("update leads set whatsapp_avisado_em = now() where empresa_id = $1 and whatsapp_avisado_em is null", [r.empresa.id]);
  }
  // Guardados com "+": na leitura, o número volta como internacional, com o código do país (sem o "+", 1 407… viraria brasileiro).
  await consulta("update empresas set whatsapp_leads = $2 where id = $1", [r.empresa.id, numeros.map((n) => `+${n}`).join(",") || null]);
  await registrar(r.u.id, r.empresa.id, numeros.length ? "whatsapp.leads" : "whatsapp.leads-desligar");
  revalidatePath("/painel", "layout");
  return sucesso(numeros.length ? `Pronto: cada lead novo vai para ${numeros.map(numeroLegivel).join(", ")}.` : "Avisos de lead no WhatsApp desligados.");
}

export async function testarWhatsapp(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDaEquipe(f);
  if (!r) return falha("Cliente não encontrado.");
  const { numeros, erros } = await enviarTeste(r.empresa);
  if (!numeros.length) return falha("Salve pelo menos um número antes de testar.");
  revalidatePath("/painel/admin/whatsapp");
  return erros.length ? falha(`Não enviei para ${erros.join("; ")}`) : sucesso("Mensagem de teste enviada.");
}

export async function reconectarWhatsapp() {
  await admin();
  await reconectarPonte().catch(() => undefined);
  revalidatePath("/painel/admin/whatsapp");
}

export async function desconectarWhatsapp() {
  const u = await admin();
  await desconectarPonte().catch(() => undefined);
  await registrar(u.id, null, "whatsapp.desconectar");
  revalidatePath("/painel/admin/whatsapp");
}

export async function ativarLeadsTempoReal(_: Estado): Promise<Estado> {
  await admin();
  try {
    const paginas = await ativarTempoReal(`${await enderecoBase()}/api/painel/meta-webhook`);
    revalidatePath("/painel/admin/whatsapp");
    const falhas = paginas.filter((p) => !p.ok);
    if (!paginas.length) return falha("Webhook ligado, mas o usuário do sistema não enxerga nenhuma Página. Atribua as Páginas dos clientes ao Painel T9.");
    if (falhas.length) {
      const permissao = falhas.some((p) => /pages_manage_metadata|permission|\(#(10|200)\)/i.test(p.erro ?? ""));
      return falha(
        `Não consegui ligar em: ${falhas.map((p) => `${p.nome} (${p.erro})`).join("; ")}.` +
          (permissao ? " Gere um token novo do Painel T9 incluindo a permissão pages_manage_metadata e atualize a META_ACCESS_TOKEN." : ""),
      );
    }
    return sucesso(`Leads em tempo real ligados em ${paginas.map((p) => p.nome).join(", ")}.`);
  } catch (e) {
    return falha(erroDe(e));
  }
}

/** Botão "Enviar manualmente" na aba Leads: manda aquele lead para o WhatsApp do cliente. */
export async function enviarLeadManual(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioAtual();
  if (!u || !ehEquipe(u)) return falha("Só a equipe da T9 pode enviar.");
  const leadId = Number(f.get("lead"));
  if (!Number.isInteger(leadId) || leadId <= 0) return falha("Lead inválido.");
  const dono = await umaLinha<{ empresa_id: number }>("select empresa_id from leads where id = $1", [leadId]);
  const empresa = dono ? await empresaPermitidaPorId(u, dono.empresa_id) : null;
  if (!empresa) return falha("Lead não encontrado.");
  if (!numerosDe(empresa.whatsapp_leads).length) return falha("Cadastre o WhatsApp do cliente na gestão dele.");
  try {
    const r = await enviarLead(empresa, leadId);
    await registrar(u.id, empresa.id, "whatsapp.lead-manual", String(leadId));
    revalidatePath(`/painel/${empresa.slug}/leads`);
    if (r.erros.length === r.numeros.length) return falha(r.erros.join("; "));
    return sucesso(r.erros.length ? `Enviado, com falha em: ${r.erros.join("; ")}` : `Enviado para ${r.numeros.map(numeroLegivel).join(", ")}.`);
  } catch (e) {
    return falha(erroDe(e));
  }
}
