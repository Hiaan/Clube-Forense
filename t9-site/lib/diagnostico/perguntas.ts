// Perguntas do diagnóstico gratuito da T9. O caminho muda conforme as respostas:
// quem não anuncia não vê perguntas sobre agência, quem está insatisfeito diz por quê.
// Este arquivo roda no navegador (assistente) e no servidor (regras e validação).

import { FAIXAS_FATURAMENTO } from "@/lib/agenda";

export type Respostas = Record<string, string | string[]>;

export type Pergunta = {
  id: string;
  titulo: string;
  ajuda?: string;
  tipo: "unica" | "multipla" | "texto";
  opcoes?: { valor: string; rotulo: string }[];
  /** Texto: pode ficar em branco. */
  opcional?: boolean;
  placeholder?: string;
  /** Só aparece quando a condição for verdadeira. */
  mostrar?: (r: Respostas) => boolean;
};

const op = (...pares: [string, string][]) => pares.map(([valor, rotulo]) => ({ valor, rotulo }));
const um = (r: Respostas, id: string) => (typeof r[id] === "string" ? (r[id] as string) : "");

export const anuncia = (r: Respostas) => um(r, "anuncia") === "sim";
const insatisfeito = (r: Respostas) => anuncia(r) && ["mais_ou_menos", "nao"].includes(um(r, "satisfeito"));
const terceirizado = (r: Respostas) => anuncia(r) && ["agencia", "freelancer"].includes(um(r, "quem_faz"));
const temInstagram = (r: Respostas) => um(r, "posts") !== "sem_perfil";

