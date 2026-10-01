import "server-only";
import { consulta } from "./db";
import { alertasDe, carteira } from "./dados";
import { enviarEmail } from "./email";
import { dinheiro, numero, razao } from "./formato";
import type { Usuario } from "./auth";

// Toda segunda de manhã, cada pessoa da equipe recebe a situação dos clientes dela:
// investimento e resultado dos últimos 7 dias e os alertas da carteira.

const escapar = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function enviarResumoSemanal() {
  const base = (process.env.PAINEL_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://t9company.com.br").replace(/\/$/, "");
  const equipe = await consulta<Usuario>("select id, email, nome, perfil, idioma from usuarios where perfil in ('admin', 'gestor')");
  let enviados = 0;

  for (const pessoa of equipe) {
    const linhas = (await carteira(pessoa)).filter((e) => e.slug !== "t9").map((e) => ({ ...e, alertas: alertasDe(e) }));
    if (!linhas.length) continue;
    linhas.sort((a, b) => b.alertas.length - a.alertas.length);
    const comAlerta = linhas.filter((l) => l.alertas.length).length;

    const tabela = linhas
      .map((e) => {
        const $ = (v: number | null) => dinheiro(v, e.moeda, "pt");
        const resultado = e.tipo === "ecommerce" ? `${numero(e.c7, "pt")} vendas` : `${numero(e.l7, "pt")} leads`;
        const eficiencia = e.tipo === "ecommerce" ? (razao(e.r7, e.g7) == null ? "—" : `ROAS ${numero(razao(e.r7, e.g7), "pt", 2)}x`) : `CPL ${$(razao(e.g7, e.l7))}`;
        const alertas = e.alertas.length
          ? e.alertas.map((a) => `<span style="color:${a.nivel === "alto" ? "#c40d16" : "#a36200"}">• ${escapar(a.texto)}</span>`).join("<br>")
          : '<span style="color:#1d8a4e">Tudo certo</span>';
        return `<tr>
<td style="padding:10px 8px;border-top:1px solid #eee"><a href="${base}/painel/admin/${e.slug}" style="color:#0b0b0b;font-weight:700;text-decoration:none">${escapar(e.nome)}</a></td>
<td style="padding:10px 8px;border-top:1px solid #eee;text-align:right">${$(e.g7)}</td>
<td style="padding:10px 8px;border-top:1px solid #eee;text-align:right">${resultado}<br><span style="color:#8a8080;font-size:12px">${eficiencia}</span></td>
<td style="padding:10px 8px;border-top:1px solid #eee;font-size:13px">${alertas}</td></tr>`;
      })
      .join("");

    const html = `<!doctype html><html><body style="margin:0;background:#f6f3f3;font-family:Arial,Helvetica,sans-serif;color:#0b0b0b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 8px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#7c0409;padding:18px 24px;color:#fff;font-weight:800;font-size:18px">T9 ADS Company · Resumo da semana</td></tr>
<tr><td style="padding:24px">
<p style="margin:0 0 16px;font-size:15px">Olá${pessoa.nome ? `, ${escapar(pessoa.nome.split(" ")[0])}` : ""}! Últimos 7 dias da sua carteira: <b>${linhas.length} cliente(s)</b>, <b>${comAlerta}</b> com pontos de atenção.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse">
<tr style="color:#8a8080;font-size:11px;text-transform:uppercase"><th align="left" style="padding:6px 8px">Cliente</th><th align="right" style="padding:6px 8px">Invest. 7d</th><th align="right" style="padding:6px 8px">Resultado</th><th align="left" style="padding:6px 8px">Atenção</th></tr>
${tabela}</table>
<p style="margin:24px 0 0"><a href="${base}/painel/admin" style="display:inline-block;background:#e3121c;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">Abrir a carteira</a></p>
</td></tr></table></td></tr></table></body></html>`;

    const texto = linhas
      .map((e) => `${e.nome}: ${dinheiro(e.g7, e.moeda, "pt")} em 7 dias${e.alertas.length ? ` — ${e.alertas.map((a) => a.texto).join("; ")}` : ""}`)
      .join("\n");

    try {
      await enviarEmail({ para: pessoa.email, assunto: `Resumo da semana: ${comAlerta} cliente(s) pedem atenção`, html, texto: `${texto}\n\n${base}/painel/admin` });
      enviados++;
    } catch (erro) {
      console.error("[painel] resumo semanal para", pessoa.email, erro);
    }
  }
  return enviados;
}
