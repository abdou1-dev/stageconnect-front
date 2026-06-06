// Upload unsigned vers Cloudinary — aucun secret côté front :
// le cloud name et le preset unsigned sont publics par design.
// Doc : https://cloudinary.com/documentation/upload_images#unsigned_upload

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'stageconnect'

export const MAX_IMAGE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Valide le fichier avant upload — renvoie un message d'erreur ou null si OK */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Format non supporté : utilisez une image JPG, PNG ou WebP.'
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Image trop lourde : ${MAX_IMAGE_SIZE_MB} Mo maximum.`
  }
  return null
}

/** Upload le fichier et renvoie l'URL https sécurisée de l'image */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary non configuré (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME manquant)')
  }

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
    // Image jusqu'à 5 Mo sur connexion lente : timeout plus généreux que l'API
    signal: AbortSignal.timeout(60_000),
  })

  const data = (await res.json()) as {
    secure_url?: string
    error?: { message?: string }
  }
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? 'Échec de l’upload de l’image')
  }
  return data.secure_url
}
