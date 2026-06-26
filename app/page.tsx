import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import PorQueSerLegista from "./components/PorQueSerLegista";
import Metodologia from "./components/Metodologia";
import DrBonnet from "./components/DrBonnet";
import Resultados from "./components/Resultados";
import Professores from "./components/Professores";
import ParaQuem from "./components/ParaQuem";
import Depoimentos from "./components/Depoimentos";
import Preco from "./components/Preco";
import Garantia from "./components/Garantia";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

export default function MentoriaSC() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <PorQueSerLegista />
        <Metodologia />
        <DrBonnet />
        <Resultados />
        <Professores />
        <ParaQuem />
        <Depoimentos />
        <Preco />
        <Garantia />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
