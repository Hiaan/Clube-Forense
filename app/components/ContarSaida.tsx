"use client";

// Marca os cliques que saem do blog para o preparatório.
//
// É A PERGUNTA QUE VALE DINHEIRO. Quantas pessoas leram é bom saber; quantas
// leram e foram ver o curso é o que diz se o blog está trabalhando. Sem esta
// contagem, a resposta seria sempre "o tráfego subiu" sem ninguém conseguir
// dizer se subiu para alguma coisa.
//
// ENVOLVE O LINK EM VEZ DE SUBSTITUÍ-LO. O filho continua sendo uma âncora de
// verdade, com href: abrir em nova aba, copiar o endereço e o clique do meio
// seguem funcionando, e se o JavaScript falhar o link leva a pessoa ao mesmo
// lugar. A contagem é um efeito colateral do clique, nunca uma condição dele —
// medir não pode atrapalhar o que está sendo medido.

export default function ContarSaida({ children }: { children: React.ReactNode }) {
  return (
    <span
      onClick={() => {
        const corpo = JSON.stringify({ tipo: "saida", slug: location.pathname });
        try {
          if (
            navigator.sendBeacon?.(
              "/api/visita",
              new Blob([corpo], { type: "application/json" }),
            )
          ) {
            return;
          }
        } catch {
          // Cai no fetch.
        }
        void fetch("/api/visita", {
          method: "POST",
          body: corpo,
          headers: { "content-type": "application/json" },
          keepalive: true,
        }).catch(() => {});
      }}
      className="contents"
    >
      {children}
    </span>
  );
}
