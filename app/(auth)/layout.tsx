import Link from "next/link";

// Layout partagé des pages d'authentification — split-screen pro :
// panneau de marque éditorial à gauche (desktop), formulaire à droite.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <div className="flex flex-col bg-background">
        {/* Filet tricolore — rappel de la charte */}
        <div className="flex h-1 lg:hidden" aria-hidden>
          <span className="flex-1 bg-primary" />
          <span className="flex-1 bg-primary-blue" />
          <span className="flex-1 bg-accent" />
          <span className="flex-1 bg-success" />
        </div>

        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            href="/"
            className="whitespace-nowrap font-heading text-base font-extrabold tracking-tight text-primary sm:text-lg lg:hidden"
          >
            Stage<span className="text-accent">—</span>Connect
          </Link>
          <Link
            href="/"
            className="ml-auto whitespace-nowrap text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline sm:text-sm"
          >
            ← Accueil
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-10">
          <div className="animate-fade-up w-full max-w-md">{children}</div>
        </main>

        <footer className="pb-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Mémoire L3 IDA — UNCHK · 2026
        </footer>
      </div>
    </div>
  );
}

/* Panneau de marque — visible à partir de lg */
function BrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
      {/* Décor géométrique en filigrane */}
      <svg
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -bottom-24 -right-24 h-[380px] w-[380px] opacity-15"
        aria-hidden
      >
        <circle cx="200" cy="200" r="160" fill="none" stroke="#F8FAFC" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="110" fill="none" stroke="#F28F1C" strokeWidth="1.5" strokeDasharray="5 10" />
        <circle cx="200" cy="200" r="55" fill="#0870B8" />
        <path d="M80 400 L80 330 A60 60 0 0 1 200 330 L200 400 Z" fill="#F28F1C" opacity="0.9" />
      </svg>
      <Link
        href="/"
        className="font-heading text-xl font-extrabold tracking-tight"
      >
        Stage<span className="text-accent">—</span>Connect
      </Link>

      <div className="relative max-w-md">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          <span className="h-px w-10 bg-accent" aria-hidden />
          Édition Sénégal · 2026
        </p>
        <h2 className="mt-6 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight">
          Votre carrière commence par une bonne connexion.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-primary-foreground/70">
          Des centaines d’offres de stages et d’emplois, des entreprises qui
          recrutent, un suivi de candidature clair — tout au même endroit.
        </p>
      </div>

      <dl className="relative flex gap-10">
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
            Offres
          </dt>
          <dd className="mt-1 font-heading text-2xl font-extrabold text-accent">
            500+
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
            Entreprises
          </dt>
          <dd className="mt-1 font-heading text-2xl font-extrabold text-accent">
            200+
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
            Étudiants
          </dt>
          <dd className="mt-1 font-heading text-2xl font-extrabold text-accent">
            5000+
          </dd>
        </div>
      </dl>
    </aside>
  );
}
