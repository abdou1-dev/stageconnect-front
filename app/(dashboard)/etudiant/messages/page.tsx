'use client'

// Messagerie étudiant — UI partagée avec l'espace entreprise (cf. Messaging).
import { Messaging } from '@/components/shared/Messaging'

export default function StudentMessagesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary-blue">
          <span className="h-px w-8 bg-accent" aria-hidden />
          Espace étudiant — 04
        </p>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          Messages
        </h1>
      </div>
      <Messaging />
    </div>
  )
}
