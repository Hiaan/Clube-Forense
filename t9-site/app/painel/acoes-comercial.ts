"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { put } from "@vercel/blob";
import { ehEquipe, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar, transacao, umaLinha } from "@/lib/painel/db";
import { emailComBotao, enviarEmail } from "@/lib/painel/email";
import { enderecoBase } from "@/lib/painel/links";
import { lerNumero } from "@/lib/painel/csv";
import { MOEDAS } from "@/lib/painel/formato";
import {
  SERVICOS,
  dadosDaContratada,
  novoToken,
  propostaPorToken,
  contratoPorToken,
  salvarContratada,
  textoDoContrato,
  type DadosComerciais,
} from "@/lib/painel/comercial";
import type { Estado } from "./admin/acoes";

// Área comercial: propostas e contratos (só o admin: têm valores) e o mural de pesquisa (equipe).
// O aceite da proposta e a assinatura do contrato vêm de fora, pelo link público (token).

const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string, extra: Partial<Estado> = {}): Estado => ({ ok: true, mensagem, vez: Date.now(), ...extra });
const txt = (f: FormData, campo: string, max = 300) => String(f.get(campo) ?? "").trim().slice(0, max) || null;
const inteiro = (f: FormData, campo: string, padrao: number, min: number, max: number) => {
  const n = Math.round(Number(String(f.get(campo) ?? "").replace(",", ".")));
  return Number.isFinite(n) && n >= min && n <= max ? n : padrao;
};

async function admin() {
  const u = await usuarioAtual();
  if (!u || u.perfil !== "admin") redirect("/painel");
  return u;
}

async function equipe() {
  const u = await usuarioAtual();
  if (!u || !ehEquipe(u)) redirect("/painel");
  return u;
}

/** Os campos que proposta e contrato têm em comum. Devolve o erro em texto, se houver. */
function lerDados(f: FormData): DadosComerciais | string {
  const cliente_nome = txt(f, "cliente_nome", 160);
  if (!cliente_nome) return "Informe o nome do cliente.";
  const valor = lerNumero(String(f.get("valor_mensal") ?? ""));
  if (!Number.isFinite(valor) || valor <= 0) return "Informe o valor mensal do serviço.";
  const servicos = f.getAll("servicos").map(String).filter((s) => SERVICOS.some((x) => x.id === s));
  if (!servicos.length) return "Marque pelo menos um serviço.";
  const implantacao = txt(f, "implantacao") ? lerNumero(String(f.get("implantacao"))) : null;
  const inicio = txt(f, "inicio", 10);
  return {
    cliente_nome,
    cliente_documento: txt(f, "cliente_documento", 30),
    cliente_responsavel: txt(f, "cliente_responsavel", 160),
    cliente_email: txt(f, "cliente_email", 160)?.toLowerCase() ?? null,
    cliente_telefone: txt(f, "cliente_telefone", 40),
    cliente_endereco: txt(f, "cliente_endereco", 300),
    servicos,
    valor_mensal: Math.round(valor * 100) / 100,
    moeda: (MOEDAS as readonly string[]).includes(String(f.get("moeda"))) ? String(f.get("moeda")) : "BRL",
    implantacao: implantacao && implantacao > 0 ? Math.round(implantacao * 100) / 100 : null,
    prazo_minimo: inteiro(f, "prazo_minimo", 6, 1, 60),
    multa_percentual: inteiro(f, "multa_percentual", 30, 0, 100),
    vencimento_dia: inteiro(f, "vencimento_dia", 10, 1, 28),
    inicio: inicio && /^\d{4}-\d{2}-\d{2}$/.test(inicio) ? inicio : null,
    observacoes: txt(f, "observacoes", 2000),
  };
}

const COLUNAS = [
  "cliente_nome",
  "cliente_documento",
  "cliente_responsavel",
  "cliente_email",
  "cliente_telefone",
  "cliente_endereco",
  "servicos",
  "valor_mensal",
  "moeda",
  "implantacao",
  "prazo_minimo",
  "multa_percentual",
  "vencimento_dia",
  "inicio",
  "observacoes",
] as const;
const valores = (d: DadosComerciais) => COLUNAS.map((c) => d[c]);

const ipHash = async () => {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "sem-ip";
  return createHash("sha256").update(`t9-aceite:${ip}`).digest("hex").slice(0, 24);
};

