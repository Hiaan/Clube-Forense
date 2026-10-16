import { consulta, registrar, umaLinha } from "@/lib/painel/db";
import { listarContasDeAnuncio, metaConfigurado, normalizarConta } from "@/lib/painel/meta";
import { PLANO_PADRAO } from "@/lib/painel/textos";
import { IDIOMAS, type Idioma } from "@/lib/i18n";
import { chamadaAutorizada } from "../autorizacao";

// Cadastro de clientes em lote (protegido pelo CRON_SECRET).
// GET: clientes já cadastrados + contas de anúncio que o usuário do sistema da Meta enxerga.
// POST { clientes: [{ nome, pais?, moeda?, idioma?, tipo?, conta?, mensalidade?, mensalidade_moeda?, novoNome? }], confirmar?: true }:
//   cria os que ainda não existem (mesmo nome, ignorando acentos/maiúsculas). Nos que já existem, só
//   atualiza mensalidade e nome (novoNome), quando enviados. Sem "confirmar", só simula.
//   Nunca liga a cobrança automática: isso é decisão do admin, no painel.

const chave = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slugDe = (s: string) => chave(s).replace(/ /g, "-");
const RESERVADOS = new Set(["admin", "entrar", "conta", "api", "nova", "equipe", "modelo-csv"]);

type Pedido = {
  nome?: string;
  pais?: string;
  moeda?: string;
  idioma?: string;
  tipo?: string;
  conta?: string;
  mensalidade?: number;
  mensalidade_moeda?: string;
  novoNome?: string;
};

export async function GET(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  const empresas = await consulta<{ id: number; slug: string; nome: string; pais: string; moeda: string; idioma: string; meta_conta: string | null }>(
    "select id, slug, nome, pais, moeda, idioma, meta_conta, mensalidade, mensalidade_moeda, cobranca_automatica from empresas order by nome",
  );
  let contas: Awaited<ReturnType<typeof listarContasDeAnuncio>> = [];
  let erroMeta: string | null = null;
  if (metaConfigurado()) {
    try {
      contas = await listarContasDeAnuncio();
    } catch (e) {
      erroMeta = e instanceof Error ? e.message : String(e);
    }
  }
  return Response.json({ ok: true, empresas, contas, erroMeta });
}

export async function POST(request: Request) {
  if (!chamadaAutorizada(request)) return new Response("Não autorizado", { status: 401 });
  const corpo = (await request.json().catch(() => null)) as { clientes?: Pedido[]; confirmar?: boolean } | null;
  const pedidos = Array.isArray(corpo?.clientes) ? corpo!.clientes.slice(0, 100) : [];
  if (!pedidos.length) return Response.json({ ok: false, erro: "Envie { clientes: [{ nome }] }." }, { status: 400 });
  const confirmar = corpo?.confirmar === true;

  const existentes = await consulta<{ id: number; nome: string; slug: string }>("select id, nome, slug from empresas");
  const porNome = new Map(existentes.map((e) => [chave(e.nome), e]));
  const resultado: Array<Record<string, unknown>> = [];

  for (const p of pedidos) {
    const nome = String(p.nome ?? "").trim().slice(0, 120);
    if (nome.length < 2) {
      resultado.push({ nome, status: "ignorado", motivo: "nome vazio" });
      continue;
    }
    const mensalidade = typeof p.mensalidade === "number" && p.mensalidade > 0 ? p.mensalidade : null;
    const mensalidadeMoeda = /^[A-Z]{3}$/.test(String(p.mensalidade_moeda ?? "")) ? String(p.mensalidade_moeda) : "BRL";
    const novoNome = String(p.novoNome ?? "").trim().slice(0, 120);
    const ja = porNome.get(chave(nome));
    if (ja) {
      const mudancas: Record<string, unknown> = {};
      if (mensalidade) Object.assign(mudancas, { mensalidade, mensalidade_moeda: mensalidadeMoeda });
      if (novoNome.length >= 2 && novoNome !== ja.nome) {
        const outro = porNome.get(chave(novoNome));
        if (outro && outro.id !== ja.id) {
          resultado.push({ nome, status: "ignorado", motivo: `já existe outro cliente chamado ${outro.nome}` });
          continue;
        }
        mudancas.nome = novoNome;
      }
      if (!Object.keys(mudancas).length) {
        resultado.push({ nome: ja.nome, status: "já existe", slug: ja.slug });
        continue;
      }
      if (confirmar) {
        await consulta(
          `update empresas set nome = coalesce($2, nome), mensalidade = coalesce($3, mensalidade),
             mensalidade_moeda = case when $3::numeric is null then mensalidade_moeda else $4 end where id = $1`,
          [ja.id, (mudancas.nome as string) ?? null, mensalidade, mensalidadeMoeda],
        );
        await registrar(null, ja.id, "empresa.editar", `lote: ${JSON.stringify(mudancas)}`);
        if (mudancas.nome) {
          porNome.delete(chave(ja.nome));
          porNome.set(chave(novoNome), { ...ja, nome: novoNome });
        }
      }
      resultado.push({ nome: ja.nome, status: confirmar ? "atualizado" : "atualizar", slug: ja.slug, ...mudancas });
      continue;
    }
    const pais = /^[A-Z]{2}$/.test(String(p.pais ?? "")) ? String(p.pais) : "BR";
    const moeda = /^[A-Z]{3}$/.test(String(p.moeda ?? "")) ? String(p.moeda) : pais === "US" ? "USD" : "BRL";
    const idioma: Idioma = (IDIOMAS as readonly string[]).includes(String(p.idioma)) ? (p.idioma as Idioma) : "pt";
    const tipo = p.tipo === "ecommerce" ? "ecommerce" : "leads";
    const conta = p.conta ? normalizarConta(p.conta) : null;

    let base = slugDe(nome) || "cliente";
    if (RESERVADOS.has(base)) base = `${base}-cliente`;
    let slug = base;
    for (let i = 2; await umaLinha("select 1 from empresas where slug = $1", [slug]); i++) slug = `${base}-${i}`;

    if (!confirmar) {
      resultado.push({ nome, status: "criar", slug, pais, moeda, idioma, tipo, conta });
      continue;
    }
    const nova = await umaLinha<{ id: number }>(
      `insert into empresas (slug, nome, tipo, pais, moeda, idioma, meta_conta, mensalidade, mensalidade_moeda)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
      [slug, nome, tipo, pais, moeda, idioma, conta, mensalidade, mensalidade ? mensalidadeMoeda : null],
    );
    const itens = PLANO_PADRAO[idioma].flatMap((titulos, s) => titulos.map((titulo, ordem) => ({ semana: s + 1, ordem, titulo })));
    await consulta(
      "insert into plano (empresa_id, semana, ordem, titulo) select $1, * from unnest($2::int[], $3::int[], $4::text[])",
      [nova!.id, itens.map((i) => i.semana), itens.map((i) => i.ordem), itens.map((i) => i.titulo)],
    );
    await registrar(null, nova!.id, "empresa.criar", `${nome} (cadastro em lote)`);
    porNome.set(chave(nome), { id: nova!.id, nome, slug });
    resultado.push({ nome, status: "criado", slug, pais, moeda, idioma, tipo, conta });
  }
  return Response.json({ ok: true, confirmar, resultado });
}
