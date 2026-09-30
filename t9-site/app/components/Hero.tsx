import Image from "next/image";
import type { CSSProperties } from "react";
import { IconeSeta } from "./Icones";

export default function Hero() {
  return (
    <section id="topo" className="relative isolate overflow-hidden bg-[#0d0203] pt-[92px]">
      {/* Luzes neon verticais, como no escritório da arte principal */}
      <span className="hero-neon left-[4%] hidden md:block" aria-hidden="true" />
      <span className="hero-neon left-[12%] hidden opacity-30 lg:block" style={{ animationDelay: "1.3s" }} aria-hidden="true" />
      <span className="hero-neon right-[4%] hidden md:block" style={{ animationDelay: "2.1s" }} aria-hidden="true" />
      <span className="hero-neon right-[12%] hidden opacity-30 lg:block" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 40%, rgba(170,10,18,0.55) 0%, rgba(60,4,7,0.3) 55%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="container-t9 relative flex flex-col items-center text-center">
        <h1 className="relative z-10">
          <span
            className="block font-display text-[2.1rem] leading-none font-extrabold tracking-tight sm:text-6xl"
            data-reveal
          >
            Entenda o que a
          </span>
          <span className="sr-only"> T9 faz</span>
        </h1>

        <div className="relative -mt-1 w-full max-w-[640px] sm:-mt-2" data-reveal="zoom" style={{ "--d": "150ms" } as CSSProperties}>
          <Image
            src="/img/hero-t9.webp"
            alt="Especialista da T9 com os ícones de Instagram, WhatsApp, Meta, Google e IA orbitando à frente, sob o letreiro T9 FAZ"
            width={1080}
            height={1078}
            priority
            sizes="(max-width: 700px) 100vw, 640px"
            className="hero-foto h-auto w-full"
          />
        </div>

        <div className="relative z-10 -mt-16 flex max-w-2xl flex-col items-center pb-20 sm:-mt-24 sm:pb-28">
          <p
            className="text-lg leading-relaxed font-light text-white/85 sm:text-xl"
            data-reveal
            style={{ "--d": "300ms" } as CSSProperties}
          >
            Entendemos o seu negócio, desenhamos o caminho e construímos a estrutura de{" "}
            <strong className="font-semibold text-white">tráfego, vendas e automação</strong> que leva sua empresa para
            outro nível.
          </p>
          <div
            className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            data-reveal
            style={{ "--d": "420ms" } as CSSProperties}
          >
            <a href="#agendar" className="botao botao-vermelho text-base">
              Agendar consultoria gratuita
              <IconeSeta className="h-5 w-5" />
            </a>
            <a href="#como-funciona" className="botao botao-contorno text-base">
              Ver como funciona
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