/** Aviso por e-mail para os administradores (aceite de proposta, contrato assinado). */
async function avisarAdmins(assunto: string, texto: string, caminho: string) {
  const admins = await consulta<{ email: string }>("select email from usuarios where perfil = 'admin'");
  const link = `${await enderecoBase()}${caminho}`;
  for (const a of admins) {
    await enviarEmail({
      para: a.email,
      assunto,
      texto: `${texto}\n\n${link}`,
      html: emailComBotao({ titulo: assunto, texto, botao: "Abrir no painel", link, rodape: "Aviso automático da área comercial do painel T9." }),
    }).catch((e) => console.error("[comercial] e-mail", e));
  }
}

// ---------- Propostas ----------

export async function criarProposta(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const d = lerDados(f);
  if (typeof d === "string") return falha(d);
  const nova = await umaLinha<{ id: number }>(
    `insert into propostas (token, ${COLUNAS.join(", ")}, titulo, objetivo, validade_dias)
     values ($1, ${COLUNAS.map((_, i) => `$${i + 2}`).join(", ")}, $${COLUNAS.length + 2}, $${COLUNAS.length + 3}, $${COLUNAS.length + 4}) returning id`,
    [novoToken(), ...valores(d), txt(f, "titulo", 160), txt(f, "objetivo", 1500), inteiro(f, "validade_dias", 15, 1, 90)],
  );
  await registrar(u.id, null, "proposta.criar", d.cliente_nome);
  redirect(`/painel/admin/propostas/${nova!.id}`);
}

export async function salvarProposta(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const id = Number(f.get("id"));
  const d = lerDados(f);
  if (typeof d === "string") return falha(d);
  await consulta(
    `update propostas set ${COLUNAS.map((c, i) => `${c} = $${i + 2}`).join(", ")},
       titulo = $${COLUNAS.length + 2}, objetivo = $${COLUNAS.length + 3}, validade_dias = $${COLUNAS.length + 4}
     where id = $1`,
    [id, ...valores(d), txt(f, "titulo", 160), txt(f, "objetivo", 1500), inteiro(f, "validade_dias", 15, 1, 90)],
  );
  await registrar(u.id, null, "proposta.salvar", d.cliente_nome);
  revalidatePath("/painel/admin/propostas", "layout");
  return sucesso("Proposta salva.");
}

export async function mudarStatusProposta(f: FormData) {
  const u = await admin();
  const status = String(f.get("status"));
  if (!["rascunho", "enviada", "recusada"].includes(status)) return;
  await consulta("update propostas set status = $2 where id = $1 and status <> 'aceita'", [Number(f.get("id")), status]);
  await registrar(u.id, null, "proposta.status", `${f.get("id")} → ${status}`);
  revalidatePath("/painel/admin/propostas", "layout");
}

export async function excluirProposta(f: FormData) {
  const u = await admin();
  await consulta("delete from propostas where id = $1", [Number(f.get("id"))]);
  await registrar(u.id, null, "proposta.excluir", String(f.get("id")));
  redirect("/painel/admin/propostas");
}

/** Cria o contrato com os dados da proposta (uma vez só por proposta). Devolve o id. */
async function contratoDaProposta(propostaId: number) {
  const t9 = await dadosDaContratada();
  return transacao(async (q) => {
    const [p] = await q<DadosComerciais & { contrato_id: number | null }>("select * from propostas where id = $1 for update", [propostaId]);
    if (!p) return null;
    if (p.contrato_id) return p.contrato_id;
    const [c] = await q<{ id: number }>(
      `insert into contratos (token, ${COLUNAS.join(", ")}, texto, proposta_id)
       values ($1, ${COLUNAS.map((_, i) => `$${i + 2}`).join(", ")}, $${COLUNAS.length + 2}, $${COLUNAS.length + 3}) returning id`,
      [novoToken(), ...valores(p), textoDoContrato(p, t9), propostaId],
    );
    await q("update propostas set contrato_id = $2 where id = $1", [propostaId, c.id]);
    return c.id;
  });
}

export async function gerarContratoDaProposta(f: FormData) {
  const u = await admin();
  const id = await contratoDaProposta(Number(f.get("id")));
  if (!id) return;
  await registrar(u.id, null, "contrato.da-proposta", String(f.get("id")));
  redirect(`/painel/admin/contratos/${id}`);
}

