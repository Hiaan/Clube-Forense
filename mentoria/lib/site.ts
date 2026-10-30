// Dados do site que mudam sem mexer no layout.

export const SITE = {
  nome: "Miguel Souza · Medicina Forensis",
  // O domínio definitivo ainda não existe: até lá vale o endereço que a
  // Vercel dá ao projeto.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
};

/**
 * Convite do grupo de discussão de casos (link do WhatsApp).
 *
 * Sem a variável, o botão dá lugar a um aviso de que o convite chega depois
 * da reunião: melhor que um botão que não leva a lugar nenhum.
 */
export const LINK_GRUPO_CASOS = process.env.NEXT_PUBLIC_LINK_GRUPO_CASOS ?? "";
