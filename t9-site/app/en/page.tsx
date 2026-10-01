import Site from "../components/Site";
import { metadadosDo } from "@/lib/metadados";

export const metadata = metadadosDo("en");

export default function Home() {
  return <Site idioma="en" />;
}
