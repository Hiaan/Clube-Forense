import Site from "./components/Site";
import { metadadosDo } from "@/lib/metadados";

export const metadata = metadadosDo("pt");

export default function Home() {
  return <Site idioma="pt" />;
}
