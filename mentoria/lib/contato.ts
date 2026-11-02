// Validação de nome, e-mail e WhatsApp, usada pelas duas rotas: a do contato
// (primeiro passo do formulário) e a do agendamento (último).

import type { Contato } from "./notificar";

export interface CorpoContato {
  id?: string;
  nome?: string;
  email?: string;
  telefone?: string;
}

/** Devolve o contato limpo ou a mensagem de erro para mostrar à pessoa. */
export function lerContato(corpo: CorpoContato): Contato | string {
  const id = String(corpo.id ?? "").replace(/[^\w-]/g, "").slice(0, 64);
  const nome = (corpo.nome ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const email = (corpo.email ?? "").trim().toLowerCase().slice(0, 160);
  const telefone = (corpo.telefone ?? "").replace(/\D/g, "");

  if (nome.length < 3) return "Informe seu nome completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Confira o seu e-mail.";
  if (telefone.length < 10 || telefone.length > 13) return "Confira o WhatsApp: DDD + número.";
  return { id, nome, email, telefone };
}