/** O cliente aceita a proposta pelo link. O contrato já sai pronto para a T9 revisar e enviar. */
export async function aceitarProposta(_: Estado, f: FormData): Promise<Estado> {
  const p = await propostaPorToken(String(f.get("token") ?? ""));
  if (!p) return falha("Proposta não encontrada.");
  if (p.status === "aceita") return sucesso("Esta proposta já foi aceita. Obrigado!");
  const nome = txt(f, "nome", 160);
  if (!nome || nome.length < 3) return falha("Digite o seu nome completo para aceitar.");
  if (!f.get("concordo")) return falha("Marque a confirmação para aceitar a proposta.");
  await consulta("update propostas set status = 'aceita', aceite_nome = $2, aceite_em = now(), aceite_ip = $3 where id = $1", [p.id, nome, await ipHash()]);
  await contratoDaProposta(p.id).catch((e) => console.error("[comercial] contrato da proposta", e));
  await avisarAdmins(`Proposta aceita: ${p.cliente_nome}`, `${nome} aceitou a proposta para ${p.cliente_nome}. O contrato já foi gerado para você revisar e enviar.`, `/painel/admin/propostas/${p.id}`);
  revalidatePath(`/painel/proposta/${p.token}`);
  return sucesso("Proposta aceita! Em breve você recebe o contrato para assinar.");
}

// ---------- Contratos ----------

export async function criarContrato(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const d = lerDados(f);
  if (typeof d === "string") return falha(d);
  const novo = await umaLinha<{ id: number }>(
    `insert into contratos (token, ${COLUNAS.join(", ")}, texto)
     values ($1, ${COLUNAS.map((_, i) => `$${i + 2}`).join(", ")}, $${COLUNAS.length + 2}) returning id`,
    [novoToken(), ...valores(d), textoDoContrato(d, await dadosDaContratada())],
  );
  await registrar(u.id, null, "contrato.criar", d.cliente_nome);
  redirect(`/painel/admin/contratos/${novo!.id}`);
}

export async function salvarTextoContrato(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const texto = String(f.get("texto") ?? "").trim().slice(0, 60_000);
  if (texto.length < 200) return falha("O texto do contrato ficou curto demais.");
  const feito = await consulta("update contratos set texto = $2 where id = $1 and status <> 'assinado' returning id", [Number(f.get("id")), texto]);
  if (!feito.length) return falha("Contrato assinado não pode ser alterado.");
  await registrar(u.id, null, "contrato.texto", String(f.get("id")));
  revalidatePath("/painel/admin/contratos", "layout");
  return sucesso("Texto do contrato salvo.");
}

/** Refaz o texto a partir dos dados (depois de corrigir valor, prazo, dados da T9...). Perde edições manuais. */
export async function refazerTextoContrato(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const id = Number(f.get("id"));
  const d = lerDados(f);
  if (typeof d === "string") return falha(d);
  const feito = await consulta(
    `update contratos set ${COLUNAS.map((c, i) => `${c} = $${i + 2}`).join(", ")}, texto = $${COLUNAS.length + 2}
      where id = $1 and status <> 'assinado' returning id`,
    [id, ...valores(d), textoDoContrato(d, await dadosDaContratada())],
  );
  if (!feito.length) return falha("Contrato assinado não pode ser alterado.");
  await registrar(u.id, null, "contrato.refazer", String(id));
  revalidatePath("/painel/admin/contratos", "layout");
  return sucesso("Dados salvos e texto do contrato refeito.");
}

export async function mudarStatusContrato(f: FormData) {
  const u = await admin();
  const status = String(f.get("status"));
  if (!["rascunho", "enviado", "cancelado"].includes(status)) return;
  await consulta("update contratos set status = $2 where id = $1 and status <> 'assinado'", [Number(f.get("id")), status]);
  await registrar(u.id, null, "contrato.status", `${f.get("id")} → ${status}`);
  revalidatePath("/painel/admin/contratos", "layout");
}

export async function excluirContrato(f: FormData) {
  const u = await admin();
  await consulta("delete from contratos where id = $1 and status <> 'assinado'", [Number(f.get("id"))]);
  await registrar(u.id, null, "contrato.excluir", String(f.get("id")));
  redirect("/painel/admin/contratos");
}

