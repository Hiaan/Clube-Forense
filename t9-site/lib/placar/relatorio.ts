import "server-only";
import type { Totais } from "@/lib/painel/dados";
import { hoje, somarDias } from "@/lib/painel/dados";
import { emailComBotao, enviarEmail } from "@/lib/painel/email";
import { situacaoDaConta } from "@/lib/painel/meta";
import { numerosDe, ponteConfigurada } from "@/lib/painel/whatsapp";
import {
  agoraNoFuso,
  comentarioDaIa,
  comentarioPorRegras,
  periodoDoRelatorio,
  relatorioDevido,
  textoDoRelatorio,
  type DadosRelatorio,
  type Frequencia,
} from "@/lib/painel/relatorioWhatsapp";
import { avaliarQueda, problemasDaConta, type Problema, type SomaPeriodo } from "@/lib/painel/alertasConta";
import { q, uma, type Agencia, type Cliente } from "./banco";
import { acessoDe, endereco } from "./conta";
import { sincronizarCliente, tokenDaAgencia } from "./meta";
import { enviarParaTodos } from "./whatsapp";

// Relatórios e alertas do Placar: o mesmo motor do painel T9 (texto, IA, regras de alerta),
// com os dados e o WhatsApp de cada agência.

const SOMAS = `coalesce(sum(gasto), 0) as gasto, coalesce(sum(impressoes), 0) as impressoes, coalesce(sum(cliques), 0) as cliques,
  coalesce(sum(leads), 0) as leads, coalesce(sum(conversoes), 0) as conversoes, coalesce(sum(receita), 0) as receita`;

export const totaisDoCliente = async (id: number, inicio: string, fim: string) =>
  (await uma<Totais>(`select ${SOMAS} from placar.metricas where cliente_id = $1 and data between $2 and $3`, [id, inicio, fim]))!;

export const campanhasDoCliente = (id: number, inicio: string, fim: string) =>
  q<Totais & { campanha: string }>(
    `select campanha, ${SOMAS} from placar.metricas where cliente_id = $1 and data between $2 and $3 group by campanha order by sum(gasto) desc, campanha`,
    [id, inicio, fim],
  );

export const serieDoCliente = (id: number, inicio: string, fim: string) =>
  q<Totais & { data: string }>(`select data, ${SOMAS} from placar.metricas where cliente_id = $1 and data between $2 and $3 group by data order by data`, [
    id,
    inicio,
    fim,
  ]);

export async function dadosDoCliente(c: Cliente, frequencia: Frequencia, hojeLocal: string): Promise<DadosRelatorio> {
  const periodo = periodoDoRelatorio(frequencia, hojeLocal);
  const [atual, anterior, lista, mes] = await Promise.all([
    totaisDoCliente(c.id, periodo.inicio, periodo.fim),
    totaisDoCliente(c.id, periodo.antInicio, periodo.antFim),
    campanhasDoCliente(c.id, periodo.inicio, periodo.fim),
    totaisDoCliente(c.id, `${periodo.fim.slice(0, 7)}-01`, periodo.fim),
  ]);
  return { periodo, atual, anterior, campanhas: lista.filter((x) => x.gasto > 0).slice(0, 8), mes };
}

export const linkDoPainel = (c: Pick<Cliente, "token">) => `${endereco()}/c/${c.token}`;

const RODAPE = { pt: (a: string) => `Relatório automático de ${a}`, en: (a: string) => `Automatic report by ${a}`, es: (a: string) => `Informe automático de ${a}` };

export async function montarRelatorio(c: Cliente, agencia: Agencia, opcoes: { comIa?: boolean; atualizar?: boolean } = {}) {
  if (opcoes.atualizar && c.meta_conta) await sincronizarCliente(c, 3).catch(() => undefined);
  const d = await dadosDoCliente(c, c.rel_frequencia, agoraNoFuso(c.rel_fuso).data);
  const ia = opcoes.comIa && c.rel_ia && d.atual.gasto > 0 ? await comentarioDaIa(c, d, c.rel_frequencia) : null;
  const texto = textoDoRelatorio(c, c.rel_frequencia, d, ia ?? comentarioPorRegras(c, d), { link: linkDoPainel(c), rodape: RODAPE[c.idioma](agencia.nome) });
  return { texto, comIa: Boolean(ia) };
}

type ClienteComAgencia = Cliente & { ag: Agencia };

