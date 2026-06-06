'use client'

// Dialog « Changer le mot de passe » — accessible depuis le bloc utilisateur
// des sidebars. PUT /auth/password (vérifie l'ancien côté serveur).
import { CheckCircle2, Circle, KeyRound, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { PasswordInput } from '@/components/shared/PasswordInput'
import { Button } from '@/components/ui/button'
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
import { api } from '@/lib/api'

export function ChangePasswordDialog({ buttonClassName }: { buttonClassName?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Base UI : prop render (pas asChild) */}
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Changer mon mot de passe"
            className={buttonClassName}
          >
            <KeyRound className="h-4 w-4" aria-hidden />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        {/* Démonté à la fermeture (Base UI) → état frais à chaque ouverture */}
        <PasswordForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const longEnough = next.length >= 8
  const different = next.length > 0 && next !== current
  const match = next.length > 0 && next === confirm
  const canSubmit = current.length > 0 && longEnough && different && match

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    setIsSaving(true)
    try {
      const res = await api.put('/auth/password', {
        currentPassword: current,
        newPassword: next,
      })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success('Mot de passe mis à jour !')
      onDone()
    } catch {
      toast.error('Changement impossible. Vérifiez votre connexion.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading text-xl font-extrabold text-primary">
          Changer le mot de passe
        </DialogTitle>
        <DialogDescription>
          Votre mot de passe actuel est requis pour confirmer le changement.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="current-password">Mot de passe actuel</Label>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nouveau</Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              placeholder="8 caractères min."
              value={next}
              onChange={(e) => setNext(e.target.value)}
              aria-describedby="password-rules"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmation</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-describedby="password-rules"
              required
            />
          </div>
        </div>

        {/* Checklist temps réel — même pattern que le register */}
        <ul id="password-rules" aria-live="polite" className="space-y-1.5 text-xs">
          <Rule met={longEnough}>Au moins 8 caractères</Rule>
          <Rule met={different}>Différent de l’actuel</Rule>
          <Rule met={match}>Les deux nouveaux mots de passe correspondent</Rule>
        </ul>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            disabled={isSaving}
            className="border-primary/20 text-primary"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !canSubmit}
            className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Changement…
              </>
            ) : (
              'Changer le mot de passe'
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function Rule({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li
      className={`flex items-center gap-2 transition-colors ${
        met ? 'text-success' : 'text-muted-foreground'
      }`}
    >
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Circle className="h-3.5 w-3.5" aria-hidden />
      )}
      {children}
    </li>
  )
}
