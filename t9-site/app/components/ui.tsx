import type { CSSProperties, ReactNode } from "react";
import { MarcaGoogle, MarcaIA, MarcaInstagram, MarcaMeta, MarcaWhatsApp } from "./Icones";

/** Faixa vermelha de largura total com o número da etapa — a assinatura dos posts. */
export function Faixa({ numero, children }: { numero?: string; children: ReactNode }) {
  return (
    <div data-reveal="faixa">
      <div className="faixa">
        <div className="container-t9 flex items-center gap-5 py-3.5 sm:py-4">
          {numero && <span className="faixa-numero">{numero}</span>}
          <span className="font-display text-lg font-extrabold tracking-tight text-white sm:text-2xl">{children}</span>
        </div>
      </div>
    </div>
  );
}

/** Pill com ícone à esquerda, borda e brilho vermelhos. */
export function Pill({
  icone,
  children,
  destaque = false,
  className = "",
  style,
}: {
  icone: ReactNode;
  children: ReactNode;
  destaque?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`pill ${destaque ? "pill-destaque" : ""} ${className}`} style={style} data-reveal>
      <span className="pill-icone">{icone}</span>
      <span className="pill-texto">{children}</span>
    </div>
  );
}

const MARCAS = {
  instagram: { Icone: MarcaInstagram, classe: "tile-instagram", nome: "Instagram" },
  whatsapp: { Icone: MarcaWhatsApp, classe: "tile-whatsapp", nome: "WhatsApp" },
  meta: { Icone: MarcaMeta, classe: "tile-meta", nome: "Meta Ads" },
  google: { Icone: MarcaGoogle, classe: "tile-google", nome: "Google Ads" },
  ia: { Icone: MarcaIA, classe: "tile-ia", nome: "Inteligência Artificial" },
} as const;

export type Marca = keyof typeof MARCAS;

/** Ícone "3D" brilhante, como os que orbitam nas artes. */
export function Tile({
  marca,
  tamanho = 72,
  className = "",
  style,
}: {
  marca: Marca;
  tamanho?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { Icone, classe, nome } = MARCAS[marca];
  return (
    <span
      className={`tile ${classe} ${className}`}
      style={{ width: tamanho, height: tamanho, ...style }}
      title={nome}
      role="img"
      aria-label={nome}
    >
      <Icone style={{ width: "56%", height: "56%" }} />
    </span>
  );
}

/** Título de seção no padrão das artes: sans pesada, branca, com ponto final. */
export function Titulo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`font-display text-[2rem] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.6rem] ${className}`}
      data-reveal
    >
      {children}
    </h2>
  );
}

export function Subtitulo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`mt-5 max-w-2xl text-lg leading-relaxed font-light text-white/80 sm:text-xl ${className}`}
      data-reveal
      style={{ "--d": "120ms" } as CSSProperties}
    >
      {children}
    </p>
  );
}
