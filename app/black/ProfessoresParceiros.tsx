// Os professores parceiros, passando em faixa.
//
// AS ARTES JÁ TRAZEM NOME E MATÉRIA GRAVADOS, como as dos três criadores. Por
// isso o cartão é só a imagem: repetir o nome embaixo colocaria a mesma
// informação duas vezes, em dois tamanhos, que é como faixa de professor fica
// feia. O texto que acompanha cada um existe para o `alt` — quem usa leitor de
// tela precisa saber quem é e o que a pessoa ensina.
//
// AS FOTOS VIERAM DO PRÓPRIO CLUBE, do carrossel que já roda no site do
// preparatório. Foram reduzidas e convertidas para webp: 13 arquivos de ~1 MB
// viraram 271 KB no total, e a faixa inteira pesa menos que uma foto original.

import Image from "next/image";

export interface Parceiro {
  nome: string;
  materia: string;
  /** Arquivo em public/black/professores/parceiros/ */
  arquivo: string;
}

export const PARCEIROS: Parceiro[] = [
  { nome: "Prof. Pedro Canezin", materia: "Criminalística", arquivo: "pedro-canezin.webp" },
  { nome: "Prof. Fabio Rosar", materia: "Informática", arquivo: "fabio-rosar.webp" },
  {
    nome: "Prof. Adenilton Almeida",
    materia: "Direito Administrativo",
    arquivo: "adenilton-almeida.webp",
  },
  {
    nome: "Prof. Bruno Vasconselos",
    materia: "Direito Constitucional",
    arquivo: "bruno-vasconselos.webp",
  },
  {
    nome: "Prof. Ricardo Ziegler",
    materia: "Legislação Especial",
    arquivo: "ricardo-ziegler.webp",
  },
  { nome: "Profa. Letícia Silva", materia: "Língua Portuguesa", arquivo: "leticia-silva.webp" },
  { nome: "Prof. Victor Barbosa", materia: "Direitos Humanos", arquivo: "victor-barbosa.webp" },
  { nome: "Profa. Flávia Pine", materia: "Toxicologia Forense", arquivo: "flavia-pine.webp" },
  {
    nome: "Prof. João Paulo Mendes",
    materia: "Direito Penal",
    arquivo: "joao-paulo-mendes.webp",
  },
  {
    nome: "Prof. Carlos Alfama",
    materia: "Direito Processual Penal",
    arquivo: "carlos-alfama.webp",
  },
  { nome: "Prof. Paulo", materia: "Direito Penal", arquivo: "paulo.webp" },
  { nome: "Prof. Paulo César", materia: "Psiquiatria Forense", arquivo: "paulo-cesar.webp" },
  { nome: "Prof. Ian Marques", materia: "Criminalística", arquivo: "ian-marques.webp" },
];

export default function ProfessoresParceiros() {
  if (PARCEIROS.length === 0) return null;

  // Duplicada para o laço não ter emenda, como nas outras faixas da página.
  const fila = [...PARCEIROS, ...PARCEIROS];

  return (
    <div
      className="relative -mx-4 mt-10 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="carousel-track flex w-max gap-4 px-4 py-2 motion-reduce:animate-none"
        style={{ animationDuration: "80s" }}
      >
        {fila.map((p, i) => (
          <figure
            key={`${p.nome}-${i}`}
            className="w-[190px] shrink-0 overflow-hidden rounded-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]"
            aria-hidden={i >= PARCEIROS.length}
          >
            <Image
              src={`/black/professores/parceiros/${p.arquivo}`}
              alt={`${p.nome} — ${p.materia}`}
              width={430}
              height={630}
              sizes="190px"
              className="h-auto w-full"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
