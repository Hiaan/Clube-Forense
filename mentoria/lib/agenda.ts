// Regras da agenda da reunião, usadas pelo formulário e pela API.
//
// O mesmo arquivo roda nos dois lados de propósito: o formulário só mostra os
// dias que a API vai aceitar, e a API recusa o que alguém montar à mão. Se as
// regras morassem em dois lugares, um dia elas iam discordar.
//
// Tudo é calculado no fuso do Miguel (Recife, UTC-3 o ano todo), não no do
// visitante nem no do servidor da Vercel, que roda em UTC. Sem isso, quem
// abrisse a página às 22h veria "amanhã" já como depois de amanhã.

export const FUSO = "America/Recife";

/** Dias de antecedência mínima: quem vê a página hoje só agenda de amanhã em diante. */
export const ANTECEDENCIA_DIAS = 1;

/** Quantos dias à frente a agenda mostra, contando a partir de amanhã. */
export const JANELA_DIAS = 21;

/** Dias da semana com reunião (0 = domingo). Domingo fica de fora. */
export const DIAS_DA_SEMANA = [1, 2, 3, 4, 5, 6];

/** Horários oferecidos, no fuso do Miguel. */
export const HORARIOS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export interface Dia {
  /** Data no formato AAAA-MM-DD. */
  iso: string;
  diaSemana: number;
}

/** A data de hoje no fuso do Miguel, como AAAA-MM-DD. */
export function hojeNoFuso(agora: Date = new Date()): string {
  // `en-CA` formata como AAAA-MM-DD, que é exatamente o que precisamos.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

function paraUtc(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

function somarDias(iso: string, n: number): Dia {
  const data = paraUtc(iso);
  data.setUTCDate(data.getUTCDate() + n);
  return { iso: data.toISOString().slice(0, 10), diaSemana: data.getUTCDay() };
}

/** Os dias que podem ser escolhidos, a partir de `hoje` (AAAA-MM-DD). */
export function diasDisponiveis(hoje: string): Dia[] {
  const dias: Dia[] = [];
  for (let i = ANTECEDENCIA_DIAS; i < ANTECEDENCIA_DIAS + JANELA_DIAS; i++) {
    const dia = somarDias(hoje, i);
    if (DIAS_DA_SEMANA.includes(dia.diaSemana)) dias.push(dia);
  }
  return dias;
}

export function dataValida(iso: string, agora: Date = new Date()): boolean {
  return diasDisponiveis(hojeNoFuso(agora)).some((d) => d.iso === iso);
}

export function horarioValido(horario: string): boolean {
  return HORARIOS.includes(horario);
}

/** "sexta-feira, 31 de outubro" */
export function dataPorExtenso(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(paraUtc(iso));
}

/** Pedaços da data para o cartão do dia: "sex", "31", "out". */
export function partesDaData(iso: string) {
  const data = paraUtc(iso);
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...o })
      .format(data)
      .replace(".", "");
  return {
    semana: f({ weekday: "short" }),
    dia: f({ day: "2-digit" }),
    mes: f({ month: "short" }),
  };
}

/** "19:00" → "19h" */
export function horarioCurto(horario: string): string {
  const [h, m] = horario.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}
