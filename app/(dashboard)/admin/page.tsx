'use client'

// Dashboard admin — stats globales, modération des utilisateurs et des offres.
// GET /admin/users (+ stats) · PUT /admin/users/:id/status ·
// GET /admin/jobs · DELETE /admin/jobs/:id
import { Briefcase, FileText, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { RoleBadge, USER_STATUS_LABELS, UserStatusBadge } from '@/components/admin/AdminBadges'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatRelativeDate } from '@/lib/utils'
import type { AdminUser, Job, UserStatus } from '@/types'

type AdminJob = Job & { _count?: { applications: number } }

interface UsersPayload {
  users: AdminUser[]
  total: number
  stats: { activeJobs: number; totalApplications: number }
}

interface JobsPayload {
  jobs: AdminJob[]
  total: number
}

interface DashboardData {
  key: number
  users: AdminUser[]
  totalUsers: number
  stats: { activeJobs: number; totalApplications: number }
  jobs: AdminJob[]
  totalJobs: number
  error: string | null
}

const STATUS_SELECT_ITEMS: Record<string, string> = USER_STATUS_LABELS

export default function AdminDashboardPage() {
  const [version, setVersion] = useState(0)
  const [data, setData] = useState<DashboardData | null>(null)
  const [deletingJob, setDeletingJob] = useState<AdminJob | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get<UsersPayload>('/admin/users?limit=50'),
      api.get<JobsPayload>('/admin/jobs?limit=50'),
    ])
      .then(([usersRes, jobsRes]) => {
        if (cancelled) return
        if (!usersRes.success || !jobsRes.success) {
          const error = !usersRes.success ? usersRes.error : !jobsRes.success ? jobsRes.error : ''
          setData({
            key: version,
            users: [],
            totalUsers: 0,
            stats: { activeJobs: 0, totalApplications: 0 },
            jobs: [],
            totalJobs: 0,
            error,
          })
          return
        }
        setData({
          key: version,
          users: usersRes.data.users,
          totalUsers: usersRes.data.total,
          stats: usersRes.data.stats,
          jobs: jobsRes.data.jobs,
          totalJobs: jobsRes.data.total,
          error: null,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setData({
            key: version,
            users: [],
            totalUsers: 0,
            stats: { activeJobs: 0, totalApplications: 0 },
            jobs: [],
            totalJobs: 0,
            error: 'Impossible de charger les données d’administration.',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [version])

  const isLoading = data?.key !== version
  const refresh = () => setVersion((v) => v + 1)

  async function changeUserStatus(user: AdminUser, status: UserStatus) {
    if (status === user.status) return
    try {
      const res = await api.put(`/admin/users/${user.id}/status`, { status })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(`${user.email} → ${USER_STATUS_LABELS[status]}`)
      refresh()
    } catch {
      toast.error('Changement de statut impossible. Vérifiez votre connexion.')
    }
  }

  async function confirmDeleteJob() {
    if (!deletingJob) return
    try {
      const res = await api.delete(`/admin/jobs/${deletingJob.id}`)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success('Offre supprimée (modération).')
      setDeletingJob(null)
      refresh()
    } catch {
      toast.error('Suppression impossible. Vérifiez votre connexion.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* En-tête éditorial */}
      <div className="mb-8">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
          <span className="h-px w-8 bg-accent" aria-hidden />
          Administration
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          Dashboard admin
        </h1>
      </div>

      {isLoading ? (
        <AdminSkeleton />
      ) : data?.error ? (
        <div className="rounded-lg border border-destructive/30 bg-card px-6 py-12 text-center">
          <p className="font-medium text-destructive">{data.error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Vérifiez que votre compte a le rôle administrateur.
          </p>
        </div>
      ) : data ? (
        <div className="space-y-12">
          {/* ——— Stats ——— */}
          <section id="stats" className="scroll-mt-20">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                icon={Users}
                label="Utilisateurs"
                value={data.totalUsers}
                color="text-primary-blue"
              />
              <StatCard
                icon={Briefcase}
                label="Offres actives"
                value={data.stats.activeJobs}
                color="text-accent"
              />
              <StatCard
                icon={FileText}
                label="Candidatures"
                value={data.stats.totalApplications}
                color="text-success"
              />
            </div>
          </section>

          {/* ——— Utilisateurs ——— */}
          <section id="utilisateurs" className="scroll-mt-20">
            <SectionHeading index="01" title="Utilisateurs" count={data.totalUsers} />
            {data.users.length === 0 ? (
              <EmptyBlock message="Aucun utilisateur inscrit pour le moment." />
            ) : (
              <div className="overflow-hidden rounded-lg border border-primary/10 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Email</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Modération</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-primary">{u.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.student
                            ? `${u.student.firstName} ${u.student.lastName}`
                            : (u.company?.name ?? '—')}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={u.role} />
                        </TableCell>
                        <TableCell>
                          <UserStatusBadge status={u.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {u.role === 'ADMIN' ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <Select
                              items={STATUS_SELECT_ITEMS}
                              value={u.status}
                              onValueChange={(v) => changeUserStatus(u, v as UserStatus)}
                            >
                              <SelectTrigger
                                size="sm"
                                aria-label={`Changer le statut de ${u.email}`}
                                className="ml-auto w-[120px]"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(USER_STATUS_LABELS) as UserStatus[]).map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {USER_STATUS_LABELS[s]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          {/* ——— Offres ——— */}
          <section id="offres" className="scroll-mt-20">
            <SectionHeading index="02" title="Offres" count={data.totalJobs} />
            {data.jobs.length === 0 ? (
              <EmptyBlock message="Aucune offre publiée pour le moment." />
            ) : (
              <div className="overflow-hidden rounded-lg border border-primary/10 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Offre</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium text-primary">
                          {job.title}
                          <span className="block text-xs text-muted-foreground">
                            {job._count?.applications ?? 0} candidature
                            {(job._count?.applications ?? 0) > 1 ? 's' : ''} ·{' '}
                            {formatRelativeDate(job.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {job.company?.name ?? '—'}
                        </TableCell>
                        <TableCell>
                          <JobTypeBadge type={job.type} />
                        </TableCell>
                        <TableCell>
                          {job.isActive ? (
                            <Badge className="border-0 bg-success/10 font-semibold text-success">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="border-0 bg-muted/40 font-semibold text-muted-foreground">
                              Désactivée
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingJob(job)}
                            aria-label={`Supprimer l’offre ${job.title}`}
                            className="text-primary hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* Confirmation de suppression (modération) */}
      <Dialog open={deletingJob !== null} onOpenChange={(o) => !o && setDeletingJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-extrabold text-primary">
              Supprimer cette offre ?
            </DialogTitle>
            <DialogDescription>
              « {deletingJob?.title} » ({deletingJob?.company?.name}) et ses{' '}
              {deletingJob?._count?.applications ?? 0} candidature(s) seront
              définitivement supprimées. Action de modération irréversible.
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
            <Button variant="destructive" onClick={confirmDeleteJob}>
              <Trash2 className="h-4 w-4" aria-hidden />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ————— Sous-composants ————— */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-lg border border-primary/10 bg-card p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-4 w-4 text-accent" aria-hidden />
        {label}
      </p>
      <p className={`mt-2 font-heading text-4xl font-extrabold tabular-nums ${color}`}>
        {value}
      </p>
    </div>
  )
}

function SectionHeading({
  index,
  title,
  count,
}: {
  index: string
  title: string
  count: number
}) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        <span className="h-px w-6 bg-accent" aria-hidden />
        {index}
      </p>
      <h2 className="font-heading text-xl font-extrabold tracking-tight text-primary">
        {title}
      </h2>
      <span className="text-sm tabular-nums text-muted-foreground">({count})</span>
    </div>
  )
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-primary/20 px-6 py-10 text-center text-sm text-muted-foreground">
      {message}
    </p>
  )
}

function AdminSkeleton() {
  return (
    <div className="space-y-10" aria-busy>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}
