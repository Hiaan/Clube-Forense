"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  EMAIL_VALIDO,
  criarTokenLogin,
  empresaPermitidaPorId,
  ehEquipe,
  normalizarEmail,
  usuarioAtual,
  type Usuario,
} from "@/lib/painel/auth";
import { consulta, registrar, umaLinha } from "@/lib/painel/db";
import { emailComBotao, enviarEmail } from "@/lib/painel/email";
import { linkDeAcesso } from "@/lib/painel/links";
import { consolidar, interpretarPlanilha, lerData, lerNumero, type LinhaMetrica } from "@/lib/painel/csv";
import { MOEDAS } from "@/lib/painel/formato";
import { PLANO_PADRAO, TEXTOS_PAINEL } from "@/lib/painel/textos";
import { IDIOMAS, fmt, type Idioma } from "@/lib/i18n";

// Ações da área de gestão. Cada uma confere, no servidor, quem está pedindo e se
// essa pessoa pode mexer naquela empresa: o formulário pode ser forjado.

export type Estado = { ok?: boolean; mensagem?: string; link?: string; vez?: number };

const VALIDADE_CONVITE_MIN = 72 * 60;
const RESERVADOS = new Set(["admin", "entrar", "conta", "api", "nova", "equipe", "modelo-csv"]);

const txt = (f: FormData, campo: string, max = 200) => String(f.get(campo) ?? "").trim().slice(0, max);
const num = (f: FormData, campo: string) => {
  const bruto = txt(f, campo);
  if (!bruto) return null;
  const n = lerNumero(bruto);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const id = (f: FormData, campo: string) => {
  const n = Number(f.get(campo));
  return Number.isInteger(n) && n > 0 ? n : 0;
};
const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string, extra: Partial<Estado> = {}): Estado => ({ ok: true, mensagem, vez: Date.now(), ...extra });

async function equipe() {
  const u = await usuarioAtual();
  if (!u || !ehEquipe(u)) redirect("/painel/entrar");
  return u;
}

async function admin() {
  const u = await equipe();
  if (u.perfil !== "admin") redirect("/painel/admin");
  return u;
}

/** Empresa do formulário, se a pessoa da equipe tiver acesso a ela. */
async function empresaDoFormulario(u: Usuario, f: FormData) {
  const empresa = await empresaPermitidaPorId(u, id(f, "empresa"));
  if (!empresa) throw new Error("Sem acesso a esta empresa.");
  return empresa;
}

function slugDe(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function camposDaEmpresa(f: FormData) {
  const tipo = txt(f, "tipo") === "ecommerce" ? "ecommerce" : "leads";
  const moeda = (MOEDAS as readonly string[]).includes(txt(f, "moeda")) ? txt(f, "moeda") : "BRL";
  const idioma = IDIOMAS.includes(txt(f, "idioma") as Idioma) ? (txt(f, "idioma") as Idioma) : "pt";
  const pais = txt(f, "pais", 2).toUpperCase() || "BR";
  return {
    nome: txt(f, "nome", 120),
    tipo,
    pais,
    moeda,
    idioma,
    meta_investimento: num(f, "meta_investimento"),
    meta_leads: num(f, "meta_leads") == null ? null : Math.round(num(f, "meta_leads")!),
    meta_cpl: num(f, "meta_cpl"),
    meta_receita: num(f, "meta_receita"),
  };
}

// ---------- Empresas ----------

export async function criarEmpresa(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const c = camposDaEmpresa(f);
  if (c.nome.length < 2) return falha("Informe o nome da empresa.");

  let base = slugDe(txt(f, "slug") || c.nome) || "empresa";
  if (RESERVADOS.has(base)) base = `${base}-cliente`;
  let slug = base;
  for (let i = 2; await umaLinha("select 1 from empresas where slug = $1", [slug]); i++) slug = `${base}-${i}`;

  const nova = await umaLinha<{ id: number }>(
    `insert into empresas (slug, nome, tipo, pais, moeda, idioma, meta_investimento, meta_leads, meta_cpl, meta_receita)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id`,
    [slug, c.nome, c.tipo, c.pais, c.moeda, c.idioma, c.meta_investimento, c.meta_leads, c.meta_cpl, c.meta_receita],
  );
  await semearPlano(nova!.id, c.idioma);
  await registrar(u.id, nova!.id, "empresa.criar", c.nome);
  revalidatePath("/painel", "layout");
  redirect(`/painel/admin/${slug}`);
}

export async function salvarEmpresa(_: Estado, f: FormData): Promise<Estado> {
  const u = await equipe();
  try {
    const empresa = await empresaDoFormulario(u, f);
    const c = camposDaEmpresa(f);
    if (c.nome.length < 2) return falha("Informe o nome da empresa.");
    await consulta(
      `update empresas set nome = $2, tipo = $3, pais = $4, moeda = $5, idioma = $6,
         meta_investimento = $7, meta_leads = $8, meta_cpl = $9, meta_receita = $10 where id = $1`,
      [empresa.id, c.nome, c.tipo, c.pais, c.moeda, c.idioma, c.meta_investimento, c.meta_leads, c.meta_cpl, c.meta_receita],
    );
    await registrar(u.id, empresa.id, "empresa.editar");
    revalidatePath("/painel", "layout");
    return sucesso("Dados e metas salvos.");
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : "Não foi possível salvar.");
  }
}

