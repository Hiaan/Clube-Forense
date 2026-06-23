import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Concurso from "./components/Concurso";
import Jornada from "./components/Jornada";
import Metodologia from "./components/Metodologia";
import DrBonnet from "./components/DrBonnet";
import Plataforma from "./components/Plataforma";
import Resultados from "./components/Resultados";
import Garantia from "./components/Garantia";
import Professores from "./components/Professores";
import PosProva from "./components/PosProva";
import Depoimentos from "./components/Depoimentos";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function MentoriaLegista() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Concurso />
        <Jornada />
        <Metodologia />
        <DrBonnet />
        <Plataforma />
        <Resultados />
        <Garantia />
        <Professores />
        <PosProva />
        <Depoimentos />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
