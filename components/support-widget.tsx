'use client'

import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

const faqs = [
  { q: 'How do Smart Matches work?', a: 'We score by keywords, category, location proximity, and date closeness, and then notify you for high matches.' },
  { q: 'What should I do when I find an item?', a: 'Create a Found report with clear photos and location/date, keep it safe, and verify claimants with proof.' },
  { q: 'Is my contact info public?', a: 'No. Use in-app messaging until you want to share details.' },
]

export default function SupportWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white p-3 shadow-lg"
          aria-label="Open Help"
          title="Help & Support"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 left-6 w-80 max-w-[90vw] bg-card border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
            <div className="font-semibold">Help & Community Support</div>
            <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-3 space-y-3 text-sm">
            {faqs.map((f, i) => (
              <div key={i}>
                <div className="font-medium">Q: {f.q}</div>
                <div className="text-muted-foreground">A: {f.a}</div>
              </div>
            ))}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Need more help? Email support or ask in the community channel.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