export async function salvarComentario(_: Estado, f: FormData): Promise<Estado> {
  const u = await equipe();
  try {
    const empresa = await empresaDoFormulario(u, f);
    const comentario = txt(f, "comentario", 2000) || null;
    await consulta("update empresas set comentario = $2, comentario_em = case when $2::text is null then null else now() end where id = $1", [
      empresa.id,
      comentario,
    ]);
    await registrar(u.id, empresa.id, "empresa.comentario");
    revalidatePath("/painel", "layout");
    return sucesso(comentario ? "Comentário publicado no painel do cliente." : "Comentário removido.");
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : "Não foi possível salvar.");
  }
}

export async function excluirEmpresa(f: FormData) {
  const u = await admin();
  const empresa = await empresaPermitidaPorId(u, id(f, "empresa"));
  if (!empresa || txt(f, "confirmacao") !== empresa.slug) return;
  await consulta("delete from empresas where id = $1", [empresa.id]);
  await registrar(u.id, null, "empresa.excluir", `${empresa.slug} (${empresa.nome})`);
  revalidatePath("/painel", "layout");
  redirect("/painel/admin");
}

// ---------- Acessos ----------

async function enviarConvite(email: string, idioma: Idioma, link: string, empresaNome: string) {
  const t = TEXTOS_PAINEL[idioma].login;
  const texto = fmt(t.conviteTexto, { empresa: empresaNome });
  await enviarEmail({
    para: email,
    assunto: t.emailAssunto,
    texto: `${texto}\n\n${link}`,
    html: emailComBotao({ titulo: t.emailTitulo, texto, botao: t.emailBotao, link, rodape: t.emailRodape }),
  });
}

/** Libera o painel de uma empresa para um e-mail (cria o usuário cliente se for novo). */
export async function convidar(_: Estado, f: FormData): Promise<Estado> {
  const u = await equipe();
  try {
    const empresa = await empresaDoFormulario(u, f);
    const email = normalizarEmail(txt(f, "email", 160));
    if (!EMAIL_VALIDO.test(email)) return falha("E-mail inválido.");
    const nome = txt(f, "nome", 120) || null;

    const usuario = await umaLinha<{ id: number; perfil: string; idioma: Idioma }>(
      `insert into usuarios (email, nome, perfil, idioma) values ($1, $2, 'cliente', $3)
       on conflict (email) do update set nome = coalesce(usuarios.nome, excluded.nome)
       returning id, perfil, idioma`,
      [email, nome, empresa.idioma],
    );
    await consulta("insert into acessos (usuario_id, empresa_id) values ($1, $2) on conflict do nothing", [usuario!.id, empresa.id]);
    await registrar(u.id, empresa.id, "acesso.liberar", email);

    let link: string | undefined;
    if (usuario!.perfil === "cliente") {
      const token = await criarTokenLogin(email, VALIDADE_CONVITE_MIN);
      if (token.ok) {
        link = await linkDeAcesso(token.token);
        if (f.get("enviar") === "on") await enviarConvite(email, usuario!.idioma, link, empresa.nome);
      }
    }
    revalidatePath("/painel/admin", "layout");
    return sucesso(
      f.get("enviar") === "on" ? `Acesso liberado e convite enviado para ${email}.` : `Acesso liberado para ${email}.`,
      { link },
    );
  } catch (erro) {
    console.error("[painel] convite", erro);
    return falha(erro instanceof Error ? erro.message : "Não foi possível liberar o acesso.");
  }
}

