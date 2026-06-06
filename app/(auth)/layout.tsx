import Link from "next/link";

// Layout partagé des pages d'authentification — fond sobre, carte centrée,
// cohérent avec la direction éditoriale de la landing.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Filet supérieur tricolore — rappel discret de la charte */}
      <div className="flex h-1" aria-hidden>
        <span className="flex-1 bg-primary" />
        <span className="flex-1 bg-primary-blue" />
        <span className="flex-1 bg-accent" />
        <span className="flex-1 bg-success" />
      </div>

      <header className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="font-heading text-lg font-extrabold tracking-tight text-primary"
        >
          Stage<span className="text-accent">—</span>Connect
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        {children}
      </main>

      <footer className="pb-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Mémoire L3 IDA — UNCHK · 2026
      </footer>
    </div>
  );
}
