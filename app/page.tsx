import Link from "next/link";

// Landing page publique — direction artistique éditoriale/magazine.
// Server Component : toutes les animations sont en CSS pur (cf. globals.css).

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <EditionBar />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

/* ————— Bandeau d'édition, façon une de journal ————— */
function EditionBar() {
  return (
    <div className="border-b border-primary/10 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] sm:px-6">
        <span>Édition Sénégal</span>
        <span className="hidden sm:block">Stages · Alternances · Premiers emplois</span>
        <span className="text-accent">2026</span>
      </div>
    </div>
  );
}

/* ————— Navbar ————— */
function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="whitespace-nowrap font-heading text-base font-extrabold tracking-tight text-primary sm:text-xl"
        >
          Stage<span className="text-accent">—</span>Connect
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/login"
            className="hidden whitespace-nowrap px-2 py-2 text-xs font-medium text-primary underline-offset-4 transition-colors hover:text-primary-blue hover:underline sm:block sm:px-3 sm:text-sm"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="whitespace-nowrap rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:text-sm"
          >
            S’inscrire
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ————— Hero ————— */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-7">
          <p className="animate-fade-up flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
            <span className="h-px w-10 bg-accent" aria-hidden />
            La plateforme des stages au Sénégal
          </p>
          <h1 className="animate-fade-up mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-primary [animation-delay:120ms] sm:text-6xl lg:text-7xl">
            Le pont entre <span className="text-primary-blue">le campus</span>{" "}
            et <span className="text-accent">l’entreprise</span>.
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground [animation-delay:240ms]">
            StageConnect met en relation les étudiants sénégalais et les
            entreprises qui recrutent : trouvez votre stage, votre alternance
            ou votre premier emploi — et gérez vos candidatures au même
            endroit.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col gap-3 [animation-delay:360ms] sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-blue hover:shadow-lg"
            >
              Je suis étudiant
              <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-md border-2 border-primary px-6 py-3.5 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              Je recrute des talents
              <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </Link>
          </div>
          <p className="animate-fade-up mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground [animation-delay:480ms]">
            Gratuit pour les étudiants · Inscription en 2 minutes
          </p>
        </div>
        <div className="animate-rise lg:col-span-5 [animation-delay:300ms]">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

/* Illustration géométrique abstraite — les 4 couleurs UNCHK, inspirée
   des compositions textiles ouest-africaines (bandes, soleil, arches). */
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 520 520"
      role="img"
      aria-label="Composition géométrique abstraite aux couleurs UNCHK"
      className="mx-auto w-full max-w-md lg:max-w-none"
    >
      {/* Trame de fond — pointillés discrets */}
      <g className="animate-fade-in [animation-delay:200ms]" fill="#214254" opacity="0.12">
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 6 }).map((__, col) => (
            <circle key={`${row}-${col}`} cx={40 + col * 32} cy={40 + row * 32} r="2.5" />
          ))
        )}
      </g>

      {/* Soleil orange */}
      <circle
        cx="360"
        cy="150"
        r="95"
        fill="#F28F1C"
        className="animate-rise [animation-delay:350ms]"
      />

      {/* Anneau en rotation lente autour du soleil */}
      <circle
        cx="360"
        cy="150"
        r="125"
        fill="none"
        stroke="#0870B8"
        strokeWidth="2"
        strokeDasharray="6 14"
        className="animate-spin-slow origin-[360px_150px]"
      />

      {/* Arche bleu sombre — le campus */}
      <path
        d="M70 470 L70 330 A105 105 0 0 1 280 330 L280 470 Z"
        fill="#214254"
        className="animate-rise [animation-delay:500ms]"
      />
      {/* Porte de l’arche */}
      <path
        d="M135 470 L135 380 A40 40 0 0 1 215 380 L215 470 Z"
        fill="#F8FAFC"
        className="animate-fade-in [animation-delay:800ms]"
      />

      {/* Bandes diagonales — tissu/dynamique */}
      <g className="animate-rise [animation-delay:650ms]">
        <rect x="310" y="330" width="170" height="26" rx="13" fill="#0870B8" />
        <rect x="335" y="372" width="145" height="26" rx="13" fill="#0870B8" opacity="0.55" />
        <rect x="360" y="414" width="120" height="26" rx="13" fill="#0870B8" opacity="0.3" />
      </g>

      {/* Pastille verte — la réussite */}
      <circle
        cx="300"
        cy="300"
        r="34"
        fill="#00A346"
        className="animate-rise [animation-delay:750ms]"
      />
      <path
        d="M285 300 L296 311 L317 288"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-fade-in [animation-delay:1000ms]"
      />

      {/* Demi-cercle découpé, coin haut gauche */}
      <path
        d="M40 250 A85 85 0 0 1 210 250 Z"
        fill="#F28F1C"
        opacity="0.85"
        className="animate-rise [animation-delay:450ms]"
      />
      <line
        x1="40"
        y1="262"
        x2="210"
        y2="262"
        stroke="#214254"
        strokeWidth="4"
        className="animate-fade-in [animation-delay:700ms]"
      />
    </svg>
  );
}

