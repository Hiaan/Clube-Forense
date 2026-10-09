// Recebe um arquivo do painel e guarda no Blob: foto de aprovado, imagem de
// estado ou PDF de edital.
//
// O arquivo passa pelo servidor em vez de ir direto do navegador para o Blob.
// A rota direta exige um token de leitura e escrita para assinar o envio, e
// este projeto autentica por OIDC — não existe token desses aqui. Passar pelo
// servidor também é o que permite conferir a sessão de admin antes de aceitar
// qualquer byte.
//
// O preço de passar por aqui é o limite de corpo de requisição da Vercel,
// perto de 4,5 MB. Para foto não pesa, porque o navegador redimensiona antes e
// o arquivo chega com 60 a 200 KB. Para o PDF do edital pesa, e é por isso que
// TAMANHO_MAXIMO_PDF para em 4 MB: assim a recusa vem daqui, explicada, e não
// da plataforma, em inglês e sem dizer o motivo.

import { put } from "@vercel/blob";
import { cookies } from "next/headers";

import { NOME_COOKIE_ADMIN, sessaoAdminValida } from "../../../lib/admin";
import {
  blobConfigurado,
  PASTAS,
  TAMANHO_MAXIMO,
  TAMANHO_MAXIMO_PDF,
  TIPOS_IMAGEM,
  TIPOS_PDF,
  type Pasta,
} from "../../../lib/blob";

export const dynamic = "force-dynamic";

/** Extensão a partir do tipo, para o arquivo no Blob não nascer sem sufixo. */
const EXTENSAO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/**
 * O que cada pasta aceita.
 *
 * A regra fica aqui, e não espalhada em `if`s, porque a pasta é o que o
 * navegador escolhe: sem uma tabela fechada, bastaria mandar `pasta=estados`
 * com um PDF para furar o limite de 1,5 MB das fotos.
 */
const REGRAS: Record<Pasta, { tipos: string[]; limite: number; nome: string; recusa: string }> = {
  aprovados: {
    tipos: TIPOS_IMAGEM,
    limite: TAMANHO_MAXIMO,
    nome: "foto",
    recusa: "Formato não aceito. Use JPG, PNG ou WEBP.",
  },
  estados: {
    tipos: TIPOS_IMAGEM,
    limite: TAMANHO_MAXIMO,
    nome: "foto",
    recusa: "Formato não aceito. Use JPG, PNG ou WEBP.",
  },
  editais: {
    tipos: TIPOS_PDF,
    limite: TAMANHO_MAXIMO_PDF,
    nome: "edital",
    recusa: "O edital precisa ser um PDF.",
  },
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
      "Armazenamento de arquivos não configurado. Crie a store de Blob na Vercel e conecte ao projeto.",
      503,
    );
  }

  const dados = await req.formData().catch(() => null);
  const arquivo = dados?.get("arquivo");
  const pastaBruta = String(dados?.get("pasta") ?? "");

  if (!(arquivo instanceof File)) return erro("Nenhum arquivo recebido.", 400);
  if (!PASTAS.includes(pastaBruta as Pasta)) return erro("Destino inválido.", 400);
  const pasta = pastaBruta as Pasta;
  const regra = REGRAS[pasta];

  if (!regra.tipos.includes(arquivo.type)) return erro(regra.recusa, 415);
  if (arquivo.size > regra.limite) {
    return erro(
      pasta === "editais"
        ? `PDF grande demais (${(arquivo.size / 1_000_000).toFixed(1)} MB). ` +
            "O limite é 4 MB. Comprima o arquivo ou use o campo de link."
        : "Imagem grande demais mesmo depois de reduzida. Tente outra.",
      413,
    );
  }

  // A UF entra no nome do arquivo só para o conteúdo da store ser legível por
  // quem abrir o painel da Vercel. Não é identificação nem controle de acesso:
  // quem manda no vínculo entre estado e arquivo é a coluna no banco.
  const marca = String(dados?.get("uf") ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2);
  const base = marca ? `${regra.nome}-${marca}` : regra.nome;

  try {
    // `addRandomSuffix` evita que dois arquivos com o mesmo nome se sobreponham
    // — e é o que faz o anterior continuar válido enquanto o novo sobe.
    const { url } = await put(`${pasta}/${base}.${EXTENSAO[arquivo.type]}`, arquivo, {
      access: "public",
      addRandomSuffix: true,
      contentType: arquivo.type,
    });
    return Response.json({ url });
  } catch (e) {
    const original = e instanceof Error ? e.message : String(e);
    console.error("Falha ao subir arquivo:", original);

    // A store da Vercel nasce privada se você não marcar o contrário, e aí o
    // envio é recusado com uma mensagem em inglês que não diz o que fazer. Como
    // o arquivo aparece no site para qualquer visitante, o certo aqui é a store
    // pública — a privada exigiria assinar uma URL temporária a cada visita.
    if (/private store|public access/i.test(original)) {
      return erro(
        "A store foi criada como privada, e estes arquivos aparecem no site. " +
          "Crie uma store com acesso público na Vercel (Storage → Create " +
          "Database → Blob), conecte ao projeto e publique de novo.",
        502,
      );
    }

    return erro(`Falha ao subir: ${original}`, 502);
  }
}
