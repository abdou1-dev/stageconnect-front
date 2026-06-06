// Carte d'offre — scannable, une seule action (toute la carte est cliquable).
import { ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { JobTypeBadge } from '@/components/etudiant/JobTypeBadge'
import { formatRelativeDate } from '@/lib/utils'
import type { Job } from '@/types'

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/etudiant/offres/${job.id}`}
      className="group relative flex flex-col gap-4 rounded-lg border border-primary/10 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary-blue/40 hover:shadow-lg"
    >
      {/* Filet supérieur qui s'étire au survol — signature éditoriale */}
      <span
        className="absolute left-6 top-0 h-0.5 w-10 bg-accent transition-all duration-500 group-hover:w-20"
        aria-hidden
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 rounded-md border border-primary/10">
            {job.company?.logoUrl && (
              <AvatarImage src={job.company.logoUrl} alt="" />
            )}
            <AvatarFallback className="rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground">
              {(job.company?.name ?? '?').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {job.company?.name ?? 'Entreprise'}
            </p>
            <h3 className="font-heading text-base font-bold leading-snug text-primary transition-colors group-hover:text-primary-blue">
              {job.title}
            </h3>
          </div>
        </div>
        <JobTypeBadge type={job.type} />
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {job.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-primary/5 pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-3">
          {job.ville && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
              {job.ville}
            </span>
          )}
          <span>{formatRelativeDate(job.createdAt)}</span>
        </span>
        <span className="flex items-center gap-1 font-semibold text-primary-blue">
          Voir l’offre
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  )
}
