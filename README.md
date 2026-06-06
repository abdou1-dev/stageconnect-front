# StageConnect — Frontend

Plateforme web de mise en relation **étudiants ↔ entreprises** pour la gestion des stages et emplois au Sénégal.
Mémoire de Licence 3 IDA — UNCHK · 2026

**Production** : [stageconnect-front.vercel.app](https://stageconnect-front.vercel.app)
**Backend** : [stageconnect-back](https://github.com/abdou1-dev/stageconnect-back) (Express 5 + Prisma 7 + Neon PostgreSQL)

---

## Stack

| Couche | Techno |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| UI | Tailwind CSS 4 + shadcn/ui (Base UI) |
| Typo | Syne (titres) + DM Sans (corps) via `next/font` |
| Toasts | Sonner |
| Uploads | Cloudinary (unsigned upload) |
| Déploiement | Vercel — auto-deploy : `main` → Production, `develop` → Preview |

## Démarrage

```bash
git clone https://github.com/abdou1-dev/stageconnect-front.git
cd stageconnect-front
npm install

# Variables d'environnement
cp .env.local.example .env.local
# puis remplir les valeurs (voir tableau ci-dessous)

npm run dev   # http://localhost:3000
```

> Le backend doit tourner sur le port 3001 (`npm run dev` dans stageconnect-back).

### Variables d'environnement (`.env.local`)

| Variable | Description | Exemple |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | `http://localhost:3001/api` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary | `dmio3ke1l` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Preset d'upload **unsigned** | `stageconnect` |

> Ces valeurs `NEXT_PUBLIC_*` sont publiques par design (aucun secret côté front).
> Le preset Cloudinary doit être configuré en **unsigned** (Dashboard → Settings → Upload → Upload presets).

## Scripts

```bash
npm run dev      # serveur de développement (port 3000)
npm run build    # build de production
npm run lint     # ESLint
npx shadcn add <composant>   # ajouter un composant shadcn/ui
```

## Structure

```
app/
  (auth)/login, register     → authentification (split-screen)
  (dashboard)/etudiant/      → profil, offres, candidatures, messages
  (dashboard)/entreprise/    → profil, mes-offres, candidatures, messages
  (dashboard)/admin/         → dashboard admin
  page.tsx                   → landing page publique
components/
  ui/          → shadcn/ui (généré — ne pas modifier à la main)
  shared/      → DashboardShell, AvatarUpload, PasswordInput…
  etudiant/    → JobCard, JobTypeBadge, StatusBadge…
  entreprise/  → JobFormDialog…
lib/           → api.ts (client HTTP), auth.ts (JWT), cloudinary.ts, utils.ts
hooks/         → useAuth.ts
types/         → index.ts (tous les types partagés)
```

## Conventions

- Branches : `feature/xxx` / `fix/xxx` depuis `develop` → PR (push direct bloqué sur `main` et `develop`)
- Commits : `feat(scope): description` (Conventional Commits)
- `main` = production uniquement — release par PR `develop → main` avec review
- Composants en anglais, commentaires en français, pas de `any`, Server Components par défaut

## Auteurs

- **Abdoulaye DIAW** — Lead front · [@abdou1-dev](https://github.com/abdou1-dev)
- **Abdallah Moussa DIALLO** — Lead back · [@LivaiAckerman7](https://github.com/LivaiAckerman7)
