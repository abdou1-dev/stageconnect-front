'use client'

// Bouton « Contacter » — démarre une conversation : dialog de premier
// message → POST /messages → redirection vers la messagerie.
import { Loader2, MessageSquare, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'

const MAX_LENGTH = 2000

interface ContactButtonProps {
  /** userId du destinataire (User.id, pas l'id du profil) */
  receiverId: string
  /** Nom affiché dans le dialog */
  recipientName: string
  /** Page messagerie de l'espace courant (/etudiant/messages ou /entreprise/messages) */
  messagesPath: string
  size?: 'default' | 'sm'
  variant?: 'default' | 'outline'
}

export function ContactButton({
  receiverId,
  recipientName,
  messagesPath,
  size = 'sm',
  variant = 'outline',
}: ContactButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Base UI : prop render (pas asChild) */}
      <DialogTrigger
        render={
          <Button
            size={size}
            variant={variant}
            className={
              variant === 'outline'
                ? 'border-primary/20 font-semibold text-primary hover:border-primary-blue hover:text-primary-blue'
                : undefined
            }
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            Contacter
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        {/* Démonté à la fermeture → état frais à chaque ouverture */}
        <ContactForm
          receiverId={receiverId}
          recipientName={recipientName}
          messagesPath={messagesPath}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function ContactForm({
  receiverId,
  recipientName,
  messagesPath,
  onDone,
}: {
  receiverId: string
  recipientName: string
  messagesPath: string
  onDone: () => void
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const message = content.trim()
    if (!message) return

    setIsSending(true)
    try {
      const res = await api.post('/messages', { receiverId, content: message })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success(`Message envoyé à ${recipientName} !`)
      onDone()
      router.push(messagesPath)
    } catch {
      toast.error('Envoi impossible. Vérifiez votre connexion.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading text-xl font-extrabold text-primary">
          Contacter {recipientName}
        </DialogTitle>
        <DialogDescription>
          Votre message ouvrira une conversation dans la messagerie.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSend} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="contact-message">Votre message</Label>
          <Textarea
            id="contact-message"
            rows={5}
            maxLength={MAX_LENGTH}
            placeholder="Présentez-vous et expliquez l’objet de votre message…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <p className="text-right text-xs tabular-nums text-muted-foreground">
            {content.length}/{MAX_LENGTH}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            disabled={isSending}
            className="border-primary/20 text-primary"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSending || content.trim().length === 0}
            className="bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
          >
            {isSending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Envoi…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                Envoyer
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
