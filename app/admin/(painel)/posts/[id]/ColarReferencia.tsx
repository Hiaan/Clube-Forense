"use client";

// A caixa de colar a matéria de referência, no topo do editor.
//
// O PEDIDO ERA ESTE: colar o texto de onde a notícia saiu e receber o post já
// no modelo do Clube, sem reescrever nada à mão. Fica dentro da própria
// notícia, e não numa aba separada, porque é aí que a pessoa está quando
// percebe que o texto do robô ficou curto — e porque o resultado cai direto
// nos campos logo abaixo.
//
// O QUE ELE FAZ E O QUE ELE NÃO FAZ, dito na própria tela e não só aqui: lê o
// texto atrás de fatos (banca, vagas, salário, carga horária, datas, etapa,
// Diário Oficial) e manda o nosso gerador escrever o post com eles. O texto
// que sai é inteiramente nosso; da matéria vêm os números. Ele não entende
// contexto nem resume argumento — se a matéria disser algo importante que não
// caiba num desses campos, quem revisa escreve.
//
// COMEÇA FECHADO. A maioria das aberturas do editor é para ajustar vírgula, e
// uma caixa de texto gigante no topo empurraria o título para fora da tela
// todas as vezes.

import { useActionState, useState } from "react";

import { reescreverReferenciaAcao, type ResultadoReescrita } from "../../../acoes";

export default function ColarReferencia({
  uf,
  aoReescrever,
}: {
  /** A UF escolhida no formulário: define o órgão e a ficha usada no texto. */
  uf: string;
  /** Entrega o resultado ao formulário, que troca o conteúdo dos campos. */
  aoReescrever: (r: ResultadoReescrita) => void;
}) {
  const [aberto, setAberto] = useState(false);

  const [resultado, reescrever, pendente] = useActionState<
    ResultadoReescrita | null,
    FormData
  >(async (anterior, dados) => {
    const r = await reescreverReferenciaAcao(anterior, dados);
    // O formulário é quem manda nos campos; esta caixa só avisa.
    if (r.ok && r.post) aoReescrever(r);
    return r;
  }, null);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="w-full rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
      >
        Colar a matéria de referência e reescrever no nosso modelo
      </button>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-gray-900 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900">Colar a referência</h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Cole a matéria de onde saiu a notícia. Eu leio os fatos — banca,
            vagas, salário, carga horária, datas, etapa e publicação no Diário
            Oficial — e escrevo o post no modelo do Clube com eles. O texto que
            sai é nosso; da matéria vêm só os números.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="shrink-0 text-sm font-semibold text-gray-400 hover:text-gray-900"
        >
          fechar
        </button>
      </div>

      {/* Um <form> dentro do <form> do post seria HTML inválido e o navegador
          desmancharia os dois. Por isso o botão não é submit de formulário
          nenhum: ele monta o FormData na mão e chama a ação. */}
      <textarea
        name="referencia"
        id="referencia"
        rows={8}
        placeholder="Cole aqui o texto da matéria, do Diário Oficial ou do comunicado…"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono text-[13px] leading-relaxed outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pendente}
          onClick={() => {
            const caixa = document.getElementById("referencia") as HTMLTextAreaElement | null;
            const dados = new FormData();
            dados.set("referencia", caixa?.value ?? "");
            dados.set("uf", uf);
            reescrever(dados);
          }}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-[#ffcd07] transition hover:bg-gray-800 disabled:opacity-60"
        >
          {pendente ? "Reescrevendo…" : "Reescrever no nosso modelo"}
        </button>
        <span className="text-xs text-gray-400">
          Substitui o título, o resumo e o texto abaixo.
        </span>
      </div>

      {resultado && (
        <div
          role="status"
          className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
            resultado.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {resultado.mensagem}
          {resultado.avisos?.map((a) => (
            <p key={a} className="mt-1.5 font-semibold text-amber-700">
              {a}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
