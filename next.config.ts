import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixe explicitement la racine du workspace au dossier du projet :
  // evite que Turbopack infere une mauvaise racine s'il detecte un
  // package-lock.json parasite dans un dossier parent.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
