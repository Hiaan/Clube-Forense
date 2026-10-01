import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Este site mora dentro do repositório do Clube Forense; a raiz é esta pasta, não a do repositório.
  turbopack: { root: path.join(__dirname) },
  // Imagens de criativos (até 4 MB) e planilhas CSV (até 3 MB) passam por Server Actions.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
