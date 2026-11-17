// A ficha do concurso da PC-TO, no lugar da faixa de editais do preparatório
// geral. Sem edital ainda, ela mostra o que já está definido (banca,
// subsídio, etapas, cidades) e o que estudar enquanto o edital não sai.

import { reaisComCentavos } from "../black/oferta";
import { DADOS_TO } from "./dados";

const NUMEROS = [
  { valor: DADOS_TO.banca, rotulo: `banca definida em ${DADOS_TO.bancaDefinidaEm}` },
  { valor: reaisComCentavos(DADOS_TO.subsidio), rotulo: "subsídio inicial do perito oficial" },
  { valor: "Em breve", rotulo: "edital: o próximo passo" },
];

/** A base de medicina legal que cai em todo concurso de médico legista. */
const BASE = [
  "Perícias, peritos e documentos médico-legais",
  "Traumatologia forense",
  "Asfixiologia",
  "Tanatologia e cronotanatognose",
  "Sexologia forense",
  "Antropologia e identificação",
  "Psicopatologia forense",
  "Toxicologia forense",
];

export default function SecaoConcursoTO() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="grid gap-3 sm:grid-cols-3">
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
            as etapas previstas
          </p>
          <ol className="mt-4 space-y-2.5">
            {DADOS_TO.etapas.map((e, i) => (
              <li key={e} className="flex items-center gap-3 text-sm text-gray-800">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gray-900 text-xs font-black text-[#ffcd07]">
                  {i + 1}
                </span>
                {e}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-gray-500">
            A primeira etapa deve ser aplicada em {DADOS_TO.cidadesPrimeiraEtapa};
            as demais, em Palmas. O último concurso com vagas de médico legista
            na PC-TO foi em {DADOS_TO.ultimoConcurso}.
          </p>
        </div>

        <div className="card-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
            o estilo da banca
          </p>
          <p className="mt-3 text-lg font-black leading-snug text-gray-900">
            Cebraspe pede treino no formato da banca, não só conteúdo
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            A Cebraspe costuma cobrar questões de certo ou errado em que a
            resposta errada desconta ponto. Nesse formato, saber medicina legal
            pela metade custa caro: é o domínio do conteúdo, treinado em
            questões, que separa quem marca com segurança de quem deixa em
            branco.
          </p>
        </div>
      </div>

      <div className="card-white mt-6 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b38f00]">
          o que estudar até o edital sair
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {BASE.map((c) => (
            <span
              key={c}
              className="rounded-full border border-gray-200 bg-[#f8f9fb] px-3.5 py-1.5 text-sm font-semibold text-gray-800"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          É a base de medicina legal que cai em todo concurso de médico legista.
          Quem estuda agora chega ao edital com a maior parte da prova
          específica já vista, e usa o tempo depois dele para revisar e treinar
          questões.
        </p>
      </div>
    </div>
  );
}
