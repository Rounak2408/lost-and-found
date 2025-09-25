'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles } from 'lucide-react'

export default function FeedbackBox() {
  const { toast } = useToast?.() || { toast: (args: any) => console.log('toast', args) }
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<'Emily' | 'Performance' | 'Design' | 'Other' | ''>('')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      toast({ title: 'Thanks for your feedback!', description: 'We appreciate your input.' })
      setName('')
      setEmail('')
      setTopic('')
      setRating(0)
      setMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-2 border-purple-200/50">
      <CardHeader className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <CardTitle className="text-purple-700 dark:text-purple-300">Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Your name (e.g., Emily)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Topic:</span>
          {(['Emily', 'Performance', 'Design', 'Other'] as const).map((t) => (
            <Badge
              key={t}
              variant={topic === t ? 'default' : 'outline'}
              className={topic === t ? 'bg-purple-600 text-white' : ''}
              onClick={() => setTopic(t)}
              style={{ cursor: 'pointer' }}
            >
              {t}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rating:</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              className="p-1"
              aria-label={`Rate ${i + 1} star`}
            >
              <Star className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
            </button>
          ))}
        </div>
        <Textarea rows={4} placeholder="Tell us what you loved or what we could improve…" value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white">
            {isSubmitting ? 'Sending…' : 'Send Feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


