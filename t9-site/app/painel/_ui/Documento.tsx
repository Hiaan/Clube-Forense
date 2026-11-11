import Logo from "@/app/components/Logo";

/** Folha branca dos documentos públicos (proposta e contrato): legível na tela e pronta para salvar em PDF. */
export function Papel({ children }: { children: React.ReactNode }) {
  return (
    <article className="papel-documento rounded-2xl bg-white px-6 py-8 text-[#161616] shadow-2xl sm:px-12 sm:py-12 print:rounded-none print:p-0 print:shadow-none">
      <header className="flex items-center justify-between gap-4 border-b border-black/10 pb-5">
        <Logo className="w-16" cor="preto" assinaturaClassName="text-[0.55rem]" />
        <p className="text-right text-xs text-black/50">
          T9 ADS Company
          <br />
          t9company.com.br
        </p>
      </header>
      <div className="mt-8">{children}</div>
    </article>
  );
}

/** Texto do contrato: linhas com "## " viram títulos, o resto vira parágrafo. */
export function TextoContrato({ texto }: { texto: string }) {
  const blocos = texto.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-3 text-[15px] leading-relaxed">
      {blocos.map((b, i) =>
        b.startsWith("## ") ? (
          <h2 key={i} className={`font-display font-extrabold tracking-tight ${i === 0 ? "text-center text-xl" : "pt-3 text-base"}`}>
            {b.slice(3)}
          </h2>
        ) : (
          <p key={i} className="text-justify whitespace-pre-line">
            {b}
          </p>
        ),
      )}
    </div>
  );
}
