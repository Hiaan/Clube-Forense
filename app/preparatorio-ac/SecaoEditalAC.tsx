// O edital da PC-AC, no lugar da faixa de concursos do preparatório geral.
//
// O preparatório geral vende "qualquer concurso"; esta página vende um só, e a
// pergunta de quem chega aqui é outra: "como é esse concurso?". Então o lugar
// onde o geral lista os editais vira a ficha do edital do Acre — áreas,
// salário, datas, como a prova pesa e o que cai —, com tudo tirado do edital
// (ver edital.ts). O argumento de venda está nos números: 75% da objetiva é
// conhecimento específico, e é exatamente isso que o curso ensina.

import Link from "next/link";

import { reais, reaisComCentavos } from "../black/oferta";
import { EDITAL_AC } from "./edital";

const NUMEROS = [
  { valor: "13h às 18h", rotulo: "horário da prova (Acre)" },
  { valor: reaisComCentavos(EDITAL_AC.salario), rotulo: "remuneração inicial" },
  { valor: EDITAL_AC.dataProva, rotulo: "provas objetiva e discursiva" },
  { valor: EDITAL_AC.inscricoes, rotulo: "inscrições pelo site do Idecan" },
  { valor: EDITAL_AC.banca, rotulo: "banca organizadora" },
  { valor: reais(EDITAL_AC.taxa), rotulo: "taxa de inscrição" },
];

/** Os blocos da objetiva, na proporção dos pontos (160 no total). */
const BLOCOS = [
  { nome: "Conhecimentos específicos", questoes: 60, pontos: 120, cor: "bg-[#ffcd07]" },
  { nome: "Conhecimentos básicos", questoes: 24, pontos: 24, cor: "bg-gray-400" },
  { nome: "Conhecimentos jurídicos", questoes: 16, pontos: 16, cor: "bg-gray-300" },
];

const CAI = [
  "Perícias, peritos e documentos médico-legais",
  "Antropologia e identificação",
  "Traumatologia: energias mecânica, química, física e biodinâmica",
  "Asfixiologia",
  "Tanatologia e cronotanatognose",
  "Sexologia forense",
  "Psicopatologia forense e imputabilidade",
  "Infortunística",
  "Exames em vivos e em cadáveres",
  "Toxicologia forense",
  "Patologia e exames laboratoriais",
  "Lei nº 12.030/2009 e Código de Ética Médica",
];

export default function SecaoEditalAC() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {NUMEROS.map((n) => (
          <div key={n.rotulo} className="card-white p-5 text-center">
            <p className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              {n.valor}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {n.rotulo}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
            as áreas do cargo
          </p>
          <ul className="mt-4 divide-y divide-gray-100">
            {EDITAL_AC.areas.map((v) => (
              <li key={v.area} className="flex items-start gap-3 py-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#ffcd07]" />
                <span>
                  <span className="block text-sm font-bold text-gray-900">
                    {v.area}
                  </span>
                  <span className="block text-xs leading-relaxed text-gray-500">
                    {v.onde}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Requisitos: graduação em medicina, CRM ativo e CNH AB. Regime de
            dedicação exclusiva, com até 40 horas semanais.
          </p>
        </div>

        <div className="card-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
            como a prova pesa
          </p>
          <p className="mt-3 text-lg font-black leading-snug text-gray-900">
            75% da objetiva é conhecimento específico, com peso 2
          </p>
          <div className="mt-4 flex h-4 overflow-hidden rounded-full">
            {BLOCOS.map((b) => (
              <div
                key={b.nome}
                className={b.cor}
                style={{ width: `${(b.pontos / 160) * 100}%` }}
              />
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {BLOCOS.map((b) => (
              <li key={b.nome} className="flex items-center gap-3 text-sm">
                <span className={`h-3 w-3 shrink-0 rounded-full ${b.cor}`} />
                <span className="flex-1 text-gray-700">{b.nome}</span>
                <span className="font-semibold tabular-nums text-gray-900">
                  {b.questoes} questões · {b.pontos} pts
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            Depois vêm a discursiva (redação de 20 a 30 linhas sobre
            conhecimentos específicos, 40 pontos), os títulos, o teste físico,
            o psicotécnico, o exame médico e a investigação social.
          </p>
        </div>
      </div>

      <div className="card-white mt-6 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
          o que cai de medicina legal
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CAI.map((c) => (
            <span
              key={c}
              className="rounded-full border border-gray-200 bg-[#f8f9fb] px-3.5 py-1.5 text-sm font-semibold text-gray-800"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          A medicina legal do edital é o centro do preparatório, com aulas,
          questões e mapas mentais feitos por médicos legistas.{" "}
          <Link
            href={EDITAL_AC.materia}
            className="font-bold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
          >
            Leia a análise completa do edital
          </Link>{" "}
          ou{" "}
          <a
            href={EDITAL_AC.editalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-gray-900 underline decoration-[#ffcd07] decoration-2 underline-offset-4"
          >
            abra o edital oficial
          </a>
          .
        </p>
      </div>
    </div>
  );
}
