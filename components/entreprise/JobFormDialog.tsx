'use client'

// Dialog de création/édition d'offre — même formulaire pour les deux modes.
// POST /jobs (création) · PUT /jobs/:id (édition).
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import type { Job, JobType } from '@/types'

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'STAGE', label: 'Stage' },
  { value: 'ALTERNANCE', label: 'Alternance' },
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'FREELANCE', label: 'Freelance' },
]

// Base UI affiche la valeur brute sans ce mapping valeur → label
const TYPE_SELECT_ITEMS: Record<string, string> = Object.fromEntries(
  JOB_TYPES.map(({ value, label }) => [value, label])
)

interface FormState {
  title: string
  description: string
  type: JobType
  ville: string
  secteur: string
  duration: string
  salary: string
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  type: 'STAGE',
  ville: '',
  secteur: '',
  duration: '',
  salary: '',
}

interface JobFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Offre à éditer — undefined pour une création */
  job?: Job
  /** Appelé après succès, pour rafraîchir la liste */
  onSaved: () => void
}

export function JobFormDialog({ open, onOpenChange, job, onSaved }: JobFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Le contenu est démonté à la fermeture (Base UI) : JobForm repart
          donc avec un état frais à chaque ouverture — pas d'effet nécessaire */}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <JobForm job={job} onOpenChange={onOpenChange} onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  )
}

function JobForm({
  job,
  onOpenChange,
  onSaved,
}: {
  job?: Job
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const isEdit = job !== undefined
  // Initialisé au montage — pré-rempli en édition, vide en création
  const [form, setForm] = useState<FormState>(() =>
    job
      ? {
          title: job.title,
          description: job.description,
          type: job.type,
          ville: job.ville ?? '',
          secteur: job.secteur ?? '',
          duration: job.duration ?? '',
          salary: job.salary ?? '',
        }
      : EMPTY_FORM
  )
  const [isSaving, setIsSaving] = useState(false)

  function updateField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        ville: form.ville.trim(),
        secteur: form.secteur.trim(),
        duration: form.duration.trim(),
        salary: form.salary.trim(),
      }
      const res = isEdit
        ? await api.put<Job>(`/jobs/${job.id}`, body)
        : await api.post<Job>('/jobs', body)

      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(isEdit ? 'Offre mise à jour !' : 'Offre publiée !')
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error('Enregistrement impossible. Vérifiez votre connexion.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
          <DialogTitle className="font-heading text-xl font-extrabold text-primary">
            {isEdit ? 'Modifier l’offre' : 'Publier une offre'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Les candidatures déjà reçues sont conservées.'
              : 'Votre offre sera visible immédiatement par tous les étudiants.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="job-title">Intitulé du poste</Label>
            <Input
              id="job-title"
              placeholder="Développeur Fullstack Junior"
              value={form.title}
              onChange={updateField('title')}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-type">Type de contrat</Label>
              <Select
                items={TYPE_SELECT_ITEMS}
                value={form.type}
                onValueChange={(v) => setForm((prev) => ({ ...prev, type: v as JobType }))}
              >
                <SelectTrigger id="job-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-ville">Ville</Label>
              <Input
                id="job-ville"
                placeholder="Dakar"
                value={form.ville}
                onChange={updateField('ville')}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="job-secteur">Secteur</Label>
              <Input
                id="job-secteur"
                placeholder="Informatique"
                value={form.secteur}
                onChange={updateField('secteur')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-duration">Durée</Label>
              <Input
                id="job-duration"
                placeholder="6 mois"
                value={form.duration}
                onChange={updateField('duration')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-salary">Rémunération</Label>
              <Input
                id="job-salary"
                placeholder="150 000 FCFA/mois"
                value={form.salary}
                onChange={updateField('salary')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Description</Label>
            <Textarea
              id="job-description"
              rows={6}
              placeholder="Missions, profil recherché, environnement de travail, modalités…"
              value={form.description}
              onChange={updateField('description')}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="border-primary/20 text-primary"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !form.title.trim() || !form.description.trim()}
              className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Enregistrement…
                </>
              ) : isEdit ? (
                'Enregistrer'
              ) : (
                'Publier l’offre'
              )}
            </Button>
          </DialogFooter>
        </form>
    </>
  )
}