async function clientesAtivos(condicao: string) {
  const linhas = await q<Cliente & { ag: Agencia }>(
    `select c.*, row_to_json(a.*) as ag from placar.clientes c join placar.agencias a on a.id = c.agencia_id where ${condicao}`,
  );
  // Agência sem acesso (teste acabou, sem pagamento): nada sai em nome dela.
  return linhas.filter((c) => acessoDe(c.ag).liberado) as ClienteComAgencia[];
}

/** Relatórios que estão na hora (um por cliente por dia, com nova tentativa por até 6 horas). */
export async function enviarRelatoriosDevidos(prazoMs = 40_000) {
  if (!ponteConfigurada()) return [];
  const inicio = Date.now();
  const resultado: { cliente: string; ok: boolean; erro?: string }[] = [];
  for (const c of await clientesAtivos("c.rel_ativo")) {
    if (Date.now() - inicio > prazoMs) break;
    if (!relatorioDevido(c)) continue;
    const numeros = numerosDe(c.whatsapp);
    if (!numeros.length) continue;
    const chave = `rel:${agoraNoFuso(c.rel_fuso).data}`;
    let envio = await uma<{ id: number; texto: string }>(
      `update placar.envios set ok = null where cliente_id = $1 and chave = $2 and ok = false and criado_em > now() - interval '6 hours' returning id, texto`,
      [c.id, chave],
    );
    if (!envio) {
      if (await uma("select 1 from placar.envios where cliente_id = $1 and chave = $2", [c.id, chave])) {
        await q("update placar.clientes set rel_ultimo_em = now() where id = $1", [c.id]);
        continue;
      }
      const { texto } = await montarRelatorio(c, c.ag, { comIa: true, atualizar: true });
      envio = await uma<{ id: number; texto: string }>(
        `insert into placar.envios (cliente_id, tipo, chave, destino, texto) values ($1, 'relatorio', $2, 'cliente', $3)
         on conflict (cliente_id, chave) do nothing returning id, texto`,
        [c.id, chave, texto],
      );
      if (!envio) continue;
    }
    const erros = await enviarParaTodos(c.agencia_id, numeros, envio.texto);
    const ok = erros.length < numeros.length;
    await q("update placar.envios set ok = $2, erro = $3 where id = $1", [envio.id, ok, erros.join("; ").slice(0, 500) || null]);
    if (ok) await q("update placar.clientes set rel_ultimo_em = now() where id = $1", [c.id]);
    resultado.push({ cliente: c.nome, ok, erro: erros.join("; ") || undefined });
  }
  return resultado;
}

/** Mantém os números do painel frescos: até 4 clientes por rodada, cada um a cada 3 horas. */
export async function sincronizarPendentes(prazoMs = 30_000) {
  const inicio = Date.now();
  const lista = (await clientesAtivos("c.meta_conta is not null and (c.sincronizado_em is null or c.sincronizado_em < now() - interval '3 hours')")).slice(0, 4);
  let feitos = 0;
  for (const c of lista) {
    if (Date.now() - inicio > prazoMs) break;
    await sincronizarCliente(c, c.sincronizado_em ? 7 : 60).then(() => feitos++, () => undefined);
  }
  return feitos;
}

const AVISO = {
  pt: { titulo: "Aviso", rodape: (a: string) => `Mensagem automática de ${a}` },
  en: { titulo: "Notice", rodape: (a: string) => `Automatic message from ${a}` },
  es: { titulo: "Aviso", rodape: (a: string) => `Mensaje automático de ${a}` },
};

