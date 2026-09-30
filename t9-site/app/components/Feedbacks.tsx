import type { CSSProperties, ReactNode } from "react";
import { Subtitulo, Titulo } from "./ui";

/** Trecho ocultado por privacidade do cliente. */
function Tarja({ largura }: { largura: number }) {
  return <span className="tarja" style={{ width: largura }} aria-label="trecho ocultado" role="img" />;
}

function Conversa({
  children,
  className = "",
  d = 0,
}: {
  children: ReactNode;
  className?: string;
  d?: number;
}) {
  return (
    <figure className={`conversa p-4 sm:p-5 ${className}`} data-reveal style={{ "--d": `${d}ms` } as CSSProperties}>
      {children}
    </figure>
  );
}

export default function Feedbacks() {
  return (
    <section className="fundo-post relative overflow-hidden">
      <div className="faixa h-4 sm:h-6" aria-hidden="true" />
      <div className="brilho-canto -right-48 top-1/3 opacity-60" aria-hidden="true" />

      <div className="container-t9 relative pt-20 pb-28 sm:pt-28 sm:pb-36">
        <p className="font-display text-sm font-extrabold tracking-[0.25em] text-[#ff5a63] uppercase" data-reveal>
          Depoimentos
        </p>
        <Titulo className="mt-3">Feedbacks que nos movem.</Titulo>
        <Subtitulo>
          Mais do que números, veja o impacto que causamos nas empresas parceiras através de histórias como estas:
        </Subtitulo>

        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-7">
          {/* Grupo: venda de 1,1 milhão */}
          <Conversa className="lg:col-span-7 lg:-rotate-1">
            <div className="flex gap-3">
              <span className="mt-1 h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#8a6a5c] to-[#3d2a24] blur-[2px]" aria-hidden="true" />
              <div className="min-w-0 space-y-2">
                <div className="bolha">
                  <span className="mb-1 block"><Tarja largura={70} /></span>
                  Tem que colocar no instagram, tem um monte de gente prometendo que consegue fazer o{" "}
                  <Tarja largura={96} /> mais de R$ 200.000,00 por mês e vc vende R$ 1.100.000,00 num dia
                  <time>13:25</time>
                </div>
                <div>
                  <div className="bolha inline-block">
                    Pessoal ontem vendemos 1.100.000,00 na <Tarja largura={110} />
                    <span className="inline-block w-12" />
                    <time>13:25</time>
                  </div>
                  <div><span className="reacoes">❤️👏😍🎉 <span className="text-white/70">9</span></span></div>
                </div>
                <div>
                  <div className="bolha inline-block">
                    Parabéns a todos <span className="inline-block w-10" />
                    <time>13:25</time>
                  </div>
                  <div><span className="reacoes">❤️👏🙏 <span className="text-white/70">8</span></span></div>
                </div>
              </div>
            </div>
          </Conversa>

          {/* Dobramos o faturamento */}
          <Conversa className="flex flex-col items-end justify-center gap-2 lg:col-span-5 lg:mt-16 lg:rotate-1" d={150}>
            <div className="bolha bolha-enviada inline-block text-[17px] font-medium">
              DOBRAMOS O FATURAMENTO ESSE MÊS 👏👏👏 <span className="inline-block w-10" />
              <time>17:18</time>
            </div>
            <div className="bolha bolha-enviada inline-block">
              Ansiosa pra black <span className="inline-block w-10" />
              <time>17:18</time>
            </div>
          </Conversa>

          {/* Mensagem de gratidão */}
          <Conversa className="lg:col-span-7 lg:col-start-2 lg:rotate-[0.5deg]" d={100}>
            <div className="bolha">
              Nossa obrigada mesmo
              <br />
              Deus colocou você nas nossas vidas para entendermos que não podemos desistir e que somos capazes sim, só
              precisamos ter as ferramentas certas.
              <br />
              E que Deus abençoe grandemente sua vida, pq você é um anjo que Deus colocou para nos ajudar.
              <br />
              Viver aqui as pessoas acham que é fácil, mas não imagina a luta que é para empreender para conseguir
              driblar o idioma e se destacar quando vc decide ir para esse lado.
              <br />
              Obrigada mesmo, só tenho gratidão por tudo que vc faz.
              <time>10:06</time>
            </div>
            <span className="reacoes">❤️</span>
          </Conversa>

          {/* Vendeu tudo na live */}
          <Conversa className="self-center lg:col-span-4 lg:-rotate-2" d={200}>
            <div className="bolha text-[17px]">
              <Tarja largura={40} /> pediu pra tirar <Tarja largura={80} /> Pq na live vendeu tudo! E to com 70
              mensagens dnv
              <span className="inline-block w-10" />
            </div>
          </Conversa>
        </div>

        <p className="mt-8 text-sm text-white/45" data-reveal>
          Mensagens reais de clientes. Nomes e marcas foram ocultados para preservar a privacidade.
        </p>
      </div>
    </section>
  );
}
