import { Fragment } from "react";

/** Texto com trechos entre **asteriscos duplos** em negrito (usado pelos dicionários). */
export default function Rico({ texto, classeForte = "font-semibold text-white" }: { texto: string; classeForte?: string }) {
  return (
    <>
      {texto.split(/(\*\*[^*]+\*\*)/).map((parte, i) =>
        parte.startsWith("**") && parte.endsWith("**") ? (
          <strong key={i} className={classeForte}>
            {parte.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        ),
      )}
    </>
  );
}
