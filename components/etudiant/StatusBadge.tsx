// Badge de statut de candidature — code couleur constant :
// attente = orange, entretien = bleu, acceptée = vert, refusée = rouge.
import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/types'

const STATUS_STYLES: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: { label: 'En attente', className: 'bg-accent/15 text-accent' },
  INTERVIEW: { label: 'Entretien', className: 'bg-primary-blue/10 text-primary-blue' },
  ACCEPTED: { label: 'Acceptée', className: 'bg-success/10 text-success' },
  REJECTED: { label: 'Refusée', className: 'bg-destructive/10 text-destructive' },
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, className } = STATUS_STYLES[status]
  return <Badge className={`border-0 font-semibold ${className}`}>{label}</Badge>
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'En attente',
  INTERVIEW: 'Entretien',
  ACCEPTED: 'Acceptées',
  REJECTED: 'Refusées',
}
