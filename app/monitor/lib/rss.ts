// Parser de RSS minimalista (sem dependências externas), suficiente para os
// feeds do Google Notícias. Extrai os <item> e seus campos principais.

export interface ItemRSS {
  titulo: string;
  link: string;
  data: string | null;
  fonte: string;
  resumo: string;
}

function decodificarEntidades(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function limparTexto(bruto: string): string {
  // O Google Notícias envia o HTML do resumo entity-encoded — e muitas vezes
  // DUPLO-encoded (&amp;nbsp;, &lt;a&gt;…). Por isso alternamos, duas vezes,
  // "remover tags" + "decodificar entidades": a cada ciclo, entidades viram
  // caracteres/tags reais e as tags recém-reveladas são removidas. Sem isso,
  // links crus e &nbsp; vazavam no resumo.
  let s = bruto.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  for (let i = 0; i < 2; i++) {
    s = decodificarEntidades(s.replace(/<[^>]+>/g, " "));
  }
  s = s.replace(/<[^>]+>/g, " "); // remoção final, caso a última decodificação revele tags
  return s.replace(/\s+/g, " ").trim();
}

function extrairTag(bloco: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = bloco.match(re);
  return m ? m[1] : null;
}

/** Faz o parse de um documento RSS e devolve os itens. */
export function parseRSS(xml: string): ItemRSS[] {
  const itens: ItemRSS[] = [];
  const blocos = xml.split(/<item[\s>]/i).slice(1);

  for (const parte of blocos) {
    const fim = parte.search(/<\/item>/i);
    if (fim === -1) continue; // item sem fechamento: descarta em vez de manter lixo
    const bloco = parte.slice(0, fim);
    if (!bloco) continue;

    const tituloBruto = extrairTag(bloco, "title") ?? "";
    const linkBruto = extrairTag(bloco, "link") ?? "";
    const dataBruta = extrairTag(bloco, "pubDate");
    const descBruta = extrairTag(bloco, "description") ?? "";
    const fonteBruta = extrairTag(bloco, "source");

    const titulo = limparTexto(tituloBruto);
    if (!titulo) continue;

    let data: string | null = null;
    if (dataBruta) {
      const d = new Date(limparTexto(dataBruta));
      if (!Number.isNaN(d.getTime())) data = d.toISOString();
    }

    itens.push({
      titulo,
      link: limparTexto(linkBruto),
      data,
      fonte: fonteBruta ? limparTexto(fonteBruta) : "Google Notícias",
      resumo: limparTexto(descBruta),
    });
  }

  return itens;
}
