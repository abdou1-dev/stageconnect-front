'use client'

// Layout du dashboard étudiant — sidebar éditoriale bleu sombre (desktop),
// Sheet latérale (mobile). Item actif : filet orange vertical + fond éclairci.
import {
  Briefcase,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { href: '/etudiant/profil', label: 'Profil', icon: UserRound },
  { href: '/etudiant/offres', label: 'Offres', icon: Briefcase },
  { href: '/etudiant/candidatures', label: 'Candidatures', icon: FileText },
  { href: '/etudiant/messages', label: 'Messages', icon: MessageSquare },
] as const

export default function StudentDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-primary text-primary-foreground lg:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header mobile */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-primary/10 bg-background/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <Link
            href="/etudiant/profil"
            className="whitespace-nowrap font-heading text-base font-extrabold tracking-tight text-primary"
          >
            Stage<span className="text-accent">—</span>Connect
          </Link>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            {/* Base UI : prop render (l'API asChild de Radix n'existe plus) */}
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Ouvrir le menu de navigation"
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              }
            />
            <SheetContent
              side="left"
              className="w-72 border-0 bg-primary p-0 text-primary-foreground"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarContent onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  )
}

/* Contenu partagé sidebar desktop / Sheet mobile */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  function handleLogout() {
    logout()
    toast.success('Vous êtes déconnecté. À bientôt !')
    router.push('/login')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo + kicker */}
      <div className="px-6 pb-6 pt-7">
        <Link
          href="/"
          className="whitespace-nowrap font-heading text-lg font-extrabold tracking-tight"
          onClick={onNavigate}
        >
          Stage<span className="text-accent">—</span>Connect
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-primary-foreground/50">
          Espace étudiant
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3" aria-label="Navigation du dashboard">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-foreground/10 text-primary-foreground'
                  : 'text-primary-foreground/65 hover:bg-primary-foreground/5 hover:text-primary-foreground'
              }`}
            >
              {/* Filet orange — marqueur éditorial de l'item actif */}
              {isActive && (
                <span
                  className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-accent"
                  aria-hidden
                />
              )}
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bloc utilisateur + déconnexion */}
      <div className="border-t border-primary-foreground/10 p-4">
        {isLoading ? (
          <div className="h-10 animate-pulse rounded-md bg-primary-foreground/10" />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-primary-foreground/20">
              <AvatarFallback className="bg-primary-blue text-xs font-bold text-white">
                {(user?.email ?? '?').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.email ?? '—'}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50">
                Étudiant
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Se déconnecter"
              className="shrink-0 text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-accent"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
