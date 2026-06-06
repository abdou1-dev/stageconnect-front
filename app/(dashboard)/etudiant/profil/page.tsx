'use client'

// Page profil étudiant — affichage + édition inline.
// Chargement : GET /auth/me (→ id étudiant) puis GET /students/:id.
import { FileText, FileUp, Loader2, MapPin, Pencil, Phone, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AvatarUpload } from '@/components/shared/AvatarUpload'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import type { Student, UserWithProfiles } from '@/types'

// Profil tel que renvoyé par GET /students/:id (email joint depuis User)
type StudentProfile = Student & { user?: { email: string } }

interface EditForm {
  firstName: string
  lastName: string
  phone: string
  ville: string
  bio: string
  skills: string
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<EditForm>({
    firstName: '',
    lastName: '',
    phone: '',
    ville: '',
    bio: '',
    skills: '',
  })

  useEffect(() => {
    async function loadProfile() {
      const me = await api.get<UserWithProfiles>('/auth/me')
      if (!me.success) throw new Error(me.error)
      if (!me.data.student) throw new Error('Profil étudiant introuvable')

      const res = await api.get<StudentProfile>(`/students/${me.data.student.id}`)
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
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? '',
      ville: profile.ville ?? '',
      bio: profile.bio ?? '',
      skills: profile.skills.join(', '),
    })
    setIsEditing(true)
  }

  function updateField(field: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  // Persiste l'URL Cloudinary après upload — appelé par AvatarUpload
  async function handlePhotoUploaded(url: string) {
    if (!profile) return
    const res = await api.put<StudentProfile>(`/students/${profile.id}`, {
      photoUrl: url,
    })
    if (!res.success) throw new Error(res.error)
    setProfile({ ...profile, photoUrl: res.data.photoUrl ?? url })
    toast.success('Photo de profil mise à jour !')
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    try {
      const body = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        ville: form.ville.trim(),
        bio: form.bio.trim(),
        // "React, Node, SQL" → ['React', 'Node', 'SQL']
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }
      const res = await api.put<StudentProfile>(`/students/${profile.id}`, body)
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
      {/* En-tête éditorial */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
            <span className="h-px w-8 bg-accent" aria-hidden />
            Espace étudiant — 01
          </p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Mon profil
          </h1>
        </div>
        {profile && !isEditing && (
          <Button
            onClick={startEditing}
            variant="outline"
            className="shrink-0 border-primary/20 font-semibold text-primary hover:border-accent hover:text-accent"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Modifier le profil
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
          <ProfileCard profile={profile} onPhotoUploaded={handlePhotoUploaded} />
        )
      ) : null}
    </div>
  )
}

/* ————— Affichage ————— */
function ProfileCard({
  profile,
  onPhotoUploaded,
}: {
  profile: StudentProfile
  onPhotoUploaded: (url: string) => Promise<void>
}) {
  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()

  return (
    <Card className="animate-fade-up overflow-hidden border-primary/10 py-0">
      {/* Bandeau identité sur fond bleu sombre */}
      <div className="flex flex-col items-center gap-5 bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center">
        <AvatarUpload
          currentUrl={profile.photoUrl}
          fallbackText={initials}
          onUploaded={onPhotoUploaded}
          ariaLabel="Changer ma photo de profil"
        />
        <div className="text-center sm:text-left">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight">
            {profile.firstName} {profile.lastName}
          </h2>
          {profile.user?.email && (
            <p className="mt-0.5 text-sm text-primary-foreground/70">
              {profile.user.email}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-primary-foreground/70 sm:justify-start">
            {profile.ville && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
                {profile.ville}
              </span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-accent" aria-hidden />
                {profile.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <CardContent className="space-y-7 px-6 py-7">
        <section>
          <SectionLabel>À propos</SectionLabel>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            {profile.bio || (
              <span className="italic text-muted-foreground">
                Aucune bio pour le moment — présentez-vous aux recruteurs !
              </span>
            )}
          </p>
        </section>

        <section>
          <SectionLabel>CV</SectionLabel>
          <CvSection profile={profile} />
        </section>

        <section>
          <SectionLabel>Compétences</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <Badge
                  key={skill}
                  className="border-0 bg-primary-blue/10 text-primary-blue hover:bg-primary-blue/15"
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-sm italic text-muted-foreground">
                Aucune compétence renseignée.
              </span>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

/* ————— Section CV — upload PDF via le back (POST /upload/cv) ————— */
function CvSection({ profile }: { profile: StudentProfile }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cvUrl, setCvUrl] = useState(profile.cvUrl ?? null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Le CV doit être un fichier PDF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('CV trop lourd : 5 Mo maximum.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.upload<{ cvUrl: string }>('/upload/cv', formData)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      setCvUrl(res.data.cvUrl)
      toast.success('CV mis à jour !')
    } catch {
      toast.error('Upload impossible. Vérifiez votre connexion.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {cvUrl ? (
        <a
          href={cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-primary-blue underline-offset-4 hover:underline"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Voir mon CV
        </a>
      ) : (
        <span className="text-sm italic text-muted-foreground">
          Aucun CV — les recruteurs le consultent depuis vos candidatures.
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="border-primary/20 font-semibold text-primary hover:border-accent hover:text-accent"
      >
        {isUploading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Envoi…
          </>
        ) : (
          <>
            <FileUp className="h-4 w-4" aria-hidden />
            {cvUrl ? 'Remplacer le CV' : 'Ajouter mon CV'}
          </>
        )}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
      <span className="text-xs text-muted-foreground">PDF · 5 Mo max</span>
    </div>
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
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={updateField('firstName')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={updateField('lastName')}
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+221 77 000 00 00"
                value={form.phone}
                onChange={updateField('phone')}
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
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Présentez-vous en quelques lignes : formation, projets, ce que vous cherchez…"
              value={form.bio}
              onChange={updateField('bio')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Compétences</Label>
            <Input
              id="skills"
              placeholder="React, Node.js, SQL"
              value={form.skills}
              onChange={updateField('skills')}
              aria-describedby="skills-hint"
            />
            <p id="skills-hint" className="text-xs text-muted-foreground">
              Séparez les compétences par des virgules.
            </p>
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
              disabled={isSaving || !form.firstName.trim() || !form.lastName.trim()}
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

/* ————— Skeleton de chargement ————— */
function ProfileSkeleton() {
  return (
    <Card className="overflow-hidden border-primary/10 py-0" aria-busy>
      <div className="flex items-center gap-5 bg-primary/95 px-6 py-8">
        <Skeleton className="h-20 w-20 rounded-full bg-primary-foreground/15" />
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-48 bg-primary-foreground/15" />
          <Skeleton className="h-4 w-36 bg-primary-foreground/10" />
        </div>
      </div>
      <CardContent className="space-y-7 px-6 py-7">
        <div className="space-y-2.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3.5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* Label de section façon kicker éditorial */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
      <span className="h-px w-6 bg-accent" aria-hidden />
      {children}
    </h3>
  )
}
