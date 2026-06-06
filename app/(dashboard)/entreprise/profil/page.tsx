'use client'

// Profil entreprise — affichage + édition inline.
// GET /auth/me (→ id entreprise) puis GET /companies/:id · PUT /companies/:id.
import { Building2, Globe, Loader2, MapPin, Pencil, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AvatarUpload } from '@/components/shared/AvatarUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import type { Company, UserWithProfiles } from '@/types'

type CompanyProfile = Company & { user?: { email: string } }

interface EditForm {
  name: string
  secteur: string
  ville: string
  website: string
  description: string
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<EditForm>({
    name: '',
    secteur: '',
    ville: '',
    website: '',
    description: '',
  })

  useEffect(() => {
    async function loadProfile() {
      const me = await api.get<UserWithProfiles>('/auth/me')
      if (!me.success) throw new Error(me.error)
      if (!me.data.company) throw new Error('Profil entreprise introuvable')

      const res = await api.get<CompanyProfile>(`/companies/${me.data.company.id}`)
      if (!res.success) throw new Error(res.error)
      setProfile(res.data)
    }
    loadProfile()
      .catch((err: unknown) => {
        setLoadError(
          err instanceof Error ? err.message : 'Impossible de charger le profil'
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  function startEditing() {
    if (!profile) return
    setForm({
      name: profile.name,
      secteur: profile.secteur ?? '',
      ville: profile.ville ?? '',
      website: profile.website ?? '',
      description: profile.description ?? '',
    })
    setIsEditing(true)
  }

  function updateField(field: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  // Persiste l'URL Cloudinary du logo après upload — appelé par AvatarUpload
  async function handleLogoUploaded(url: string) {
    if (!profile) return
    const res = await api.put<CompanyProfile>(`/companies/${profile.id}`, {
      logoUrl: url,
    })
    if (!res.success) throw new Error(res.error)
    setProfile({ ...profile, logoUrl: res.data.logoUrl ?? url })
    toast.success('Logo mis à jour !')
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    try {
      const res = await api.put<CompanyProfile>(`/companies/${profile.id}`, {
        name: form.name.trim(),
        secteur: form.secteur.trim(),
        ville: form.ville.trim(),
        website: form.website.trim(),
        description: form.description.trim(),
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      setProfile({ ...profile, ...res.data })
      setIsEditing(false)
      toast.success('Profil mis à jour !')
    } catch {
      toast.error('Enregistrement impossible. Vérifiez votre connexion.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
            <span className="h-px w-8 bg-accent" aria-hidden />
            Espace entreprise — 01
          </p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Profil entreprise
          </h1>
        </div>
        {profile && !isEditing && (
          <Button
            onClick={startEditing}
            variant="outline"
            className="shrink-0 border-primary/20 font-semibold text-primary hover:border-accent hover:text-accent"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Modifier
          </Button>
        )}
      </div>

      {isLoading ? (
        <ProfileSkeleton />
      ) : loadError ? (
        <Card className="border-destructive/30">
          <CardContent className="py-10 text-center">
            <p className="font-medium text-destructive">{loadError}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Reconnectez-vous puis réessayez.
            </p>
          </CardContent>
        </Card>
      ) : profile ? (
        isEditing ? (
          <EditCard
            form={form}
            updateField={updateField}
            onSubmit={handleSave}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        ) : (
          <ProfileCard profile={profile} onLogoUploaded={handleLogoUploaded} />
        )
      ) : null}
    </div>
  )
}

/* ————— Affichage ————— */
function ProfileCard({
  profile,
  onLogoUploaded,
}: {
  profile: CompanyProfile
  onLogoUploaded: (url: string) => Promise<void>
}) {
  return (
    <Card className="animate-fade-up overflow-hidden border-primary/10 py-0">
      <div className="flex flex-col items-center gap-5 bg-primary px-6 py-8 text-primary-foreground sm:flex-row">
        <AvatarUpload
          currentUrl={profile.logoUrl}
          fallbackText={profile.name.slice(0, 2).toUpperCase()}
          onUploaded={onLogoUploaded}
          shape="square"
          ariaLabel="Changer le logo de l’entreprise"
        />
        <div className="text-center sm:text-left">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight">
            {profile.name}
          </h2>
          {profile.user?.email && (
            <p className="mt-0.5 text-sm text-primary-foreground/70">
              {profile.user.email}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-primary-foreground/70 sm:justify-start">
            {profile.secteur && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-accent" aria-hidden />
                {profile.secteur}
              </span>
            )}
            {profile.ville && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
                {profile.ville}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 underline-offset-4 hover:text-accent hover:underline"
              >
                <Globe className="h-3.5 w-3.5 text-accent" aria-hidden />
                Site web
              </a>
            )}
          </div>
        </div>
      </div>

      <CardContent className="px-6 py-7">
        <h3 className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          <span className="h-px w-6 bg-accent" aria-hidden />
          Présentation
        </h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {profile.description || (
            <span className="italic text-muted-foreground">
              Aucune présentation — décrivez votre activité pour attirer les
              candidats !
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  )
}

/* ————— Édition inline ————— */
interface EditCardProps {
  form: EditForm
  updateField: (
    field: keyof EditForm
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  isSaving: boolean
}

function EditCard({ form, updateField, onSubmit, onCancel, isSaving }: EditCardProps) {
  return (
    <Card className="animate-fade-up border-primary/10">
      <CardContent className="px-6 py-7">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Raison sociale</Label>
            <Input id="name" value={form.name} onChange={updateField('name')} required />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="secteur">Secteur</Label>
              <Input
                id="secteur"
                placeholder="Informatique, Finance…"
                value={form.secteur}
                onChange={updateField('secteur')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                placeholder="Dakar"
                value={form.ville}
                onChange={updateField('ville')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://votre-entreprise.sn"
              value={form.website}
              onChange={updateField('website')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Présentation</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Votre activité, vos équipes, ce que vous offrez aux stagiaires et jeunes diplômés…"
              value={form.description}
              onChange={updateField('description')}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="border-primary/20 text-primary"
            >
              <X className="h-4 w-4" aria-hidden />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !form.name.trim()}
              className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Enregistrement…
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <Card className="overflow-hidden border-primary/10 py-0" aria-busy>
      <div className="flex items-center gap-5 bg-primary/95 px-6 py-8">
        <Skeleton className="h-20 w-20 rounded-lg bg-primary-foreground/15" />
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-52 bg-primary-foreground/15" />
          <Skeleton className="h-4 w-36 bg-primary-foreground/10" />
        </div>
      </div>
      <CardContent className="space-y-2.5 px-6 py-7">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}
