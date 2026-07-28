// Gera app/components/fotosAprovados.ts a partir dos arquivos reais em
// public/aprovados. Rode depois de adicionar ou remover uma foto:
//
//   npm run fotos
//
// Por que existe: o Avatar é um componente de cliente e não enxerga o disco.
// Sem esse índice ele teria que descobrir a foto por tentativa e erro, pedindo
// .jpg, .jpeg, .png e .webp até desistir — o que gera até 4 requisições 404
// por pessoa sem foto. Com o índice, ele pede exatamente o arquivo que existe,
// e para quem não tem foto não pede nada.

import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "..");
const DIR_FOTOS = join(RAIZ, "public", "aprovados");
const SAIDA = join(RAIZ, "app", "components", "fotosAprovados.ts");

const arquivos = readdirSync(DIR_FOTOS)
  .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
  .sort();

const entradas = arquivos.map((arquivo) => {
  const ponto = arquivo.lastIndexOf(".");
  return [arquivo.slice(0, ponto), arquivo.slice(ponto + 1).toLowerCase()];
});

const corpo = entradas.map(([slug, ext]) => `  "${slug}": "${ext}",`).join("\n");

writeFileSync(
  SAIDA,
  `// ARQUIVO GERADO — não edite à mão.
// Fonte: os arquivos em public/aprovados. Regenere com \`npm run fotos\`.
//
// Mapeia o slug do aprovado para a extensão da foto que realmente existe no
// disco. Quem não aparece aqui simplesmente não tem foto, e o Avatar vai
// direto para o círculo de iniciais, sem disparar requisição nenhuma.

export const FOTOS_APROVADOS: Record<string, string> = {
${corpo}
};
`,
  "utf8",
);

console.log(`${entradas.length} fotos indexadas em ${SAIDA.replace(RAIZ + "/", "")}`);
