/** Recebe do navegador o resultado do envio ao FormSubmit e registra nos logs da Vercel. */
export async function POST(request: Request) {
  const texto = (await request.text()).slice(0, 1000);
  console.info("[formsubmit] Resposta:", texto);
  return new Response(null, { status: 204 });
}
