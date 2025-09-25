'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Users } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function HelpCommunityStatus() {
  const { toast } = useToast?.() || { toast: (args: any) => console.log('toast', args) }
  const [itemsFound, setItemsFound] = useState<number | ''>('')
  const [itemsNotFound, setItemsNotFound] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    setIsSubmitting(true)
    try {
      // This is purely client-side for now. Hook into DB if needed later.
      toast({
        title: 'Status updated',
        description: `Thanks for helping the community! Found: ${itemsFound || 0}, Not found: ${itemsNotFound || 0}`,
      })
      setItemsFound('')
      setItemsNotFound('')
      setNotes('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Box with + and Help Community */}
      <Card className="mb-4 border-2 border-accent/40">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Help Community
          </CardTitle>
          <Badge variant="outline" className="ml-auto">Share your contribution</Badge>
        </CardHeader>
      </Card>

      {/* Rounded Form */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm mb-1 block">Items Found</label>
            <Input
              type="number"
              min={0}
              value={itemsFound}
              onChange={(e) => setItemsFound(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g., 2"
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Items Not Found</label>
            <Input
              type="number"
              min={0}
              value={itemsNotFound}
              onChange={(e) => setItemsNotFound(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g., 1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm mb-1 block">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any helpful details about your efforts…"
              rows={3}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Update Status'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


