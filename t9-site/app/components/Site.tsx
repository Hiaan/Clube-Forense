import { DICIONARIOS } from "@/lib/dicionarios";
import { CONFIG_IDIOMA, type Idioma } from "@/lib/i18n";
import Agendamento from "./Agendamento";
import Animacoes from "./Animacoes";
import Cases from "./Cases";
import Construir from "./Construir";
import Entender from "./Entender";
import Estruturar from "./Estruturar";
import FaixaRolante from "./FaixaRolante";
import Feedbacks from "./Feedbacks";
import Hero from "./Hero";
import Metodo from "./Metodo";
import Navegacao from "./Navegacao";
import Numeros from "./Numeros";
import Rodape from "./Rodape";

/** A página inteira em um idioma. Cada rota (/, /en, /es) só escolhe o idioma. */
export default function Site({ idioma }: { idioma: Idioma }) {
  const t = DICIONARIOS[idioma];
  return (
    <div lang={CONFIG_IDIOMA[idioma].html}>
      <Navegacao t={t.nav} idioma={idioma} />
      <main>
        <Hero t={t.hero} />
        <FaixaRolante itens={t.faixaRolante} />
        <Entender t={t.entender} />
        <Estruturar t={t.estruturar} />
        <Construir t={t.construir} />
        <Numeros t={t.numeros} idioma={idioma} />
        <Cases t={t.clientes} />
        <Feedbacks t={t.feedbacks} />
        <Metodo t={t.metodo} />
        <Agendamento t={t.agendamento} gerenciador={t.gerenciador} idioma={idioma} />
      </main>
      <Rodape t={t.rodape} nav={t.nav} />
      <Animacoes idioma={idioma} />
    </div>
  );
}
