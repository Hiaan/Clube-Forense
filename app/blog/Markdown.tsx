// Markdown mínimo, renderizado como React — nunca como HTML injetado.
//
// POR QUE NÃO UMA BIBLIOTECA: este projeto tem cinco dependências, e a conta de
// uma a mais não é o tamanho do pacote, é a superfície. Um renderizador de
// markdown completo aceita HTML embutido, e parte do que passa por aqui foi
// rascunhada por um robô a partir de texto de terceiros. Pequeno e fechado é
// mais fácil de garantir do que grande e configurado.
//
// POR QUE NÃO dangerouslySetInnerHTML: porque o nome não mente. Devolvendo
// elementos React, o texto é sempre texto — não existe caminho pelo qual um
// `<script>` escrito no corpo do post vire script. O preço é não aceitar HTML
// no corpo, o que aqui é vantagem.
//
// O QUE ENTENDE: ## e ### para títulos, parágrafo, **negrito**, *itálico*,
// [texto](link), lista com - ou 1., citação com > e --- como separador. O que
// não entende fica como texto comum, que é o jeito certo de errar: nada some.

import Link from "next/link";

/** Um pedaço de linha: texto puro, negrito, itálico ou link. */
type Trecho =
  | { tipo: "texto"; valor: string }
  | { tipo: "negrito"; valor: string }
  | { tipo: "italico"; valor: string }
  | { tipo: "link"; valor: string; href: string };

/**
 * Quebra uma linha nos marcadores de formatação.
 *
 * Uma varredura só, da esquerda para a direita, procurando o próximo marcador.
 * Regex aninhada daria o mesmo resultado em texto bem escrito e travaria em
 * texto mal escrito — asteriscos soltos são comuns em notícia copiada.
 */
function trechos(linha: string): Trecho[] {
  const saida: Trecho[] = [];
  let resto = linha;

  // Ordem importa: ** antes de *, senão o negrito vira dois itálicos vazios.
  const padrao = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)\s]+)\))/;

  while (resto) {
    const achou = resto.match(padrao);
    if (!achou || achou.index === undefined) break;

    if (achou.index > 0) saida.push({ tipo: "texto", valor: resto.slice(0, achou.index) });

    if (achou[2]) saida.push({ tipo: "negrito", valor: achou[2] });
    else if (achou[4]) saida.push({ tipo: "italico", valor: achou[4] });
    else if (achou[6]) saida.push({ tipo: "link", valor: achou[6], href: achou[7] });

    resto = resto.slice(achou.index + achou[0].length);
  }

  if (resto) saida.push({ tipo: "texto", valor: resto });
  return saida;
}

/**
 * Só http, https e caminho interno viram link.
 *
 * `javascript:` num [texto](link) é o caminho óbvio para transformar um post
 * revisado às pressas em execução de código no navegador de quem lê. O que não
 * passa continua visível como texto — some o link, não a informação.
 *
 * O caminho interno é devolvido COMO VEIO, sem virar endereço absoluto. Resolver
 * `/?uf=RJ` contra um domínio fixo parecia inofensivo e mandava o leitor para
 * outro site: o gancho que o robô escreve para o mapa apontava para a home
 * institucional, em outra aba, em vez de abrir o estado aqui mesmo. Caminho
 * relativo também é o que faz o link funcionar nos dois domínios desta
 * aplicação.
 */
