'use client'

// Layout du dashboard étudiant — coquille partagée (cf. DashboardShell).
import { Briefcase, FileText, MessageSquare, UserRound } from 'lucide-react'

import { DashboardShell, type NavItem } from '@/components/shared/DashboardShell'

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/etudiant/profil', label: 'Profil', icon: UserRound },
  { href: '/etudiant/offres', label: 'Offres', icon: Briefcase },
  { href: '/etudiant/candidatures', label: 'Candidatures', icon: FileText },
  { href: '/etudiant/messages', label: 'Messages', icon: MessageSquare },
]

export default function StudentDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      roleLabel="Espace étudiant"
      homeHref="/etudiant/profil"
    >
      {children}
    </DashboardShell>
  )
}
