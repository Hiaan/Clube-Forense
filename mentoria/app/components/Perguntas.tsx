// Perguntas frequentes. `<details>` abre e fecha sem JavaScript.

const PERGUNTAS = [
  {
    p: "Como é a reunião?",
    r: "Uma conversa individual comigo, pelo Google Meet. Quero entender em que ponto você está, qual prova tem em vista e quanto tempo sobra na sua rotina — e, a partir disso, montar com você um plano de estudo personalizado e mostrar como a mentoria se encaixa na sua preparação.",
  },
  {
    p: "Preciso já ser médico(a)?",
    r: "Não. A mentoria atende quem já é formado e quer ser médico legista, e também quem ainda está na graduação e quer chegar ao concurso com a base pronta. É por isso que eu pergunto no formulário: o plano muda conforme o seu momento.",
  },
  {
    p: "Serve para qualquer concurso de médico legista?",
    r: "Sim. O acompanhamento é montado em cima da sua prova-alvo: banca, edital, referência bibliográfica e peso de cada tema. Se ainda não há edital, a rota começa pela base que todos cobram.",
  },
  {
    p: "Como funcionam os encontros?",
    r: "Encontros individuais de uma hora, ao vivo pelo Google Meet, com horário combinado diretamente comigo. O primeiro acontece em até 7 dias depois da sua entrada.",
  },
  {
    p: "E entre um encontro e outro?",
    r: "Você fala direto comigo, no meu WhatsApp privado. Dúvida de conteúdo, de questão, de cronograma — sem fila de fórum e sem intermediário.",
  },
  {
    p: "Por que as vagas são limitadas?",
    r: "Porque eu faço o acompanhamento pessoalmente, um aluno de cada vez. A minha agenda é o limite, e prefiro atender menos gente a dividir a atenção.",
  },
];

export default function Perguntas() {
  return (
    <div className="space-y-3">
      {PERGUNTAS.map(({ p, r }) => (
        <details key={p} className="group rounded-2xl border border-preto/10 bg-white px-5 open:shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] sm:px-7">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-extrabold text-preto marker:hidden sm:text-xl [&::-webkit-details-marker]:hidden">
            {p}
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-preto text-lg font-bold text-ouro transition group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="max-w-2xl pb-6 leading-relaxed text-preto/70">{r}</p>
        </details>
      ))}
    </div>
  );
}
