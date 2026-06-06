'use client'

// Candidatures reçues — choisir une offre, examiner les candidats,
// changer le statut (PENDING / INTERVIEW / ACCEPTED / REJECTED).
// GET /jobs/mine (sélecteur) · GET /applications/job/:jobId · PUT /applications/:id/status
import { FileText, Inbox, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { StatusBadge } from '@/components/etudiant/StatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { formatRelativeDate } from '@/lib/utils'
import type { Application, ApplicationStatus, Job, Student } from '@/types'

type ReceivedApplication = Application & { student?: Student }

const STATUS_OPTIONS: Record<ApplicationStatus, string> = {
  PENDING: 'En attente',
  INTERVIEW: 'Entretien',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
}

interface JobsPayload {
  jobs: Job[]
  total: number
}

interface ApplicationsPayload {
  applications: ReceivedApplication[]
  total: number
}

export default function CompanyApplicationsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const [version, setVersion] = useState(0)
  const [apps, setApps] = useState<{
    key: string
    list: ReceivedApplication[]
    error: string | null
  } | null>(null)

  // Charge les offres de l'entreprise pour le sélecteur
  useEffect(() => {
    let cancelled = false
    api
      .get<JobsPayload>('/jobs/mine?limit=50')
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setJobsError(res.error)
          return
        }
        setJobs(res.data.jobs)
        // Pré-sélectionne la première offre
        if (res.data.jobs.length > 0) setSelectedJobId(res.data.jobs[0].id)
      })
      .catch(() => {
        if (!cancelled) setJobsError('Impossible de charger vos offres.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Charge les candidatures de l'offre sélectionnée
  const appsKey = selectedJobId ? `${selectedJobId}|v${version}` : null
  useEffect(() => {
    if (!appsKey || !selectedJobId) return
    let cancelled = false
    api
      .get<ApplicationsPayload>(`/applications/job/${selectedJobId}?limit=50`)
      .then((res) => {
        if (cancelled) return
        if (!res.success) {
          setApps({ key: appsKey, list: [], error: res.error })
          return
        }
        setApps({ key: appsKey, list: res.data.applications, error: null })
      })
      .catch(() => {
        if (!cancelled) {
          setApps({ key: appsKey, list: [], error: 'Impossible de charger les candidatures.' })
        }
      })
    return () => {
      cancelled = true
    }
  }, [appsKey, selectedJobId])

  const jobsLoading = jobs === null && !jobsError
  const appsLoading = selectedJobId !== null && apps?.key !== appsKey

  const jobSelectItems: Record<string, string> = Object.fromEntries(
    (jobs ?? []).map((j) => [j.id, j.title])
  )

  async function changeStatus(app: ReceivedApplication, status: ApplicationStatus) {
    if (status === app.status) return
    try {
      const res = await api.put(`/applications/${app.id}/status`, { status })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(`Statut mis à jour : ${STATUS_OPTIONS[status]}`)
      setVersion((v) => v + 1)
    } catch {
      toast.error('Changement de statut impossible. Vérifiez votre connexion.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* En-tête éditorial */}
      <div className="mb-8">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
          <span className="h-px w-8 bg-accent" aria-hidden />
          Espace entreprise — 03
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          Candidatures reçues
        </h1>
      </div>

      {jobsLoading ? (
        <Skeleton className="h-12 w-full max-w-md" />
      ) : jobsError ? (
        <div className="rounded-lg border border-destructive/30 bg-card px-6 py-12 text-center">
          <p className="font-medium text-destructive">{jobsError}</p>
        </div>
      ) : jobs !== null && jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-primary/20 px-6 py-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="font-heading text-lg font-bold text-primary">
            Publiez d’abord une offre
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Les candidatures reçues sur vos offres apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {/* Sélecteur d'offre */}
          <div className="mb-6 max-w-md space-y-1.5">
            <Label htmlFor="job-select" className="text-xs uppercase tracking-[0.15em]">
              Offre
            </Label>
            <Select
              items={jobSelectItems}
              value={selectedJobId ?? undefined}
              onValueChange={(v) => setSelectedJobId(v)}
            >
              <SelectTrigger id="job-select" className="w-full">
                <SelectValue placeholder="Choisir une offre" />
              </SelectTrigger>
              <SelectContent>
                {(jobs ?? []).map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {appsLoading ? (
            <ApplicationsSkeleton />
          ) : apps?.error ? (
            <div className="rounded-lg border border-destructive/30 bg-card px-6 py-12 text-center">
              <p className="font-medium text-destructive">{apps.error}</p>
            </div>
          ) : apps !== null && apps.list.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-primary/20 px-6 py-14 text-center">
              <Inbox className="h-9 w-9 text-muted-foreground/50" aria-hidden />
              <p className="font-heading text-base font-bold text-primary">
                Aucune candidature sur cette offre pour le moment
              </p>
            </div>
          ) : apps !== null ? (
            <ul className="space-y-4" aria-live="polite">
              {apps.list.map((app) => (
                <li key={app.id}>
                  <CandidateRow application={app} onChangeStatus={changeStatus} />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  )
}

/* ————— Ligne candidat ————— */
const STATUS_SELECT_ITEMS: Record<string, string> = STATUS_OPTIONS

function CandidateRow({
  application,
  onChangeStatus,
}: {
  application: ReceivedApplication
  onChangeStatus: (app: ReceivedApplication, status: ApplicationStatus) => void
}) {
  const student = application.student
  const initials = student
    ? `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
    : '?'

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-primary/10 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <Avatar className="h-11 w-11 shrink-0 border border-primary/10">
          {student?.photoUrl && <AvatarImage src={student.photoUrl} alt="" />}
          <AvatarFallback className="bg-primary-blue text-sm font-bold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-primary">
            {student ? `${student.firstName} ${student.lastName}` : 'Candidat'}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {student?.ville && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-accent" aria-hidden />
                {student.ville}
              </span>
            )}
            <span>Reçue {formatRelativeDate(application.createdAt)}</span>
            {application.coverLetter && <CoverLetterDialog application={application} />}
          </div>
          {student && student.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {student.skills.slice(0, 4).map((skill) => (
                <Badge
                  key={skill}
                  className="border-0 bg-primary-blue/10 text-[10px] text-primary-blue"
                >
                  {skill}
                </Badge>
              ))}
              {student.skills.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{student.skills.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={application.status} />
        <Select
          items={STATUS_SELECT_ITEMS}
          value={application.status}
          onValueChange={(v) => onChangeStatus(application, v as ApplicationStatus)}
        >
          <SelectTrigger
            aria-label="Changer le statut de la candidature"
            size="sm"
            className="w-[130px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_OPTIONS) as ApplicationStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_OPTIONS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/* ————— Lettre de motivation (Dialog) ————— */
function CoverLetterDialog({ application }: { application: ReceivedApplication }) {
  const [open, setOpen] = useState(false)
  const student = application.student

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-auto gap-1 px-1.5 py-0.5 text-xs font-medium text-primary-blue hover:text-primary"
      >
        <FileText className="h-3 w-3" aria-hidden />
        Lire la lettre
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-extrabold text-primary">
              Lettre de motivation
            </DialogTitle>
            <DialogDescription>
              {student ? `${student.firstName} ${student.lastName}` : 'Candidat'} ·
              reçue {formatRelativeDate(application.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <p className="max-h-[50vh] overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {application.coverLetter}
          </p>
        </DialogContent>
      </Dialog>
    </>
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
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
      ))}
    </div>
  )
}
