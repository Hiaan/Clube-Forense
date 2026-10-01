import "server-only";
import { consulta, umaLinha } from "./db";
import { hoje, somarDias } from "./dados";
import { PLANO_PADRAO } from "./textos";

// Cliente de demonstração, com dados fictícios, para mostrar o painel.
// Recriar apaga a versão anterior (só deste cliente) e gera tudo de novo.

export const SLUG_DEMO = "clinica-exemplo";

/** Números pseudoaleatórios com semente fixa: a demonstração sai sempre igual. */
function sorteador(semente: number) {
  let s = semente;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const NOMES = [
  "Ana Paula Ribeiro", "Bruno Carvalho", "Camila Nogueira", "Diego Martins", "Eduarda Lima", "Fernando Souza", "Gabriela Rocha",
  "Henrique Alves", "Isabela Costa", "João Pedro Melo", "Larissa Fernandes", "Marcelo Teixeira", "Natália Barros", "Otávio Pires",
  "Patrícia Gomes", "Rafael Duarte", "Sabrina Moreira", "Thiago Castro", "Vanessa Cardoso", "William Freitas", "Aline Moura",
  "Carlos Eduardo Reis", "Débora Santana", "Fábio Monteiro", "Giovana Batista", "Igor Campos", "Juliana Prado", "Leonardo Vieira",
  "Mariana Azevedo", "Paulo Henrique Dias",
];

const CAMPANHAS = [
  { plataforma: "Meta Ads", campanha: "[LEADS] Implante - Público frio", base: 210, cpl: 38, ctr: 0.014 },
  { plataforma: "Meta Ads", campanha: "[LEADS] Lentes - Lookalike 2%", base: 120, cpl: 44, ctr: 0.012 },
  { plataforma: "Meta Ads", campanha: "[RMKT] Visitantes 30 dias", base: 55, cpl: 26, ctr: 0.021 },
  { plataforma: "Google Ads", campanha: "Pesquisa - Implante dentário", base: 85, cpl: 52, ctr: 0.064 },
];

export async function semearDemo() {
  const r = sorteador(20261001);
  const ref = hoje();

  await consulta("delete from empresas where slug = $1", [SLUG_DEMO]);
  const empresa = await umaLinha<{ id: number }>(
    `insert into empresas (slug, nome, tipo, pais, moeda, idioma, meta_investimento, meta_leads, meta_cpl, comentario, comentario_em)
     values ($1, 'Clínica Exemplo (demonstração)', 'leads', 'BR', 'BRL', 'pt', 14000, 360, 40, $2, now() - interval '2 hours') returning id`,
    [
      SLUG_DEMO,
      "Semana muito boa: o custo por lead caiu 9% depois que o vídeo de depoimento do implante virou o criativo principal. " +
        "Próximo passo: duplicar o conjunto de lookalike com o público de quem agendou e testar dois novos vídeos de lentes.",
    ],
  );
  const empresaId = empresa!.id;

  // ---- Métricas: 90 dias, com o custo por lead melhorando aos poucos ----
  const linhas: [string, string, string, number, number, number, number][] = [];
  for (let d = 89; d >= 0; d--) {
    const data = somarDias(ref, -d);
    const diaSemana = new Date(`${data}T12:00:00Z`).getUTCDay();
    const fimDeSemana = diaSemana === 0 || diaSemana === 6 ? 0.72 : 1;
    const parcial = d === 0 ? 0.45 : 1; // hoje ainda está no meio do dia
    const melhora = 1.22 - (0.3 * (89 - d)) / 89;
    for (const c of CAMPANHAS) {
      const gasto = c.base * fimDeSemana * parcial * (0.82 + r() * 0.36);
      const impressoes = Math.round(gasto * (88 + r() * 40));
      const cliques = Math.round(impressoes * c.ctr * (0.85 + r() * 0.3));
      const leads = Math.max(0, Math.round(gasto / (c.cpl * melhora * (0.75 + r() * 0.5))));
      linhas.push([data, c.plataforma, c.campanha, Math.round(gasto * 100) / 100, impressoes, cliques, leads]);
    }
  }
  const coluna = (i: number) => linhas.map((l) => l[i]);
  await consulta(
    `insert into metricas (empresa_id, data, plataforma, campanha, gasto, impressoes, cliques, leads, origem)
     select $1, *, 'demo' from unnest($2::date[], $3::text[], $4::text[], $5::numeric[], $6::bigint[], $7::bigint[], $8::int[])`,
    [empresaId, coluna(0), coluna(1), coluna(2), coluna(3), coluna(4), coluna(5), coluna(6)],
  );

  // ---- Leads dos últimos 30 dias, espalhados pelo funil ----
  const etapas = ["novo", "novo", "novo", "contato", "contato", "contato", "reuniao", "reuniao", "proposta", "ganho", "perdido"];
  const leads = Array.from({ length: 64 }, (_, i) => {
    const horasAtras = Math.round(i * 11 + r() * 8);
    const nome = NOMES[i % NOMES.length];
    const c = CAMPANHAS[Math.floor(r() * CAMPANHAS.length)];
    // Leads mais antigos já andaram no funil; os mais novos ainda estão no começo.
    const etapa = horasAtras < 30 ? "novo" : etapas[Math.floor(r() * etapas.length)];
    return {
      nome,
      email: `${nome.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.exemplo${i}@email.com`,
      whatsapp: `+55119${String(80000000 + Math.floor(r() * 19999999)).slice(0, 8)}`,
      origem: c.plataforma,
      campanha: c.campanha,
      etapa,
      valor: etapa === "ganho" ? Math.round(3500 + r() * 9000) : null,
      horasAtras,
    };
  });
  await consulta(
    `insert into leads (empresa_id, nome, email, whatsapp, origem, campanha, etapa, valor, recebido_em)
     select $1, n, e, w, o, c, et, v, now() - make_interval(hours => h)
       from unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::numeric[], $9::int[]) as t(n, e, w, o, c, et, v, h)`,
    [
      empresaId,
      leads.map((l) => l.nome),
      leads.map((l) => l.email),
      leads.map((l) => l.whatsapp),
      leads.map((l) => l.origem),
      leads.map((l) => l.campanha),
      leads.map((l) => l.etapa),
      leads.map((l) => l.valor),
      leads.map((l) => l.horasAtras),
    ],
  );

  // ---- Plano: semana 1 concluída, semana 2 quase, semana 3 começando ----
  const statusPorSemana = [["feito", "feito", "feito", "feito"], ["feito", "feito", "feito", "andamento"], ["andamento", "pendente", "pendente"], ["pendente", "pendente", "pendente"]];
  const plano = PLANO_PADRAO.pt.flatMap((titulos, s) => titulos.map((titulo, ordem) => ({ semana: s + 1, ordem, titulo, status: statusPorSemana[s][ordem] ?? "pendente" })));
  await consulta(
    "insert into plano (empresa_id, semana, ordem, titulo, status) select $1, * from unnest($2::int[], $3::int[], $4::text[], $5::text[])",
    [empresaId, plano.map((p) => p.semana), plano.map((p) => p.ordem), plano.map((p) => p.titulo), plano.map((p) => p.status)],
  );

  // ---- Criativos ----
  const criativos = [
    ["Implante em 1 dia — depoimento", "validado", "video", "Meta Ads", "implante-video", 3820, 112, 1.9, "Melhor criativo da conta: CPL 22% abaixo da média. Depoimento real nos 3 primeiros segundos segura a atenção.", 34],
    ["Antes e depois — clareamento", "validado", "carrossel", "Meta Ads", "clareamento-carrossel", 2140, 61, 1.6, "Carrossel com 5 casos. Funciona melhor no público de remarketing.", 28],
    ["Avaliação gratuita", "validado", "imagem", "Google Ads", "avaliacao-gratuita", 1450, 33, 2.3, "Oferta direta. Converte bem com quem já pesquisou por implante.", 40],
    ["Minha experiência com lentes — UGC", "teste", "video", "Meta Ads", "lente-ugc", 420, 11, 1.4, "Em teste há 5 dias. Primeiros sinais bons de CTR; aguardando volume para decidir.", 5],
    ["Outubro: 12x sem juros", "teste", "imagem", "Meta Ads", "oferta-outubro", 260, 6, 1.1, "Oferta sazonal. Avaliamos na sexta.", 3],
    ["O doutor explica como funciona", "teste", "video", "Meta Ads", "doutor-explica", 180, 4, 1.7, "Vídeo de autoridade, testando contra o depoimento.", 2],
    ["Promoção imperdível (banco de imagem)", "reprovado", "imagem", "Meta Ads", "promo-generica", 690, 7, 0.6, "Imagem genérica não gerou confiança: CPL quase 2x a meta. Aprendizado: rosto real e caso real performam muito melhor.", 52],
    ["As 7 etapas do implante", "reprovado", "carrossel", "Meta Ads", "etapas-implante", 540, 6, 0.8, "Conteúdo técnico demais para público frio. Reaproveitado como material para quem já agendou.", 47],
  ] as const;
  await consulta(
    `insert into criativos (empresa_id, titulo, status, formato, plataforma, imagem, gasto, resultados, ctr, nota, inicio)
     select $1, t, s, f, p, i, g, re, c, n, current_date - d
       from unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::numeric[], $8::int[], $9::numeric[], $10::text[], $11::int[]) as x(t, s, f, p, i, g, re, c, n, d)`,
    [
      empresaId,
      criativos.map((c) => c[0]),
      criativos.map((c) => c[1]),
      criativos.map((c) => c[2]),
      criativos.map((c) => c[3]),
      criativos.map((c) => `/painel-demo/${c[4]}.svg`),
      criativos.map((c) => c[5]),
      criativos.map((c) => c[6]),
      criativos.map((c) => c[7]),
      criativos.map((c) => c[8]),
      criativos.map((c) => c[9]),
    ],
  );

  // ---- Reuniões ----
  await consulta(
    `insert into reunioes (empresa_id, quando, titulo, link, gravacao, resumo, proximos_passos) values
     ($1, (current_date - 21) + time '13:00', 'Reunião de diagnóstico', null, null,
      'Entendemos a operação: ticket médio de R$ 6.800 no implante, 40% dos agendamentos vêm por indicação e a recepção leva até 1 dia para responder leads.',
      'T9: configurar pixel e API de conversões. Clínica: enviar fotos reais de casos e liberar acesso ao Instagram.'),
     ($1, (current_date - 7) + time '14:00', 'Alinhamento semanal', null, null,
      'Campanhas no ar há 10 dias. CPL em R$ 41, perto da meta. Leads respondidos em menos de 1 hora fecham 2x mais.',
      'Clínica: responder leads em até 1 hora. T9: testar 2 novos vídeos de lentes e criar o remarketing de 30 dias.'),
     ($1, (current_date + 6) + time '13:00', 'Fechamento do mês e plano de escala', 'https://meet.google.com/', null, null, null)`,
    [empresaId],
  );

  // ---- Relatório do mês passado, já publicado ----
  const mesPassado = somarDias(`${ref.slice(0, 7)}-01`, -1).slice(0, 7);
  await consulta(
    `insert into relatorios (empresa_id, mes, resumo, destaques, proximos_passos, publicado) values ($1, $2, $3, $4, $5, true)`,
    [
      empresaId,
      mesPassado,
      "Mês de estruturação concluído. As campanhas de implante passaram a responder pela maior parte dos leads e o custo por lead terminou o mês abaixo da meta de R$ 40.",
      "• Vídeo de depoimento virou o principal criativo da conta\n• Remarketing com o menor custo por lead (R$ 26)\n• 9 tratamentos fechados vindos das campanhas",
      "• Escalar o conjunto de lookalike de quem agendou\n• Testar dois vídeos novos de lentes\n• Ajustar o tempo de resposta da recepção para menos de 1 hora",
    ],
  );

  // ---- Arquivos enviados pela clínica ----
  await consulta(
    `insert into arquivos (empresa_id, titulo, url, nota, criado_em) values
     ($1, 'Fotos da clínica e da equipe', 'https://drive.google.com/drive/folders/exemplo-fotos', 'Fotos novas da recepção e dos consultórios.', now() - interval '12 days'),
     ($1, 'Vídeos de depoimentos de pacientes', 'https://drive.google.com/drive/folders/exemplo-depoimentos', '6 vídeos gravados no celular, já com autorização dos pacientes.', now() - interval '9 days'),
     ($1, 'Logo em alta resolução', 'https://drive.google.com/file/d/exemplo-logo/view', null, now() - interval '20 days')`,
    [empresaId],
  );

  return SLUG_DEMO;
}
