'use client'

import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SupportWidget from '@/components/support-widget'
import ChatbotWidget from '@/components/chatbot-widget'
import { useI18n } from '@/components/i18n-provider'

export default function CommunityHelpPage() {
  const { t } = useI18n()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([
    'Welcome to the community help channel! Be kind and verify once matched.',
  ])

  const send = () => {
    if (!message.trim()) return
    setMessages((prev) => [...prev, message.trim()])
    setMessage('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-6 w-6 text-accent" />
        <h1 className="text-2xl font-bold">{t('community.title')}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Live Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4 h-72 overflow-y-auto border rounded p-3 bg-muted/30">
              {messages.map((m, i) => (
                <div key={i} className="text-sm">
                  {m}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message" />
              <Button onClick={send}>
                <Send className="h-4 w-4 mr-1" /> Send
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Help</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask questions, share found item tips, or coordinate safely with community.
              </p>
            </CardContent>
          </Card>
          <ChatbotWidget />
        </div>
      </div>

      <SupportWidget />
    </div>
  )
}


