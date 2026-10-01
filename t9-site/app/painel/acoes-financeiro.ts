"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { empresaPermitidaPorId, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar, umaLinha } from "@/lib/painel/db";
import { lerData, lerNumero } from "@/lib/painel/csv";
import { hoje } from "@/lib/painel/dados";
import { somarMeses } from "@/lib/painel/financeiro";
import { MOEDAS } from "@/lib/painel/formato";
import type { Estado } from "./admin/acoes";

// Financeiro: só o administrador cria cobranças e dá baixa. Cliente e gestor só veem.

const txt = (f: FormData, campo: string, max = 300) => String(f.get(campo) ?? "").trim().slice(0, max);
const id = (f: FormData, campo: string) => {
  const n = Number(f.get(campo));
  return Number.isInteger(n) && n > 0 ? n : 0;
};
const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });
const atualizar = () => revalidatePath("/painel", "layout");

async function admin() {
  const u = await usuarioAtual();
  if (!u || u.perfil !== "admin") redirect("/painel");
  return u;
}

/** Cria a cobrança (ou várias, uma por mês) ou edita uma existente. */
export async function salvarCobranca(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const empresa = await empresaPermitidaPorId(u, id(f, "empresa"));
  if (!empresa) return falha("Escolha o cliente.");
  const descricao = txt(f, "descricao", 150);
  const valor = lerNumero(txt(f, "valor"));
  const vencimento = lerData(txt(f, "vencimento"));
  const moeda = (MOEDAS as readonly string[]).includes(txt(f, "moeda")) ? txt(f, "moeda") : "BRL";
  const link = txt(f, "link", 1000);
  if (!descricao) return falha("Informe a descrição (ex.: Mensalidade de outubro).");
  if (!(valor > 0)) return falha("Informe o valor.");
  if (!vencimento) return falha("Informe o vencimento.");
  if (link && !/^https:\/\/\S+\.\S+$/.test(link)) return falha("O link de pagamento precisa começar com https://");

  const cobranca = id(f, "cobranca");
  if (cobranca) {
    await consulta(
      "update cobrancas set descricao = $3, valor = $4, moeda = $5, vencimento = $6, link = $7 where id = $1 and empresa_id = $2",
      [cobranca, empresa.id, descricao, valor, moeda, vencimento, link || null],
    );
    await registrar(u.id, empresa.id, "cobranca.editar", `${descricao} ${valor} ${vencimento}`);
    atualizar();
    return sucesso("Cobrança atualizada.");
  }

  const repetir = Math.min(24, Math.max(1, Math.round(lerNumero(txt(f, "repetir")) || 1)));
  const vencimentos = Array.from({ length: repetir }, (_, i) => somarMeses(vencimento, i));
  await consulta(
    `insert into cobrancas (empresa_id, descricao, valor, moeda, vencimento, link)
     select $1, $2, $3, $4, v, $5 from unnest($6::date[]) as v`,
    [empresa.id, descricao, valor, moeda, link || null, vencimentos],
  );
  await registrar(u.id, empresa.id, "cobranca.criar", `${descricao} ${valor} ${moeda} × ${repetir} a partir de ${vencimento}`);
  atualizar();
  return sucesso(repetir > 1 ? `${repetir} cobranças criadas, uma por mês.` : "Cobrança criada.");
}

async function cobrancaDoAdmin(f: FormData) {
  const u = await admin();
  const c = await umaLinha<{ id: number; empresa_id: number; descricao: string }>("select id, empresa_id, descricao from cobrancas where id = $1", [
    id(f, "cobranca"),
  ]);
  if (!c || !(await empresaPermitidaPorId(u, c.empresa_id))) return null;
  return { u, c };
}

/** Dá baixa: marca como pago na data informada (padrão: hoje). */
export async function darBaixa(f: FormData) {
  const r = await cobrancaDoAdmin(f);
  if (!r) return;
  const data = lerData(txt(f, "data")) ?? hoje();
  await consulta("update cobrancas set pago_em = $2, baixa_por = $3 where id = $1", [r.c.id, data, r.u.id]);
  await registrar(r.u.id, r.c.empresa_id, "cobranca.baixa", `${r.c.descricao} pago em ${data}`);
  atualizar();
}

export async function desfazerBaixa(f: FormData) {
  const r = await cobrancaDoAdmin(f);
  if (!r) return;
  await consulta("update cobrancas set pago_em = null, baixa_por = null where id = $1", [r.c.id]);
  await registrar(r.u.id, r.c.empresa_id, "cobranca.desfazer-baixa", r.c.descricao);
  atualizar();
}

export async function excluirCobranca(f: FormData) {
  const r = await cobrancaDoAdmin(f);
  if (!r) return;
  await consulta("delete from cobrancas where id = $1", [r.c.id]);
  await registrar(r.u.id, r.c.empresa_id, "cobranca.excluir", r.c.descricao);
  atualizar();
}

/** Texto de "como pagar" do cliente (chave PIX, dados bancários...). */
export async function salvarInstrucoes(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const empresa = await empresaPermitidaPorId(u, id(f, "empresa"));
  if (!empresa) return falha("Cliente não encontrado.");
  await consulta("update empresas set pagamento_instrucoes = $2 where id = $1", [empresa.id, txt(f, "instrucoes", 1500) || null]);
  await registrar(u.id, empresa.id, "cobranca.instrucoes");
  atualizar();
  return sucesso("Instruções de pagamento salvas.");
}
