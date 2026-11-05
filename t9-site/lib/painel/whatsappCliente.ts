import "server-only";
import { consulta, umaLinha } from "./db";
import { chamarPonte, ponteConfigurada, type EstadoDaPonte } from "./whatsapp";
import type { Idioma } from "@/lib/i18n";

// WhatsApp do próprio cliente. Ele lê o QR Code no painel (aba WhatsApp) e, com a chamada
// automática ligada, cada lead novo recebe a primeira mensagem saindo do celular do cliente,
// com o texto que ele escolheu. Quem conecta e envia é a mesma ponte do número da T9, numa
// sessão separada por cliente (rotas /clientes/<id>/... da ponte).

export type EstadoCliente = Omit<EstadoDaPonte, "fase"> & { fase: EstadoDaPonte["fase"] | "desligado" };

/** Nome da sessão do cliente na ponte. */
const sessao = (empresaId: number) => `c${empresaId}`;

export async function estadoDoCliente(empresaId: number): Promise<EstadoCliente> {
  const vazio = { qr: "", numero: "", nome: "", desde: "", erro: "" };
  if (!ponteConfigurada()) return { fase: "sem-config", ...vazio };
  try {
    return await chamarPonte<EstadoCliente>(`/clientes/${sessao(empresaId)}/estado`, undefined, 6000);
  } catch (erro) {
    return { fase: "fora", ...vazio, erro: erro instanceof Error ? erro.message : String(erro) };
  }
}

export const conectarCliente = (empresaId: number) => chamarPonte<EstadoCliente>(`/clientes/${sessao(empresaId)}/conectar`, {}, 20_000);
export const desconectarCliente = (empresaId: number) => chamarPonte(`/clientes/${sessao(empresaId)}/sair`, {}, 20_000);

export function enviarPeloCliente(empresaId: number, numero: string, texto: string) {
  return chamarPonte<{ ok: boolean; para: string }>(`/clientes/${sessao(empresaId)}/enviar`, { numero, texto }, 60_000);
}

// ---------- Mensagem ----------

/** Mensagens prontas para o cliente escolher (ele pode editar ou escrever a dele). */
export const MODELOS: Record<Idioma, { id: string; titulo: string; texto: string }[]> = {
  pt: [
    {
      id: "boas-vindas",
      titulo: "Boas-vindas",
      texto: "Oi, {nome}! Tudo bem? Aqui é da {empresa}. Vi que você se cadastrou no nosso anúncio e queria saber como posso te ajudar. 😊",
    },
    {
      id: "horario",
      titulo: "Marcar um horário",
      texto:
        "Olá, {nome}! Aqui é da {empresa}, obrigado pelo seu interesse. Para te atender melhor, qual o melhor dia e horário para conversarmos?",
    },
    {
      id: "direta",
      titulo: "Direto ao ponto",
      texto: "Oi, {nome}, tudo certo? Recebi o seu cadastro aqui na {empresa}. Posso te mandar mais informações por aqui?",
    },
  ],
  en: [
    {
      id: "boas-vindas",
      titulo: "Welcome",
      texto: "Hi {nome}! This is {empresa}. Thanks for reaching out through our ad. How can I help you? 😊",
    },
    {
      id: "horario",
      titulo: "Book a time",
      texto: "Hello {nome}, this is {empresa}. Thanks for your interest! What's the best day and time for a quick call?",
    },
    {
      id: "direta",
      titulo: "Straight to the point",
      texto: "Hi {nome}, we got your request at {empresa}. Can I send you more information here?",
    },
  ],
  es: [
    {
      id: "boas-vindas",
      titulo: "Bienvenida",
      texto: "¡Hola, {nome}! Te escribo de {empresa}. Vi que te registraste en nuestro anuncio, ¿en qué te puedo ayudar? 😊",
    },
    {
      id: "horario",
      titulo: "Agendar un horario",
      texto: "Hola, {nome}, te escribo de {empresa}. ¡Gracias por tu interés! ¿Qué día y horario te queda mejor para conversar?",
    },
    {
      id: "direta",
      titulo: "Directo al punto",
      texto: "Hola, {nome}, recibí tu registro en {empresa}. ¿Te puedo enviar más información por aquí?",
    },
  ],
};

export const mensagemPadrao = (idioma: Idioma) => MODELOS[idioma][0].texto;

