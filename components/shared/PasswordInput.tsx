'use client'

// Champ mot de passe avec bouton afficher/masquer.
// Bonne pratique UX : permettre de vérifier sa saisie réduit les erreurs
// (et les abandons) bien plus efficacement qu'un champ de confirmation seul.
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={`pr-10 ${className ?? ''}`}
        {...props}
      />
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  )
}
