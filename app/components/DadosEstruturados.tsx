// O <script type="application/ld+json"> das páginas — ver lib/schema.ts.
// Recebe o JSON já serializado e escapado por `grafo()`.

export default function DadosEstruturados({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
