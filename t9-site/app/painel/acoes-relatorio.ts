"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { empresaPermitidaPorId, ehEquipe, usuarioAtual } from "@/lib/painel/auth";
import { consulta, registrar } from "@/lib/painel/db";
import { numeroLegivel, numerosDe, ponteConfigurada } from "@/lib/painel/whatsapp";
import {
  DIAS_SEMANA,
  FREQUENCIAS,
  FUSOS,
  METRICAS,
  empresaDoRelatorio,
  enviarParaNumeros,
  montarRelatorio,
  numerosDoRelatorio,
  relatorioDevido,
  type Frequencia,
} from "@/lib/painel/relatorioWhatsapp";
import { salvarNumerosDaEquipe } from "@/lib/painel/alertasConta";
import type { Estado } from "./admin/acoes";

// Relatório automático no WhatsApp do cliente e alertas da conta: configuração pela equipe T9.

const falha = (mensagem: string): Estado => ({ ok: false, mensagem, vez: Date.now() });
const sucesso = (mensagem: string): Estado => ({ ok: true, mensagem, vez: Date.now() });

async function empresaDaEquipe(f: FormData) {
  const u = await usuarioAtual();
  if (!u || !ehEquipe(u)) redirect("/painel");
  const empresa = await empresaPermitidaPorId(u, Number(f.get("empresa")));
  return empresa ? { u, empresa } : null;
}

const inteiro = (f: FormData, campo: string, min: number, max: number, padrao: number) => {
  const n = Number(f.get(campo));
  return Number.isInteger(n) && n >= min && n <= max ? n : padrao;
};

export async function salvarRelatorio(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDaEquipe(f);
  if (!r) return falha("Cliente não encontrado.");
  const bruto = String(f.get("numeros") ?? "").slice(0, 500);
  const numeros = numerosDe(bruto);
  if (bruto.trim() && !numeros.length)
    return falha("Não reconheci nenhum número. Use DDD + número, por exemplo (83) 99999-9999, ou + e o código do país.");
  const frequencia = (Object.keys(FREQUENCIAS) as Frequencia[]).includes(String(f.get("frequencia")) as Frequencia)
    ? (String(f.get("frequencia")) as Frequencia)
    : "semanal";
  const fuso = FUSOS.some((x) => x.valor === f.get("fuso")) ? String(f.get("fuso")) : "America/Sao_Paulo";
  const ativo = Boolean(f.get("ativo"));
  const config = {
    ativo,
    frequencia,
    semana: inteiro(f, "dia_semana", 0, 6, 1),
    mes: inteiro(f, "dia_mes", 1, 28, 1),
    hora: inteiro(f, "hora", 0, 23, 9),
    fuso,
    numeros: numeros.map((n) => `+${n}`).join(",") || null,
    ia: Boolean(f.get("ia")),
    alertas: Boolean(f.get("alertas_cliente")),
    metricas: METRICAS.map((m) => m.id).filter((id) => f.getAll("metricas").includes(id)),
    abertura:
      String(f.get("abertura") ?? "")
        .trim()
        .slice(0, 600) || null,
    fechamento:
      String(f.get("fechamento") ?? "")
        .trim()
        .slice(0, 600) || null,
    instrucao:
      String(f.get("instrucao") ?? "")
        .trim()
        .slice(0, 500) || null,
    destaque: Boolean(f.get("destaque")),
    link: Boolean(f.get("link")),
  };
  if (!config.metricas.length) return falha("Escolha pelo menos uma métrica para o relatório.");
  const destino = numerosDe(config.numeros ?? r.empresa.whatsapp_leads);
  if (ativo && !destino.length) return falha("Informe o WhatsApp que recebe o relatório (ou cadastre o número dos leads).");

  await consulta(
    `update empresas set rel_ativo = $2, rel_frequencia = $3, rel_dia_semana = $4, rel_dia_mes = $5, rel_hora = $6, rel_fuso = $7,
            rel_numeros = $8, rel_ia = $9, alertas_cliente = $10, rel_metricas = $11, rel_abertura = $12, rel_fechamento = $13,
            rel_instrucao = $14, rel_destaque = $15, rel_link = $16 where id = $1`,
    [
      r.empresa.id,
      config.ativo,
      config.frequencia,
      config.semana,
      config.mes,
      config.hora,
      config.fuso,
      config.numeros,
      config.ia,
      config.alertas,
      config.metricas,
      config.abertura,
      config.fechamento,
      config.instrucao,
      config.destaque,
      config.link,
    ],
  );
  // Ligado depois do horário de hoje: o primeiro relatório sai no próximo dia marcado, não agora de surpresa.
  if (ativo && !r.empresa.rel_ativo) {
    const e = await empresaDoRelatorio(r.empresa.id);
    if (e && relatorioDevido(e)) await consulta("update empresas set rel_ultimo_em = now() where id = $1", [r.empresa.id]);
  }
  await registrar(r.u.id, r.empresa.id, ativo ? "relatorio.ligar" : "relatorio.salvar", `${frequencia} ${config.hora}h`);
  revalidatePath("/painel", "layout");
  if (!ativo) return sucesso("Configuração salva. O relatório automático está desligado.");
  const quando =
    frequencia === "diario"
      ? `todo dia às ${config.hora}h`
      : frequencia === "semanal"
        ? `toda ${DIAS_SEMANA[config.semana].toLowerCase()} às ${config.hora}h`
        : `todo dia ${config.mes} às ${config.hora}h`;
  return sucesso(`Pronto: o relatório sai ${quando} (${FUSOS.find((x) => x.valor === fuso)?.rotulo}) para ${destino.map(numeroLegivel).join(", ")}.`);
}

