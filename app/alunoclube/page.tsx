// A Black dos alunos: mapa.clubeforense.com.br/alunoclube
//
// Sem passe válido, a página é só a porta: o aviso e o campo do CPF. Com o
// passe (cookie assinado, gravado quando o CPF confere com uma compra paga),
// é a página da Black inteira, com a oferta montada para aquele aluno.

import { cookies } from "next/headers";

import PaginaBlack from "../black/PaginaBlack";
import { lerPasse } from "../lib/alunoClubeRepo";
import { COOKIE_ALUNO, linkComCupom, regraDoCupom } from "./cupons";
import EntradaAluno from "./EntradaAluno";
import EventosAluno from "./EventosAluno";

// Depende do cookie de quem acessa e da lista de editais ao vivo.
export const dynamic = "force-dynamic";

export default async function AlunoClubePage() {
  const cupom = lerPasse((await cookies()).get(COOKIE_ALUNO)?.value);
  const regra = cupom ? regraDoCupom(cupom) : null;

  if (!regra) return <EntradaAluno />;

  return (
    <>
      <PaginaBlack
        modo="aluno"
        ofertaAluno={{
          rotulo: regra.rotulo,
          preco: regra.preco,
          link: linkComCupom(regra.cupom),
        }}
      />
      <EventosAluno valor={regra.preco} />
    </>
  );
}
