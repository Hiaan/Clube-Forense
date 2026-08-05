import { redirect } from "next/navigation";

// O monitor é a página inicial do site. Este redirecionamento existe para não
// quebrar os links de /monitor que já foram divulgados.
export default function MonitorRedirect() {
  redirect("/");
}
