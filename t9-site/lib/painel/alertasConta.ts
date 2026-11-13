import "server-only";
import type { Idioma } from "@/lib/i18n";
import type { Empresa } from "./auth";
import { consulta, umaLinha } from "./db";
import { hoje, somarDias } from "./dados";
import { emailComBotao, enviarEmail } from "./email";
import { dinheiro } from "./formato";
import { metaConfigurado, situacaoDaConta } from "./meta";
import { enviarParaNumeros, numerosDoRelatorio } from "./relatorioWhatsapp";
import { numerosDe, ponteConfigurada } from "./whatsapp";

// Alertas da conta de anúncios: pagamento recusado, conta bloqueada, saldo ou limite acabando
// e queda de desempenho. Vão para o WhatsApp da equipe (ou por e-mail, sem número cadastrado) e,
// se o cliente quiser, os de pagamento e saldo também para ele. Cada alerta sai uma vez por dia.

const CHAVE_NUMEROS = "alertas_equipe_numeros";
const MINUTOS_ENTRE_CHECAGENS = 30;

export async function numerosDaEquipe() {
  const linha = await umaLinha<{ valor: string }>("select valor from ajustes where chave = $1", [CHAVE_NUMEROS]);
  return linha?.valor ?? "";
}

export async function salvarNumerosDaEquipe(texto: string) {
  await consulta(
    `insert into ajustes (chave, valor, atualizado_em) values ($1, $2, now())
     on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`,
    [CHAVE_NUMEROS, texto],
  );
}

export type Problema = {
  tipo: string;
  nivel: "alto" | "medio";
  /** Texto para a equipe. */
  equipe: string;
  /** Texto para o cliente (só nos alertas que ele pode resolver ou precisa saber). */
  cliente?: Record<Idioma, string>;
};

const COBRANCA = {
  pt: "no Gerenciador de Anúncios, em Cobrança e pagamentos",
  en: "in Ads Manager, under Billing & payments",
  es: "en el Administrador de anuncios, en Facturación y pagos",
};

