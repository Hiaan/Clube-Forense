// Os dados estruturados (schema.org, em JSON-LD) das páginas.
//
// PARA QUEM ISTO EXISTE. Buscador com IA — ChatGPT, Perplexity, Gemini, o
// resumo do Google — lê a página como texto, mas confia mais no que ela
// declara como fato: quem é a organização, o que é o curso, quem ensina,
// quanto custa, até quando, o que os alunos dizem e quais as perguntas
// frequentes com as respostas. É daqui que sai a frase "o Clube Forense é um
// preparatório de medicina legal com professores médicos legistas…" numa
// resposta de IA, em vez de um resumo adivinhado.
//
// TUDO AQUI ESTÁ ESCRITO NA PÁGINA. Marcação que promete o que a página não
// mostra é penalizada — por isso não há nota média inventada
// (aggregateRating): os depoimentos entram como Review, com o texto e o nome
// que estão na página, sem estrela que ninguém deu.

import { DEPOIMENTOS } from "../black/depoimentos";
import type { Pergunta } from "../black/faq";
import { PROFESSORES } from "../black/professores";
import { baseDoSite } from "./site";

const SITE = baseDoSite();
const INSTITUCIONAL = "https://www.clubeforense.com.br";
const ORG_ID = `${INSTITUCIONAL}/#organizacao`;

type Json = Record<string, unknown>;

/** O Clube Forense, a organização. Vai em todas as páginas (layout raiz). */
export function organizacao(totalAprovados: number): Json {
  return {
    "@type": ["EducationalOrganization", "Organization"],
    "@id": ORG_ID,
    name: "Clube Forense",
    alternateName: ["Clube Forense Medicina Legal", "Aprova Legista"],
    url: INSTITUCIONAL,
    logo: `${SITE}/logo-fundo-claro.png`,
    description: `Preparatório para concursos de médico legista (perito médico-legista), criado e ensinado por médicos legistas. Considerado por alunos de vários preparatórios o melhor em Medicina Legal, com ${totalAprovados} aprovados nos últimos concursos.`,
    knowsAbout: [
      "Medicina Legal",
      "Concurso para médico legista",
      "Perito médico-legista",
      "Traumatologia forense",
      "Tanatologia forense",
      "Sexologia forense",
      "Toxicologia forense",
      "Psiquiatria forense",
    ],
    areaServed: { "@type": "Country", name: "Brasil" },
    sameAs: [SITE, INSTITUCIONAL],
    founder: PROFESSORES.map((p) => ({ "@id": idProfessor(p.nome) })),
  };
}

/** O site do mapa e do blog, ligado à organização. */
export function site(): Json {
  return {
    "@type": "WebSite",
    "@id": `${SITE}/#site`,
    url: SITE,
    name: "Clube Forense — mapa dos concursos e blog de médico legista",
    inLanguage: "pt-BR",
    publisher: { "@id": ORG_ID },
  };
}

function idProfessor(nome: string): string {
  return `${SITE}/#prof-${nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")}`;
}

/** Os três professores, médicos legistas. */
export function professores(): Json[] {
  return PROFESSORES.map((p) => ({
    "@type": "Person",
    "@id": idProfessor(p.nome),
    name: p.nome,
    jobTitle: p.cargo,
    description: p.texto,
    image: `${SITE}/black/professores/${p.arquivo}`,
    hasOccupation: { "@type": "Occupation", name: "Médico legista" },
    worksFor: { "@id": ORG_ID },
  }));
}

/** Os depoimentos publicados, como avaliações sem nota. */
function avaliacoes(): Json[] {
  return DEPOIMENTOS.map((d) => ({
    "@type": "Review",
    author: { "@type": "Person", name: d.nome },
    reviewBody: d.texto,
    name: `${d.nome} — ${d.cargo}`,
  }));
}

/** Um curso do Clube com a oferta que a página mostra. */
export function curso({
  url,
  nome,
  descricao,
  preco,
  checkout,
  validoAte,
  assuntos,
}: {
  url: string;
  nome: string;
  descricao: string;
  preco: number;
  checkout: string;
  validoAte?: string;
  assuntos?: string[];
}): Json {
  return {
    "@type": "Course",
    "@id": `${url}#curso`,
    name: nome,
    description: descricao,
    url,
    inLanguage: "pt-BR",
    provider: { "@id": ORG_ID },
    instructor: PROFESSORES.map((p) => ({ "@id": idProfessor(p.nome) })),
    about: assuntos ?? ["Medicina Legal", "Concurso para médico legista"],
    educationalLevel: "Profissional (médicos e estudantes de medicina)",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "Acesso vitalício, no próprio ritmo",
    },
    offers: {
      "@type": "Offer",
      price: preco,
      priceCurrency: "BRL",
      url: checkout,
      availability: "https://schema.org/InStock",
      category: "Paid",
      ...(validoAte ? { priceValidUntil: validoAte.slice(0, 10) } : {}),
      seller: { "@id": ORG_ID },
    },
    review: avaliacoes(),
  };
}

/** As perguntas frequentes, como estão na página. */
export function perguntas(lista: Pergunta[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: lista.map((f) => ({
      "@type": "Question",
      name: f.p,
      acceptedAnswer: { "@type": "Answer", text: f.r },
    })),
  };
}

/** Uma matéria do blog. */
export function materia({
  url,
  titulo,
  resumo,
  publicadoEm,
  atualizadoEm,
  imagem,
  estado,
}: {
  url: string;
  titulo: string;
  resumo: string;
  publicadoEm: string | null;
  atualizadoEm: string | null;
  imagem: string | null;
  estado: string | null;
}): Json {
  return {
    "@type": "NewsArticle",
    "@id": `${url}#materia`,
    headline: titulo.slice(0, 110),
    description: resumo,
    url,
    mainEntityOfPage: url,
    inLanguage: "pt-BR",
    ...(publicadoEm ? { datePublished: publicadoEm } : {}),
    ...(atualizadoEm || publicadoEm
      ? { dateModified: atualizadoEm ?? publicadoEm }
      : {}),
    ...(imagem ? { image: imagem } : { image: `${SITE}/opengraph-image.jpg` }),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    about: ["Concurso para médico legista", ...(estado ? [estado] : [])],
  };
}

/** O bloco <script> pronto, com vários nós num grafo só. */
export function grafo(...nos: Json[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nos })
    // Fecha a porta para `</script>` dentro de um texto.
    .replace(/</g, "\\u003c");
}