/** Gera um novo link de acesso (vale 3 dias, uso único) para mandar pelo WhatsApp. */
export async function gerarLink(_: Estado, f: FormData): Promise<Estado> {
  const u = await equipe();
  try {
    const empresa = await empresaDoFormulario(u, f);
    // Só para clientes com acesso a esta empresa: um gestor não gera link de entrada de outro membro da equipe.
    const alvo = await umaLinha<{ email: string }>(
      `select us.email from usuarios us join acessos a on a.usuario_id = us.id
        where us.id = $1 and a.empresa_id = $2 and (us.perfil = 'cliente' or $3::boolean)`,
      [id(f, "usuario"), empresa.id, u.perfil === "admin"],
    );
    if (!alvo) return falha("Usuário não encontrado nesta empresa.");
    const token = await criarTokenLogin(alvo.email, VALIDADE_CONVITE_MIN);
    if (!token.ok) return falha(token.motivo === "limite" ? "Muitos links gerados agora. Aguarde 15 minutos." : "Não foi possível gerar.");
    await registrar(u.id, empresa.id, "acesso.link", alvo.email);
    return sucesso(`Link para ${alvo.email} (vale 3 dias, uso único):`, { link: await linkDeAcesso(token.token) });
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : "Não foi possível gerar.");
  }
}

export async function removerAcesso(f: FormData) {
  const u = await equipe();
  const empresa = await empresaPermitidaPorId(u, id(f, "empresa"));
  if (!empresa) return;
  const alvo = id(f, "usuario");
  // Gestor remove clientes; só o admin remove alguém da equipe de uma empresa.
  const perfil = await umaLinha<{ perfil: string; email: string }>("select perfil, email from usuarios where id = $1", [alvo]);
  if (!perfil || (perfil.perfil !== "cliente" && u.perfil !== "admin")) return;
  await consulta("delete from acessos where usuario_id = $1 and empresa_id = $2", [alvo, empresa.id]);
  if (perfil.perfil === "cliente") await consulta("delete from sessoes where usuario_id = $1 and not exists (select 1 from acessos where usuario_id = $1)", [alvo]);
  await registrar(u.id, empresa.id, "acesso.remover", perfil.email);
  revalidatePath("/painel", "layout");
}

export async function atribuirGestor(f: FormData) {
  const u = await admin();
  const empresa = await empresaPermitidaPorId(u, id(f, "empresa"));
  const gestor = await umaLinha<{ id: number; email: string }>("select id, email from usuarios where id = $1 and perfil in ('gestor', 'admin')", [
    id(f, "usuario"),
  ]);
  if (!empresa || !gestor) return;
  await consulta("insert into acessos (usuario_id, empresa_id) values ($1, $2) on conflict do nothing", [gestor.id, empresa.id]);
  await registrar(u.id, empresa.id, "acesso.gestor", gestor.email);
  revalidatePath("/painel", "layout");
}

// ---------- Equipe T9 ----------