/** O que há de errado na conta, pelo status da Meta, pelo saldo e pelo limite de gastos. */
export function problemasDaConta(
  s: { status: number; moeda: string; saldo: number | null; limiteRestante: number | null },
  mediaDiaria: number,
  idioma: Idioma,
): Problema[] {
  const lista: Problema[] = [];
  if (s.status === 3)
    lista.push({
      tipo: "pagamento",
      nivel: "alto",
      equipe: "Pagamento não aprovado na conta de anúncios: há valor em aberto e os anúncios ficam parados até o pagamento.",
      cliente: {
        pt: `O pagamento da conta de anúncios (Facebook e Instagram) não foi aprovado e os anúncios estão parados. Confira o cartão ou faça o pagamento ${COBRANCA.pt}.`,
        en: `The ad account payment (Facebook and Instagram) was declined and the ads are paused. Check the card or make the payment ${COBRANCA.en}.`,
        es: `El pago de la cuenta publicitaria (Facebook e Instagram) no fue aprobado y los anuncios están pausados. Revisa la tarjeta o haz el pago ${COBRANCA.es}.`,
      },
    });
  if (s.status === 9)
    lista.push({
      tipo: "carencia",
      nivel: "alto",
      equipe: "Conta em período de carência: a última cobrança falhou e os anúncios podem parar.",
      cliente: {
        pt: `A última cobrança da conta de anúncios falhou. Para os anúncios não pararem, atualize a forma de pagamento ${COBRANCA.pt}.`,
        en: `The last ad account charge failed. To keep the ads running, update the payment method ${COBRANCA.en}.`,
        es: `El último cobro de la cuenta publicitaria falló. Para que los anuncios no se detengan, actualiza el método de pago ${COBRANCA.es}.`,
      },
    });
  if (s.status === 2)
    lista.push({
      tipo: "desativada",
      nivel: "alto",
      equipe: "Conta de anúncios desativada pela Meta. Verificar o motivo e pedir revisão.",
      cliente: {
        pt: "A Meta desativou a conta de anúncios. Já estamos verificando o motivo e cuidando da revisão.",
        en: "Meta disabled the ad account. We are already checking the reason and requesting a review.",
        es: "Meta desactivó la cuenta publicitaria. Ya estamos revisando el motivo y solicitando la revisión.",
      },
    });
  if (s.status === 7)
    lista.push({ tipo: "analise", nivel: "alto", equipe: "Conta de anúncios em análise de risco pela Meta: os anúncios podem não rodar." });
  if (s.status === 100 || s.status === 101)
    lista.push({ tipo: "encerrada", nivel: "alto", equipe: "Conta de anúncios encerrada (ou em encerramento) na Meta." });

  const dias = (valor: number) => (mediaDiaria > 0 ? valor / mediaDiaria : Infinity);
  const din = (v: number) => dinheiro(v, s.moeda, idioma);
  if (s.saldo !== null && mediaDiaria > 0 && dias(s.saldo) < 3) {
    const d = Math.max(0, Math.floor(dias(s.saldo)));
    const quanto = {
      pt: d < 1 ? "não dá para um dia" : `dá para cerca de ${d} dia(s)`,
      en: d < 1 ? "won't last a day" : `lasts about ${d} day(s)`,
      es: d < 1 ? "no alcanza para un día" : `alcanza para unos ${d} día(s)`,
    };
    lista.push({
      tipo: "saldo",
      nivel: d < 1 ? "alto" : "medio",
      equipe: `Saldo da conta de anúncios: ${din(s.saldo)}, ${quanto.pt} no ritmo atual (${din(mediaDiaria)} por dia).`,
      cliente: {
        pt: `O saldo da conta de anúncios está em ${din(s.saldo)} e ${quanto.pt}. Para os anúncios não pararem, adicione saldo ${COBRANCA.pt}.`,
        en: `The ad account balance is ${din(s.saldo)} and ${quanto.en}. To keep the ads running, add funds ${COBRANCA.en}.`,
        es: `El saldo de la cuenta publicitaria es ${din(s.saldo)} y ${quanto.es}. Para que los anuncios no se detengan, agrega saldo ${COBRANCA.es}.`,
      },
    });
  }
  if (s.limiteRestante !== null && mediaDiaria > 0 && dias(s.limiteRestante) < 3) {
    lista.push({
      tipo: "limite",
      nivel: dias(s.limiteRestante) < 1 ? "alto" : "medio",
      equipe: `Limite de gastos da conta quase no fim: faltam ${din(s.limiteRestante)} (${din(mediaDiaria)} por dia). Ajustar o limite no Gerenciador.`,
    });
  }
  return lista;
}

/** Queda de desempenho: últimos 3 dias completos contra os 14 anteriores. */
export async function quedaDeDesempenho(e: Pick<Empresa, "id" | "tipo" | "moeda" | "idioma">, ref = hoje()): Promise<Problema | null> {
  const fim = somarDias(ref, -1);
  const soma = (inicio: string, ate: string) =>
    umaLinha<{ gasto: number; leads: number; conversoes: number; receita: number }>(
      `select coalesce(sum(gasto), 0) as gasto, coalesce(sum(leads), 0) as leads, coalesce(sum(conversoes), 0) as conversoes,
              coalesce(sum(receita), 0) as receita from metricas where empresa_id = $1 and data between $2 and $3`,
      [e.id, inicio, ate],
    );
  const [r3, r14] = await Promise.all([soma(somarDias(fim, -2), fim), soma(somarDias(fim, -16), somarDias(fim, -3))]);
  return avaliarQueda(e, r3, r14);
}

export type SomaPeriodo = { gasto: number; leads: number; conversoes: number; receita: number };