/** "Maria da Silva" → "Maria". Sem nome, a saudação fica sem ele ("Oi! Tudo bem?"). */
export function montarMensagem(modelo: string, lead: { nome: string | null }, empresa: string, oferta = "") {
  const primeiro = (lead.nome ?? "").trim().split(/\s+/)[0] ?? "";
  const nome = primeiro ? primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase() : "";
  return modelo
    .replace(/,?\s*\{nome\}/g, (trecho) => (nome ? trecho.replace("{nome}", nome) : ""))
    .replace(/\{empresa\}/g, empresa)
    .replace(/\{(oferta|imovel|imóvel)\}/gi, oferta)
    .trim();
}

/**
 * Número do lead em formato internacional ("+5583999999999"), ou null se não der para saber.
 * Sem "+", vale o país do cliente: 10 ou 11 dígitos no Brasil ganham o 55; 10 dígitos nos EUA ganham o 1.
 */
export function numeroDoLead(bruto: string | null, pais: string) {
  if (!bruto) return null;
  const internacional = /^\s*(\+|00)/.test(bruto);
  const d = bruto.replace(/\D/g, "").replace(/^00/, "");
  if (internacional) return d.length >= 8 && d.length <= 15 ? `+${d}` : null;
  if (pais === "US" || pais === "CA") {
    if (d.length === 10) return `+1${d}`;
    if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  }
  if (d.length === 10 || d.length === 11) return `+55${d}`;
  return d.length >= 12 && d.length <= 15 ? `+${d}` : null;
}

// ---------- Ofertas em divulgação ----------
// Imóvel, produto ou serviço que está nos anúncios, cada um com a própria saudação. Marcando a
// oferta num criativo (aba Criativos), os leads daquele anúncio, ou da campanha dele, recebem a
// saudação da oferta. Sem oferta marcada, vale a saudação geral do cliente.

export type Oferta = { id: number; nome: string; mensagem: string; criativos: number };

export function listarOfertas(empresaId: number) {
  return consulta<Oferta>(
    `select o.id, o.nome, o.mensagem, (select count(*)::int from criativos c where c.oferta_id = o.id) as criativos
       from ofertas o where o.empresa_id = $1 order by o.nome`,
    [empresaId],
  );
}

/** Saudação pronta para uma oferta nova (o cliente edita como quiser). */
export const SAUDACAO_OFERTA: Record<Idioma, string> = {
  pt: "Olá, {nome}, tudo bem? Aqui é da {empresa}. Estou entrando em contato porque vi que você se cadastrou para saber mais sobre {oferta}. Posso te mandar mais informações por aqui?",
  en: "Hi {nome}! This is {empresa}. I'm reaching out because you signed up to learn more about {oferta}. Can I send you more details here?",
  es: "Hola, {nome}, ¿cómo estás? Te escribo de {empresa}. Vi que te registraste para saber más sobre {oferta}. ¿Te puedo enviar más información por aquí?",
};

/**
 * A oferta do lead: a do criativo que contém o anúncio dele ou, sem isso, a de um criativo da
 * mesma campanha (cada campanha costuma ser de uma oferta só). Null se nada estiver marcado.
 */
export async function ofertaDoLead(empresaId: number, lead: { campanha: string | null; anuncio_id: string | null }) {
  if (!lead.campanha && !lead.anuncio_id) return null;
  return umaLinha<{ nome: string; mensagem: string }>(
    `select o.nome, o.mensagem
       from criativos c join ofertas o on o.id = c.oferta_id
      where c.empresa_id = $1
        and (($2::text is not null and coalesce(c.meta_anuncio_ids, '[]'::jsonb) ? $2)
          or ($3::text is not null and exists (select 1 from jsonb_array_elements(coalesce(c.meta_campanhas, '[]'::jsonb)) x where x->>'nome' = $3)))
      order by ($2::text is not null and coalesce(c.meta_anuncio_ids, '[]'::jsonb) ? $2) desc, c.gasto desc nulls last
      limit 1`,
    [empresaId, lead.anuncio_id, lead.campanha],
  );
}

// ---------- Chamada automática ----------

/** A ponte está fora ou o WhatsApp do cliente caiu: o lead volta para a fila e sai na próxima rodada. */
const PASSAGEIRO = /não está conectado|fetch failed|aborted|timeout|ponte respondeu 5|não informou o endereço/i;

