"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { empresaPermitidaPorId, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar } from "@/lib/painel/db";
import { TEXTOS_PAINEL } from "@/lib/painel/textos";
import { numeroLegivel } from "@/lib/painel/whatsapp";
import {
  conectarCliente,
  desconectarCliente,
  enviarPeloCliente,
  estadoDoCliente,
  montarMensagem,
  numeroDoLead,
} from "@/lib/painel/whatsappCliente";
import { fmt } from "@/lib/i18n";
import type { Estado } from "./admin/acoes";

// WhatsApp do próprio cliente: conectar pelo QR, a mensagem automática para cada lead novo e o
// teste. O cliente e a equipe podem mexer, sempre conferindo no servidor o acesso à empresa.

const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });

async function contexto(f: FormData) {
  const u = await usuarioAtual();
  if (!u) redirect("/painel/entrar");
  const empresa = await empresaPermitidaPorId(u, Number(f.get("empresa")));
  if (!empresa) return null;
  return { u, empresa, t: TEXTOS_PAINEL[u.idioma].waCliente };
}

export async function conectarWhatsappCliente(_: Estado, f: FormData): Promise<Estado> {
  const r = await contexto(f);
  if (!r) return falha("Cliente não encontrado.");
  try {
    await conectarCliente(r.empresa.id);
    await registrar(r.u.id, r.empresa.id, "whatsapp-cliente.conectar");
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : r.t.foraDoAr);
  }
  revalidatePath("/painel", "layout");
  return sucesso("");
}

export async function desconectarWhatsappCliente(f: FormData) {
  const r = await contexto(f);
  if (!r) return;
  await desconectarCliente(r.empresa.id).catch(() => undefined);
  await consulta("update empresas set wa_cliente_numero = null where id = $1", [r.empresa.id]);
  await registrar(r.u.id, r.empresa.id, "whatsapp-cliente.desconectar");
  revalidatePath("/painel", "layout");
}

export async function salvarMensagemCliente(_: Estado, f: FormData): Promise<Estado> {
  const r = await contexto(f);
  if (!r) return falha("Cliente não encontrado.");
  const mensagem = String(f.get("mensagem") ?? "").trim().slice(0, 1000);
  const ativo = Boolean(f.get("ativo"));
  if (!mensagem) return falha(r.t.vazia);
  // Ligando agora: conta a partir deste momento (os leads antigos não recebem).
  await consulta(
    `update empresas set wa_cliente_mensagem = $2, wa_cliente_ativo = $3,
            wa_cliente_ativado_em = case when $3 and not wa_cliente_ativo then now() else wa_cliente_ativado_em end
      where id = $1`,
    [r.empresa.id, mensagem, ativo],
  );
  await registrar(r.u.id, r.empresa.id, ativo ? "whatsapp-cliente.mensagem-ligada" : "whatsapp-cliente.mensagem");
  revalidatePath("/painel", "layout");
  if (!ativo) return sucesso(r.t.salvo);
  const estado = await estadoDoCliente(r.empresa.id);
  return sucesso(estado.fase === "conectado" ? r.t.salvoAtivo : r.t.salvoSemConexao);
}

export async function testarMensagemCliente(_: Estado, f: FormData): Promise<Estado> {
  const r = await contexto(f);
  if (!r) return falha("Cliente não encontrado.");
  const numero = numeroDoLead(String(f.get("numero") ?? ""), r.empresa.pais);
  if (!numero) return falha(r.t.testeNumeroInvalido);
  const estado = await estadoDoCliente(r.empresa.id);
  if (estado.fase !== "conectado") return falha(r.t.testeSemConexao);
  const modelo = String(f.get("mensagem") ?? "").trim() || r.empresa.wa_cliente_mensagem || "";
  if (!modelo) return falha(r.t.vazia);
  try {
    await enviarPeloCliente(r.empresa.id, numero, montarMensagem(modelo, { nome: r.t.exemploNome }, r.empresa.nome));
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : String(erro));
  }
  await registrar(r.u.id, r.empresa.id, "whatsapp-cliente.teste");
  return sucesso(fmt(r.t.testeEnviado, { numero: numeroLegivel(numero.slice(1)) }));
}

// ---------- Ofertas em divulgação ----------

const lerOferta = (f: FormData) => ({
  nome: String(f.get("nome") ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
  mensagem: String(f.get("mensagem") ?? "").trim().slice(0, 1000),
});

export async function criarOferta(_: Estado, f: FormData): Promise<Estado> {
  const r = await contexto(f);
  if (!r) return falha("Cliente não encontrado.");
  const o = lerOferta(f);
  if (!o.nome) return falha(r.t.ofertaSemNome);
  if (!o.mensagem) return falha(r.t.vazia);
  const total = await consulta<{ n: number }>("select count(*)::int as n from ofertas where empresa_id = $1", [r.empresa.id]);
  if ((total[0]?.n ?? 0) >= 30) return falha(r.t.ofertaLimite);
  await consulta("insert into ofertas (empresa_id, nome, mensagem) values ($1, $2, $3)", [r.empresa.id, o.nome, o.mensagem]);
  await registrar(r.u.id, r.empresa.id, "oferta.criar", o.nome);
  revalidatePath("/painel", "layout");
  return sucesso(fmt(r.t.ofertaCriada, { nome: o.nome }));
}

export async function salvarOferta(_: Estado, f: FormData): Promise<Estado> {
  const r = await contexto(f);
  if (!r) return falha("Cliente não encontrado.");
  const o = lerOferta(f);
  if (!o.nome) return falha(r.t.ofertaSemNome);
  if (!o.mensagem) return falha(r.t.vazia);
  const feito = await consulta("update ofertas set nome = $3, mensagem = $4 where id = $1 and empresa_id = $2 returning id", [
    Number(f.get("oferta")),
    r.empresa.id,
    o.nome,
    o.mensagem,
  ]);
  if (!feito.length) return falha("Oferta não encontrada.");
  await registrar(r.u.id, r.empresa.id, "oferta.salvar", o.nome);
  revalidatePath("/painel", "layout");
  return sucesso(r.t.salvo);
}

export async function excluirOferta(f: FormData) {
  const r = await contexto(f);
  if (!r) return;
  const apagada = await consulta<{ nome: string }>("delete from ofertas where id = $1 and empresa_id = $2 returning nome", [Number(f.get("oferta")), r.empresa.id]);
  if (apagada.length) await registrar(r.u.id, r.empresa.id, "oferta.excluir", apagada[0].nome);
  revalidatePath("/painel", "layout");
}
