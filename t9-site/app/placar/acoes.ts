"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { conferirSenha, hashSenha, problemaNaSenha } from "@/lib/painel/senha";
import { emailComBotao, enviarEmail } from "@/lib/painel/email";
import { numeroLegivel, numerosDe } from "@/lib/painel/whatsapp";
import { FREQUENCIAS, FUSOS, METRICAS, type Frequencia } from "@/lib/painel/relatorioWhatsapp";
import { q, uma, type Cliente } from "@/lib/placar/banco";
import {
  DIAS_TESTE,
  criarToken,
  encerrarSessao,
  endereco,
  exigirAcesso,
  exigirConta,
  iniciarSessao,
  limiteDeClientes,
  planoPorId,
  usarToken,
  type IdPlano,
} from "@/lib/placar/conta";
import { contasDaAgencia, sincronizarCliente } from "@/lib/placar/meta";
import { conectarWhatsapp, desconectarWhatsapp, enviarParaTodos } from "@/lib/placar/whatsapp";
import { montarRelatorio } from "@/lib/placar/relatorio";
import { asaasConfigurado, assinar, cancelarAssinatura } from "@/lib/placar/asaas";
import type { Estado } from "@/app/painel/admin/acoes";

const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });
const txt = (f: FormData, campo: string, max = 200) => String(f.get(campo) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const numerosGuardados = (bruto: string) => numerosDe(bruto).map((n) => `+${n}`).join(",") || null;

// ---------- Conta ----------

export async function cadastrar(_: Estado, f: FormData): Promise<Estado> {
  const agencia = txt(f, "agencia", 120);
  const nome = txt(f, "nome", 120);
  const email = txt(f, "email", 160).toLowerCase();
  const senha = String(f.get("senha") ?? "");
  const telefone = txt(f, "telefone", 40);
  if (!agencia || !nome) return falha("Preencha o nome da agência e o seu nome.");
  if (!EMAIL.test(email)) return falha("Confira o e-mail.");
  const problema = problemaNaSenha(senha);
  if (problema) return falha(problema);
  if (!f.get("termos")) return falha("Para continuar, aceite os termos de uso.");
  if (await uma("select 1 from placar.usuarios where email = $1", [email])) return falha("Já existe uma conta com este e-mail. Entre com a sua senha.");

  const a = await uma<{ id: number }>(
    "insert into placar.agencias (nome, telefone, teste_ate) values ($1, $2, now() + make_interval(days => $3)) returning id",
    [agencia, numerosGuardados(telefone), DIAS_TESTE],
  );
  const u = await uma<{ id: number }>("insert into placar.usuarios (agencia_id, email, nome, senha) values ($1, $2, $3, $4) returning id", [
    a!.id,
    email,
    nome,
    await hashSenha(senha),
  ]);
  await iniciarSessao(u!.id);
  redirect("/placar/app/comecar");
}

export async function entrar(_: Estado, f: FormData): Promise<Estado> {
  const email = txt(f, "email", 160).toLowerCase();
  const u = await uma<{ id: number; senha: string }>("select id, senha from placar.usuarios where email = $1", [email]);
  if (!(await conferirSenha(String(f.get("senha") ?? ""), u?.senha ?? null)) || !u) return falha("E-mail ou senha não conferem.");
  await iniciarSessao(u.id);
  redirect("/placar/app");
}

export async function sair() {
  await encerrarSessao();
  redirect("/placar/entrar");
}

export async function esqueciSenha(_: Estado, f: FormData): Promise<Estado> {
  const email = txt(f, "email", 160).toLowerCase();
  const u = await uma<{ id: number }>("select id from placar.usuarios where email = $1", [email]);
  if (u) {
    const link = `${endereco()}/redefinir?token=${await criarToken(u.id, "senha", 60)}`;
    await enviarEmail({
      para: email,
      assunto: "Criar uma senha nova no Placar",
      texto: `Para criar uma senha nova, abra: ${link}\n\nO link vale por 1 hora.`,
      html: emailComBotao({ titulo: "Senha nova", texto: "Clique no botão para criar uma senha nova. O link vale por 1 hora.", botao: "Criar senha nova", link, rodape: "Se não foi você, ignore este e-mail." }),
    }).catch(() => undefined);
  }
  return sucesso("Se o e-mail tiver conta, o link para criar uma senha nova chega em instantes.");
}

export async function redefinirSenha(_: Estado, f: FormData): Promise<Estado> {
  const senha = String(f.get("senha") ?? "");
  const problema = problemaNaSenha(senha);
  if (problema) return falha(problema);
  const usuario = await usarToken(String(f.get("token") ?? ""), "senha");
  if (!usuario) return falha("O link venceu ou já foi usado. Peça outro.");
  await q("update placar.usuarios set senha = $2 where id = $1", [usuario, await hashSenha(senha)]);
  await q("delete from placar.sessoes where usuario_id = $1", [usuario]);
  await iniciarSessao(usuario);
  redirect("/placar/app");
}

// ---------- Agência ----------

const TIPOS_IMAGEM = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

export async function salvarAgencia(_: Estado, f: FormData): Promise<Estado> {
  const { agencia } = await exigirConta();
  const nome = txt(f, "nome", 120);
  if (!nome) return falha("Dê um nome para a agência.");
  const cor = /^#[0-9a-fA-F]{6}$/.test(txt(f, "cor")) ? txt(f, "cor") : agencia.cor;
  let logo = agencia.logo;
  const arquivo = f.get("logo");
  if (arquivo instanceof File && arquivo.size > 0) {
    if (!TIPOS_IMAGEM.has(arquivo.type) || arquivo.type === "image/svg+xml") return falha("O logo precisa ser PNG, JPG ou WEBP.");
    if (arquivo.size > 1024 * 1024) return falha("Logo grande demais (máximo 1 MB).");
    logo = (await put(`placar/logos/${agencia.id}.${arquivo.type.split("/")[1]}`, arquivo, { access: "private", addRandomSuffix: true, contentType: arquivo.type })).pathname;
  }
  const bruto = txt(f, "alertas", 300);
  if (bruto && !numerosDe(bruto).length) return falha("Não reconheci o número dos alertas. Use DDD + número.");
  await q("update placar.agencias set nome = $2, cor = $3, logo = $4, alertas_numeros = $5 where id = $1", [agencia.id, nome, cor, logo, numerosGuardados(bruto)]);
  revalidatePath("/placar", "layout");
  return sucesso("Salvo.");
}

export async function ligarWhatsapp(_: Estado): Promise<Estado> {
  const { agencia } = await exigirAcesso();
  try {
    await conectarWhatsapp(agencia.id);
  } catch (e) {
    return falha(e instanceof Error ? e.message : "O serviço de WhatsApp não respondeu. Tente de novo em instantes.");
  }
  revalidatePath("/placar", "layout");
  return sucesso("");
}

export async function desligarWhatsapp() {
  const { agencia } = await exigirConta();
  await desconectarWhatsapp(agencia.id).catch(() => undefined);
  await q("update placar.agencias set wa_numero = null where id = $1", [agencia.id]);
  revalidatePath("/placar", "layout");
}

export async function desconectarMeta() {
  const { agencia } = await exigirConta();
  await q("update placar.agencias set meta_token = null, meta_expira_em = null, meta_pessoa = null where id = $1", [agencia.id]);
  revalidatePath("/placar", "layout");
}

// ---------- Clientes ----------

const slugDe = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "cliente";

async function clienteDaAgencia(f: FormData) {
  const conta = await exigirAcesso();
  const c = await uma<Cliente>("select * from placar.clientes where id = $1 and agencia_id = $2", [Number(f.get("cliente")), conta.agencia.id]);
  return c ? { ...conta, cliente: c } : null;
}

export async function criarCliente(_: Estado, f: FormData): Promise<Estado> {
  const { agencia } = await exigirAcesso();
  const nome = txt(f, "nome", 120);
  if (!nome) return falha("Dê um nome para o cliente.");
  const total = await uma<{ n: number }>("select count(*)::int as n from placar.clientes where agencia_id = $1", [agencia.id]);
  if ((total?.n ?? 0) >= limiteDeClientes(agencia)) return falha("Você chegou ao limite de clientes do seu plano. Troque de plano para adicionar mais.");
  const conta = txt(f, "conta", 40);
  const contas = await contasDaAgencia(agencia).catch(() => []);
  const escolhida = contas.find((c) => c.id === conta);
  if (conta && !escolhida) return falha("Essa conta de anúncio não aparece na sua conexão com o Facebook.");
  const whatsapp = txt(f, "whatsapp", 200);
  if (whatsapp && !numerosDe(whatsapp).length) return falha("Não reconheci o WhatsApp do cliente. Use DDD + número.");
  let slug = slugDe(nome);
  for (let i = 2; await uma("select 1 from placar.clientes where agencia_id = $1 and slug = $2", [agencia.id, slug]); i++) slug = `${slugDe(nome)}-${i}`;
  const c = await uma<Cliente>(
    `insert into placar.clientes (agencia_id, nome, slug, token, tipo, moeda, meta_conta, whatsapp)
     values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
    [agencia.id, nome, slug, randomBytes(15).toString("base64url"), f.get("tipo") === "ecommerce" ? "ecommerce" : "leads", escolhida?.moeda ?? "BRL", escolhida?.id ?? null, numerosGuardados(whatsapp)],
  );
  if (c!.meta_conta) await sincronizarCliente(c!, 60).catch(() => undefined);
  redirect(`/placar/app/clientes/${c!.id}?novo=1`);
}

export async function salvarCliente(_: Estado, f: FormData): Promise<Estado> {
  const r = await clienteDaAgencia(f);
  if (!r) return falha("Cliente não encontrado.");
  const nome = txt(f, "nome", 120);
  if (!nome) return falha("Dê um nome para o cliente.");
  const whatsapp = txt(f, "whatsapp", 200);
  if (whatsapp && !numerosDe(whatsapp).length) return falha("Não reconheci o WhatsApp do cliente.");
  const conta = txt(f, "conta", 40) || null;
  let moeda = r.cliente.moeda;
  if (conta && conta !== r.cliente.meta_conta) {
    const escolhida = (await contasDaAgencia(r.agencia).catch(() => [])).find((c) => c.id === conta);
    if (!escolhida) return falha("Essa conta de anúncio não aparece na sua conexão com o Facebook.");
    moeda = escolhida.moeda;
  }
  const numero = (campo: string) => {
    const v = Number(txt(f, campo).replace(/\./g, "").replace(",", "."));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  await q(
    `update placar.clientes set nome = $2, tipo = $3, whatsapp = $4, meta_conta = $5, moeda = $6, meta_leads = $7, meta_cpl = $8, meta_investimento = $9 where id = $1`,
    [r.cliente.id, nome, f.get("tipo") === "ecommerce" ? "ecommerce" : "leads", numerosGuardados(whatsapp), conta, moeda, numero("meta_leads"), numero("meta_cpl"), numero("meta_investimento")],
  );
  if (conta !== r.cliente.meta_conta) {
    await q("delete from placar.metricas where cliente_id = $1", [r.cliente.id]);
    if (conta) await sincronizarCliente({ ...r.cliente, meta_conta: conta }, 60).catch(() => undefined);
  }
  revalidatePath("/placar", "layout");
  return sucesso("Salvo.");
}

export async function salvarRelatorio(_: Estado, f: FormData): Promise<Estado> {
  const r = await clienteDaAgencia(f);
  if (!r) return falha("Cliente não encontrado.");
  const frequencia = (Object.keys(FREQUENCIAS) as Frequencia[]).find((x) => x === f.get("frequencia")) ?? "semanal";
  const metricas = METRICAS.map((m) => m.id).filter((id) => f.getAll("metricas").includes(id));
  if (!metricas.length) return falha("Escolha pelo menos uma métrica.");
  const ativo = Boolean(f.get("ativo"));
  if (ativo && !numerosDe(r.cliente.whatsapp).length) return falha("Cadastre o WhatsApp do cliente (em Dados do cliente) antes de ligar o relatório.");
  if (ativo && !r.agencia.wa_numero) return falha("Conecte o seu WhatsApp em Configurações antes de ligar o relatório.");
  const int = (campo: string, min: number, max: number, padrao: number) => {
    const n = Number(f.get(campo));
    return Number.isInteger(n) && n >= min && n <= max ? n : padrao;
  };
  await q(
    `update placar.clientes set rel_ativo = $2, rel_frequencia = $3, rel_dia_semana = $4, rel_dia_mes = $5, rel_hora = $6, rel_fuso = $7, rel_ia = $8,
            rel_metricas = $9, rel_abertura = $10, rel_fechamento = $11, rel_instrucao = $12, rel_destaque = $13, rel_link = $14, alertas_cliente = $15
      where id = $1`,
    [
      r.cliente.id,
      ativo,
      frequencia,
      int("dia_semana", 0, 6, 1),
      int("dia_mes", 1, 28, 1),
      int("hora", 0, 23, 9),
      FUSOS.some((x) => x.valor === f.get("fuso")) ? String(f.get("fuso")) : "America/Sao_Paulo",
      Boolean(f.get("ia")),
      metricas,
      txt(f, "abertura", 600) || null,
      txt(f, "fechamento", 600) || null,
      txt(f, "instrucao", 500) || null,
      Boolean(f.get("destaque")),
      Boolean(f.get("link")),
      Boolean(f.get("alertas_cliente")),
    ],
  );
  // Ligado depois do horário de hoje: o primeiro sai no próximo dia marcado, não agora de surpresa.
  if (ativo && !r.cliente.rel_ativo) await q("update placar.clientes set rel_ultimo_em = now() where id = $1 and rel_hora <= extract(hour from now() at time zone rel_fuso)", [r.cliente.id]);
  revalidatePath("/placar", "layout");
  return sucesso(ativo ? "Pronto! O relatório vai sair sozinho no dia e horário escolhidos." : "Salvo. O envio automático está desligado.");
}

export async function enviarRelatorioAgora(_: Estado, f: FormData): Promise<Estado> {
  const r = await clienteDaAgencia(f);
  if (!r) return falha("Cliente não encontrado.");
  if (!r.agencia.wa_numero) return falha("Conecte o seu WhatsApp em Configurações primeiro.");
  const paraMim = f.get("destino") === "eu";
  const destino = paraMim ? numerosDe(txt(f, "meu_numero", 40)) : numerosDe(r.cliente.whatsapp);
  if (!destino.length) return falha(paraMim ? "Digite o seu número." : "Cadastre o WhatsApp do cliente.");
  const { texto } = await montarRelatorio(r.cliente, r.agencia, { comIa: true, atualizar: true });
  const erros = await enviarParaTodos(r.agencia.id, destino, texto);
  await q("insert into placar.envios (cliente_id, tipo, chave, destino, texto, ok, erro) values ($1, 'relatorio', $2, $3, $4, $5, $6)", [
    r.cliente.id,
    `manual:${Date.now()}`,
    paraMim ? "equipe" : "cliente",
    texto,
    erros.length < destino.length,
    erros.join("; ").slice(0, 500) || null,
  ]);
  revalidatePath("/placar", "layout");
  if (erros.length === destino.length) return falha(`Não foi: ${erros.join("; ")}`);
  return sucesso(`Enviado para ${destino.map(numeroLegivel).join(", ")}.`);
}

export async function atualizarAgora(f: FormData) {
  const r = await clienteDaAgencia(f);
  if (r?.cliente.meta_conta) await sincronizarCliente(r.cliente, 30).catch(() => undefined);
  revalidatePath("/placar", "layout");
}

export async function excluirCliente(f: FormData) {
  const r = await clienteDaAgencia(f);
  if (r) await q("delete from placar.clientes where id = $1", [r.cliente.id]);
  redirect("/placar/app");
}

// ---------- Plano ----------

const documentoValido = (d: string) => d.length === 11 || d.length === 14;

export async function assinarPlano(_: Estado, f: FormData): Promise<Estado> {
  const { agencia, usuario } = await exigirConta();
  const plano = String(f.get("plano")) as IdPlano;
  if (!planoPorId(plano)) return falha("Escolha um plano.");
  const documento = txt(f, "documento", 30).replace(/\D/g, "") || agencia.documento || "";
  if (!documentoValido(documento)) return falha("Informe o CPF ou o CNPJ de quem paga (só números).");
  if (!asaasConfigurado()) return falha("A cobrança ainda não está ligada. Fale com o suporte.");
  const usados = await uma<{ n: number }>("select count(*)::int as n from placar.clientes where agencia_id = $1", [agencia.id]);
  if ((usados?.n ?? 0) > planoPorId(plano)!.clientes) return falha(`Você tem ${usados?.n} clientes; este plano vai até ${planoPorId(plano)!.clientes}. Escolha um maior.`);
  let fatura: Awaited<ReturnType<typeof assinar>>;
  try {
    fatura = await assinar(agencia, plano, { documento, email: usuario.email });
  } catch (e) {
    return falha(`Não deu para criar a assinatura: ${e instanceof Error ? e.message : String(e)}`);
  }
  revalidatePath("/placar", "layout");
  if (fatura?.link) redirect(fatura.link);
  return sucesso(`Plano ${planoPorId(plano)!.nome} assinado.`);
}

export async function cancelarPlano() {
  const { agencia } = await exigirConta();
  await cancelarAssinatura(agencia).catch(() => undefined);
  revalidatePath("/placar", "layout");
}
