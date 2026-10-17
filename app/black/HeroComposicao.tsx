// A composição da capa: os três professores e a plataforma, lado a lado.
//
// O QUE ESTA IMAGEM PRECISA DIZER EM UM SEGUNDO: "quem ensina aqui é
// médico-legista de verdade, e existe uma plataforma por trás". São as duas
// coisas que separam o Clube de um cursinho genérico, e nenhuma das duas cabe
// num título — por isso elas entram como imagem, à direita do texto.
//
// POR QUE EM LEQUE, E NÃO LADO A LADO. As fotos dos professores são artes
// prontas, com fundo próprio e o nome gravado embaixo. Em fileira, três
// retângulos com três fundos diferentes brigam entre si. Sobrepostos e
// levemente girados, viram um grupo: o do meio à frente, os outros atrás, como
// quem posa para a foto da equipe. A moldura escura por baixo de cada um
// costura os três fundos num só.
//
// A TELA DA PLATAFORMA FLUTUA NA FRENTE porque é o que a referência faz com os
// notebooks — o produto aparece junto das pessoas, não numa seção distante. É
// a mesma maquete da seção da plataforma, reduzida: nenhuma captura de tela
// inventada.

import Image from "next/image";

const PROFESSORES = [
  { arquivo: "erika.png", nome: "Dra. Erika Anjos" },
  { arquivo: "joao-paulo.png", nome: "Dr. João Paulo" },
  { arquivo: "miguel.png", nome: "Dr. Miguel Souza" },
];

/**
 * A telinha abaixo das fotos: a plataforma de verdade, rodando.
 *
 * Era uma maquete em CSS, por falta de material. Com a gravação do catálogo
 * convertida para vídeo, a capa passa a mostrar o produto em vez de uma
 * representação dele — que é o que a referência faz com os notebooks. Sem som,
 * em laço e sem controles: é cenário, não mídia para assistir.
 */
function TelaFlutuante() {
  return (
    <div className="w-[92%] max-w-[380px] rounded-2xl border border-white/15 bg-[#101016] p-2 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-1.5 px-1 pb-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider text-white/30">
          plataforma do Clube
        </span>
      </div>
      {/* DOIS FORMATOS, E NÃO É PRECIOSISMO. O H.264 (mp4) é o que Safari e
          iPhone tocam; o VP9 (webm) é o que builds livres do Chromium tocam —
          o navegador de teste desta máquina é um deles, e com só o mp4 o quadro
          ficava preto. O navegador escolhe a primeira fonte que sabe ler. */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        className="aspect-[16/9] w-full rounded-lg object-cover"
      >
        <source src="/black/catalogo.webm" type="video/webm" />
        <source src="/black/catalogo.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

export default function HeroComposicao({ aprovados }: { aprovados: number }) {
  return (
    <div className="relative mx-auto w-full max-w-[520px] px-2 pt-6">
      {/* Brilho atrás do grupo: separa a composição do fundo preto sem precisar
          de borda, e é o que dá a sensação de luz de estúdio. */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffcd07]/15 blur-[90px]" />

      {/* NADA SE SOBREPÕE A UM ROSTO. A primeira montagem jogava a telinha por
          cima da foto da esquerda e cortava a da direita na borda da coluna —
          sobrava um professor e meio à vista. Os três ficam lado a lado, com a
          sobreposição medida nas quinas, e a plataforma desce para baixo do
          grupo: aparece inteira e não disputa espaço com ninguém. */}
      <div className="relative z-10 flex items-end justify-center">
        {PROFESSORES.map((p, i) => {
          const meio = i === 1;
          return (
            <div
              key={p.arquivo}
              className={`relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ${
                meio
                  ? "z-20 w-[38%]"
                  : i === 0
                    ? "z-10 -mr-5 w-[32%] -rotate-6"
                    : "z-10 -ml-5 w-[32%] rotate-6"
              }`}
            >
              <Image
                src={`/black/professores/${p.arquivo}`}
                alt={p.nome}
                width={424}
                height={632}
                priority
                sizes="(max-width: 640px) 36vw, 200px"
                className="h-auto w-full object-cover"
              />
              {/* Véu escuro por baixo: iguala os três fundos e faz o nome
                  gravado na arte continuar legível sobre qualquer um deles. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          );
        })}

        <div className="absolute -top-4 right-0 z-30 rounded-2xl border border-[#ffcd07]/40 bg-[#0b0b0d]/90 px-4 py-2.5 text-center backdrop-blur">
          <p className="text-xl font-black leading-none text-[#ffcd07]">{aprovados}</p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
            aprovados
          </p>
        </div>
      </div>

      {/* Sem sobreposição com as fotos: o nome e o CRM de cada professor estão
          gravados na base da arte, e qualquer avanço da telinha corta
          justamente a credencial que a imagem existe para mostrar. */}
      <div className="relative z-20 mt-4 flex justify-center">
        <TelaFlutuante />
      </div>
    </div>
  );
}
