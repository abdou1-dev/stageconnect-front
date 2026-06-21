import Link from "next/link";

export const metadata = {
  title: "Mentions légales — StageConnect",
  description: "Mentions légales de la plateforme StageConnect.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <header className="border-b border-primary/10 bg-background/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-heading text-lg font-extrabold text-primary">
            Stage<span className="text-accent">—</span>Connect
          </Link>
          <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            ← Retour à l’accueil
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Mentions légales
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">Éditeur</h2>
              <p className="mt-2">
                StageConnect est un projet académique réalisé par les étudiants de
                Licence 3 IDA de l’Université Numérique Cheikh Hamidou Kane (UNCHK),
                promotion 2026.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">Hébergement</h2>
              <p className="mt-2">
                Le site (interface) est hébergé par Vercel Inc. L’API et la base de
                données sont hébergées respectivement par Render et Neon.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">Données personnelles</h2>
              <p className="mt-2">
                Les données saisies (nom, email, profil) servent uniquement au
                fonctionnement de la plateforme et ne sont ni revendues ni partagées
                à des tiers. Pour toute demande concernant vos données, contactez
                l’équipe du projet.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">Propriété intellectuelle</h2>
              <p className="mt-2">
                Ce site est réalisé à des fins pédagogiques dans le cadre d’un mémoire
                de fin de cycle. Le code source est publié sous licence MIT.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">Contact</h2>
              <p className="mt-2">
                Pour toute question : équipe StageConnect — UNCHK, Licence 3 IDA.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-primary/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © 2026 StageConnect — Mémoire L3 IDA, UNCHK.
        </div>
      </footer>
    </div>
  );
}
