import Agendamento from "./components/Agendamento";
import Animacoes from "./components/Animacoes";
import Construir from "./components/Construir";
import Entender from "./components/Entender";
import Estruturar from "./components/Estruturar";
import FaixaRolante from "./components/FaixaRolante";
import Feedbacks from "./components/Feedbacks";
import Hero from "./components/Hero";
import Metodo from "./components/Metodo";
import Navegacao from "./components/Navegacao";
import Numeros from "./components/Numeros";
import Rodape from "./components/Rodape";

export default function Home() {
  return (
    <>
      <Navegacao />
      <main>
        <Hero />
        <FaixaRolante />
        <Entender />
        <Estruturar />
        <Construir />
        <Numeros />
        <Feedbacks />
        <Metodo />
        <Agendamento />
      </main>
      <Rodape />
      <Animacoes />
    </>
  );
}
