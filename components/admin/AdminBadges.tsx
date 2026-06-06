// Badges du dashboard admin — rôles et statuts utilisateur,
// même langage visuel que JobTypeBadge/StatusBadge.
import { Badge } from '@/components/ui/badge'
import type { Role, UserStatus } from '@/types'

const ROLE_STYLES: Record<Role, { label: string; className: string }> = {
  STUDENT: { label: 'Étudiant', className: 'bg-primary-blue/10 text-primary-blue' },
  COMPANY: { label: 'Entreprise', className: 'bg-accent/15 text-accent' },
  ADMIN: { label: 'Admin', className: 'bg-primary/10 text-primary' },
}

const USER_STATUS_STYLES: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Actif', className: 'bg-success/10 text-success' },
  SUSPENDED: { label: 'Suspendu', className: 'bg-accent/15 text-accent' },
  BANNED: { label: 'Banni', className: 'bg-destructive/10 text-destructive' },
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  BANNED: 'Banni',
}

export function RoleBadge({ role }: { role: Role }) {
  const { label, className } = ROLE_STYLES[role]
  return <Badge className={`border-0 font-semibold ${className}`}>{label}</Badge>
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const { label, className } = USER_STATUS_STYLES[status]
  return <Badge className={`border-0 font-semibold ${className}`}>{label}</Badge>
}
