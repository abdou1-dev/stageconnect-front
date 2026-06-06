'use client'

// Avatar cliquable avec upload Cloudinary — preview immédiate
// (URL.createObjectURL), spinner pendant l'upload, validation type/taille.
// Le parent persiste l'URL (PUT API) via onUploaded.
import { Camera, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MAX_IMAGE_SIZE_MB,
  uploadToCloudinary,
  validateImageFile,
} from '@/lib/cloudinary'

interface AvatarUploadProps {
  currentUrl?: string | null
  fallbackText: string
  /** Persiste l'URL côté API — toute erreur levée annule la preview */
  onUploaded: (url: string) => Promise<void>
  shape?: 'circle' | 'square'
  ariaLabel: string
}

export function AvatarUpload({
  currentUrl,
  fallbackText,
  onUploaded,
  shape = 'circle',
  ariaLabel,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-lg'
  const displayedUrl = previewUrl ?? currentUrl

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permet de re-sélectionner le même fichier
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    // Preview immédiate pendant l'upload
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setIsUploading(true)

    try {
      const url = await uploadToCloudinary(file)
      await onUploaded(url) // le parent fait le PUT — peut throw
      setPreviewUrl(null) // l'URL persistée prend le relais
    } catch (err) {
      setPreviewUrl(null) // on revient à l'image précédente
      toast.error(
        err instanceof Error ? err.message : 'Upload impossible. Réessayez.'
      )
    } finally {
      URL.revokeObjectURL(localUrl)
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      <Avatar className={`h-20 w-20 border-2 border-accent ${radius}`}>
        {displayedUrl && <AvatarImage src={displayedUrl} alt="" />}
        <AvatarFallback
          className={`bg-primary-blue font-heading text-xl font-bold text-white ${radius}`}
        >
          {fallbackText}
        </AvatarFallback>
      </Avatar>

      {/* Bouton caméra — recouvre l'avatar, accessible clavier */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label={ariaLabel}
        className={`absolute inset-0 flex items-center justify-center bg-primary/0 text-transparent transition-all hover:bg-primary/50 hover:text-white focus-visible:bg-primary/50 focus-visible:text-white ${radius} ${
          isUploading ? 'bg-primary/60 text-white' : ''
        }`}
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        ) : (
          <Camera className="h-6 w-6" aria-hidden />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
      <p className="sr-only">
        Formats acceptés : JPG, PNG, WebP — {MAX_IMAGE_SIZE_MB} Mo maximum
      </p>
    </div>
  )
}
