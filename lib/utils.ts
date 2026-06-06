import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// "2026-06-01T..." → "il y a 5 jours" (français, via Intl natif)
export function formatRelativeDate(isoDate: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now()
  const diffDays = Math.round(diffMs / 86_400_000)
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" })
  if (diffDays > -30) return rtf.format(diffDays, "day")
  if (diffDays > -365) return rtf.format(Math.round(diffDays / 30), "month")
  return rtf.format(Math.round(diffDays / 365), "year")
}
