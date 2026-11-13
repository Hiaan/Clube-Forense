import "server-only";
import { chamarPonte, ponteConfigurada, type EstadoDaPonte } from "@/lib/painel/whatsapp";

// WhatsApp da agência: conectado pelo QR Code, na mesma ponte (servidor) da T9, numa sessão
// própria ("p<id da agência>"). Relatórios e alertas saem do número da agência, nunca do da T9.

export type EstadoWhatsapp = Omit<EstadoDaPonte, "fase"> & { fase: EstadoDaPonte["fase"] | "desligado" };

const sessao = (agenciaId: number) => `p${agenciaId}`;

export async function estadoWhatsapp(agenciaId: number): Promise<EstadoWhatsapp> {
  const vazio = { qr: "", numero: "", nome: "", desde: "", erro: "" };
  if (!ponteConfigurada()) return { fase: "sem-config", ...vazio };
  try {
    return await chamarPonte<EstadoWhatsapp>(`/clientes/${sessao(agenciaId)}/estado`, undefined, 6000);
  } catch (erro) {
    return { fase: "fora", ...vazio, erro: erro instanceof Error ? erro.message : String(erro) };
  }
}

export const conectarWhatsapp = (agenciaId: number) => chamarPonte<EstadoWhatsapp>(`/clientes/${sessao(agenciaId)}/conectar`, {}, 20_000);
export const desconectarWhatsapp = (agenciaId: number) => chamarPonte(`/clientes/${sessao(agenciaId)}/sair`, {}, 20_000);

export function enviarPelaAgencia(agenciaId: number, numero: string, texto: string) {
  return chamarPonte<{ ok: boolean }>(`/clientes/${sessao(agenciaId)}/enviar`, { numero: `+${numero.replace(/\D/g, "")}`, texto }, 60_000);
}

/** Manda para cada número; devolve os erros ("número: motivo"). Vazio = todos receberam. */
export async function enviarParaTodos(agenciaId: number, numeros: string[], texto: string) {
  const erros: string[] = [];
  for (const n of numeros) {
    try {
      await enviarPelaAgencia(agenciaId, n, texto);
    } catch (e) {
      erros.push(`${n}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return erros;
}
