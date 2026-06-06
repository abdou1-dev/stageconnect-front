'use client'

// Mes candidatures — tableau de bord des statuts.
// GET /applications/mine (limite API : 50/page) ; filtres par statut
// côté client avec compteurs. isLoading dérivé de la clé de requête.
import { ArrowRight, FileText, Inbox } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { StatusBadge, STATUS_LABELS } from '@/components/etudiant/StatusBadge'
import { JobTypeBadge } from '@/components/etudiant/JobTypeBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { formatRelativeDate } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/types'

const PAGE_SIZE = 50 // max accepté par l'API — large pour un étudiant

interface ApplicationsPayload {
  applications: Application[]
  total: number
  page: number
  limit: number
}

interface QueryResult {
  key: string
  applications: Application[]
  total: number
  error: string | null
}

type StatusFilter = ApplicationStatus | 'ALL'

// Cascade d'apparition des lignes — classes statiques (pas de style inline,
// et Tailwind ne compile pas les valeurs dynamiques)
const STAGGER_DELAYS = [
  '[animation-delay:0ms]',
  '[animation-delay:60ms]',
  '[animation-delay:120ms]',
  '[animation-delay:180ms]',
  '[animation-delay:240ms]',
  '[animation-delay:300ms]',
] as const

export default function StudentApplicationsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [result, setResult] = useState<QueryResult | null>(null)

  const queryKey = `page=${page}&limit=${PAGE_SIZE}`

  useEffect(() => {
    let cancelled = false
    api
      .get<ApplicationsPayload>(`/applications/mine?${queryKey}`)
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setResult({ key: queryKey, applications: [], total: 0, error: res.error })
          return
        }
        setResult({
          key: queryKey,
          applications: res.data.applications,
          total: res.data.total,
          error: null,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            key: queryKey,
            applications: [],
            total: 0,
            error: 'Impossible de charger vos candidatures.',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [queryKey])

  const isLoading = result?.key !== queryKey
  const loadError = !isLoading && result ? result.error : null
  const applications = result?.applications ?? []
  const total = result?.total ?? 0

  // Compteurs par statut (sur la page chargée — 50 max, large pour un étudiant)
  const counts = applications.reduce<Record<StatusFilter, number>>(
    (acc, app) => {
      acc.ALL += 1
      acc[app.status] += 1
      return acc
    },
    { ALL: 0, PENDING: 0, INTERVIEW: 0, ACCEPTED: 0, REJECTED: 0 }
  )

  const visible =
    statusFilter === 'ALL'
      ? applications
      : applications.filter((app) => app.status === statusFilter)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-4xl">
      {/* En-tête éditorial */}
      <div className="mb-8">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
          <span className="h-px w-8 bg-accent" aria-hidden />
          Espace étudiant — 03
        </p>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Mes candidatures
          </h1>
          {!isLoading && !loadError && total > 0 && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {total} candidature{total > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <ApplicationsSkeleton />
      ) : loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-card px-6 py-12 text-center">
          <p className="font-medium text-destructive">{loadError}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Reconnectez-vous puis réessayez.
          </p>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Filtres par statut, avec compteurs */}
          <div
            className="mb-6 flex flex-wrap gap-2"
            role="group"
            aria-label="Filtrer par statut"
          >
            <FilterChip
              active={statusFilter === 'ALL'}
              onClick={() => setStatusFilter('ALL')}
              label="Toutes"
              count={counts.ALL}
            />
            {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((status) => (
              <FilterChip
                key={status}
                active={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                label={STATUS_LABELS[status]}
                count={counts[status]}
              />
            ))}
          </div>

          {/* Liste */}
          {visible.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-6 py-10 text-center text-sm text-muted-foreground">
              Aucune candidature avec ce statut.
            </p>
          ) : (
            <ul className="space-y-4">
              {visible.map((app, i) => (
                <li
                  key={app.id}
                  className={`animate-fade-up ${STAGGER_DELAYS[Math.min(i, STAGGER_DELAYS.length - 1)]}`}
                >
                  <ApplicationRow application={app} />
                </li>
              ))}
            </ul>
          )}

          {/* Pagination — seulement au-delà de 50 candidatures */}
          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-4"
              aria-label="Pagination"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="border-primary/20 text-primary"
              >
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
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

/* ————— Ligne de candidature ————— */
function ApplicationRow({ application }: { application: Application }) {
  const job = application.job

  return (
    <div className="group flex flex-col gap-4 rounded-lg border border-primary/10 bg-card p-5 transition-all hover:border-primary-blue/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-11 w-11 shrink-0 rounded-md border border-primary/10">
          {job?.company?.logoUrl && <AvatarImage src={job.company.logoUrl} alt="" />}
          <AvatarFallback className="rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
            {(job?.company?.name ?? '?').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">
            {job?.company?.name ?? 'Entreprise'}
          </p>
          {job ? (
            <Link
              href={`/etudiant/offres/${job.id}`}
              className="block truncate font-heading text-base font-bold text-primary underline-offset-4 transition-colors hover:text-primary-blue hover:underline"
            >
              {job.title}
            </Link>
          ) : (
            <p className="font-heading text-base font-bold text-muted-foreground">
              Offre supprimée
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {job && <JobTypeBadge type={job.type} />}
            <span>Envoyée {formatRelativeDate(application.createdAt)}</span>
            {application.coverLetter && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-accent" aria-hidden />
                Lettre jointe
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0 sm:text-right">
        <StatusBadge status={application.status} />
      </div>
    </div>
  )
}

/* ————— Filtres ————— */
function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-primary/15 bg-card text-primary hover:border-primary/40'
      }`}
    >
      {label}
      <span
        className={`ml-1.5 tabular-nums ${
          active ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

/* ————— États ————— */
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-primary/20 px-6 py-16 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/50" aria-hidden />
      <div>
        <p className="font-heading text-lg font-bold text-primary">
          Aucune candidature pour le moment
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          Parcourez les offres disponibles et postulez en quelques clics — votre
          suivi apparaîtra ici.
        </p>
      </div>
      <Button
        nativeButton={false}
        render={
          <Link href="/etudiant/offres">
            Voir les offres
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
        className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
      />
    </div>
  )
}

function ApplicationsSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-primary/10 bg-card p-5"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}
