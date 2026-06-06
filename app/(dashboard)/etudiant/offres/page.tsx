'use client'

// Liste des offres — filtres (type, ville, secteur), pagination, skeletons.
// GET /jobs est public ; les filtres texte sont débouncés (400 ms).
import { ChevronLeft, ChevronRight, Search, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'

import { JobCard } from '@/components/etudiant/JobCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import type { Job, JobType } from '@/types'

const PAGE_SIZE = 10

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'STAGE', label: 'Stage' },
  { value: 'ALTERNANCE', label: 'Alternance' },
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'FREELANCE', label: 'Freelance' },
]

// Base UI affiche la valeur brute sans ce mapping valeur → label
const TYPE_SELECT_ITEMS: Record<string, string> = Object.fromEntries([
  ['ALL', 'Tous les types'],
  ...JOB_TYPES.map(({ value, label }) => [value, label]),
])

interface JobsPayload {
  jobs: Job[]
  total: number
  page: number
  limit: number
}

// Résultat d'une requête, mémorisé avec sa clé de filtres :
// isLoading se DÉRIVE de la comparaison des clés — aucun setState
// synchrone dans l'effet (règle react-hooks/set-state-in-effect).
interface QueryResult {
  key: string
  jobs: Job[]
  total: number
  error: string | null
}

export default function StudentJobsPage() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<QueryResult | null>(null)

  // Filtres saisis (immédiats) vs filtres appliqués (débouncés)
  const [typeFilter, setTypeFilter] = useState<JobType | 'ALL'>('ALL')
  const [qInput, setQInput] = useState('')
  const [villeInput, setVilleInput] = useState('')
  const [secteurInput, setSecteurInput] = useState('')
  const [applied, setApplied] = useState({ q: '', ville: '', secteur: '' })

  // Débounce des champs texte — évite une requête par frappe
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplied({
        q: qInput.trim(),
        ville: villeInput.trim(),
        secteur: secteurInput.trim(),
      })
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [qInput, villeInput, secteurInput])

  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  })
  if (typeFilter !== 'ALL') params.set('type', typeFilter)
  if (applied.q) params.set('q', applied.q)
  if (applied.ville) params.set('ville', applied.ville)
  if (applied.secteur) params.set('secteur', applied.secteur)
  const queryKey = params.toString()

  useEffect(() => {
    let cancelled = false
    api
      .get<JobsPayload>(`/jobs?${queryKey}`)
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setResult({ key: queryKey, jobs: [], total: 0, error: res.error })
          return
        }
        setResult({
          key: queryKey,
          jobs: res.data.jobs,
          total: res.data.total,
          error: null,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            key: queryKey,
            jobs: [],
            total: 0,
            error: 'Impossible de charger les offres.',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [queryKey])

  // Chargement = le résultat affiché ne correspond pas encore aux filtres courants
  const isLoading = result?.key !== queryKey
  const loadError = !isLoading && result ? result.error : null
  const jobs = result?.jobs ?? []
  const total = result?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-5xl">
      {/* En-tête éditorial */}
      <div className="mb-8">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
          <span className="h-px w-8 bg-accent" aria-hidden />
          Espace étudiant — 02
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Offres
          </h1>
          {!isLoading && !loadError && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {total} offre{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="mb-8 space-y-4 rounded-lg border border-primary/10 bg-card p-4">
        {/* Recherche texte libre — titre, description ou secteur */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Rechercher une offre"
            placeholder="Rechercher un poste, une mission, un secteur…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="filter-type" className="text-xs uppercase tracking-[0.15em]">
            Type de contrat
          </Label>
          <Select
            items={TYPE_SELECT_ITEMS}
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as JobType | 'ALL')
              setPage(1)
            }}
          >
            <SelectTrigger id="filter-type" className="w-full">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              {JOB_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-ville" className="text-xs uppercase tracking-[0.15em]">
            Ville
          </Label>
          <Input
            id="filter-ville"
            placeholder="Dakar, Thiès…"
            value={villeInput}
            onChange={(e) => setVilleInput(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-secteur" className="text-xs uppercase tracking-[0.15em]">
            Secteur
          </Label>
          <Input
            id="filter-secteur"
            placeholder="Informatique, Finance…"
            value={secteurInput}
            onChange={(e) => setSecteurInput(e.target.value)}
          />
        </div>
        </div>
      </div>

      {/* Résultats */}
      {isLoading ? (
        <JobsSkeleton />
      ) : loadError ? (
        <ErrorState message={loadError} />
      ) : jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-4"
              aria-label="Pagination des offres"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="border-primary/20 text-primary"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Précédent
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border-primary/20 text-primary"
              >
                Suivant
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

function JobsSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2" aria-busy>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-lg border border-primary/10 bg-card p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-4.5 w-44" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-primary/20 px-6 py-16 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground/50" aria-hidden />
      <p className="font-heading text-lg font-bold text-primary">
        Aucune offre ne correspond
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Essayez d’élargir vos critères : retirez un filtre ou vérifiez
        l’orthographe de la ville ou du secteur.
      </p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-card px-6 py-12 text-center">
      <p className="font-medium text-destructive">{message}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Vérifiez votre connexion puis rechargez la page.
      </p>
    </div>
  )
}
