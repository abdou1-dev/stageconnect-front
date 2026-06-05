// Helpers JWT — stockage en cookie lisible côté client.
// Règle CLAUDE.md : jamais de localStorage. Le cookie survit au refresh,
// SameSite=Lax limite le CSRF, Secure activé en production (HTTPS).

const TOKEN_KEY = 'sc_token'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 jours

export function getToken(): string | null {
  // Garde SSR : document n'existe pas côté serveur
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setToken(token: string): void {
  if (typeof document === 'undefined') return
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`
}

export function removeToken(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0`
}
