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

/** Tipos aceitos no upload. Fechado de propósito: o painel só recebe imagem. */
export const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"];

/**
 * Teto do arquivo que chega ao Blob: 1,5 MB.
 *
 * O navegador redimensiona antes de enviar, então uma foto de celular chega
 * com algo entre 60 e 200 KB. Este limite existe para o caso de o
 * redimensionamento falhar — e para impedir que um PNG gigante entre inteiro.
 */
export const TAMANHO_MAXIMO = 1_500_000;

/** Pastas dentro da store, para o conteúdo não virar um monte solto. */
export type Pasta = "aprovados" | "estados";

export const PASTAS: Pasta[] = ["aprovados", "estados"];
