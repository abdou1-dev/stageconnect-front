'use client'

// Layout du dashboard entreprise — coquille partagée (cf. DashboardShell).
import { Building2, FileText, MessageSquare, Newspaper } from 'lucide-react'

import { DashboardShell, type NavItem } from '@/components/shared/DashboardShell'

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/entreprise/profil', label: 'Profil', icon: Building2 },
  { href: '/entreprise/mes-offres', label: 'Mes offres', icon: Newspaper },
  { href: '/entreprise/candidatures', label: 'Candidatures', icon: FileText },
  { href: '/entreprise/messages', label: 'Messages', icon: MessageSquare },
]

export default function CompanyDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      roleLabel="Espace entreprise"
      homeHref="/entreprise/profil"
    >
      {children}
    </DashboardShell>
  )
}
