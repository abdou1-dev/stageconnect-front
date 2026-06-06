'use client'

// Messagerie deux panneaux — liste des conversations + fenêtre de chat.
// Partagée entre l'espace étudiant et l'espace entreprise.
// Polling 30 s (conversations + fil ouvert) ; GET du fil marque les messages lus.
import { ArrowLeft, Inbox, Loader2, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { formatRelativeDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import type { ChatMessage, Conversation, MessageParticipant } from '@/types'

const POLL_INTERVAL_MS = 30_000
const MAX_LENGTH = 2000

/* Nom affichable d'un participant, selon son rôle */
function participantName(p?: MessageParticipant | null): string {
  if (!p) return 'Utilisateur'
  if (p.student) return `${p.student.firstName} ${p.student.lastName}`
  if (p.company) return p.company.name
  return 'Administration'
}

function participantAvatar(p?: MessageParticipant | null): string | null {
  return p?.student?.photoUrl ?? p?.company?.logoUrl ?? null
}

/* L'interlocuteur = celui des deux participants qui n'est pas moi */
function otherParticipant(conv: Conversation, myId: string): MessageParticipant | null {
  const { lastMessage } = conv
  if (!lastMessage) return null
  return lastMessage.sender?.id === myId
    ? (lastMessage.receiver ?? null)
    : (lastMessage.sender ?? null)
}

export function Messaging() {
  const { user } = useAuth()
  const myId = user?.id

  const [pollTick, setPollTick] = useState(0)
  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ convId: string; list: ChatMessage[] } | null>(null)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Polling : re-déclenche les deux fetchs toutes les 30 s
  useEffect(() => {
    const timer = setInterval(() => setPollTick((t) => t + 1), POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  // Conversations
  useEffect(() => {
    let cancelled = false
    api
      .get<Conversation[]>('/messages/conversations')
      .then((res) => {
        if (!cancelled && res.success) setConversations(res.data)
      })
      .catch(() => {
        // silencieux sur le polling — un toast toutes les 30 s serait insupportable
      })
    return () => {
      cancelled = true
    }
  }, [pollTick])

  // Fil de la conversation sélectionnée
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    api
      .get<{ messages: ChatMessage[] }>(`/messages/${selectedId}?limit=100`)
      .then((res) => {
        if (!cancelled && res.success) {
          setMessages({ convId: selectedId, list: res.data.messages })
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger la conversation.')
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, pollTick])

  // Auto-scroll en bas du fil à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  async function handleSend() {
    const content = input.trim()
    if (!content || !selectedId || !myId) return
    const receiverId = selectedId.split('_').find((id) => id !== myId)
    if (!receiverId) return

    setIsSending(true)
    try {
      const res = await api.post<ChatMessage>('/messages', { receiverId, content })
      if (!res.success) {
        toast.error(res.error)
        return
      }
      setInput('')
      setMessages((prev) =>
        prev && prev.convId === selectedId
          ? { ...prev, list: [...prev.list, res.data] }
          : prev
      )
      setPollTick((t) => t + 1) // rafraîchit la liste (dernier message)
    } catch {
      toast.error('Envoi impossible. Vérifiez votre connexion.')
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Entrée = envoyer · Maj+Entrée = saut de ligne
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const selectedConv = conversations?.find((c) => c.conversationId === selectedId)
  const threadLoading = selectedId !== null && messages?.convId !== selectedId

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-lg border border-primary/10 bg-card">
      {/* ——— Liste des conversations ——— */}
      <aside
        className={`w-full shrink-0 flex-col border-r border-primary/10 sm:flex sm:w-80 ${
          selectedId ? 'hidden' : 'flex'
        }`}
      >
        <div className="border-b border-primary/10 px-4 py-3">
          <h2 className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-6 bg-accent" aria-hidden />
            Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations === null ? (
            <ConversationsSkeleton />
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/50" aria-hidden />
              <p className="text-sm text-muted-foreground">
                Aucune conversation. Elles démarrent depuis une offre ou une
                candidature.
              </p>
            </div>
          ) : (
            <ul>
              {conversations.map((conv) => {
                const other = otherParticipant(conv, myId ?? '')
                const isActive = conv.conversationId === selectedId
                return (
                  <li key={conv.conversationId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(conv.conversationId)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative flex w-full items-center gap-3 border-b border-primary/5 px-4 py-3.5 text-left transition-colors hover:bg-primary/5 ${
                        isActive ? 'bg-primary/5' : ''
                      }`}
                    >
                      {isActive && (
                        <span
                          className="absolute inset-y-2 left-0 w-1 rounded-full bg-accent"
                          aria-hidden
                        />
                      )}
                      <Avatar className="h-10 w-10 shrink-0 border border-primary/10">
                        {participantAvatar(other) && (
                          <AvatarImage src={participantAvatar(other)!} alt="" />
                        )}
                        <AvatarFallback className="bg-primary-blue text-xs font-bold text-white">
                          {participantName(other).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-primary">
                            {participantName(other)}
                          </p>
                          {conv.lastMessage && (
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {formatRelativeDate(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p
                          className={`truncate text-xs ${
                            conv.unread > 0
                              ? 'font-semibold text-primary'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {conv.lastMessage?.content ?? '—'}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <Badge
                          aria-label={`${conv.unread} message(s) non lu(s)`}
                          className="shrink-0 border-0 bg-accent px-1.5 text-[10px] font-bold tabular-nums text-accent-foreground"
                        >
                          {conv.unread}
                        </Badge>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ——— Fenêtre de chat ——— */}
      <section
        className={`min-w-0 flex-1 flex-col sm:flex ${selectedId ? 'flex' : 'hidden'}`}
        aria-label="Fenêtre de conversation"
      >
        {!selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <Send className="h-9 w-9 text-muted-foreground/40" aria-hidden />
            <p className="font-heading text-base font-bold text-primary">
              Sélectionnez une conversation
            </p>
          </div>
        ) : (
          <>
            {/* En-tête du fil */}
            <div className="flex items-center gap-3 border-b border-primary/10 px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedId(null)}
                aria-label="Retour aux conversations"
                className="sm:hidden"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Button>
              <p className="font-heading text-sm font-bold text-primary">
                {selectedConv
                  ? participantName(otherParticipant(selectedConv, myId ?? ''))
                  : 'Conversation'}
              </p>
            </div>

            {/* Fil */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {threadLoading ? (
                <ThreadSkeleton />
              ) : (
                messages?.list.map((msg) => {
                  const isMine = msg.senderId === myId
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3.5 py-2 text-sm leading-relaxed ${
                          isMine
                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                            : 'rounded-bl-sm border border-primary/10 bg-background text-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-line break-words">{msg.content}</p>
                        <p
                          className={`mt-1 text-right text-[10px] ${
                            isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                          }`}
                        >
                          {formatRelativeDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} aria-hidden />
            </div>

            {/* Saisie */}
            <div className="border-t border-primary/10 p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message… (Entrée pour envoyer)"
                  rows={2}
                  maxLength={MAX_LENGTH}
                  aria-label="Votre message"
                  className="min-h-0 resize-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={isSending || input.trim().length === 0}
                  aria-label="Envoyer le message"
                  className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                </Button>
              </div>
              <p className="mt-1 text-right text-[10px] tabular-nums text-muted-foreground">
                {input.length}/{MAX_LENGTH}
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function ConversationsSkeleton() {
  return (
    <div className="space-y-1 p-2" aria-busy>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ThreadSkeleton() {
  return (
    <div className="space-y-3" aria-busy>
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="ml-auto h-12 w-1/2" />
      <Skeleton className="h-12 w-3/5" />
    </div>
  )
}
