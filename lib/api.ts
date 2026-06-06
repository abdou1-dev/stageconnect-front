// Client HTTP centralisé — TOUS les appels API passent par ce module.
// baseURL depuis NEXT_PUBLIC_API_URL, token Bearer injecté automatiquement.

import { getToken } from '@/lib/auth'
import type { ApiResponse } from '@/types'

// `||` (et non `??`) : couvre aussi la variable définie mais vide
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Timeout réseau : évite les requêtes qui pendent indéfiniment
const REQUEST_TIMEOUT_MS = 15_000

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Le back renvoie toujours du JSON, y compris en erreur HTTP :
  // succès → { success: true, data, message } · erreur → { success: false, error, code }
  return res.json() as Promise<ApiResponse<T>>
}

export const api = {
  get: <T = unknown>(url: string) => request<T>(url),

  // Multipart (upload de fichiers) : pas de Content-Type manuel (le navigateur
  // pose le boundary), timeout élargi pour les connexions lentes
  upload: async <T = unknown>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
    const token = getToken()
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(60_000),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return res.json() as Promise<ApiResponse<T>>
  },

  post: <T = unknown>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),

  put: <T = unknown>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T = unknown>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
}
