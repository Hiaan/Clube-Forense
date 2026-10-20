"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { empresaPermitidaPorId, ehEquipe, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar, transacao, umaLinha } from "@/lib/painel/db";
import { MAX_ETAPAS, TIPOS_ETAPA, enviarPendentes, etapasDaEmpresa, limparNome, moverLead, type TipoEtapa } from "@/lib/painel/crm";
import { lerNumero } from "@/lib/painel/csv";
import { conferirConjuntoDeDados, metaConfigurado } from "@/lib/painel/meta";
import type { Estado } from "./admin/acoes";

// CRM do cliente: mover leads entre as etapas e montar as etapas. Cliente e equipe podem,
// sempre conferindo no servidor se a pessoa tem acesso àquela empresa.

const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });
const inteiro = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : 0;
};

async function usuario() {
  const u = await usuarioAtual();
  if (!u) redirect("/painel/entrar");
  return u;
}

async function empresaDoForm(f: FormData) {
  const u = await usuario();
  const empresa = await empresaPermitidaPorId(u, inteiro(f.get("empresa")));
  return empresa ? { u, empresa } : null;
}

/** Arrastar o cartão (ou escolher no "Mover para"). */
export async function moverLeadCrm(leadId: number, etapaId: number) {
  const u = await usuario();
  const lead = await umaLinha<{ empresa_id: number }>("select empresa_id from leads where id = $1", [inteiro(leadId)]);
  if (!lead) return { ok: false };
  const empresa = await empresaPermitidaPorId(u, lead.empresa_id);
  if (!empresa) return { ok: false };
  const etapas = await etapasDaEmpresa(empresa.id, empresa.idioma);
  const i = etapas.findIndex((e) => e.id === inteiro(etapaId));
  if (i < 0) return { ok: false };

  const novoEvento = await moverLead(inteiro(leadId), etapas[i], i === 0, empresa.id);
  await registrar(u.id, empresa.id, "lead.etapa", `${leadId} → ${etapas[i].nome}`);
  // O envio à Meta acontece depois da resposta: a tela não espera por ele.
  if (novoEvento && empresa.meta_dataset) after(() => enviarPendentes(empresa.id));
  revalidatePath("/painel", "layout");
  return { ok: true };
}

/** Mesma coisa, pelo seletor da lista (formulário). */
export async function moverLeadForm(f: FormData) {
  await moverLeadCrm(inteiro(f.get("lead")), inteiro(f.get("etapa")));
}

export async function salvarValorLead(f: FormData) {
  const u = await usuario();
  const id = inteiro(f.get("lead"));
  const lead = await umaLinha<{ empresa_id: number }>("select empresa_id from leads where id = $1", [id]);
  if (!lead || !(await empresaPermitidaPorId(u, lead.empresa_id))) return;
  const bruto = String(f.get("valor") ?? "").trim();
  const valor = bruto ? lerNumero(bruto) : null;
  if (valor != null && (!Number.isFinite(valor) || valor < 0)) return;
  await consulta("update leads set valor = $2, atualizado_em = now() where id = $1", [id, valor]);
  // Venda ainda não enviada à Meta leva o valor junto.
  await consulta(
    `update crm_eventos v set valor = $2 from crm_etapas s
      where v.lead_id = $1 and v.enviado_em is null and s.id = v.etapa_id and s.tipo = 'ganho'`,
    [id, valor],
  );
  await registrar(u.id, lead.empresa_id, "lead.valor", `${id} → ${valor ?? "—"}`);
  revalidatePath("/painel", "layout");
}

const lerTipo = (v: FormDataEntryValue | null): TipoEtapa => (TIPOS_ETAPA.includes(v as TipoEtapa) ? (v as TipoEtapa) : "aberta");

