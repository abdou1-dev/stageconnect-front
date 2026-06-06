// Tous les types TypeScript partagés du projet.
// Règle CLAUDE.md : ne pas créer de fichiers de types en dehors de celui-ci.

export type Role = 'STUDENT' | 'COMPANY' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED'
export type JobType = 'STAGE' | 'ALTERNANCE' | 'CDI' | 'CDD' | 'FREELANCE'
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW'

// Format de réponse standard du backend Express (décision du 05/06/2026) :
// succès → { success: true, data, message } · erreur → { success: false, error, code }
// Union discriminée : après `if (!res.success)`, TS sait que res.error existe.
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  message: string
}

export interface ApiError {
  success: false
  error: string
  code: number
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

export interface User {
  id: string
  email: string
  role: Role
}

// Réponse de GET /auth/me — l'utilisateur avec son profil selon le rôle
export interface UserWithProfiles extends User {
  student?: Student
  company?: Company
}

// Ligne utilisateur du dashboard admin (GET /admin/users)
export interface AdminUser {
  id: string
  email: string
  role: Role
  status: UserStatus
  createdAt: string
  student?: { firstName: string; lastName: string } | null
  company?: { name: string } | null
}

export interface Student {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone?: string
  ville?: string
  bio?: string
  skills: string[]
  photoUrl?: string
  cvUrl?: string
  formations?: unknown
  experiences?: unknown
}

export interface Company {
  id: string
  userId: string
  name: string
  secteur?: string
  ville?: string
  description?: string
  logoUrl?: string
  website?: string
}

export interface Job {
  id: string
  companyId: string
  title: string
  description: string
  type: JobType
  ville?: string
  secteur?: string
  duration?: string
  salary?: string
  isActive: boolean
  createdAt: string
  company?: Company
}

export interface Application {
  id: string
  studentId: string
  jobId: string
  status: ApplicationStatus
  coverLetter?: string
  createdAt: string
  student?: Student
  job?: Job
}
