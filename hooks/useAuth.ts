'use client'

// Hook d'authentification — user courant, login, logout, isLoading.
// Au montage : si un token existe, on recharge l'utilisateur via GET /auth/me.

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getToken, removeToken, setToken } from '@/lib/auth'
import type { User } from '@/types'

interface Credentials {
  email: string
  password: string
}

interface LoginResponse {
  user: User
  token: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restaure la session au chargement si un token est présent.
  // Tout passe par une fonction async : la règle react-hooks/set-state-in-effect
  // interdit les setState synchrones dans le corps d'un effet.
  // ⚠️ On ne retire le token QUE sur un rejet d'authentification explicite
  // (401/403) — une panne réseau ou un redéploiement du back ne doit pas
  // déconnecter l'utilisateur (bug constaté en prod le 06/06).
  useEffect(() => {
    async function restoreSession() {
      const token = getToken()
      if (!token) return
      const res = await api.get<User>('/auth/me')
      if (res.success) setUser(res.data)
      else if (res.code === 401 || res.code === 403) removeToken() // token expiré/invalide ou compte sanctionné
      // autre échec (5xx, timeout…) : on garde le token, l'utilisateur réessaiera
    }
    restoreSession()
      .catch(() => {
        // erreur réseau : token conservé volontairement
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async ({ email, password }: Credentials): Promise<User> => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password })
    if (!res.success) throw new Error(res.error)
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  return { user, login, logout, isLoading }
}