/** A regra da queda (sem banco): `r3` = últimos 3 dias completos, `r14` = os 14 dias antes deles. */
export function avaliarQueda(e: Pick<Empresa, "tipo" | "moeda" | "idioma">, r3: SomaPeriodo | null, r14: SomaPeriodo | null): Problema | null {
  if (!r3 || !r14 || r3.gasto <= 0 || r14.gasto <= 0) return null;
  const din = (v: number) => dinheiro(v, e.moeda, e.idioma);

  if (e.tipo === "ecommerce") {
    if (r14.conversoes < 3 || r14.receita <= 0) return null;
    const roas3 = r3.receita / r3.gasto;
    const roas14 = r14.receita / r14.gasto;
    if (roas3 >= roas14 * 0.6) return null;
    return {
      tipo: "queda",
      nivel: "medio",
      equipe: `Retorno dos últimos 3 dias em ${roas3.toFixed(2)}, contra ${roas14.toFixed(2)} nas 2 semanas anteriores.`,
    };
  }
  if (r14.leads < 5) return null;
  const cpl14 = r14.gasto / r14.leads;
  if (r3.leads === 0) {
    if (r3.gasto < cpl14 * 2) return null;
    return {
      tipo: "queda",
      nivel: "alto",
      equipe: `Nenhum lead nos últimos 3 dias, com ${din(r3.gasto)} investidos (antes, ${din(cpl14)} por lead).`,
    };
  }
  const cpl3 = r3.gasto / r3.leads;
  if (cpl3 <= cpl14 * 1.5) return null;
  return {
    tipo: "queda",
    nivel: "medio",
    equipe: `Custo por lead dos últimos 3 dias em ${din(cpl3)}, ${Math.round((cpl3 / cpl14 - 1) * 100)}% acima das 2 semanas anteriores (${din(cpl14)}).`,
  };
}

