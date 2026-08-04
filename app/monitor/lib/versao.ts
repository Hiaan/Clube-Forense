// Identificação do código que está publicado.
//
// Existe por uma razão prática: descobrir QUAL commit está no ar não deveria
// exigir dedução. Passamos vários turnos inferindo isso a partir de efeitos
// colaterais ("o campo X apareceu, logo o commit Y subiu"), com dois projetos
// da Vercel em jogo e deploys promovidos fora de ordem. Um campo direto elimina
// a adivinhação.
//
// A Vercel injeta estas variáveis automaticamente em todo build; não é preciso
// configurar nada. Fora dela (ambiente local), ficam nulas — e o campo `ondeRoda`
// diz "local", que já é a resposta certa.

export interface Versao {
  /** SHA curto do commit publicado, ou null fora da Vercel. */
  commit: string | null;
  commitCompleto: string | null;
  /** Branch de onde o deploy saiu — revela deploy do branch errado. */
  branch: string | null;
  mensagem: string | null;
  /** "production", "preview" ou "local". */
  ondeRoda: string;
  /** Momento em que esta resposta foi gerada. */
  geradoEm: string;
}

export function versaoAtual(): Versao {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
  return {
    commit: sha ? sha.slice(0, 7) : null,
    commitCompleto: sha,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    mensagem: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? null,
    ondeRoda: process.env.VERCEL_ENV ?? "local",
    geradoEm: new Date().toISOString(),
  };
}
