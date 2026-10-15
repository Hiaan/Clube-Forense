// Moldura do blog.
//
// O mapa é preto, denso, feito para ser varrido com os olhos em dez segundos.
// O blog é o contrário: fundo claro, coluna estreita, tipo grande — é lugar de
// ler parágrafo. Manter os dois com a mesma cara faria o blog parecer um anexo
// do mapa, e ninguém lê anexo.
//
// O que amarra os dois é o amarelo da marca e a barra de cima, que leva de um
// para o outro em um clique.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog do Clube Forense — concursos de médico-legista",
    template: "%s | Blog do Clube Forense",
  },
  description:
    "Notícias, editais e conteúdo de medicina legal para quem presta concurso de perito médico-legista.",
};

const LINKS = [
  { href: "/blog", texto: "Blog" },
  { href: "/blog/categoria/noticia", texto: "Notícias" },
  { href: "/blog/categoria/conteudo", texto: "Conteúdo de prova" },
  { href: "/blog/categoria/carreira", texto: "Carreira" },
];

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbfbfa]">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
          <Link href="/blog" className="group flex items-baseline gap-2">
            <span className="text-base font-black tracking-tight text-gray-900">
              Clube Forense
            </span>
            <span className="rounded bg-[#ffcd07] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-900">
              Blog
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {LINKS.slice(1).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] font-semibold text-gray-600 transition hover:text-gray-900"
              >
                {l.texto}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* O caminho de volta para o mapa. Fica à direita, perto do botão
                de compra, porque é o par de ações que leva a pessoa adiante —
                o resto da barra é navegação dentro do blog. */}
            <Link
              href="/"
              className="hidden rounded-full border border-gray-300 px-3 py-1.5 text-[12px] font-bold text-gray-700 transition hover:border-gray-900 hover:text-gray-900 sm:inline-flex"
            >
              Mapa dos concursos
            </Link>
            <a
              href="https://app.clubeforense.com.br"
              className="rounded-full bg-gray-900 px-3.5 py-1.5 text-[12px] font-bold text-[#ffcd07] transition hover:bg-gray-800"
            >
              Preparatório
            </a>
          </div>
        </div>
      </header>

      {children}

      <footer className="mt-20 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="max-w-sm">
              <p className="text-base font-black tracking-tight text-gray-900">
                Clube Forense
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Acompanhamos os concursos de perito médico-legista nas 27
                unidades federativas e escrevemos sobre o que muda para quem
                estuda.
              </p>
            </div>

            <div className="flex gap-12">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Conteúdo
                </p>
                <ul className="mt-3 space-y-2">
                  {LINKS.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {l.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Clube
                </p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                      Mapa dos concursos
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://app.clubeforense.com.br"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Preparatório
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-10 border-t border-gray-100 pt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} Clube Forense. As notícias citadas
            pertencem aos veículos de origem, sempre indicados no rodapé de cada
            post.
          </p>
        </div>
      </footer>
    </div>
  );
}
