'use client'

// Layout du dashboard admin — sidebar sobre avec ancres vers les sections
// de la page unique (Stats / Utilisateurs / Offres) + badge ADMIN.
import { BarChart3, LogOut, Menu, Newspaper, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { ChangePasswordDialog } from '@/components/shared/ChangePasswordDialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'

const SECTIONS = [
  { href: '/admin#stats', label: 'Stats', icon: BarChart3 },
  { href: '/admin#utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/admin#offres', label: 'Offres', icon: Newspaper },
] as const

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-primary text-primary-foreground lg:flex">
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-primary/10 bg-background/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <Link
            href="/admin"
            className="whitespace-nowrap font-heading text-base font-extrabold tracking-tight text-primary"
          >
            Stage<span className="text-accent">—</span>Connect
          </Link>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
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
              <AdminSidebar onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  )
}

function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  function handleLogout() {
    logout()
    toast.success('Vous êtes déconnecté.')
    router.push('/login')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-6 pt-7">
        <Link
          href="/"
          className="whitespace-nowrap font-heading text-lg font-extrabold tracking-tight"
          onClick={onNavigate}
        >
          Stage<span className="text-accent">—</span>Connect
        </Link>
        <Badge className="mt-2 border-0 bg-accent font-bold tracking-[0.15em] text-accent-foreground">
          ADMIN
        </Badge>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Sections du dashboard">
        {SECTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/65 transition-colors hover:bg-primary-foreground/5 hover:text-primary-foreground"
          >
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-primary-foreground/10 p-4">
        {isLoading ? (
          <div className="h-10 animate-pulse rounded-md bg-primary-foreground/10" />
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-primary-foreground/20">
              <AvatarFallback className="bg-accent text-xs font-bold text-accent-foreground">
                {(user?.email ?? '?').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.email ?? '—'}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50">
                Administrateur
              </p>
            </div>
            <ChangePasswordDialog buttonClassName="shrink-0 text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-accent" />
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