export const PERGUNTAS: Pergunta[] = [
  { id: "empresa", titulo: "Qual o nome da sua empresa?", tipo: "texto", placeholder: "Ex.: Clínica Bem-Estar" },
  {
    id: "nicho",
    titulo: "Em qual área ela atua?",
    tipo: "unica",
    opcoes: op(
      ["saude", "Saúde e estética"],
      ["imoveis", "Imóveis"],
      ["alimentacao", "Alimentação e eventos"],
      ["varejo", "Loja / varejo"],
      ["servicos", "Serviços locais (reformas, limpeza, oficina...)"],
      ["educacao", "Cursos e educação"],
      ["profissional", "Advocacia, contabilidade, consultoria"],
      ["outro", "Outra área"],
    ),
  },
  { id: "nicho_outro", titulo: "Qual é a área?", tipo: "texto", placeholder: "Ex.: pet shop", mostrar: (r) => um(r, "nicho") === "outro" },
  { id: "cidade", titulo: "Em qual cidade (ou região) você atende?", tipo: "texto", placeholder: "Ex.: João Pessoa - PB" },
  {
    id: "objetivo",
    titulo: "O que você mais quer agora?",
    tipo: "unica",
    opcoes: op(
      ["mais_clientes", "Que cheguem mais clientes"],
      ["vender_mais", "Vender mais para quem já chega"],
      ["ser_conhecido", "Ser mais conhecido na minha região"],
      ["organizar", "Organizar meu atendimento e vendas"],
    ),
  },
  { id: "faturamento", titulo: "Quanto a empresa fatura por mês, mais ou menos?", tipo: "unica", opcoes: FAIXAS_FATURAMENTO.map((f) => ({ valor: f, rotulo: f })) },

  // Redes sociais e Google
  {
    id: "posts",
    titulo: "Com que frequência você posta no Instagram?",
    tipo: "unica",
    opcoes: op(
      ["diario", "Todo dia"],
      ["semana_varias", "Algumas vezes por semana"],
      ["semanal", "Uma vez por semana ou menos"],
      ["raro", "Quase não posto"],
      ["sem_perfil", "Não tenho perfil da empresa"],
    ),
  },
  { id: "instagram", titulo: "Qual o @ da empresa?", tipo: "texto", opcional: true, placeholder: "@suaempresa", mostrar: temInstagram },
  {
    id: "stories",
    titulo: "E os stories?",
    tipo: "unica",
    opcoes: op(["diario", "Todo dia"], ["as_vezes", "Às vezes"], ["nunca", "Quase nunca"]),
    mostrar: temInstagram,
  },
  {
    id: "google",
    titulo: "Sua empresa aparece no Google Maps (Perfil da Empresa no Google)?",
    tipo: "unica",
    opcoes: op(["atualizado", "Sim, e está atualizado"], ["abandonado", "Sim, mas está abandonado"], ["nao", "Não tenho"], ["nao_sei", "Não sei o que é"]),
  },
  { id: "site", titulo: "Você tem site?", tipo: "unica", opcoes: op(["sim", "Sim"], ["so_instagram", "Não, só o Instagram"], ["nao", "Não"]) },

  // Anúncios
  {
    id: "anuncia",
    titulo: "Hoje você faz anúncios pagos (Instagram, Facebook, Google)?",
    tipo: "unica",
    opcoes: op(["sim", "Sim"], ["ja_anunciou", "Já fiz, mas parei"], ["nunca", "Nunca fiz"], ["nao_sei", "Não sei bem o que é"]),
  },
  {
    id: "onde",
    titulo: "Onde você anuncia?",
    ajuda: "Pode marcar mais de um.",
    tipo: "multipla",
    opcoes: op(["meta", "Instagram / Facebook"], ["google", "Google"], ["tiktok", "TikTok"], ["outro", "Outro lugar"]),
    mostrar: anuncia,
  },
  {
    id: "investimento",
    titulo: "Quanto você investe em anúncios por mês?",
    tipo: "unica",
    opcoes: op(["ate_500", "Até R$ 500"], ["500_2000", "De R$ 500 a R$ 2 mil"], ["2000_5000", "De R$ 2 mil a R$ 5 mil"], ["5000_15000", "De R$ 5 mil a R$ 15 mil"], ["15000_mais", "Mais de R$ 15 mil"]),
    mostrar: anuncia,
  },
  {
    id: "quem_faz",
    titulo: "Quem faz os seus anúncios?",
    tipo: "unica",
    opcoes: op(
      ["impulsionar", "Eu mesmo, pelo botão \"Impulsionar\""],
      ["gerenciador", "Eu mesmo, pelo Gerenciador de Anúncios"],
      ["freelancer", "Um freelancer"],
      ["agencia", "Uma agência"],
    ),
    mostrar: anuncia,
  },
  {
    id: "satisfeito",
    titulo: "Você está satisfeito com o resultado dos anúncios?",
    tipo: "unica",
    opcoes: op(["sim", "Sim, gosto do resultado"], ["mais_ou_menos", "Mais ou menos"], ["nao", "Não"]),
    mostrar: anuncia,
  },
  {
    id: "problemas",
    titulo: "O que não está bom?",
    ajuda: "Pode marcar mais de um.",
    tipo: "multipla",
    opcoes: op(
      ["poucos_contatos", "Chegam poucos contatos"],
      ["contatos_ruins", "Os contatos são de baixa qualidade"],
      ["nao_fecho", "Chegam contatos, mas não consigo fechar"],
      ["caro", "Está caro"],
      ["sem_clareza", "Não sei se está dando retorno"],
    ),
    mostrar: insatisfeito,
  },
  {
    id: "terceiro",
    titulo: "E com quem faz os anúncios, o que incomoda?",
    ajuda: "Pode marcar mais de um.",
    tipo: "multipla",
    opcoes: op(
      ["nao_responde", "Não me responde direito"],
      ["sem_relatorio", "Não manda relatório claro"],
      ["nao_entende", "Não entende o meu negócio"],
      ["so_posta", "Faz o básico e não traz resultado"],
      ["nada", "Nada, o problema não é com ele"],
    ),
    mostrar: (r) => insatisfeito(r) && terceirizado(r),
  },
  {
    id: "por_que_parou",
    titulo: "Por que você parou de anunciar?",
    tipo: "unica",
    opcoes: op(["sem_retorno", "Gastei e não vi retorno"], ["nao_sabia", "Não sabia fazer direito"], ["tempo", "Faltou tempo para cuidar"], ["caro", "Achei caro"]),
    mostrar: (r) => um(r, "anuncia") === "ja_anunciou",
  },
  {
    id: "o_que_impede",
    titulo: "O que te impede de começar a anunciar?",
    tipo: "unica",
    opcoes: op(
      ["medo", "Medo de gastar e não ter retorno"],
      ["como_comecar", "Não sei por onde começar"],
      ["nao_funciona", "Acho que não funciona para o meu negócio"],
      ["nunca_pensei", "Nunca pensei nisso"],
    ),
    mostrar: (r) => ["nunca", "nao_sei"].includes(um(r, "anuncia")),
  },

  // Atendimento e vendas
  {
    id: "atende",
    titulo: "Quem atende os contatos que chegam?",
    tipo: "unica",
    opcoes: op(["eu", "Eu mesmo"], ["uma_pessoa", "Uma pessoa da equipe"], ["equipe", "Uma equipe de vendas"], ["ninguem", "Ninguém fixo"]),
  },
  {
    id: "resposta",
    titulo: "Quanto tempo vocês levam para responder um contato novo?",
    tipo: "unica",
    opcoes: op(["minutos", "Poucos minutos"], ["horas", "Algumas horas"], ["dia_seguinte", "No dia seguinte"], ["as_vezes_nao", "Às vezes nem respondemos"]),
  },
  {
    id: "anota",
    titulo: "Onde vocês anotam os contatos e as negociações?",
    tipo: "unica",
    opcoes: op(["crm", "Num CRM (sistema de vendas)"], ["planilha", "Numa planilha"], ["whatsapp", "Fica tudo no WhatsApp"], ["nao_anota", "Não anotamos"]),
  },
  {
    id: "follow_up",
    titulo: "Vocês voltam a falar com quem não fechou?",
    tipo: "unica",
    opcoes: op(["sempre", "Sempre"], ["as_vezes", "Às vezes"], ["nunca", "Nunca"]),
  },
  {
    id: "automacao",
    titulo: "Vocês usam respostas automáticas no WhatsApp (atendimento automático)?",
    tipo: "unica",
    opcoes: op(["sim", "Sim"], ["nao", "Não"], ["nao_sei", "Não sei o que é"]),
  },
  {
    id: "quando",
    titulo: "Se fizer sentido, quando você quer começar a melhorar isso?",
    tipo: "unica",
    opcoes: op(["agora", "Agora, é prioridade"], ["30_dias", "Nos próximos 30 dias"], ["pesquisando", "Só estou pesquisando"]),
  },
];

