// Perguntas frequentes. `<details>` abre e fecha sem JavaScript.

const PERGUNTAS = [
  {
    p: "Como é a reunião?",
    r: "Uma conversa individual com o Miguel pelo Google Meet. Ele quer entender em que ponto você está, qual prova tem em vista e quanto tempo sobra na sua rotina — e, a partir disso, mostrar como a mentoria se encaixaria na sua preparação.",
  },
  {
    p: "Preciso já ser médico(a)?",
    r: "Não. A mentoria atende quem já é formado e quer ser médico legista, e também quem ainda está na graduação e quer chegar ao concurso com a base pronta. É por isso que perguntamos no formulário: o plano muda conforme o seu momento.",
  },
  {
    p: "Serve para qualquer concurso de médico legista?",
    r: "Sim. O acompanhamento é montado em cima da sua prova-alvo: banca, edital e peso de cada tema. Se ainda não há edital, a rota começa pela base que todos cobram.",
  },
  {
    p: "Como funcionam os encontros?",
    r: "Encontros individuais de uma hora, ao vivo pelo Google Meet, com horário combinado diretamente com o Miguel. Em cada um: revisão do que você estudou, resolução de questões, discussão de casos e o planejamento da semana seguinte. O primeiro encontro acontece em até 7 dias depois da sua entrada.",
  },
  {
    p: "E entre um encontro e outro?",
    r: "Você fala direto com o Miguel pelo WhatsApp privado dele. Dúvida de conteúdo, de questão, de cronograma — sem fila de fórum e sem intermediário.",
  },
  {
    p: "Por que as vagas são limitadas?",
    r: "Porque o acompanhamento é feito pessoalmente pelo Miguel, um aluno de cada vez. A agenda dele é o limite, e ele prefere atender menos gente a dividir a atenção.",
  },
];

export default function Perguntas() {
  return (
    <div className="divide-y divide-tinta/10 border-y border-tinta/10">
      {PERGUNTAS.map(({ p, r }) => (
        <details key={p} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-serif text-xl text-tinta marker:hidden sm:text-2xl [&::-webkit-details-marker]:hidden">
            {p}
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center border border-tinta/20 font-mono text-sm transition group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="max-w-2xl pb-6 text-[17px] leading-relaxed text-tinta/70">{r}</p>
        </details>
      ))}
    </div>
  );
}
