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
  useEffect(() => {
    async function restoreSession() {
      const token = getToken()
      if (!token) return
      const res = await api.get<User>('/auth/me')
      if (res.success) setUser(res.data)
      else removeToken() // token expiré ou invalide
    }
    restoreSession()
      .catch(() => removeToken())
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
