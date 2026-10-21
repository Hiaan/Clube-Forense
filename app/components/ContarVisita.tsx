"use client";

// A batida que diz "alguém abriu esta página".
//
// POR QUE NO NAVEGADOR E NÃO NO SERVIDOR. Contar no render do servidor contaria
// também o Googlebot, que passa várias vezes por dia em cada post e inflaria o
// número justamente onde ele precisa ser honesto — a pergunta é "quantas
// pessoas leram". Robô de buscador não executa JavaScript; este componente
// roda só onde há gente.
//
// `sendBeacon` E NÃO `fetch`: a batida sobrevive a quem lê o título e fecha a
// aba no segundo seguinte. O navegador assume a entrega e não segura a
// navegação por causa dela — um `fetch` solto nessa hora é cancelado, e as
// leituras mais curtas (que são muitas) sumiriam da conta.
//
// UMA VEZ POR ABA. O marcador em sessionStorage evita que voltar para a página
// pelo botão do navegador conte de novo. Aba nova conta de novo, e está certo:
// é outra sessão de leitura.

import { useEffect } from "react";

export default function ContarVisita({
  tipo,
  slug = "",
}: {
  tipo: "post" | "blog" | "saida";
  slug?: string;
}) {
  useEffect(() => {
    const chave = `visita:${tipo}:${slug}`;
    try {
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, "1");
    } catch {
      // Navegador com armazenamento bloqueado (aba anônima, política do
      // aparelho) ainda deve contar — só perde a proteção contra repetição.
    }

    const corpo = JSON.stringify({ tipo, slug });
    try {
      const enviou = navigator.sendBeacon?.(
        "/api/visita",
        new Blob([corpo], { type: "application/json" }),
      );
      if (enviou) return;
    } catch {
      // Cai no fetch abaixo.
    }
    void fetch("/api/visita", {
      method: "POST",
      body: corpo,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }, [tipo, slug]);

  return null;
}