export async function criarEtapa(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDoForm(f);
  if (!r) return falha("Cliente não encontrado.");
  const nome = limparNome(String(f.get("nome") ?? ""));
  if (!nome) return falha("Dê um nome para a etapa.");
  const etapas = await etapasDaEmpresa(r.empresa.id, r.empresa.idioma);
  if (etapas.length >= MAX_ETAPAS) return falha(`O quadro aceita até ${MAX_ETAPAS} etapas.`);
  if (etapas.some((e) => e.nome.toLowerCase() === nome.toLowerCase())) return falha("Já existe uma etapa com esse nome.");
  const tipo = lerTipo(f.get("tipo"));
  // Etapas novas entram antes das de fechamento (ganho/perdido), que costumam ficar no fim.
  const posicao = etapas.findIndex((e) => e.tipo !== "aberta");
  const ordem = posicao < 0 || tipo !== "aberta" ? etapas.length : posicao;
  await transacao(async (q) => {
    await q("update crm_etapas set ordem = ordem + 1 where empresa_id = $1 and ordem >= $2", [r.empresa.id, ordem]);
    await q("insert into crm_etapas (empresa_id, nome, ordem, tipo, evento_meta) values ($1, $2, $3, $4, $5)", [
      r.empresa.id,
      nome,
      ordem,
      tipo,
      f.get("meta") ? nome : null,
    ]);
  });
  await registrar(r.u.id, r.empresa.id, "crm.etapa-criar", nome);
  revalidatePath("/painel", "layout");
  return sucesso(`Etapa "${nome}" criada.`);
}

export async function salvarEtapa(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDoForm(f);
  if (!r) return falha("Cliente não encontrado.");
  const etapas = await etapasDaEmpresa(r.empresa.id, r.empresa.idioma);
  const etapa = etapas.find((e) => e.id === inteiro(f.get("etapa")));
  if (!etapa) return falha("Etapa não encontrada.");
  const nome = limparNome(String(f.get("nome") ?? ""));
  if (!nome) return falha("Dê um nome para a etapa.");
  if (etapas.some((e) => e.id !== etapa.id && e.nome.toLowerCase() === nome.toLowerCase())) return falha("Já existe uma etapa com esse nome.");

  // O nome do evento na Meta só acompanha a renomeação enquanto nada foi enviado com ele:
  // depois disso, mudar quebraria a otimização que já aprendeu com o nome antigo.
  let evento: string | null = null;
  if (f.get("meta")) {
    const enviado = etapa.evento_meta
      ? await umaLinha("select 1 from crm_eventos where etapa_id = $1 and enviado_em is not null limit 1", [etapa.id])
      : null;
    evento = enviado ? etapa.evento_meta : nome;
  }
  await consulta("update crm_etapas set nome = $2, tipo = $3, evento_meta = $4 where id = $1", [etapa.id, nome, lerTipo(f.get("tipo")), evento]);
  await registrar(r.u.id, r.empresa.id, "crm.etapa-salvar", `${etapa.nome} → ${nome}`);
  revalidatePath("/painel", "layout");
  return sucesso("Etapa salva.");
}

/** Sobe (-1) ou desce (+1) a etapa no quadro. */
export async function reordenarEtapa(f: FormData) {
  const r = await empresaDoForm(f);
  if (!r) return;
  const etapas = await etapasDaEmpresa(r.empresa.id, r.empresa.idioma);
  const i = etapas.findIndex((e) => e.id === inteiro(f.get("etapa")));
  const j = i + (f.get("direcao") === "subir" ? -1 : 1);
  if (i < 0 || j < 0 || j >= etapas.length) return;
  const nova = [...etapas];
  [nova[i], nova[j]] = [nova[j], nova[i]];
  await transacao(async (q) => {
    // Quem estava sem etapa (na primeira coluna) continua onde está, mesmo que outra etapa vire a primeira.
    if (i === 0 || j === 0) {
      await q("update leads set etapa_id = $2 where empresa_id = $1 and etapa_id is null", [r.empresa.id, etapas[0].id]);
    }
    await q("update crm_etapas set ordem = x.o from unnest($2::int[], $3::int[]) as x(id, o) where crm_etapas.id = x.id and empresa_id = $1", [
      r.empresa.id,
      nova.map((e) => e.id),
      nova.map((_, k) => k),
    ]);
  });
  revalidatePath("/painel", "layout");
}

