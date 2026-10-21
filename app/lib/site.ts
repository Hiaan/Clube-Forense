// O endereço público do blog, num lugar só.
//
// POR QUE ISTO PRECISOU EXISTIR, E O ESTRAGO QUE EVITA. Quatro arquivos
// escreviam `https://blog.clubeforense.com.br` à mão — a canônica de cada
// post, o sitemap, o RSS e o aviso por e-mail. Esse subdomínio nunca chegou a
// ser apontado: ele não resolve em DNS. O resultado é pior do que link
// quebrado em e-mail.
//
// Uma tag canônica é a página dizendo ao Google "a versão de verdade disto
// mora naquele endereço". Apontando para um domínio que não existe, cada post
// publicado estava mandando o buscador embora da única página que funciona —
// e pedindo que indexasse uma que não responde. O sitemap repetia o recado em
// volume, listando 29 endereços mortos. Era o blog inteiro se escondendo.
//
// AGORA É UMA VARIÁVEL. `SITE_URL` manda; sem ela, vale o domínio que de fato
// serve o blog hoje. No dia em que o subdomínio for apontado, basta preencher
// a variável na Vercel — canônica, sitemap, RSS e e-mail passam a falar dele
// juntos, que é a única forma de essa troca não dividir a reputação da página
// em dois endereços.

/** O domínio que serve o blog hoje, e que responde de verdade. */
const PADRAO = "https://mapa.clubeforense.com.br";

/** Base pública, sem barra no fim. */
export function baseDoSite(): string {
  const configurado = process.env.SITE_URL?.trim();
  if (configurado) return configurado.replace(/\/$/, "");
  return PADRAO;
}

/** O endereço público de um post. */
export function urlDoPost(slug: string): string {
  return `${baseDoSite()}/blog/${slug}`;
}
