// Idiomas do site. Português fica em "/", os demais em "/en" e "/es".

export const IDIOMAS = ["pt", "en", "es"] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const CONFIG_IDIOMA: Record<Idioma, { sigla: string; nome: string; caminho: string; html: string; locale: string; og: string }> = {
  pt: { sigla: "PT", nome: "Português", caminho: "/", html: "pt-BR", locale: "pt-BR", og: "pt_BR" },
  en: { sigla: "EN", nome: "English", caminho: "/en", html: "en", locale: "en-US", og: "en_US" },
  es: { sigla: "ES", nome: "Español", caminho: "/es", html: "es", locale: "es-ES", og: "es_ES" },
};

/** Troca {chave} pelos valores: fmt("Olá, {nome}", { nome: "Ana" }). */
export function fmt(texto: string, valores: Record<string, string | number>) {
  return texto.replace(/\{(\w+)\}/g, (_, chave) => String(valores[chave] ?? `{${chave}}`));
}

export function moeda(valor: number, idioma: Idioma) {
  return new Intl.NumberFormat(CONFIG_IDIOMA[idioma].locale, { style: "currency", currency: "BRL" }).format(valor);
}
