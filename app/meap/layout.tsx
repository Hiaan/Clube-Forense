import { Inter, Sora } from "next/font/google";

import "./meap.css";

// As duas fontes da landing page de captura. Vêm por next/font, que baixa e
// serve os arquivos do próprio domínio — sem requisição ao Google no navegador
// do visitante e sem o salto de layout que a fonte externa causaria.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export default function MeapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O escopo `.meap` isola esta identidade do resto do site, que roda no
  // amarelo do Clube Forense.
  return (
    <div className={`meap ${sora.variable} ${inter.variable}`}>{children}</div>
  );
}
