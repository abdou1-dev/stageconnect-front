import Link from "next/link";

export const metadata = {
  title: "Contact — StageConnect",
  description: "Contactez l’équipe StageConnect.",
};

export default function ContactPage() {
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
            Nous contacter
          </p>
          <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Contact
          </h1>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Une question, une suggestion ou besoin d’aide ? L’équipe StageConnect
            est à votre écoute.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/10 bg-card p-6">
              <h2 className="font-heading text-lg font-bold text-foreground">Par email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Écrivez-nous, nous répondons sous 48h ouvrées.
              </p>
              <a
                href="mailto:contact@stageconnect.sn"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                contact@stageconnect.sn
              </a>
            </div>

            <div className="rounded-lg border border-primary/10 bg-card p-6">
              <h2 className="font-heading text-lg font-bold text-foreground">Le projet</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                StageConnect est un projet académique réalisé dans le cadre du mémoire
                de Licence 3 IDA à l’Université Numérique Cheikh Hamidou Kane (UNCHK),
                promotion 2026.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-lg border border-primary/10 bg-card p-6">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Vous débutez sur la plateforme ?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Consultez notre{" "}
              <Link href="/faq" className="text-primary underline-offset-4 hover:underline">
                FAQ
              </Link>{" "}
              : la réponse à votre question s’y trouve peut-être déjà.
            </p>
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
