// Armazenamento das imagens (Vercel Blob).
//
// A autenticação NÃO usa senha guardada em variável: a Vercel injeta um token
// OIDC de curta duração em toda função em execução, e o SDK o combina com
// BLOB_STORE_ID. Por isso a checagem abaixo olha o id da store, e não um token.
// BLOB_READ_WRITE_TOKEN continua valendo como caminho alternativo — é o que se
// usa fora da Vercel.

/** True quando dá para subir imagem. Sem isso o painel esconde os campos de foto. */
export function blobConfigurado(): boolean {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

/** Tipos aceitos no upload de foto. Fechado de propósito. */
export const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"];

/** O edital é sempre PDF. Lista de um item para a checagem ficar igual à das fotos. */
export const TIPOS_PDF = ["application/pdf"];

/**
 * Teto do arquivo que chega ao Blob: 1,5 MB.
 *
 * O navegador redimensiona antes de enviar, então uma foto de celular chega
 * com algo entre 60 e 200 KB. Este limite existe para o caso de o
 * redimensionamento falhar — e para impedir que um PNG gigante entre inteiro.
 */
export const TAMANHO_MAXIMO = 1_500_000;

/**
 * Teto do PDF do edital: 4 MB.
 *
 * Não é um número escolhido por gosto. O arquivo passa pelo servidor (ver a
 * rota de upload), e função na Vercel recusa corpo de requisição acima de
 * ~4,5 MB antes de o nosso código rodar — o erro que chega ao navegador nesse
 * caso é genérico e não diz o que houve. Parando em 4 MB, quem recusa somos
 * nós, com uma mensagem que explica o que fazer.
 *
 * Edital de banca grande costuma ter de 300 KB a 2 MB. O que estoura são os
 * digitalizados página a página; para esses, o campo de link continua ali.
 */
export const TAMANHO_MAXIMO_PDF = 4_000_000;

/** Pastas dentro da store, para o conteúdo não virar um monte solto. */
export type Pasta = "aprovados" | "estados" | "editais";

export const PASTAS: Pasta[] = ["aprovados", "estados", "editais"];
