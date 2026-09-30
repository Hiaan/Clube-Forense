import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Traco({ children, ...props }: P & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---------- Ícones de interface ---------- */

export const IconeMaleta = (p: P) => (
  <Traco {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Traco>
);
export const IconeMegafone = (p: P) => (
  <Traco {...p}>
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </Traco>
);
export const IconeCifrao = (p: P) => (
  <Traco {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6" />
  </Traco>
);
export const IconePessoas = (p: P) => (
  <Traco {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Traco>
);
export const IconeGraficoLinha = (p: P) => (
  <Traco {...p}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </Traco>
);
export const IconeGlobo = (p: P) => (
  <Traco {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Traco>
);
export const IconeAlvo = (p: P) => (
  <Traco {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Traco>
);
export const IconeEngrenagem = (p: P) => (
  <Traco {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Traco>
);
export const IconeDocumento = (p: P) => (
  <Traco {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </Traco>
);
export const IconeLista = (p: P) => (
  <Traco {...p}>
    <path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8" />
  </Traco>
);
export const IconeEnviar = (p: P) => (
  <Traco {...p}>
    <path d="m22 2-7 20-4-9-9-4z" />
    <path d="M22 2 11 13" />
  </Traco>
);
export const IconeBandeira = (p: P) => (
  <Traco {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <path d="M4 22v-7" />
  </Traco>
);
export const IconeLocal = (p: P) => (
  <Traco {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </Traco>
);
export const IconeBarras = (p: P) => (
  <Traco {...p} strokeWidth={2.6}>
    <path d="M5 20v-5M10 20v-9M15 20V7M20 20V3" />
  </Traco>
);
export const IconeFunil = (p: P) => (
  <Traco {...p}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </Traco>
);
export const IconeRobo = (p: P) => (
  <Traco {...p}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4M8 16h.01M16 16h.01" />
  </Traco>
);
export const IconePainel = (p: P) => (
  <Traco {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Traco>
);
export const IconeCRM = (p: P) => (
  <Traco {...p}>
    <circle cx="12" cy="8" r="3" />
    <path d="M6 20a6 6 0 0 1 12 0" />
    <path d="M3.5 9.5A9 9 0 0 1 8 3.8M20.5 9.5A9 9 0 0 0 16 3.8" />
  </Traco>
);
export const IconeMais = (p: P) => (
  <Traco {...p} strokeWidth={3}>
    <path d="M12 5v14M5 12h14" />
  </Traco>
);
export const IconeCheck = (p: P) => (
  <Traco {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Traco>
);
export const IconeCalendario = (p: P) => (
  <Traco {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Traco>
);
export const IconeRelogio = (p: P) => (
  <Traco {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Traco>
);
export const IconeSeta = (p: P) => (
  <Traco {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Traco>
);
export const IconeSetaEsquerda = (p: P) => (
  <Traco {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Traco>
);
export const IconeSubindo = (p: P) => (
  <Traco {...p} strokeWidth={2.6}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Traco>
);
export const IconeMenu = (p: P) => (
  <Traco {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Traco>
);
export const IconeFechar = (p: P) => (
  <Traco {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Traco>
);
export const IconeCadeado = (p: P) => (
  <Traco {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Traco>
);

/* ---------- Marcas (usadas nos "ícones 3D") ---------- */

export const MarcaInstagram = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} aria-hidden="true" {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="#fff" stroke="none" />
  </svg>
);

export const MarcaWhatsApp = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path
      d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.9 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <path
      d="M8.6 7.6c.2-.4.5-.5.8-.5h.6c.2 0 .4.1.5.4l.9 2.1c.1.3 0 .5-.1.7l-.6.7c-.1.1-.2.3 0 .5.4.8 1 1.5 1.7 2.1.6.5 1.2.9 2 1.2.2.1.4 0 .5-.1l.8-.9c.2-.2.4-.3.7-.2l2 .9c.3.1.4.3.4.5 0 .7-.3 1.4-.9 1.8-.6.4-1.4.5-2.1.3-1.5-.4-2.9-1.2-4.1-2.3-1.1-1-2.1-2.3-2.7-3.7-.4-1.1-.3-2.3.5-3.3z"
      fill="#fff"
    />
  </svg>
);

export const MarcaMeta = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
    <path
      d="M2.8 14.6c0-3.9 2-7.6 4.7-7.6 2.1 0 3.4 1.8 5.4 5.3 1.7 3 2.9 4.7 4.4 4.7 1.4 0 2-1.2 2-3.1 0-3.2-1.5-6.9-3.8-6.9-1.9 0-3.3 2.1-5.3 5.6-1.6 2.8-2.7 4.4-4.4 4.4-1.8 0-3-1.1-3-2.4z"
      stroke="#fff"
      strokeWidth={2.4}
      strokeLinejoin="round"
    />
  </svg>
);

export const MarcaGoogle = (p: P) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
    <path
      fill="#FFC107"
      d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
    />
    <path
      fill="#FF3D00"
      d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
    />
  </svg>
);

export const MarcaIA = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#e8572a" strokeWidth={2.1} strokeLinecap="round" aria-hidden="true" {...p}>
    <path d="M14.18 12.31L21.41 13.32M13.73 13.35L18.30 16.93M12.82 14.04L15.67 21.09M11.69 14.18L10.94 19.53M10.65 13.73L6.34 19.25M9.96 12.82L4.21 15.15M9.82 11.69L2.30 10.64M10.27 10.65L5.85 7.20M11.18 9.96L8.48 3.28M12.31 9.82L13.14 3.88M13.35 10.27L17.91 4.44M14.04 11.18L19.42 9.00" />
  </svg>
);
