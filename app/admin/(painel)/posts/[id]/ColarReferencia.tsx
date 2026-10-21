"use client";

// A caixa de colar a matéria de referência, no topo do editor.
//
// O PEDIDO ERA ESTE: colar o texto de onde a notícia saiu e receber o post já
// no modelo do Clube, sem reescrever nada à mão. Fica dentro da própria
// notícia, e não numa aba separada, porque é aí que a pessoa está quando
// percebe que o texto do robô ficou curto — e porque o resultado cai direto
// nos campos logo abaixo.
//
// DOIS CAMINHOS, E A TELA DIZ QUAL SAIU. Com chave de IA configurada, quem
// escreve é o Claude: ele lê a matéria inteira e devolve o post no nosso
// modelo, com o que não cabe em campo nenhum. Sem chave — ou com a API fora do
// ar, lenta ou respondendo torto —, o post sai do gerador de campos, que monta
// o texto a partir de banca, vagas, salário, datas e etapa. Nunca sobra erro
// no lugar do texto; o que muda é o aviso embaixo do botão.
//
// COMEÇA FECHADO. A maioria das aberturas do editor é para ajustar vírgula, e
// uma caixa de texto gigante no topo empurraria o título para fora da tela
// todas as vezes.

import { useActionState, useEffect, useState } from "react";

import { reescreverReferenciaAcao, type ResultadoReescrita } from "../../../acoes";

/**
 * O relógio da espera.
 *
 * ELE EXISTE POR UM MOTIVO MEDIDO, NÃO POR ENFEITE. A reescrita leva algumas
 * dezenas de segundos — o modelo lê a matéria, escreve o post e um segundo
 * modelo confere o que saiu —, e durante toda a espera a tela dizia só
 * "Reescrevendo…". Parado, sem número, aquilo lê como travado: a primeira
 * reação de quem clicou foi concluir que nada tinha acontecido. Um contador
 * subindo diz a única coisa que falta dizer, que é "ainda estou aqui".
 *
 * O setInterval mora em efeito e o estado muda dentro do callback, não no
 * corpo — que é a diferença entre um contador e um laço de renderização.
 */
function Relogio() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const etapa =
    segundos < 12
      ? "lendo a matéria"
      : segundos < 30
        ? "escrevendo o post"
        : "conferindo os números";

  return (
    <span className="text-xs text-gray-500">
      {etapa}… {segundos}s
    </span>
  );
}

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
    try {
      const r = await reescreverReferenciaAcao(anterior, dados);
      // O formulário é quem manda nos campos; esta caixa só avisa.
      if (r.ok && r.post) aoReescrever(r);
      return r;
    } catch {
      // SILÊNCIO É O PIOR DEFEITO QUE ESTA TELA PODE TER, e já teve. A ação
      // trata os próprios erros e devolve mensagem; o que ela não tem como
      // tratar é morrer inteira — função desligada no meio por tempo, rede
      // caída, deploy trocando sob os pés. Nesses casos a promessa é recusada,
      // nenhum estado muda e o botão volta ao normal como se nada tivesse sido
      // clicado. Este catch transforma qualquer um desses fins numa frase.
      return {
        ok: false,
        mensagem:
          "A reescrita não voltou do servidor. Normalmente é demora: tente de novo e, se repetir, me avise — o texto montado pelo modelo automático continua funcionando enquanto isso.",
      };
    }
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
            Cole a matéria de onde saiu a notícia e eu escrevo o post no
            modelo do Clube. Os fatos vêm da matéria; as palavras são nossas —
            nada de frase copiada, nada de número inventado e previsão nunca
            vira data marcada. Leia antes de publicar.
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
        {pendente ? (
          <Relogio />
        ) : (
          <span className="text-xs text-gray-400">
            Substitui o título, o resumo e o texto abaixo. Leva algumas dezenas
            de segundos: são duas leituras do modelo, uma para escrever e uma
            para conferir.
          </span>
        )}
      </div>

      {resultado && (
        <div
          role="status"
          className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
            resultado.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {resultado.ok && (
            <span
              className={`mb-1.5 mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                resultado.comIA ? "bg-gray-900 text-[#ffcd07]" : "bg-gray-200 text-gray-700"
              }`}
            >
              {resultado.comIA ? "escrito pela IA" : "modelo automático"}
            </span>
          )}
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
