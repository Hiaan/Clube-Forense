import { get, list, put } from "@vercel/blob";

// Leads guardados no Vercel Blob, um arquivo JSON por envio, em leads/.
// O store precisa estar conectado ao projeto na Vercel (Storage → Blob);
// a conexão cria BLOB_READ_WRITE_TOKEN (ou BLOB_STORE_ID, via OIDC) sozinha.

export type LeadSalvo = {
  etapa: "lead" | "agendamento";
  nome: string;
  email: string;
  whatsapp: string;
  whatsappFormatado: string;
  faturamento: string | null;
  reuniao: { data: string; horario: string; fuso: string; descricao: string } | null;
  origem: string | null;
  /** Idioma em que a pessoa viu o site (pt, en ou es). */
  idioma?: string;
  recebidoEm: string;
};

const ACESSO = process.env.LEADS_BLOB_ACCESS === "public" ? "public" : "private";
const PASTA = "leads/";

export const armazenamentoConfigurado = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export async function salvarLead(lead: LeadSalvo) {
  const quando = lead.recebidoEm.replace(/[:.]/g, "-");
  const quem = lead.email.replace(/[^a-z0-9]+/gi, "-").slice(0, 60);
  await put(`${PASTA}${quando}-${lead.etapa}-${quem}.json`, JSON.stringify(lead, null, 2), {
    access: ACESSO,
    contentType: "application/json",
    addRandomSuffix: true,
  });
}

/** Leads mais recentes primeiro. */
export async function listarLeads(limite = 300): Promise<LeadSalvo[]> {
  const blobs = [];
  let cursor: string | undefined;
  do {
    const pagina = await list({ prefix: PASTA, cursor, limit: 1000 });
    blobs.push(...pagina.blobs);
    cursor = pagina.hasMore ? pagina.cursor : undefined;
  } while (cursor);

  const recentes = blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, limite);

  const leads = await Promise.all(
    recentes.map(async (b) => {
      try {
        const arquivo = await get(b.pathname, { access: ACESSO });
        if (!arquivo || arquivo.statusCode !== 200) return null;
        return (await new Response(arquivo.stream).json()) as LeadSalvo;
      } catch {
        return null;
      }
    }),
  );
  return leads.filter((l): l is LeadSalvo => l !== null);
}