/**
 * Manda a primeira mensagem para os leads novos do cliente, pelo WhatsApp dele. Só leads que
 * chegaram depois de ligar a chamada automática e nas últimas 48 horas, uma vez cada.
 */
export async function chamarLeadsNovos(empresaId: number) {
  if (!ponteConfigurada()) return { enviados: 0 };
  const empresa = await umaLinha<{ nome: string; pais: string; idioma: Idioma; wa_cliente_ativo: boolean; wa_cliente_mensagem: string | null }>(
    "select nome, pais, idioma, wa_cliente_ativo, wa_cliente_mensagem from empresas where id = $1",
    [empresaId],
  );
  if (!empresa?.wa_cliente_ativo) return { enviados: 0 };
  const estado = await estadoDoCliente(empresaId);
  if (estado.fase !== "conectado") return { enviados: 0, erro: "o WhatsApp do cliente não está conectado" };

  // Reserva antes de enviar (o webhook e a rotina podem rodar juntos): cada lead sai uma vez só.
  const leads = await consulta<{ id: number; nome: string | null; whatsapp: string | null; campanha: string | null; anuncio_id: string | null }>(
    `update leads set contato_auto_em = now(), contato_auto_erro = null
      where id in (
        select l.id from leads l join empresas e on e.id = l.empresa_id
         where l.empresa_id = $1 and l.contato_auto_em is null and l.whatsapp is not null
           and l.recebido_em > greatest(now() - interval '48 hours', e.wa_cliente_ativado_em)
         order by l.recebido_em limit 15
         for update of l skip locked)
      returning id, nome, whatsapp, campanha, dados->>'anuncio_id' as anuncio_id`,
    [empresaId],
  );
  const modelo = empresa.wa_cliente_mensagem || mensagemPadrao(empresa.idioma);
  let enviados = 0;
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const numero = numeroDoLead(lead.whatsapp, empresa.pais);
    if (!numero) {
      await consulta("update leads set contato_auto_erro = 'número de WhatsApp inválido' where id = $1", [lead.id]);
      continue;
    }
    try {
      const oferta = await ofertaDoLead(empresaId, lead);
      await enviarPeloCliente(empresaId, numero, montarMensagem(oferta?.mensagem ?? modelo, lead, empresa.nome, oferta?.nome));
      if (oferta) await consulta("update leads set contato_auto_oferta = $2 where id = $1", [lead.id, oferta.nome.slice(0, 120)]);
      enviados++;
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      if (PASSAGEIRO.test(mensagem)) {
        // Devolve este e os que ainda não saíram: tentam de novo na próxima rodada.
        await consulta("update leads set contato_auto_em = null where id = any($1::int[])", [leads.slice(i).map((l) => l.id)]);
        return { enviados, erro: mensagem };
      }
      await consulta("update leads set contato_auto_erro = $2 where id = $1", [lead.id, mensagem.slice(0, 300)]);
    }
  }
  return { enviados };
}

/** Todos os clientes com a chamada automática ligada (usado pela rotina da ponte). */
export async function chamarTodos() {
  const empresas = await consulta<{ id: number; nome: string }>("select id, nome from empresas where wa_cliente_ativo order by id");
  const resultado: { empresa: string; enviados: number; erro?: string }[] = [];
  for (const e of empresas) {
    const r = await chamarLeadsNovos(e.id).catch((erro) => ({ enviados: 0, erro: erro instanceof Error ? erro.message : String(erro) }));
    resultado.push({ empresa: e.nome, ...r });
  }
  return resultado;
}

export type ContatoAuto = {
  id: number;
  nome: string | null;
  whatsapp: string | null;
  recebido_em: string;
  contato_auto_em: string | null;
  contato_auto_erro: string | null;
  contato_auto_oferta: string | null;
};

/** Últimos leads e como foi a primeira mensagem de cada um (para o cliente acompanhar). */
export function ultimosContatos(empresaId: number, limite = 10) {
  return consulta<ContatoAuto>(
    `select l.id, l.nome, l.whatsapp, l.recebido_em, l.contato_auto_em, l.contato_auto_erro, l.contato_auto_oferta
       from leads l join empresas e on e.id = l.empresa_id
      where l.empresa_id = $1 and e.wa_cliente_ativado_em is not null and l.recebido_em > e.wa_cliente_ativado_em
      order by l.recebido_em desc limit $2`,
    [empresaId, limite],
  );
}
