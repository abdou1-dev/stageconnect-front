import Link from "next/link";

export const metadata = {
  title: "À propos — StageConnect",
  description:
    "StageConnect, la plateforme sénégalaise qui relie étudiants et entreprises.",
};

export default function AProposPage() {
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
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            <span className="h-px w-10 bg-accent" aria-hidden />
            Notre mission
          </p>
          <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            À propos de StageConnect
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              StageConnect est une plateforme web sénégalaise qui met en relation
              les <strong className="text-foreground">étudiants</strong> et les{" "}
              <strong className="text-foreground">entreprises</strong> pour faciliter
              l’accès aux stages, alternances et premiers emplois.
            </p>
            <p>
              Notre objectif est de simplifier la recherche d’opportunités pour les
              étudiants, tout en permettant aux entreprises de trouver facilement
              les profils dont elles ont besoin.
            </p>

            <h2 className="font-heading text-xl font-bold text-foreground">
              Pourquoi StageConnect ?
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Un espace unique pour publier et trouver des offres au Sénégal.</li>
              <li>Une candidature simple et rapide pour les étudiants.</li>
              <li>Une gestion claire des candidatures pour les entreprises.</li>
              <li>Une messagerie intégrée entre étudiants et recruteurs.</li>
            </ul>

            <h2 className="font-heading text-xl font-bold text-foreground">
              Un projet académique
            </h2>
            <p>
              StageConnect est développé dans le cadre d’un mémoire de Licence 3 —
              Internet et Développement d’Applications (IDA) à l’Université Numérique
              Cheikh Hamidou Kane (UNCHK), promotion 2026.
            </p>
          </div>

          <div className="mt-12">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Créer mon compte
            </Link>
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