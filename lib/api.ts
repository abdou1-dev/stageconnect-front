// Client HTTP centralisé — TOUS les appels API passent par ce module.
// baseURL depuis NEXT_PUBLIC_API_URL, token Bearer injecté automatiquement.

import { getToken } from '@/lib/auth'
import type { ApiResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
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

  post: <T = unknown>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),

  put: <T = unknown>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T = unknown>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
}
