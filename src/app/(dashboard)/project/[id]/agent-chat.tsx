'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Sparkles, Send, Loader2, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

interface Props {
  projectId: string
}

const SUGGESTED_PROMPTS = [
  '¿Cuántas tareas hay en progreso?',
  'Crea una tarea de revisión de código',
  'Resume el estado del proyecto',
  '¿Qué tareas tienen prioridad urgente?',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#09090B]">
        <Sparkles className="h-3 w-3 text-white" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#F4F4F5] px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A1A1AA] [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A1A1AA] [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#A1A1AA] [animation-delay:300ms]" />
      </div>
    </div>
  )
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('')
}

export function AgentChat({ projectId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent',
      body: { projectId },
    }),
    onFinish: () => router.refresh(),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  function submit() {
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function handleSuggestedPrompt(prompt: string) {
    sendMessage({ text: prompt })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir asistente AI"
        className="fixed bottom-6 right-6 z-50 flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#09090B] text-white shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl"
      >
        <Sparkles className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent showCloseButton={false} className="flex w-[420px] flex-col gap-0 bg-white p-0 sm:w-[480px]">

          {/* Header */}
          <SheetHeader className="shrink-0 border-b border-[#E4E4E7] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#09090B]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-sm font-semibold text-[#09090B]">
                    FlowMind AI
                  </SheetTitle>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <SheetDescription className="text-[11px] text-[#71717A]">
                      Listo para ayudarte
                    </SheetDescription>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[#A1A1AA] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B]"
                aria-label="Cerrar chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-6 pt-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F4F5]">
                    <Sparkles className="h-6 w-6 text-[#09090B]" />
                  </div>
                  <p className="text-sm font-medium text-[#09090B]">¿En qué te ayudo?</p>
                  <p className="text-xs text-[#71717A] max-w-[260px] leading-relaxed">
                    Puedo consultar, crear, editar y eliminar tareas de este proyecto.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="cursor-pointer rounded-xl border border-[#E4E4E7] bg-white px-4 py-2.5 text-left text-xs text-[#3F3F46] transition-colors hover:border-[#09090B] hover:bg-[#F4F4F5]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((m) => {
              const text = getTextContent(m)
              if (!text) return null
              const isUser = m.role === 'user'
              return (
                <div key={m.id} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isUser && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#09090B]">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'rounded-br-sm bg-[#09090B] text-white'
                        : 'rounded-bl-sm bg-[#F4F4F5] text-[#09090B]'
                    }`}
                  >
                    {text}
                  </div>
                </div>
              )
            })}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-[#E4E4E7] px-4 py-3">
            <div className="flex items-end gap-2 rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-[#09090B] placeholder:text-[#A1A1AA] disabled:opacity-50 outline-none focus:outline-none focus-visible:outline-none"
                style={{ height: '24px', outline: 'none' }}
              />
              <button
                onClick={submit}
                disabled={isLoading || !input.trim()}
                aria-label="Enviar mensaje"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#09090B] text-white transition-all hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Send className="h-3.5 w-3.5" />
                }
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-[#A1A1AA]">
              Enter para enviar · Shift+Enter para nueva línea
            </p>
          </div>

        </SheetContent>
      </Sheet>
    </>
  )
}
