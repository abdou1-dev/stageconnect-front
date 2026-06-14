'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
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
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'

// Destination après connexion, selon le rôle renvoyé par l'API
const HOME_BY_ROLE: Record<Role, string> = {
  STUDENT: '/etudiant/profil',
  COMPANY: '/entreprise/profil',
  ADMIN: '/admin',
}

// Section autorisée par rôle — sert à valider le ?redirect posé par le proxy
const SECTION_BY_ROLE: Record<Role, string> = {
  STUDENT: '/etudiant',
  COMPANY: '/entreprise',
  ADMIN: '/admin',
}

// Destination après connexion : on respecte le ?redirect du proxy s'il pointe
// vers la section du rôle de l'utilisateur (évite tout open-redirect / mauvais rôle),
// sinon on retombe sur l'accueil du rôle.
function resolveDestination(user: { role: Role }, redirect: string | null): string {
  if (redirect?.startsWith(`${SECTION_BY_ROLE[user.role]}/`) || redirect === SECTION_BY_ROLE[user.role]) {
    return redirect
  }
  return HOME_BY_ROLE[user.role]
}

// useSearchParams impose une frontière Suspense : on isole le formulaire et on
// l'enveloppe dans <Suspense> au niveau de l'export par défaut.
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const user = await login({ email, password })
      toast.success('Connexion réussie. Bienvenue !')
      router.push(resolveDestination(user, searchParams.get('redirect')))
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Connexion impossible. Réessayez.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-primary/10 shadow-lg">
      <CardHeader className="space-y-2">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
          <span className="h-px w-8 bg-accent" aria-hidden />
          Espace membre
        </p>
        <CardTitle className="font-heading text-2xl font-extrabold tracking-tight text-primary">
          Se connecter
        </CardTitle>
        <CardDescription>
          Accédez à votre tableau de bord StageConnect.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.sn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full bg-primary font-semibold hover:bg-primary-blue"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Connexion…
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link
            href="/register"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            S’inscrire
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  // Fallback léger pendant l'hydratation de useSearchParams — pas de flash de layout
  return (
    <Suspense fallback={<div className="h-[28rem] w-full max-w-md" aria-hidden />}>
      <LoginForm />
    </Suspense>
  )
}
