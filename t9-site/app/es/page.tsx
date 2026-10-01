import Site from "../components/Site";
import { metadadosDo } from "@/lib/metadados";

export const metadata = metadadosDo("es");

export default function Home() {
  return <Site idioma="es" />;
}
