import Link from "next/link";

export const metadata = {
  title: "FAQ — StageConnect",
  description: "Les questions fréquentes sur l’utilisation de StageConnect.",
};

const FAQ = [
  {
    q: "StageConnect est-il gratuit ?",
    r: "Oui, la création de compte et l’utilisation de la plateforme sont entièrement gratuites, pour les étudiants comme pour les entreprises.",
  },
  {
    q: "Comment créer un compte ?",
    r: "Cliquez sur « Créer un compte », choisissez votre profil (étudiant ou entreprise), puis remplissez le formulaire d’inscription.",
  },
  {
    q: "Comment postuler à une offre ?",
    r: "Connectez-vous en tant qu’étudiant, parcourez les offres, ouvrez celle qui vous intéresse et cliquez sur « Postuler ». Vous pouvez ajouter une lettre de motivation.",
  },
  {
    q: "Comment une entreprise publie-t-elle une offre ?",
    r: "Connectez-vous en tant qu’entreprise, allez dans « Mes offres » et cliquez sur « Publier une offre ».",
  },
  {
    q: "Puis-je échanger avec une entreprise (ou un étudiant) ?",
    r: "Oui, une messagerie est intégrée à la plateforme pour échanger directement.",
  },
  {
    q: "Comment modifier mon profil ?",
    r: "Une fois connecté, rendez-vous sur votre page « Profil » pour mettre à jour vos informations et votre photo.",
  },
];

export default function FaqPage() {
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
            Aide
          </p>
          <h1 className="mt-5 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Questions fréquentes
          </h1>

          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-lg border border-primary/10 bg-card p-5 transition-colors hover:border-primary/20"
              >
                <summary className="cursor-pointer list-none font-semibold text-foreground">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.r}
                </p>
              </details>
            ))}
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