/** Aceite eletrônico do contrato pelo link: nome, CPF/CNPJ, data e hora e o endereço de origem (com hash). */
export async function assinarContrato(_: Estado, f: FormData): Promise<Estado> {
  const c = await contratoPorToken(String(f.get("token") ?? ""));
  if (!c) return falha("Contrato não encontrado.");
  if (c.status === "assinado") return sucesso("Este contrato já foi assinado. Obrigado!");
  if (c.status === "cancelado") return falha("Este contrato foi cancelado. Fale com a T9.");
  const nome = txt(f, "nome", 160);
  const documento = txt(f, "documento", 30);
  if (!nome || nome.length < 3) return falha("Digite o seu nome completo.");
  if (!documento || documento.replace(/\D/g, "").length < 11) return falha("Digite o seu CPF (ou o CNPJ da empresa).");
  if (!f.get("concordo")) return falha("Marque a confirmação de que leu e concorda com o contrato.");
  await consulta(
    "update contratos set status = 'assinado', aceite_nome = $2, aceite_documento = $3, aceite_em = now(), aceite_ip = $4 where id = $1 and status <> 'assinado'",
    [c.id, nome, documento, await ipHash()],
  );
  await avisarAdmins(`Contrato assinado: ${c.cliente_nome}`, `${nome} (${documento}) assinou eletronicamente o contrato de ${c.cliente_nome}.`, `/painel/admin/contratos/${c.id}`);
  revalidatePath(`/painel/contrato/${c.token}`);
  return sucesso("Contrato assinado. Obrigado! Você pode salvar uma cópia em PDF nesta página.");
}

export async function salvarDadosContratada(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  await salvarContratada({
    razao_social: txt(f, "razao_social", 160) ?? "T9 ADS Company",
    documento: txt(f, "documento", 30) ?? "",
    endereco: txt(f, "endereco", 300) ?? "",
    representante: txt(f, "representante", 160) ?? "",
    foro: txt(f, "foro", 80) ?? "",
  });
  await registrar(u.id, null, "comercial.contratada");
  revalidatePath("/painel/admin/contratos", "layout");
  return sucesso("Dados da T9 salvos. Valem para os próximos contratos (ou use \"Refazer o texto\" nos que já existem).");
}

// ---------- Pesquisa de mercado ----------

const TIPOS_IMAGEM = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function salvarReferencia(_: Estado, f: FormData): Promise<Estado> {
  const u = await equipe();
  const titulo = txt(f, "titulo", 160);
  if (!titulo) return falha("Dê um título para a referência.");
  const link = txt(f, "link", 1000);
  if (link && !/^https:\/\//i.test(link)) return falha("O link precisa começar com https://");
  let imagem: string | null = null;
  const arquivo = f.get("imagem");
  if (arquivo instanceof File && arquivo.size > 0) {
    if (!TIPOS_IMAGEM.has(arquivo.type)) return falha("A imagem precisa ser JPG, PNG, WEBP ou GIF.");
    if (arquivo.size > 4 * 1024 * 1024) return falha("Imagem grande demais (máximo 4 MB).");
    const nome = arquivo.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
    imagem = (await put(`pesquisa/${nome}`, arquivo, { access: "private", addRandomSuffix: true, contentType: arquivo.type })).pathname;
  }
  if (!link && !imagem && !txt(f, "observacao")) return falha("Cole o link, envie um print ou escreva uma observação.");
  await consulta("insert into referencias (titulo, link, imagem, nicho, anunciante, observacao, usuario_id) values ($1, $2, $3, $4, $5, $6, $7)", [
    titulo,
    link,
    imagem,
    txt(f, "nicho", 80),
    txt(f, "anunciante", 120),
    txt(f, "observacao", 2000),
    u.id,
  ]);
  await registrar(u.id, null, "pesquisa.referencia", titulo);
  revalidatePath("/painel/admin/pesquisa");
  return sucesso("Referência guardada.");
}

export async function excluirReferencia(f: FormData) {
  const u = await equipe();
  await consulta("delete from referencias where id = $1", [Number(f.get("id"))]);
  await registrar(u.id, null, "pesquisa.excluir", String(f.get("id")));
  revalidatePath("/painel/admin/pesquisa");
}
