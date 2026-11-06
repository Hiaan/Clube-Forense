// ROTA TEMPORÁRIA: grava um post pronto no blog, para publicar a matéria do
// edital da PC-AC sem passar pelo editor. Protegida pelo hash de um token que
// só existe fora do repositório. Será removida logo depois do uso.

import { createHash, timingSafeEqual } from "node:crypto";

import { gravarPost, slugOcupado, type PostParaGravar } from "../../lib/postsRepo";

export const dynamic = "force-dynamic";

const HASH = "0a54f4c633fabba972654023b3bd6ff9beed4e68e6445453c6ddb2c4e4f4916a";

export async function POST(req: Request) {
  const token = req.headers.get("x-token") ?? "";
  const recebido = createHash("sha256").update(token).digest();
  if (!timingSafeEqual(recebido, Buffer.from(HASH, "hex"))) {
    return Response.json({ ok: false }, { status: 404 });
  }
  const p = (await req.json()) as PostParaGravar;
  if (!p.id && (await slugOcupado(p.slug))) {
    return Response.json({ ok: false, erro: "slug ocupado" }, { status: 409 });
  }
  const id = await gravarPost(p);
  return Response.json({ ok: Boolean(id), id });
}
