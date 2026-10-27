"use client";

// O Dr. Bonet, demonstrado.
//
// É UMA DEMONSTRAÇÃO, E A PÁGINA DIZ ISSO. O que roda aqui são perguntas e
// respostas escritas por nós, encenadas com efeito de digitação — não é o
// Dr. Bonet respondendo ao vivo. Fingir uma IA funcionando numa página de
// vendas é o tipo de coisa que a pessoa descobre no primeiro dia de acesso, e
// aí toda a promessa da página vira suspeita. A etiqueta "exemplo" fica
// visível, e o que a demonstração mostra é o FORMATO da resposta: direta e com
// a referência bibliográfica ao lado.
//
// RESPEITA QUEM PEDIU MENOS MOVIMENTO. Com `prefers-reduced-motion`, o texto
// aparece inteiro, sem digitação — o conteúdo é exatamente o mesmo.
//
// COMO A DIGITAÇÃO FOI ESCRITA. Cada resposta é um componente próprio, trocado
// por `key`: ao mudar de pergunta o React monta um componente novo, que começa
// do zero sozinho. É o que dispensa "zerar o texto" dentro de um efeito —
// padrão que o lint do projeto barra, por disparar renderização em cascata.

import { useEffect, useState, useSyncExternalStore } from "react";

interface Troca {
  pergunta: string;
  resposta: string;
  fonte: string;
}

const EXEMPLOS: Troca[] = [
  {
    pergunta: "Qual a diferença entre livor cadavérico e equimose?",
    resposta:
      "O livor é acúmulo passivo de sangue nos vasos das regiões de declive, some à digitopressão nas primeiras horas e não tem infiltração nos tecidos. A equimose é infiltração hemorrágica no tecido, por ruptura vascular em vida — não desaparece à pressão e tem reação vital.",
    fonte: "França, Medicina Legal · Tanatologia",
  },
  {
    pergunta: "Como se estima o intervalo post mortem pela mancha verde?",
    resposta:
      "A mancha verde abdominal costuma surgir entre 18 e 24 horas após a morte, na fossa ilíaca direita, marcando o início do período de transformação. Temperatura ambiente alta antecipa; frio retarda.",
    fonte: "Hygino, Medicina Legal · Cronotanatognose",
  },
  {
    pergunta: "O que caracteriza a lesão corporal gravíssima no Código Penal?",
    resposta:
      "Incapacidade permanente para o trabalho, enfermidade incurável, perda ou inutilização de membro, sentido ou função, deformidade permanente e aborto — art. 129, §2º. A perícia descreve o achado; o enquadramento é do juiz.",
    fonte: "Delton Croce · Manual de Medicina Legal",
  },
];

/** Avisa quando a preferência de movimento do sistema muda. */
function assinarMovimento(aoMudar: () => void): () => void {
  const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
  consulta.addEventListener("change", aoMudar);
  return () => consulta.removeEventListener("change", aoMudar);
}

function querMenosMovimento(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** No servidor, assume o caminho sem animação: é o que é seguro desenhar. */
function semMovimento(): boolean {
  return true;
}

/** A resposta sendo escrita. Remontada a cada pergunta, via `key`. */
function Resposta({
  texto,
  fonte,
  anima,
}: {
  texto: string;
  fonte: string;
  anima: boolean;
  /** Chamado quando a escrita termina, para a página seguir para a próxima. */
}) {
  const [letras, setLetras] = useState(anima ? 0 : texto.length);

  useEffect(() => {
    if (!anima) return;
    const id = setInterval(() => {
      // A troca de estado acontece no aviso do intervalo, e não durante o
      // efeito: o componente não re-renderiza em cascata na montagem.
      setLetras((n) => {
        if (n >= texto.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 18);
    return () => clearInterval(id);
  }, [anima, texto]);

  const terminou = letras >= texto.length;

  return (
    <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-[#ffcd07]/20 bg-[#ffcd07]/[0.06] px-4 py-3">
      <p className="text-sm leading-relaxed text-white/85">
        {texto.slice(0, letras)}
        {!terminou && "▍"}
      </p>
      {/* A fonte ocupa o lugar desde o começo, só aparece no fim: surgir do
          nada somava uma linha à caixa e empurrava a página. */}
      <p
        className={`mt-2.5 text-[11px] font-semibold text-[#ffcd07] transition-opacity ${
          terminou ? "opacity-100" : "opacity-0"
        }`}
      >
        📖 {fonte}
      </p>
    </div>
  );
}

export default function DrBonet() {
  const [indice, setIndice] = useState(0);
  const reduzir = useSyncExternalStore(
    assinarMovimento,
    querMenosMovimento,
    semMovimento,
  );
  const anima = !reduzir;

  // Passa para a próxima pergunta sozinho. O tempo é o de ler a resposta, e
  // não o de ver a animação: quem desligou o movimento também avança.
  useEffect(() => {
    const id = setTimeout(() => {
      setIndice((i) => (i + 1) % EXEMPLOS.length);
    }, 12_000);
    return () => clearTimeout(id);
  }, [indice]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#101016]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ffcd07] text-sm font-black text-gray-900">
            B
          </span>
          <span>
            <span className="block text-sm font-bold text-white">
              Dr. Bonet
            </span>
            <span className="block text-[11px] text-white/40">
              disponível a qualquer hora
            </span>
          </span>
        </div>
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          exemplo
        </span>
      </div>

      {/* ALTURA FIXA, A DA MAIOR RESPOSTA. A conversa cresce enquanto a
          resposta é "digitada" e encolhe quando a próxima pergunta entra; no
          celular, cada mudança empurrava a página inteira para cima e para
          baixo enquanto a pessoa lia mais embaixo. Todas as trocas ficam
          empilhadas na mesma célula da grade — as que não estão na vez,
          invisíveis mas ocupando lugar —, e a caixa fica sempre com a altura
          da mais longa. */}
      <div className="grid px-5 py-6">
        {/* Camadas de medida: todas as trocas completas, invisíveis. A
            célula fica com a altura da maior, inclusive enquanto ela mesma
            está sendo digitada. */}
        {EXEMPLOS.map((t) => (
          <div
            key={t.pergunta}
            aria-hidden
            className="invisible col-start-1 row-start-1 space-y-4"
          >
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-white/10 px-4 py-3 text-sm text-white/85">
                {t.pergunta}
              </p>
            </div>
            <div className="flex justify-start">
              <Resposta texto={t.resposta} fonte={t.fonte} anima={false} />
            </div>
          </div>
        ))}
        {/* A troca da vez, por cima, no mesmo lugar. */}
        <div className="col-start-1 row-start-1 space-y-4">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-white/10 px-4 py-3 text-sm text-white/85">
              {EXEMPLOS[indice].pergunta}
            </p>
          </div>
          <div className="flex justify-start">
            <Resposta
              key={indice}
              texto={EXEMPLOS[indice].resposta}
              fonte={EXEMPLOS[indice].fonte}
              anima={anima}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-t border-white/10 px-5 py-3">
        {EXEMPLOS.map((e, i) => (
          <button
            key={e.pergunta}
            onClick={() => setIndice(i)}
            aria-label={`Ver exemplo ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === indice
                ? "w-7 bg-[#ffcd07]"
                : "w-3 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