/** Perguntas que valem para estas respostas, em ordem. */
export const perguntasAtivas = (r: Respostas) => PERGUNTAS.filter((p) => !p.mostrar || p.mostrar(r));

/** Rótulo legível de uma resposta (para o aviso e o painel). */
export function respostaLegivel(p: Pergunta, valor: string | string[] | undefined) {
  if (valor == null || valor === "") return "";
  const lista = Array.isArray(valor) ? valor : [valor];
  return lista.map((v) => p.opcoes?.find((o) => o.valor === v)?.rotulo ?? v).join(", ");
}

/**
 * Limpa o que veio do navegador: só perguntas que existem e estão ativas, só opções válidas,
 * textos curtos. Devolve as respostas limpas e as perguntas obrigatórias que faltaram.
 */
export function limparRespostas(bruto: unknown): { respostas: Respostas; faltando: string[] } {
  const entrada = (bruto && typeof bruto === "object" ? bruto : {}) as Record<string, unknown>;
  const respostas: Respostas = {};
  for (const p of PERGUNTAS) {
    const v = entrada[p.id];
    if (p.tipo === "texto" && typeof v === "string" && v.trim()) respostas[p.id] = v.trim().slice(0, 120);
    if (p.tipo === "unica" && typeof v === "string" && p.opcoes?.some((o) => o.valor === v)) respostas[p.id] = v;
    if (p.tipo === "multipla" && Array.isArray(v)) {
      const validos = v.filter((x): x is string => typeof x === "string" && Boolean(p.opcoes?.some((o) => o.valor === x)));
      if (validos.length) respostas[p.id] = [...new Set(validos)];
    }
  }
  // Respostas de perguntas que não se aplicam (a pessoa voltou e mudou o caminho) saem.
  const ativas = perguntasAtivas(respostas);
  for (const id of Object.keys(respostas)) if (!ativas.some((p) => p.id === id)) delete respostas[id];
  const faltando = ativas.filter((p) => !p.opcional && !respostas[p.id]).map((p) => p.id);
  return { respostas, faltando };
}
