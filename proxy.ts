// proxy.ts — Protection des routes (Next.js 16, ex-middleware).
//  • pas de token valide → routes du dashboard interdites (redirige /login)
//  • token valide → /login et /register interdits (redirige vers son espace)
//  • mauvais rôle → renvoyé vers son propre espace
// L'autorisation réelle reste côté API (Bearer) ; ici c'est de l'UX/garde-fou.
//
// Perf : aucune I/O, aucun appel réseau — on lit juste le cookie et on décode
// le payload JWT en mémoire. Le matcher exclut api, assets _next et fichiers
// statiques (images comprises), donc le proxy ne tourne JAMAIS sur une image.

import { NextResponse, type NextRequest } from 'next/server'
import type { Role } from '@/types'

const TOKEN_KEY = 'sc_token'

const HOME_BY_ROLE: Record<Role, string> = {
  STUDENT: '/etudiant/profil',
  COMPANY: '/entreprise/profil',
  ADMIN: '/admin',
}

const SECTION_BY_ROLE: Record<Role, string> = {
  STUDENT: '/etudiant',
  COMPANY: '/entreprise',
  ADMIN: '/admin',
}

const PROTECTED_PREFIXES = ['/etudiant', '/entreprise', '/admin']
const AUTH_PAGES = ['/login', '/register']

interface JwtPayload {
  role?: Role
  exp?: number
}

// Décode le payload d'un JWT sans vérifier la signature (lecture seule, routage).
// Renvoie null si le token est illisible OU expiré.
function readToken(token: string | undefined): JwtPayload | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const payload = JSON.parse(atob(padded)) as JwtPayload
    // exp en secondes : un token expiré est traité comme absent (évite le blocage sur /login)
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const payload = readToken(request.cookies.get(TOKEN_KEY)?.value)
  const isLoggedIn = payload !== null

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  const isAuthPage = AUTH_PAGES.includes(pathname)

  // 1. Route protégée sans session valide → login (avec retour après connexion)
  if (isProtected && !isLoggedIn) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Déjà connecté sur /login ou /register → son espace
  if (isAuthPage && isLoggedIn) {
    const home = payload.role ? HOME_BY_ROLE[payload.role] : '/'
    return NextResponse.redirect(new URL(home, request.url))
  }

  // 3. Connecté mais dans la section d'un autre rôle → renvoyé chez lui
  if (isProtected && isLoggedIn && payload.role) {
    const section = SECTION_BY_ROLE[payload.role]
    const inOwnSection = pathname === section || pathname.startsWith(`${section}/`)
    if (!inOwnSection) {
      return NextResponse.redirect(new URL(HOME_BY_ROLE[payload.role], request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Exclut api, assets Next et tout fichier avec extension (images, svg, ico…)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
