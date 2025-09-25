'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, X, Send, Trash2, Clipboard, Link as LinkIcon } from 'lucide-react'

type ChatAction = {
  label: string
  type: 'route' | 'copy' | 'link'
  value: string
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  actions?: ChatAction[]
}

function getSuggestion(userText: string): { text: string; actions?: ChatAction[] } {
  const text = userText.toLowerCase()

  // Basic intents for lost & found workflows
  if (/\b(found|picked up|got.*item)\b/.test(text)) {
    return {
      text:
        'Great job helping! Steps: 1) Open Report Found Item. 2) Add clear photos and location/date. 3) Describe unique identifiers (hide some details until verified). 4) Keep the item safe and enable notifications to get claims.',
      actions: [
        { label: 'Report Found Item', type: 'route', value: '/dashboard/find' },
        { label: 'Safety Checklist', type: 'copy', value: 
          '- Meet in public place\n- Ask for proof of ownership\n- Don\'t reveal all serials upfront\n- Use in‑app messaging first\n- Consider taking a pickup photo' }
      ],
    }
  }

  if (/(lost|missing|misplac)/.test(text)) {
    return {
      text:
        'Let\'s recover it fast: 1) Open Report Lost Item. 2) Add last-seen location/date and unique identifiers. 3) Enable notifications. 4) Watch Smart Matches and message potential finders politely with proof.',
      actions: [
        { label: 'Report Lost Item', type: 'route', value: '/dashboard/loss' },
        { label: 'Proof Tips', type: 'copy', value: 
          'Share partial serial/IMEI, photos of ownership, purchase proof, or device unlock demo during handover.' }
      ],
    }
  }

  if (/match|how.*match|auto.*match|smart match/.test(text)) {
    return {
      text:
        'Smart Matches score by keywords (name/description), category, location proximity, and date closeness. New reports are auto-checked and high scores trigger notifications. Improve your score: add exact model, color, and distinct marks.',
    }
  }

  if (/contact|owner|claim|verify/.test(text)) {
    return {
      text:
        'Verification tips: ask for proof (receipt, device unlock, distinguishing marks). Use in‑app messaging first. Share only partial serials until verified. Meet in a public place and consider a pickup photo/ID if appropriate.',
    }
  }

  if (/image|photo|upload/.test(text)) {
    return { text: 'Use clear, well‑lit photos. Include unique marks. Blur or crop full serials; reveal partially (last 4) until verified.' }
  }

  if (/notification|alert/.test(text)) {
    return { text: 'Enable browser notifications and keep your email updated to get match and message alerts instantly.' }
  }

  if (/policy|rls|security|privacy/.test(text)) {
    return { text: 'We use row‑level security (RLS) to restrict updates to owners. Public listings hide contact details; use secure messaging for contact.' }
  }

  // Default helpful reply
  return {
    text:
      'I can help with lost/found steps, reports, Smart Matches, safety, and messaging. Try: "I found a phone", "I lost my wallet", or "How do matches work?"',
  }
}

export default function ChatbotWidget() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about reporting lost or found items. I can guide you step‑by‑step.' },
  ])
  const listRef = useRef<HTMLDivElement>(null)

  // Persist conversation
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sf_chat_history')
      if (saved) setMessages(JSON.parse(saved))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('sf_chat_history', JSON.stringify(messages))
    } catch {}
  }, [messages])

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, messages])

  const handleSend = async () => {
    const value = input.trim()
    if (!value) return
    const userMsg: ChatMessage = { role: 'user', content: value }
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }])
    setInput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      if (!res.body) {
        // fallback to local suggestion
        const sug = getSuggestion(value)
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: sug.text, actions: sug.actions }
          return next
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { value: chunk, done } = await reader.read()
        if (done) break
        assistantText += decoder.decode(chunk, { stream: true })
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: assistantText }
          return next
        })
      }

      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: assistantText }
        return next
      })
    } catch {
      const sug = getSuggestion(value)
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: sug.text, actions: sug.actions }
        return next
      })
    }
  }

  const handleAction = (action: ChatAction) => {
    if (action.type === 'route') {
      router.push(action.value)
      setOpen(false)
    } else if (action.type === 'copy') {
      navigator.clipboard.writeText(action.value).catch(() => {})
    } else if (action.type === 'link') {
      window.open(action.value, '_blank', 'noopener,noreferrer')
    }
  }

  const quickPrompts = [
    'I found a phone',
    'I lost my wallet',
    'How do Smart Matches work?',
    'How to verify a claimant?',
  ]

  return (
    <div>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white p-4 shadow-lg focus:outline-none"
          aria-label="Open SmartFind assistant"
          title="Ask SmartFind Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-80 max-w-[90vw] bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
            <div className="font-semibold">SmartFind Assistant</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([{ role: 'assistant', content: 'Cleared. How can I help you now?' }])}
                className="p-1 hover:opacity-80"
                aria-label="Clear"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div ref={listRef} className="p-3 space-y-3 h-80 overflow-y-auto">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={
                    'inline-block px-3 py-2 rounded-lg text-sm ' +
                    (m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-muted text-foreground')
                  }
                >
                  {m.content}
                </div>
                {m.role === 'assistant' && m.actions && m.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.actions.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(a)}
                        className="text-xs px-2 py-1 rounded-md border hover:bg-accent"
                      >
                        {a.type === 'route' && '➡ '} 
                        {a.type === 'copy' && '📋 '} 
                        {a.type === 'link' && '🔗 '}
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Quick prompts */}
          <div className="px-2 pb-2 flex flex-wrap gap-2 border-t bg-muted/20">
            {quickPrompts.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q)
                  setTimeout(() => handleSend(), 0)
                }}
                className="text-xs px-2 py-1 rounded-full border hover:bg-accent"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-2 border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
              placeholder="Ask about lost/found..."
              className="flex-1 bg-background border rounded-md px-3 py-2 text-sm"
            />
            <button onClick={handleSend} className="p-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white" aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