/* ————— Stats — chiffres RÉELS depuis l'API (ISR 1 h, fallback gracieux) ————— */
async function fetchCount(path: string): Promise<number | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const res = await fetch(`${base}${path}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    const payload = (await res.json()) as {
      success?: boolean;
      data?: { total?: number };
    };
    return payload.success && typeof payload.data?.total === "number"
      ? payload.data.total
      : null;
  } catch {
    return null; // API injoignable au build : on retombe sur le libellé seul
  }
}

async function Stats() {
  const [jobs, companies] = await Promise.all([
    fetchCount("/jobs?limit=1"),
    fetchCount("/companies?limit=1"),
  ]);

  const STATS = [
    {
      value: jobs !== null ? String(jobs) : "—",
      label: "Offres en ligne",
      color: "text-primary-blue",
    },
    {
      value: companies !== null ? String(companies) : "—",
      label: "Entreprises inscrites",
      color: "text-accent",
    },
    { value: "100%", label: "Gratuit pour les étudiants", color: "text-success" },
  ] as const;

  return (
    <section className="border-y border-primary/10 bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-primary/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 py-10 sm:py-12">
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              N°0{i + 1}
            </span>
            <span className={`font-heading text-5xl font-extrabold tabular-nums ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ————— Features ————— */
const FEATURES = [
  {
    number: "01.",
    title: "Trouvez votre stage",
    text: "Parcourez des centaines d’offres de stages, d’alternances et de premiers emplois, filtrées par ville, secteur et type de contrat.",
    accent: "bg-primary-blue",
    icon: (
      <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" />
    ),
  },
  {
    number: "02.",
    title: "Publiez vos offres",
    text: "Entreprises : créez votre fiche, publiez vos offres en quelques clics et recevez des candidatures qualifiées d’étudiants motivés.",
    accent: "bg-accent",
    icon: (
      <path d="M12 5v14M5 12h14" />
    ),
  },
  {
    number: "03.",
    title: "Gérez vos candidatures",
    text: "Suivez chaque candidature de l’envoi à la réponse : statuts clairs, messagerie intégrée et notifications à chaque étape.",
    accent: "bg-success",
    icon: (
      <path d="M9 11l3 3 8-8M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
    ),
  },
] as const;

function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
            <span className="h-px w-10 bg-accent" aria-hidden />
            Fonctionnalités — 01 → 03
          </p>
          <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-5xl">
            Une plateforme, trois métiers.
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Pensée pour les étudiants, les entreprises et les équipes qui les
          accompagnent.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.number}
            className="group relative rounded-lg border border-primary/10 bg-card p-8 transition-all hover:-translate-y-1.5 hover:shadow-xl"
          >
            {/* Filet supérieur coloré qui s’étire au survol */}
            <span
              className={`absolute left-8 top-0 h-1 w-12 ${feature.accent} transition-all duration-500 group-hover:w-24`}
              aria-hidden
            />
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-sm font-bold text-muted-foreground">
                {feature.number}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-primary transition-colors group-hover:text-primary-blue"
                aria-hidden
              >
                {feature.icon}
              </svg>
            </div>
            <h3 className="mt-6 font-heading text-xl font-bold text-primary">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {feature.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ————— CTA final ————— */
function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Décor géométrique en filigrane */}
      <svg
        viewBox="0 0 600 400"
        className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-10"
        aria-hidden
      >
        <circle cx="300" cy="200" r="180" fill="none" stroke="#F8FAFC" strokeWidth="2" />
        <circle cx="300" cy="200" r="120" fill="none" stroke="#F28F1C" strokeWidth="2" />
        <circle cx="300" cy="200" r="60" fill="#0870B8" />
      </svg>

      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-28">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            <span className="h-px w-10 bg-accent" aria-hidden />
            Rejoignez le mouvement
          </p>
          <h2 className="mt-5 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Votre prochaine étape commence ici.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/70">
            Créez votre compte gratuitement et accédez dès aujourd’hui aux
            opportunités qui façonnent les carrières de demain au Sénégal.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Créer mon compte
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border-2 border-primary-foreground/30 px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ————— Footer ————— */
function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-extrabold text-primary">
            Stage<span className="text-accent">—</span>Connect
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            La plateforme sénégalaise qui relie les étudiants aux entreprises —
            stages, alternances et premiers emplois.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Plateforme
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link href="/login" className="transition-colors hover:text-primary-blue">
                Se connecter
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-primary-blue">
                Créer un compte
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Projet
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link href="/a-propos" className="transition-colors hover:text-primary-blue">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className="transition-colors hover:text-primary-blue">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition-colors hover:text-primary-blue">
                FAQ
              </Link>
            </li>
            <li>Mémoire L3 IDA — UNCHK</li>
            <li>Conçu à Dakar, Sénégal</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>© 2026 StageConnect. Tous droits réservés.</span>
          <span className="uppercase tracking-[0.2em]">
            Étudiants <span className="text-primary-blue">·</span> Entreprises{" "}
            <span className="text-accent">·</span> Opportunités
          </span>
        </div>
      </div>
    </footer>
  );
}