export async function excluirEtapa(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDoForm(f);
  if (!r) return falha("Cliente não encontrado.");
  const etapas = await etapasDaEmpresa(r.empresa.id, r.empresa.idioma);
  const etapa = etapas.find((e) => e.id === inteiro(f.get("etapa")));
  if (!etapa) return falha("Etapa não encontrada.");
  if (etapas.length <= 2) return falha("O quadro precisa de pelo menos duas etapas.");
  const destino = etapas.find((e) => e.id === inteiro(f.get("destino")) && e.id !== etapa.id);
  if (!destino) return falha("Escolha para qual etapa vão os leads desta.");
  const primeira = etapas[0].id === etapa.id;
  const movidos = await transacao(async (q) => {
    const m = await q(
      `update leads set etapa_id = $3, etapa_em = now() where empresa_id = $1 and (etapa_id = $2 or ($4::boolean and etapa_id is null)) returning id`,
      [r.empresa.id, etapa.id, destino.id, primeira],
    );
    await q("delete from crm_etapas where id = $1 and empresa_id = $2", [etapa.id, r.empresa.id]);
    await q(
      "update crm_etapas set ordem = x.o from unnest($2::int[], $3::int[]) as x(id, o) where crm_etapas.id = x.id and empresa_id = $1",
      [r.empresa.id, etapas.filter((e) => e.id !== etapa.id).map((e) => e.id), etapas.filter((e) => e.id !== etapa.id).map((_, k) => k)],
    );
    return m.length;
  });
  await registrar(r.u.id, r.empresa.id, "crm.etapa-excluir", `${etapa.nome} (${movidos} lead(s) → ${destino.nome})`);
  revalidatePath("/painel", "layout");
  return sucesso(movidos ? `Etapa excluída. ${movidos} lead(s) foram para "${destino.nome}".` : "Etapa excluída.");
}

// ---------- Ligação com a Meta (só a equipe) ----------

export async function salvarConjuntoDeDados(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDoForm(f);
  if (!r || !ehEquipe(r.u)) return falha("Cliente não encontrado.");
  const dataset = String(f.get("dataset") ?? "").replace(/\D/g, "");
  const tokenNovo = String(f.get("token") ?? "").trim();
  const apagarToken = Boolean(f.get("apagar_token"));

  if (!dataset) {
    await consulta("update empresas set meta_dataset = null, meta_dataset_token = null, meta_dataset_erro = null where id = $1", [r.empresa.id]);
    await registrar(r.u.id, r.empresa.id, "crm.meta-desligar");
    revalidatePath("/painel", "layout");
    return sucesso("Envio das etapas para a Meta desligado.");
  }
  if (dataset.length < 8) return falha("ID inválido. Use o número do conjunto de dados (pixel) que aparece no Gerenciador de Eventos.");
  if (tokenNovo && tokenNovo.length < 50) return falha("Cole o token inteiro gerado no Gerenciador de Eventos.");
  const token = apagarToken ? null : tokenNovo || r.empresa.meta_dataset_token;
  if (!token && !metaConfigurado()) return falha("Falta o token da Meta na Vercel (META_ACCESS_TOKEN) ou um token do próprio conjunto de dados.");

  let nome: string;
  try {
    nome = await conferirConjuntoDeDados(dataset, token ?? undefined);
  } catch (erro) {
    return falha(
      `A Meta recusou o acesso a esse conjunto de dados: ${erro instanceof Error ? erro.message : erro}. ` +
        "Atribua o conjunto de dados ao usuário do sistema da T9 no Business Manager, ou gere um token no Gerenciador de Eventos (Configurações → API de Conversões) e cole aqui.",
    );
  }
  await consulta("update empresas set meta_dataset = $2, meta_dataset_token = $3, meta_dataset_erro = null where id = $1", [r.empresa.id, dataset, token]);
  await registrar(r.u.id, r.empresa.id, "crm.meta-ligar", `${dataset}${tokenNovo ? " (token novo)" : ""}`);
  // Movimentações dos últimos 7 dias que estavam esperando vão agora.
  const envio = await enviarPendentes(r.empresa.id, true);
  revalidatePath("/painel", "layout");
  const enviados = envio.reduce((a, x) => a + x.enviados, 0);
  const erro = envio.find((x) => x.erro)?.erro;
  if (erro) return falha(`Conjunto "${nome}" ligado, mas o envio falhou: ${erro}`);
  return sucesso(`Conjunto de dados "${nome}" ligado.${enviados ? ` ${enviados} movimentação(ões) recentes enviadas.` : ""}`);
}

export async function enviarPendentesAgora(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDoForm(f);
  if (!r || !ehEquipe(r.u)) return falha("Cliente não encontrado.");
  const envio = await enviarPendentes(r.empresa.id, true);
  revalidatePath("/painel", "layout");
  const erro = envio.find((x) => x.erro)?.erro;
  if (erro) return falha(`O envio falhou: ${erro}`);
  const enviados = envio.reduce((a, x) => a + x.enviados, 0);
  return sucesso(enviados ? `${enviados} evento(s) enviados para a Meta.` : "Nada pendente para enviar.");
}