const endereco = () => (process.env.PAINEL_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://t9company.com.br").replace(/\/$/, "");

const AVISO_CLIENTE: Record<Idioma, { titulo: string; rodape: string }> = {
  pt: { titulo: "Aviso da T9", rodape: "Mensagem automática da T9" },
  en: { titulo: "Notice from T9", rodape: "Automatic message from T9" },
  es: { titulo: "Aviso de T9", rodape: "Mensaje automático de T9" },
};

type EmpresaAlerta = Pick<
  Empresa,
  "id" | "slug" | "nome" | "tipo" | "moeda" | "idioma" | "meta_conta" | "rel_numeros" | "whatsapp_leads" | "alertas_cliente"
>;

/** Registra e manda um alerta (uma vez por dia por tipo). */
async function dispararAlerta(e: EmpresaAlerta, p: Problema, dia: string) {
  const enviados: string[] = [];
  const equipeTexto = `${p.nivel === "alto" ? "🚨" : "⚠️"} *Alerta* — ${e.nome}\n\n${p.equipe}\n\nPainel: ${endereco()}/painel/admin/${e.slug}`;
  const novo = await umaLinha<{ id: number }>(
    `insert into envios_automaticos (empresa_id, tipo, chave, destino, texto) values ($1, 'alerta', $2, 'equipe', $3)
     on conflict (empresa_id, chave) do nothing returning id`,
    [e.id, `alerta:${p.tipo}:${dia}`, equipeTexto],
  );
  if (!novo) return enviados;

  const equipe = numerosDe(await numerosDaEquipe());
  let erros: string[] = [];
  if (equipe.length && ponteConfigurada()) {
    erros = await enviarParaNumeros(equipe, equipeTexto);
  } else {
    // Sem número da equipe: o alerta vai por e-mail para os administradores.
    const admins = await consulta<{ email: string }>("select email from usuarios where perfil = 'admin'");
    for (const a of admins) {
      await enviarEmail({
        para: a.email,
        assunto: `Alerta: ${e.nome}`,
        texto: `${p.equipe}\n\n${endereco()}/painel/admin/${e.slug}`,
        html: emailComBotao({
          titulo: `Alerta: ${e.nome}`,
          texto: p.equipe,
          botao: "Abrir no painel",
          link: `${endereco()}/painel/admin/${e.slug}`,
          rodape: "Alerta automático do painel T9.",
        }),
      }).catch((x) => erros.push(String(x)));
    }
  }
  await consulta("update envios_automaticos set ok = $2, erro = $3 where id = $1", [
    novo.id,
    erros.length === 0,
    erros.join("; ").slice(0, 500) || null,
  ]);
  enviados.push("equipe");

  const numerosCliente = numerosDoRelatorio(e);
  if (p.cliente && e.alertas_cliente && numerosCliente.length && ponteConfigurada()) {
    const a = AVISO_CLIENTE[e.idioma];
    const texto = `⚠️ *${a.titulo}* — ${e.nome}\n\n${p.cliente[e.idioma]}\n\n_${a.rodape}_`;
    const linha = await umaLinha<{ id: number }>(
      `insert into envios_automaticos (empresa_id, tipo, chave, destino, texto) values ($1, 'alerta', $2, 'cliente', $3)
       on conflict (empresa_id, chave) do nothing returning id`,
      [e.id, `alerta:${p.tipo}:${dia}:cliente`, texto],
    );
    if (linha) {
      const errosCliente = await enviarParaNumeros(numerosCliente, texto);
      await consulta("update envios_automaticos set ok = $2, erro = $3 where id = $1", [
        linha.id,
        errosCliente.length < numerosCliente.length,
        errosCliente.join("; ").slice(0, 500) || null,
      ]);
      enviados.push("cliente");
    }
  }
  return enviados;
}

/** Média de investimento por dia nos últimos 7 dias completos. */
async function mediaDiaria(empresaId: number, ref: string) {
  const r = await umaLinha<{ gasto: number }>(
    "select coalesce(sum(gasto), 0) as gasto from metricas where empresa_id = $1 and data between $2 and $3",
    [empresaId, somarDias(ref, -7), somarDias(ref, -1)],
  );
  return (r?.gasto ?? 0) / 7;
}

const COLUNAS = "id, slug, nome, tipo, moeda, idioma, meta_conta, rel_numeros, whatsapp_leads, alertas_cliente";

/** Chamado pela rotina: confere as contas que não foram vistas nos últimos 30 minutos e a queda de desempenho (uma vez por dia). */
export async function verificarAlertas(prazoMs = 40_000) {
  const inicio = Date.now();
  const dia = hoje();
  const resultado: { empresa: string; alertas: string[]; erro?: string }[] = [];

  if (metaConfigurado()) {
    const contas = await consulta<EmpresaAlerta>(
      `select ${COLUNAS} from empresas
        where meta_conta is not null and (meta_conta_checada_em is null or meta_conta_checada_em < now() - make_interval(mins => $1))
        order by meta_conta_checada_em nulls first limit 15`,
      [MINUTOS_ENTRE_CHECAGENS],
    );
    for (const e of contas) {
      if (Date.now() - inicio > prazoMs) break;
      try {
        const situacao = await situacaoDaConta(e.meta_conta!);
        const problemas = problemasDaConta(situacao, await mediaDiaria(e.id, dia), e.idioma);
        await consulta("update empresas set meta_conta_checada_em = now(), meta_conta_alerta = $2 where id = $1", [
          e.id,
          problemas.map((p) => p.equipe).join(" ") || null,
        ]);
        const alertas: string[] = [];
        for (const p of problemas) if ((await dispararAlerta(e, p, dia)).length) alertas.push(p.tipo);
        if (alertas.length) resultado.push({ empresa: e.nome, alertas });
      } catch (erro) {
        // Sem permissão para ler a conta ou Meta fora do ar: tenta de novo na próxima janela, sem alarde.
        await consulta("update empresas set meta_conta_checada_em = now() where id = $1", [e.id]);
        resultado.push({ empresa: e.nome, alertas: [], erro: erro instanceof Error ? erro.message : String(erro) });
      }
    }
  }

  // Queda de desempenho: uma vez por dia, a partir das 10h de Brasília (depois da sincronização da madrugada).
  const horaBrasilia = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", hourCycle: "h23" }).format(new Date()),
  );
  const feito = await umaLinha<{ valor: string }>("select valor from ajustes where chave = 'alertas_desempenho_dia'");
  if (horaBrasilia >= 10 && feito?.valor !== dia) {
    await consulta(
      `insert into ajustes (chave, valor, atualizado_em) values ('alertas_desempenho_dia', $1, now())
       on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`,
      [dia],
    );
    const empresas = await consulta<EmpresaAlerta>(
      `select ${COLUNAS} from empresas where exists (select 1 from metricas m where m.empresa_id = empresas.id and m.data >= $1)`,
      [somarDias(dia, -3)],
    );
    for (const e of empresas) {
      const p = await quedaDeDesempenho(e, dia).catch(() => null);
      if (p && (await dispararAlerta(e, p, dia)).length) resultado.push({ empresa: e.nome, alertas: [p.tipo] });
    }
  }
  return resultado;
}
