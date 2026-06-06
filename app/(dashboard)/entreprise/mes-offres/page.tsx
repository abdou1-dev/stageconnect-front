'use client'

// Mes offres — gestion complète : créer, modifier, activer/désactiver, supprimer.
// GET /jobs/mine (inclut les inactives + nb de candidatures par offre).
import {
  Eye,
  EyeOff,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { JobFormDialog } from '@/components/entreprise/JobFormDialog'
import { JobTypeBadge } from '@/components/etudiant/JobTypeBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { formatRelativeDate } from '@/lib/utils'
import type { Job } from '@/types'

type MyJob = Job & { _count?: { applications: number } }

interface JobsPayload {
  jobs: MyJob[]
  total: number
  page: number
  limit: number
}

interface QueryResult {
  key: string
  jobs: MyJob[]
  total: number
  error: string | null
}

export default function CompanyJobsPage() {
  const [version, setVersion] = useState(0) // incrémenté après chaque mutation
  const [result, setResult] = useState<QueryResult | null>(null)

  // Dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<MyJob | undefined>(undefined)
  const [deletingJob, setDeletingJob] = useState<MyJob | null>(null)

  const queryKey = `v=${version}`

  useEffect(() => {
    let cancelled = false
    api
      .get<JobsPayload>('/jobs/mine?limit=50')
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setResult({ key: queryKey, jobs: [], total: 0, error: res.error })
          return
        }
        setResult({ key: queryKey, jobs: res.data.jobs, total: res.data.total, error: null })
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            key: queryKey,
            jobs: [],
            total: 0,
            error: 'Impossible de charger vos offres.',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [queryKey])

  const isLoading = result?.key !== queryKey
  const loadError = !isLoading && result ? result.error : null
  const jobs = result?.jobs ?? []

  const refresh = () => setVersion((v) => v + 1)

  function openCreate() {
    setEditingJob(undefined)
    setFormOpen(true)
  }

  function openEdit(job: MyJob) {
    setEditingJob(job)
    setFormOpen(true)
  }

  async function toggleActive(job: MyJob) {
    const res = await api.put<MyJob>(`/jobs/${job.id}`, { isActive: !job.isActive })
    if (!res.success) {
      toast.error(res.error)
      return
    }
    toast.success(job.isActive ? 'Offre désactivée.' : 'Offre réactivée !')
    refresh()
  }

  async function confirmDelete() {
    if (!deletingJob) return
    const res = await api.delete(`/jobs/${deletingJob.id}`)
    if (!res.success) {
      toast.error(res.error)
      return
    }
    toast.success('Offre supprimée.')
    setDeletingJob(null)
    refresh()
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* En-tête éditorial */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
            <span className="h-px w-8 bg-accent" aria-hidden />
            Espace entreprise — 02
          </p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Mes offres
          </h1>
        </div>
        <Button
          onClick={openCreate}
          className="shrink-0 bg-accent font-semibold text-accent-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Publier une offre
        </Button>
      </div>

      {isLoading ? (
        <JobsSkeleton />
      ) : loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-card px-6 py-12 text-center">
          <p className="font-medium text-destructive">{loadError}</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobRow
                job={job}
                onEdit={() => openEdit(job)}
                onToggle={() => toggleActive(job)}
                onDelete={() => setDeletingJob(job)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Dialog création / édition */}
      <JobFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        job={editingJob}
        onSaved={refresh}
      />

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deletingJob !== null} onOpenChange={(o) => !o && setDeletingJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-extrabold text-primary">
              Supprimer cette offre ?
            </DialogTitle>
            <DialogDescription>
              « {deletingJob?.title} » et toutes ses candidatures (
              {deletingJob?._count?.applications ?? 0}) seront définitivement
              supprimées. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingJob(null)}
              className="border-primary/20 text-primary"
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" aria-hidden />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ————— Ligne d'offre ————— */
function JobRow({
  job,
  onEdit,
  onToggle,
  onDelete,
}: {
  job: MyJob
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const applicationsCount = job._count?.applications ?? 0

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border bg-card p-5 transition-all sm:flex-row sm:items-center sm:justify-between ${
        job.isActive ? 'border-primary/10' : 'border-dashed border-primary/20 opacity-70'
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-base font-bold text-primary">{job.title}</h3>
          <JobTypeBadge type={job.type} />
          {!job.isActive && (
            <Badge className="border-0 bg-muted/40 font-semibold text-muted-foreground">
              Désactivée
            </Badge>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-accent" aria-hidden />
            {applicationsCount} candidature{applicationsCount > 1 ? 's' : ''}
          </span>
          <span>Publiée {formatRelativeDate(job.createdAt)}</span>
          {job.ville && <span>{job.ville}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          aria-label={`Modifier l’offre ${job.title}`}
          className="text-primary hover:text-primary-blue"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={
            job.isActive
              ? `Désactiver l’offre ${job.title}`
              : `Réactiver l’offre ${job.title}`
          }
          className="text-primary hover:text-accent"
        >
          {job.isActive ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label={`Supprimer l’offre ${job.title}`}
          className="text-primary hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}

/* ————— États ————— */
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-primary/20 px-6 py-16 text-center">
      <Newspaper className="h-10 w-10 text-muted-foreground/50" aria-hidden />
      <div>
        <p className="font-heading text-lg font-bold text-primary">
          Aucune offre publiée
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          Publiez votre première offre : elle sera immédiatement visible par les
          milliers d’étudiants de la plateforme.
        </p>
      </div>
      <Button
        onClick={onCreate}
        className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Publier une offre
      </Button>
    </div>
  )
}

function JobsSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-primary/10 bg-card p-5"
        >
          <div className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}
