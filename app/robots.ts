// O robots.txt.
//
// NÃO EXISTIA, e a falta dele custa duas coisas. A primeira é o sitemap: sem
// esta linha, a única forma de um buscador saber que ele existe é alguém ir ao
// Search Console e cadastrar à mão. A segunda é o painel: /admin e as rotas de
// API não têm por que ser visitadas por robô nenhum, e pedir que não sejam
// poupa tanto a banda quanto a chance de uma tela de login aparecer em
// resultado de busca.
//
// `Disallow` não é segurança — é pedido, e robô mal-intencionado ignora. O que
// protege o painel é a senha; isto aqui é só higiene.

import type { MetadataRoute } from "next";

import { baseDoSite } from "./lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/alunoclube"],
    },
    sitemap: `${baseDoSite()}/sitemap.xml`,
  };
}
