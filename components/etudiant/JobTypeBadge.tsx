// Badge coloré par type de contrat — une couleur UNCHK par type,
// constante pour que l'œil apprenne le code couleur.
import { Badge } from '@/components/ui/badge'
import type { JobType } from '@/types'

const TYPE_STYLES: Record<JobType, { label: string; className: string }> = {
  STAGE: { label: 'Stage', className: 'bg-primary-blue/10 text-primary-blue' },
  ALTERNANCE: { label: 'Alternance', className: 'bg-success/10 text-success' },
  CDI: { label: 'CDI', className: 'bg-primary/10 text-primary' },
  CDD: { label: 'CDD', className: 'bg-accent/15 text-accent' },
  FREELANCE: { label: 'Freelance', className: 'bg-muted/40 text-muted-foreground' },
}

export function JobTypeBadge({ type }: { type: JobType }) {
  const { label, className } = TYPE_STYLES[type]
  return <Badge className={`border-0 font-semibold ${className}`}>{label}</Badge>
}