/** Manda o relatório agora (com a IA), sem mudar o agendamento: para testar ou mandar fora de hora. */
export async function enviarRelatorioAgora(_: Estado, f: FormData): Promise<Estado> {
  const r = await empresaDaEquipe(f);
  if (!r) return falha("Cliente não encontrado.");
  if (!ponteConfigurada()) return falha("O WhatsApp da T9 não está configurado.");
  const e = await empresaDoRelatorio(r.empresa.id);
  if (!e) return falha("Cliente não encontrado.");
  const numeros = numerosDoRelatorio(e);
  if (!numeros.length) return falha("Salve o WhatsApp que recebe o relatório antes de enviar.");
  const somenteEquipe = f.get("destino") === "eu";
  const meu = somenteEquipe ? numerosDe(String(f.get("meu_numero") ?? "")) : [];
  if (somenteEquipe && !meu.length) return falha("Digite o seu número para receber a prévia.");

  const { texto, comIa } = await montarRelatorio(e, { comIa: true, atualizar: true });
  const destino = somenteEquipe ? meu : numeros;
  const erros = await enviarParaNumeros(destino, texto);
  await consulta(`insert into envios_automaticos (empresa_id, tipo, chave, destino, texto, ok, erro) values ($1, 'relatorio', $2, $3, $4, $5, $6)`, [
    e.id,
    `manual:${Date.now()}`,
    somenteEquipe ? "equipe" : "cliente",
    texto,
    erros.length < destino.length,
    erros.join("; ").slice(0, 500) || null,
  ]);
  await registrar(r.u.id, r.empresa.id, "relatorio.enviar-agora", somenteEquipe ? "prévia" : "cliente");
  revalidatePath("/painel", "layout");
  if (erros.length === destino.length) return falha(`Não enviei: ${erros.join("; ")}`);
  const ia = comIa ? "" : " (sem a análise da IA: a chave da Anthropic não está configurada ou não respondeu, então foi o comentário automático)";
  return sucesso(`Relatório enviado para ${destino.map(numeroLegivel).join(", ")}${ia}.${erros.length ? ` Falhou: ${erros.join("; ")}` : ""}`);
}

export async function salvarAlertasEquipe(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioAtual();
  if (!u || u.perfil !== "admin") redirect("/painel");
  const bruto = String(f.get("numeros") ?? "").slice(0, 500);
  const numeros = numerosDe(bruto);
  if (bruto.trim() && !numeros.length) return falha("Não reconheci nenhum número.");
  await salvarNumerosDaEquipe(numeros.map((n) => `+${n}`).join(","));
  await registrar(u.id, null, "alertas.equipe");
  revalidatePath("/painel/admin/whatsapp");
  return sucesso(
    numeros.length
      ? `Os alertas vão para ${numeros.map(numeroLegivel).join(", ")}.`
      : "Sem número: os alertas vão por e-mail para os administradores.",
  );
}
