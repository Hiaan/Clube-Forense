// Recebe uma imagem do painel e guarda no Blob.
//
// O arquivo passa pelo servidor em vez de ir direto do navegador para o Blob.
// A rota direta exige um token de leitura e escrita para assinar o envio, e
// este projeto autentica por OIDC — não existe token desses aqui. Passar pelo
// servidor também é o que permite conferir a sessão de admin antes de aceitar
// qualquer byte.
//
// O tamanho não é problema porque o navegador redimensiona antes: uma foto de
// celular chega com algo entre 60 e 200 KB, bem abaixo do limite de corpo de
// requisição da Vercel.

import { put } from "@vercel/blob";
import { cookies } from "next/headers";

import { NOME_COOKIE_ADMIN, sessaoAdminValida } from "../../../lib/admin";
import { blobConfigurado, PASTAS, TAMANHO_MAXIMO, TIPOS_IMAGEM, type Pasta } from "../../../lib/blob";

export const dynamic = "force-dynamic";

/** Extensão a partir do tipo, para o arquivo no Blob não nascer sem sufixo. */
const EXTENSAO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function erro(mensagem: string, status: number): Response {
  return Response.json({ erro: mensagem }, { status });
}

export async function POST(req: Request): Promise<Response> {
  const jar = await cookies();
  if (!sessaoAdminValida(jar.get(NOME_COOKIE_ADMIN)?.value)) {
    return erro("Sessão expirada. Entre novamente.", 401);
  }

  if (!blobConfigurado()) {
    return erro(
      "Armazenamento de imagens não configurado. Crie a store de Blob na Vercel e conecte ao projeto.",
      503,
    );
  }

  const dados = await req.formData().catch(() => null);
  const arquivo = dados?.get("arquivo");
  const pastaBruta = String(dados?.get("pasta") ?? "");

  if (!(arquivo instanceof File)) return erro("Nenhum arquivo recebido.", 400);
  if (!PASTAS.includes(pastaBruta as Pasta)) return erro("Destino inválido.", 400);
  const pasta = pastaBruta as Pasta;

  if (!TIPOS_IMAGEM.includes(arquivo.type)) {
    return erro("Formato não aceito. Use JPG, PNG ou WEBP.", 415);
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return erro("Imagem grande demais mesmo depois de reduzida. Tente outra.", 413);
  }

  try {
    // `addRandomSuffix` evita que duas fotos com o mesmo nome se sobreponham —
    // e é o que faz a imagem antiga continuar válida enquanto a nova sobe.
    const { url } = await put(`${pasta}/foto.${EXTENSAO[arquivo.type]}`, arquivo, {
      access: "public",
      addRandomSuffix: true,
      contentType: arquivo.type,
    });
    return Response.json({ url });
  } catch (e) {
    console.error("Falha ao subir imagem:", e instanceof Error ? e.message : e);
    return erro(
      e instanceof Error ? `Falha ao subir: ${e.message}` : "Falha ao subir a imagem.",
      502,
    );
  }
}
