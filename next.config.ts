import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixe la racine du workspace : un package-lock.json parasite existe dans
  // C:\Users\DELL\, ce qui faisait hesiter Turbopack sur la racine a inferer.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
