'use client'

import { Building2, CheckCircle2, Circle, GraduationCap, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/shared/PasswordInput'
import { api } from '@/lib/api'

// Rôles proposés à l'inscription (ADMIN se crée côté back uniquement)
type RegisterRole = 'STUDENT' | 'COMPANY'

interface FormState {
  firstName: string
  lastName: string
  name: string
  email: string
  password: string
  confirmPassword: string
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<RegisterRole | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation en temps réel — pilote la checklist et l'état du bouton
  const passwordLongEnough = form.password.length >= 8
  const passwordsMatch =
    form.password.length > 0 && form.password === form.confirmPassword

  function updateField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!role) return

    if (form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)
    try {
      const body =
        role === 'STUDENT'
          ? {
              role,
              email: form.email,
              password: form.password,
              firstName: form.firstName,
              lastName: form.lastName,
            }
          : {
              role,
              email: form.email,
              password: form.password,
              name: form.name,
            }

      const res = await api.post('/auth/register', body)
      if (!res.success) {
        toast.error(res.error)
        setIsSubmitting(false)
        return
      }
      toast.success('Compte créé ! Connectez-vous pour continuer.')
      router.push('/login')
    } catch {
      toast.error('Inscription impossible. Vérifiez votre connexion.')
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg border-primary/10 shadow-lg">
      <CardHeader className="space-y-2">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
          <span className="h-px w-8 bg-accent" aria-hidden />
          Rejoindre StageConnect
        </p>
        <CardTitle className="font-heading text-2xl font-extrabold tracking-tight text-primary">
          Créer un compte
        </CardTitle>
        <CardDescription>
          {role === null
            ? 'Commencez par choisir votre profil.'
            : role === 'STUDENT'
              ? 'Profil étudiant — trouvez votre stage ou premier emploi.'
              : 'Profil entreprise — publiez vos offres et recrutez.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Étape 1 — choix du rôle, deux cartes visuellement distinctes */}
        <div className="grid grid-cols-2 gap-4">
          <RoleCard
            selected={role === 'STUDENT'}
            onClick={() => setRole('STUDENT')}
            icon={<GraduationCap className="h-7 w-7" aria-hidden />}
            title="Je suis étudiant"
            subtitle="Je cherche un stage ou un emploi"
            selectedClasses="border-primary-blue bg-primary-blue/5 text-primary-blue"
          />
          <RoleCard
            selected={role === 'COMPANY'}
            onClick={() => setRole('COMPANY')}
            icon={<Building2 className="h-7 w-7" aria-hidden />}
            title="Je suis une entreprise"
            subtitle="Je publie des offres et je recrute"
            selectedClasses="border-accent bg-accent/5 text-accent"
          />
        </div>

        {/* Étape 2 — formulaire selon le rôle */}
        {role !== null && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {role === 'STUDENT' ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    placeholder="Abdoulaye"
                    value={form.firstName}
                    onChange={updateField('firstName')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    placeholder="Diaw"
                    value={form.lastName}
                    onChange={updateField('lastName')}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="name">Raison sociale</Label>
                <Input
                  id="name"
                  autoComplete="organization"
                  placeholder="Orbus Digital SARL"
                  value={form.name}
                  onChange={updateField('name')}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={
                  role === 'STUDENT' ? 'vous@exemple.sn' : 'contact@entreprise.sn'
                }
                value={form.email}
                onChange={updateField('email')}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  placeholder="8 caractères min."
                  value={form.password}
                  onChange={updateField('password')}
                  aria-describedby="password-checklist"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmation</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={updateField('confirmPassword')}
                  aria-describedby="password-checklist"
                  required
                />
              </div>
            </div>

            {/* Checklist temps réel — feedback immédiat, lu poliment par les lecteurs d'écran */}
            <ul
              id="password-checklist"
              aria-live="polite"
              className="space-y-1.5 text-xs"
            >
              <Requirement met={passwordLongEnough}>
                Au moins 8 caractères
              </Requirement>
              <Requirement met={passwordsMatch}>
                Les deux mots de passe correspondent
              </Requirement>
            </ul>

            <Button
              type="submit"
              disabled={isSubmitting || !passwordLongEnough || !passwordsMatch}
              className="w-full bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Création du compte…
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary-blue underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

/* Ligne de la checklist mot de passe — icône verte quand la condition est remplie */
function Requirement({
  met,
  children,
}: {
  met: boolean
  children: React.ReactNode
}) {
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

/* Carte de sélection de rôle — bouton accessible, état sélectionné marqué */
interface RoleCardProps {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
  selectedClasses: string
}

function RoleCard({
  selected,
  onClick,
  icon,
  title,
  subtitle,
  selectedClasses,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? selectedClasses
          : 'border-primary/15 text-primary hover:border-primary/40'
      }`}
    >
      {icon}
      <span className="font-heading text-sm font-bold leading-tight">
        {title}
      </span>
      <span className="text-xs leading-snug text-muted-foreground">
        {subtitle}
      </span>
    </button>
  )
}
