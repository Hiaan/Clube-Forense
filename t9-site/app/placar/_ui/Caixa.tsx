import Link from "next/link";
import Marca from "./Marca";
import { cartao } from "./estilo";

/** Moldura das telas de conta (cadastro, entrar, senha): centralizada e simples. */
export default function Caixa({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <Link href="/placar" aria-label="Placar, página inicial" className="self-start">
        <Marca />
      </Link>
      <div className={`${cartao} mt-6 p-6 sm:p-8`}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{titulo}</h1>
        {subtitulo && <p className="mt-1.5 text-[15px] text-gray-600">{subtitulo}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