async function dispararAlerta(c: ClienteComAgencia, p: Problema, dia: string) {
  const textoEquipe = `${p.nivel === "alto" ? "🚨" : "⚠️"} *Alerta* — ${c.nome}\n\n${p.equipe}\n\n${endereco()}/app/clientes/${c.id}`;
  const novo = await uma<{ id: number }>(
    `insert into placar.envios (cliente_id, tipo, chave, destino, texto) values ($1, 'alerta', $2, 'equipe', $3)
     on conflict (cliente_id, chave) do nothing returning id`,
    [c.id, `alerta:${p.tipo}:${dia}`, textoEquipe],
  );
  if (!novo) return false;
  const equipe = numerosDe(c.ag.alertas_numeros);
  let erros: string[] = [];
  if (equipe.length && c.ag.wa_numero) {
    erros = await enviarParaTodos(c.agencia_id, equipe, textoEquipe);
  } else {
    const pessoas = await q<{ email: string }>("select email from placar.usuarios where agencia_id = $1", [c.agencia_id]);
    for (const u of pessoas)
      await enviarEmail({
        para: u.email,
        assunto: `Alerta: ${c.nome}`,
        texto: `${p.equipe}\n\n${endereco()}/app/clientes/${c.id}`,
        html: emailComBotao({ titulo: `Alerta: ${c.nome}`, texto: p.equipe, botao: "Abrir no Placar", link: `${endereco()}/app/clientes/${c.id}`, rodape: "Alerta automático do Placar." }),
      }).catch((e) => erros.push(String(e)));
  }
  await q("update placar.envios set ok = $2, erro = $3 where id = $1", [novo.id, erros.length === 0, erros.join("; ").slice(0, 500) || null]);

  const numerosCliente = numerosDe(c.whatsapp);
  if (p.cliente && c.alertas_cliente && numerosCliente.length && c.ag.wa_numero) {
    const a = AVISO[c.idioma];
    const texto = `⚠️ *${a.titulo}* — ${c.nome}\n\n${p.cliente[c.idioma]}\n\n_${a.rodape(c.ag.nome)}_`;
    const linha = await uma<{ id: number }>(
      `insert into placar.envios (cliente_id, tipo, chave, destino, texto) values ($1, 'alerta', $2, 'cliente', $3)
       on conflict (cliente_id, chave) do nothing returning id`,
      [c.id, `alerta:${p.tipo}:${dia}:cliente`, texto],
    );
    if (linha) {
      const e2 = await enviarParaTodos(c.agencia_id, numerosCliente, texto);
      await q("update placar.envios set ok = $2, erro = $3 where id = $1", [linha.id, e2.length < numerosCliente.length, e2.join("; ").slice(0, 500) || null]);
    }
  }
  return true;
}

/** Contas de anúncio (a cada 30 minutos) e queda de desempenho (uma vez por dia, depois das 10h). */
export async function verificarAlertas(prazoMs = 25_000) {
  const inicio = Date.now();
  const dia = hoje();
  let disparados = 0;
  const contas = await clientesAtivos("c.meta_conta is not null and (c.conta_checada_em is null or c.conta_checada_em < now() - interval '30 minutes')");
  for (const c of contas.slice(0, 15)) {
    if (Date.now() - inicio > prazoMs) break;
    const token = tokenDaAgencia(c.ag);
    if (!token) continue;
    try {
      const s = await situacaoDaConta(c.meta_conta!, token);
      const media = await totaisDoCliente(c.id, somarDias(dia, -7), somarDias(dia, -1));
      const problemas = problemasDaConta(s, media.gasto / 7, c.idioma);
      await q("update placar.clientes set conta_checada_em = now(), conta_alerta = $2 where id = $1", [c.id, problemas.map((p) => p.equipe).join(" ") || null]);
      for (const p of problemas) if (await dispararAlerta(c, p, dia)) disparados++;
    } catch {
      await q("update placar.clientes set conta_checada_em = now() where id = $1", [c.id]);
    }
  }

  const hora = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
  const feito = await uma<{ valor: string }>("select valor from placar.ajustes where chave = 'queda_dia'");
  if (hora >= 10 && feito?.valor !== dia) {
    await q(
      `insert into placar.ajustes (chave, valor, atualizado_em) values ('queda_dia', $1, now()) on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`,
      [dia],
    );
    const fim = somarDias(dia, -1);
    for (const c of await clientesAtivos("c.meta_conta is not null")) {
      const soma = (a: string, b: string) => totaisDoCliente(c.id, a, b) as Promise<SomaPeriodo>;
      const p = avaliarQueda(c, await soma(somarDias(fim, -2), fim), await soma(somarDias(fim, -16), somarDias(fim, -3)));
      if (p && (await dispararAlerta(c, p, dia))) disparados++;
    }
  }
  return disparados;
}

/** Chamado pela rotina da ponte (a cada 5 minutos). */
export async function rotinaDoPlacar() {
  const sincronizados = await sincronizarPendentes().catch(() => 0);
  const relatorios = await enviarRelatoriosDevidos().catch((e) => [{ cliente: "-", ok: false, erro: String(e) }]);
  const alertas = await verificarAlertas().catch(() => 0);
  return { sincronizados, relatorios: relatorios.length, alertas };
}

export function enviosDoCliente(clienteId: number, limite = 8) {
  return q<{ id: number; tipo: string; destino: string; ok: boolean | null; erro: string | null; criado_em: string }>(
    "select id, tipo, destino, ok, erro, criado_em from placar.envios where cliente_id = $1 order by criado_em desc limit $2",
    [clienteId, limite],
  );
}
