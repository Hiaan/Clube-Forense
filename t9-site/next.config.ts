import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Este site mora dentro do repositório do Clube Forense; a raiz é esta pasta, não a do repositório.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