export async function adicionarMembro(_: Estado, f: FormData): Promise<Estado> {
  const u = await admin();
  const email = normalizarEmail(txt(f, "email", 160));
  if (!EMAIL_VALIDO.test(email)) return falha("E-mail inválido.");
  const perfil = txt(f, "perfil") === "admin" ? "admin" : "gestor";
  const nome = txt(f, "nome", 120) || null;
  await consulta(
    `insert into usuarios (email, nome, perfil) values ($1, $2, $3)
     on conflict (email) do update set perfil = excluded.perfil, nome = coalesce(excluded.nome, usuarios.nome)`,
    [email, nome, perfil],
  );
  await registrar(u.id, null, "equipe.adicionar", `${email} (${perfil})`);
  revalidatePath("/painel/admin", "layout");
  return sucesso(`${email} agora é ${perfil}. Para entrar, é só pedir o link em /painel/entrar.`);
}

export async function removerMembro(f: FormData) {
  const u = await admin();
  const alvo = id(f, "usuario");
  if (alvo === u.id) return; // ninguém se remove sozinho (evita ficar sem admin)
  const membro = await umaLinha<{ email: string }>("delete from usuarios where id = $1 and perfil in ('admin', 'gestor') returning email", [alvo]);
  if (membro) await registrar(u.id, null, "equipe.remover", membro.email);
  revalidatePath("/painel/admin", "layout");
}

// ---------- Métricas ----------

async function gravarMetricas(empresaId: number, linhas: LinhaMetrica[], origem: string) {
  if (!linhas.length) return 0;
  const coluna = <K extends keyof LinhaMetrica>(k: K) => linhas.map((l) => l[k]);
  const resultado = await consulta<{ id: number }>(
    `insert into metricas (empresa_id, data, plataforma, campanha, gasto, impressoes, cliques, leads, conversoes, receita, origem)
     select $1, * , $11 from unnest($2::date[], $3::text[], $4::text[], $5::numeric[], $6::bigint[], $7::bigint[], $8::int[], $9::int[], $10::numeric[])
     on conflict (empresa_id, data, plataforma, campanha) do update set
       gasto = excluded.gasto, impressoes = excluded.impressoes, cliques = excluded.cliques, leads = excluded.leads,
       conversoes = excluded.conversoes, receita = excluded.receita, origem = excluded.origem
     returning id`,
    [
      empresaId,
      coluna("data"),
      coluna("plataforma"),
      coluna("campanha"),
      coluna("gasto"),
      coluna("impressoes"),
      coluna("cliques"),
      coluna("leads"),
      coluna("conversoes"),
      coluna("receita"),
      origem,
    ],
  );
  return resultado.length;
}

const plataformaDe = (f: FormData) => txt(f, "plataforma", 40) || "Meta Ads";

export async function lancarMetrica(_: Estado, f: FormData): Promise<Estado> {
  const u = await equipe();
  try {
    const empresa = await empresaDoFormulario(u, f);
    const data = lerData(txt(f, "data"));
    if (!data) return falha("Informe uma data válida.");
    const linha: LinhaMetrica = {
      data,
      plataforma: plataformaDe(f),
      campanha: txt(f, "campanha", 200),
      gasto: num(f, "gasto") ?? 0,
      impressoes: Math.round(num(f, "impressoes") ?? 0),
      cliques: Math.round(num(f, "cliques") ?? 0),
      leads: Math.round(num(f, "leads") ?? 0),
      conversoes: Math.round(num(f, "conversoes") ?? 0),
      receita: num(f, "receita") ?? 0,
    };
    await gravarMetricas(empresa.id, [linha], "manual");
    await registrar(u.id, empresa.id, "metricas.manual", `${data} ${linha.plataforma} ${linha.campanha}`);
    revalidatePath("/painel", "layout");
    return sucesso(`Dados de ${data.split("-").reverse().join("/")} salvos (se já existiam, foram substituídos).`);
  } catch (erro) {
    return falha(erro instanceof Error ? erro.message : "Não foi possível salvar.");
  }
}

