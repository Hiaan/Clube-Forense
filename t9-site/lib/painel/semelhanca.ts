import "server-only";
import sharp from "sharp";

// "Impressão digital" visual de uma imagem (dHash de 64 bits): reduz a imagem a 9×8
// em tons de cinza e compara cada pixel com o vizinho. Imagens iguais (mesmo que
// recomprimidas ou em outro tamanho) dão hashes iguais ou quase iguais.

const ZERO = BigInt(0);
const UM = BigInt(1);

export async function hashVisual(url: string): Promise<bigint | null> {
  try {
    const resposta = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
    if (!resposta.ok) return null;
    const pixels = await sharp(Buffer.from(await resposta.arrayBuffer()))
      .grayscale()
      .resize(9, 8, { fit: "fill" })
      .raw()
      .toBuffer();
    let hash = BigInt(0);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) hash = (hash << UM) | (pixels[y * 9 + x] < pixels[y * 9 + x + 1] ? UM : ZERO);
    }
    return hash;
  } catch {
    return null;
  }
}

/** Quantos dos 64 bits diferem (0 = idênticas). */
export function distancia(a: bigint, b: bigint) {
  let x = a ^ b;
  let n = 0;
  while (x) {
    n += Number(x & UM);
    x >>= UM;
  }
  return n;
}

/** Executa tarefas com no máximo `limite` ao mesmo tempo. */
export async function emParalelo<T, R>(itens: T[], limite: number, tarefa: (item: T) => Promise<R>) {
  const resultados: R[] = new Array(itens.length);
  let proximo = 0;
  await Promise.all(
    Array.from({ length: Math.min(limite, itens.length) }, async () => {
      while (proximo < itens.length) {
        const i = proximo++;
        resultados[i] = await tarefa(itens[i]);
      }
    }),
  );
  return resultados;
}