function linkSeguro(href: string): string | null {
  const limpo = href.trim();

  // "//exemplo.com" herda o protocolo e é endereço externo disfarçado de
  // caminho: fica de fora do atalho.
  if (limpo.startsWith("/") && !limpo.startsWith("//")) return limpo;

  try {
    const u = new URL(limpo);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function Linha({ texto: t }: { texto: string }) {
  return (
    <>
      {trechos(t).map((p, i) => {
        if (p.tipo === "negrito") return <strong key={i}>{p.valor}</strong>;
        if (p.tipo === "italico") return <em key={i}>{p.valor}</em>;
        if (p.tipo === "link") {
          const href = linkSeguro(p.href);
          if (!href) return <span key={i}>{p.valor}</span>;
          const interno = href.startsWith("/") || href.includes("clubeforense.com.br");
          return interno ? (
            <Link key={i} href={href} className="font-semibold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-2 hover:bg-[#fff9db]">
              {p.valor}
            </Link>
          ) : (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-semibold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-2 hover:bg-[#fff9db]"
            >
              {p.valor}
            </a>
          );
        }
        return <span key={i}>{p.valor}</span>;
      })}
    </>
  );
}

/** Um bloco já identificado, pronto para virar elemento. */
type Bloco =
  | { tipo: "titulo"; nivel: 2 | 3; texto: string }
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "citacao"; texto: string }
  | { tipo: "lista"; ordenada: boolean; itens: string[] }
  | { tipo: "separador" };

function emBlocos(corpo: string): Bloco[] {
  const blocos: Bloco[] = [];
  // \r\n vem de texto colado do Word e de alguns feeds; sem normalizar, toda
  // linha termina com um caractere invisível que estraga o casamento dos
  // marcadores.
  const linhas = corpo.replace(/\r\n/g, "\n").split("\n");

  let paragrafo: string[] = [];
  const fecharParagrafo = () => {
    if (paragrafo.length) {
      blocos.push({ tipo: "paragrafo", texto: paragrafo.join(" ") });
      paragrafo = [];
    }
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();

    if (!linha) {
      fecharParagrafo();
      continue;
    }
    if (/^---+$/.test(linha)) {
      fecharParagrafo();
      blocos.push({ tipo: "separador" });
      continue;
    }
    const titulo = linha.match(/^(#{2,3})\s+(.*)$/);
    if (titulo) {
      fecharParagrafo();
      blocos.push({ tipo: "titulo", nivel: titulo[1].length as 2 | 3, texto: titulo[2] });
      continue;
    }
    if (linha.startsWith("> ")) {
      fecharParagrafo();
      blocos.push({ tipo: "citacao", texto: linha.slice(2) });
      continue;
    }

    const marcador = linha.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (marcador) {
      fecharParagrafo();
      const ordenada = /\d/.test(marcador[1]);
      const itens = [marcador[2]];
      // Consome as linhas seguintes da mesma lista aqui, e não numa segunda
      // passada: assim uma lista é um bloco só, que é o que o <ul> precisa.
      while (i + 1 < linhas.length) {
        const proxima = linhas[i + 1].trim();
        const seguinte = proxima.match(/^([-*]|\d+\.)\s+(.*)$/);
        if (!seguinte || /\d/.test(seguinte[1]) !== ordenada) break;
        itens.push(seguinte[2]);
        i++;
      }
      blocos.push({ tipo: "lista", ordenada, itens });
      continue;
    }

    paragrafo.push(linha);
  }
  fecharParagrafo();
  return blocos;
}

export default function Markdown({ corpo }: { corpo: string }) {
  return (
    <div className="space-y-5">
      {emBlocos(corpo).map((b, i) => {
        if (b.tipo === "separador") return <hr key={i} className="border-gray-200" />;
        if (b.tipo === "titulo") {
          return b.nivel === 2 ? (
            <h2 key={i} className="pt-4 text-2xl font-bold tracking-tight text-gray-900">
              <Linha texto={b.texto} />
            </h2>
          ) : (
            <h3 key={i} className="pt-2 text-lg font-bold text-gray-900">
              <Linha texto={b.texto} />
            </h3>
          );
        }
        if (b.tipo === "citacao") {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-[#ffcd07] bg-[#fff9db]/60 py-3 pl-4 pr-3 text-[17px] italic leading-relaxed text-gray-800"
            >
              <Linha texto={b.texto} />
            </blockquote>
          );
        }
        if (b.tipo === "lista") {
          const Tag = b.ordenada ? "ol" : "ul";
          return (
            <Tag
              key={i}
              className={`ml-5 space-y-2 text-[17px] leading-relaxed text-gray-700 ${
                b.ordenada ? "list-decimal" : "list-disc"
              }`}
            >
              {b.itens.map((item, j) => (
                <li key={j} className="pl-1">
                  <Linha texto={item} />
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={i} className="text-[17px] leading-relaxed text-gray-700">
            <Linha texto={b.texto} />
          </p>
        );
      })}
    </div>
  );
}