export async function importarCsv(_: Estado, f: FormData): Promise<Estado> {
  const u = await equipe();
  try {
    const empresa = await empresaDoFormulario(u, f);
    const arquivo = f.get("arquivo");
    if (!(arquivo instanceof File) || arquivo.size === 0) return falha("Escolha um arquivo CSV.");
    if (arquivo.size > 3 * 1024 * 1024) return falha("Arquivo grande demais (máximo 3 MB).");

    const texto = await arquivo.text();
    const { linhas, erros, colunas } = interpretarPlanilha(texto, plataformaDe(f));
    if (!linhas.length) return falha(erros[0] ?? "Nenhuma linha válida encontrada.");
    const consolidadas = consolidar(linhas);
    const gravadas = await gravarMetricas(empresa.id, consolidadas, "csv");
    await registrar(u.id, empresa.id, "metricas.csv", `${arquivo.name}: ${gravadas} linhas`);
    revalidatePath("/painel", "layout");

    const datas = consolidadas.map((l) => l.data).sort();
    const periodo = `${datas[0].split("-").reverse().join("/")} a ${datas.at(-1)!.split("-").reverse().join("/")}`;
    const avisos = erros.length ? ` ${erros.length} linha(s) ignorada(s): ${erros.slice(0, 3).join(" ")}` : "";
    return sucesso(`${gravadas} linha(s) importadas (${periodo}). Colunas reconhecidas: ${colunas.join(", ")}.${avisos}`);
  } catch (erro) {
    console.error("[painel] csv", erro);
    return falha(erro instanceof Error ? erro.message : "Não foi possível importar.");
  }
}

export async function excluirMetrica(f: FormData) {
  const u = await equipe();
  const linha = await umaLinha<{ empresa_id: number }>("select empresa_id from metricas where id = $1", [id(f, "metrica")]);
  if (!linha || !(await empresaPermitidaPorId(u, linha.empresa_id))) return;
  await consulta("delete from metricas where id = $1", [id(f, "metrica")]);
  await registrar(u.id, linha.empresa_id, "metricas.excluir", String(id(f, "metrica")));
  revalidatePath("/painel", "layout");
}

// ---------- Plano de 4 semanas ----------

async function semearPlano(empresaId: number, idioma: Idioma) {
  const itens = PLANO_PADRAO[idioma].flatMap((titulos, s) => titulos.map((titulo, ordem) => ({ semana: s + 1, ordem, titulo })));
  await consulta(
    "insert into plano (empresa_id, semana, ordem, titulo) select $1, * from unnest($2::int[], $3::int[], $4::text[])",
    [empresaId, itens.map((i) => i.semana), itens.map((i) => i.ordem), itens.map((i) => i.titulo)],
  );
}

export async function criarPlanoPadrao(f: FormData) {
  const u = await equipe();
  const empresa = await empresaPermitidaPorId(u, id(f, "empresa"));
  if (!empresa) return;
  const existe = await umaLinha("select 1 from plano where empresa_id = $1", [empresa.id]);
  if (!existe) await semearPlano(empresa.id, empresa.idioma);
  revalidatePath("/painel", "layout");
}

export async function adicionarItemPlano(f: FormData) {
  const u = await equipe();
  const empresa = await empresaPermitidaPorId(u, id(f, "empresa"));
  const semana = id(f, "semana");
  const titulo = txt(f, "titulo", 200);
  if (!empresa || semana < 1 || semana > 4 || !titulo) return;
  await consulta(
    "insert into plano (empresa_id, semana, ordem, titulo) values ($1, $2, (select coalesce(max(ordem), -1) + 1 from plano where empresa_id = $1 and semana = $2), $3)",
    [empresa.id, semana, titulo],
  );
  await registrar(u.id, empresa.id, "plano.adicionar", titulo);
  revalidatePath("/painel", "layout");
}

export async function excluirItemPlano(f: FormData) {
  const u = await equipe();
  const item = await umaLinha<{ empresa_id: number; titulo: string }>("select empresa_id, titulo from plano where id = $1", [id(f, "item")]);
  if (!item || !(await empresaPermitidaPorId(u, item.empresa_id))) return;
  await consulta("delete from plano where id = $1", [id(f, "item")]);
  await registrar(u.id, item.empresa_id, "plano.excluir", item.titulo);
  revalidatePath("/painel", "layout");
}
