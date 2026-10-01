import type { Metadata } from "next";
import { DICIONARIOS } from "@/lib/dicionarios";
import { CONFIG_IDIOMA, IDIOMAS, type Idioma } from "@/lib/i18n";

/** Título, descrição, prévia de compartilhamento e links entre os idiomas (hreflang). */
export function metadadosDo(idioma: Idioma): Metadata {
  const { meta } = DICIONARIOS[idioma];
  return {
    title: meta.titulo,
    description: meta.descricao,
    alternates: {
      canonical: CONFIG_IDIOMA[idioma].caminho,
      languages: {
        ...Object.fromEntries(IDIOMAS.map((i) => [CONFIG_IDIOMA[i].html, CONFIG_IDIOMA[i].caminho])),
        "x-default": "/",
      },
    },
    openGraph: {
      title: meta.ogTitulo,
      description: meta.ogDescricao,
      images: ["/og.jpg"],
      locale: CONFIG_IDIOMA[idioma].og,
      alternateLocale: IDIOMAS.filter((i) => i !== idioma).map((i) => CONFIG_IDIOMA[i].og),
      type: "website",
      url: CONFIG_IDIOMA[idioma].caminho,
    },
  };
}
