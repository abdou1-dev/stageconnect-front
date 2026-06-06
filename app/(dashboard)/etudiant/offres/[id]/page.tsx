'use client'

// Détail d'une offre + candidature (Dialog avec lettre de motivation).
// GET /jobs/:id (public) · POST /applications (étudiant authentifié).
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  MapPin,
  Send,
} from 'lucide-react'
import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { JobTypeBadge } from '@/components/etudiant/JobTypeBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { formatRelativeDate } from '@/lib/utils'
import type { Job } from '@/types'

type JobDetail = Job & { _count?: { applications: number } }

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [job, setJob] = useState<JobDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get<JobDetail>(`/jobs/${id}`)
      .then((res) => {
        if (cancelled) return
        if (!res.success) setLoadError(res.error)
        else setJob(res.data)
      })
      .catch(() => {
        if (!cancelled) setLoadError('Impossible de charger cette offre.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/etudiant/offres"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Toutes les offres
      </Link>

      {isLoading ? (
        <DetailSkeleton />
      ) : loadError || !job ? (
        <Card className="border-destructive/30">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-destructive">
              {loadError ?? 'Offre introuvable'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Elle a peut-être été retirée par l’entreprise.
            </p>
          </CardContent>
        </Card>
      ) : (
        <article className="animate-fade-up">
          {/* En-tête de l'offre */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 rounded-md border border-primary/10">
                {job.company?.logoUrl && (
                  <AvatarImage src={job.company.logoUrl} alt="" />
                )}
                <AvatarFallback className="rounded-md bg-primary font-heading text-lg font-bold text-primary-foreground">
                  {(job.company?.name ?? '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {job.company?.name}
                </p>
                <h1 className="font-heading text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                  {job.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <JobTypeBadge type={job.type} />
                  {job.ville && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
                      {job.ville}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-accent" aria-hidden />
                    {formatRelativeDate(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <ApplyDialog
              job={job}
              hasApplied={hasApplied}
              onApplied={() => setHasApplied(true)}
            />
          </div>

          {/* Caractéristiques */}
          {(job.duration || job.salary || job.secteur) && (
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {job.secteur && (
                <FactCard icon={Building2} label="Secteur" value={job.secteur} />
              )}
              {job.duration && (
                <FactCard icon={Clock} label="Durée" value={job.duration} />
              )}
              {job.salary && (
                <FactCard icon={Banknote} label="Rémunération" value={job.salary} />
              )}
            </div>
          )}

          {/* Description */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <span className="h-px w-6 bg-accent" aria-hidden />
              Description du poste
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
              {job.description}
            </p>
          </section>

          {/* Entreprise */}
          {job.company && (
            <section className="mt-8 rounded-lg border border-primary/10 bg-card p-5">
              <h2 className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <span className="h-px w-6 bg-accent" aria-hidden />
                À propos de l’entreprise
              </h2>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="font-heading text-base font-bold text-primary">
                  {job.company.name}
                </p>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-blue underline-offset-4 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" aria-hidden />
                    Site web
                  </a>
                )}
              </div>
            </section>
          )}
        </article>
      )}
    </div>
  )
}

/* ————— Dialog de candidature ————— */
function ApplyDialog({
  job,
  hasApplied,
  onApplied,
}: {
  job: JobDetail
  hasApplied: boolean
  onApplied: () => void
}) {
  const [open, setOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleApply() {
    setIsSending(true)
    try {
      const res = await api.post('/applications', {
        jobId: job.id,
        ...(coverLetter.trim() && { coverLetter: coverLetter.trim() }),
      })
      if (!res.success) {
        toast.error(res.error)
        // 409 = déjà postulé : on reflète l'état réel
        if (res.code === 409) {
          onApplied()
          setOpen(false)
        }
        return
      }
      toast.success('Candidature envoyée ! Suivez-la dans « Candidatures ».')
      onApplied()
      setOpen(false)
    } catch {
      toast.error('Envoi impossible. Vérifiez votre connexion.')
    } finally {
      setIsSending(false)
    }
  }

  if (hasApplied) {
    return (
      <Button disabled className="shrink-0 bg-success text-success-foreground">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Candidature envoyée
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Base UI : prop render (pas asChild) */}
      <DialogTrigger
        render={
          <Button className="shrink-0 bg-accent font-semibold text-accent-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent/90">
            <Send className="h-4 w-4" aria-hidden />
            Postuler
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-extrabold text-primary">
            Postuler — {job.title}
          </DialogTitle>
          <DialogDescription>
            Chez {job.company?.name ?? 'cette entreprise'} · Votre profil sera
            transmis avec votre candidature.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="coverLetter">
            Lettre de motivation{' '}
            <span className="font-normal text-muted-foreground">(optionnelle)</span>
          </Label>
          <Textarea
            id="coverLetter"
            rows={6}
            placeholder="Expliquez en quelques lignes pourquoi ce poste vous intéresse et ce que vous pouvez apporter…"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            maxLength={2000}
          />
          <p className="text-right text-xs tabular-nums text-muted-foreground">
            {coverLetter.length}/2000
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSending}
            className="border-primary/20 text-primary"
          >
            Annuler
          </Button>
          <Button
            onClick={handleApply}
            disabled={isSending}
            className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
          >
            {isSending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Envoi…
              </>
            ) : (
              'Envoyer ma candidature'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ————— Petites cartes de caractéristiques ————— */
function FactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-primary/10 bg-card px-4 py-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-primary">{value}</p>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-7" aria-busy>
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-md" />
        <div className="space-y-2.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
