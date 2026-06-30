// Parser de RSS minimalista (sem dependências externas), suficiente para os
// feeds do Google Notícias. Extrai os <item> e seus campos principais.

export interface ItemRSS {
  titulo: string;
  link: string;
  data: string | null;
  fonte: string;
  resumo: string;
}

function limparTexto(bruto: string): string {
  return bruto
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // remove CDATA
    .replace(/<[^>]+>/g, " ") // remove tags HTML internas
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    const bloco = parte.slice(0, parte.search(/<\/item>/i));
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
