'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, HelpCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type Quiz = {
  question: string
  options: string[]
  answerIndex: number
}

export default function QuizBox() {
  const { toast } = useToast?.() || { toast: (args: any) => console.log('toast', args) }
  const quizzes: Quiz[] = useMemo(() => [
    {
      question: 'What helps most to match lost and found items?',
      options: ['Clear photos', 'Random guess', 'Ignoring details', 'No contact info'],
      answerIndex: 0,
    },
    {
      question: 'Best time to report a found item?',
      options: ['A week later', 'Immediately', 'Never', 'Only if asked'],
      answerIndex: 1,
    },
    {
      question: 'What should you avoid sharing publicly?',
      options: ['Sensitive info', 'Item category', 'General location', 'Date found'],
      answerIndex: 0,
    },
    // Silly/fun round
    {
      question: 'If a wallet could talk, what would it say?',
      options: ['I feel empty', 'I love receipts', 'Feed me coins', 'Call me maybe'],
      answerIndex: 0,
    },
    {
      question: 'Best superhero to find keys?',
      options: ['Spider-Man', 'Key-ra', 'Captain Obvious', 'Doctor Strange-r'],
      answerIndex: 1,
    },
    {
      question: 'Ideal snack while searching?',
      options: ['Nacho problem', 'Cookie crumbs (trackable)', 'Invisible chips', 'Air fries'],
      answerIndex: 0,
    },
  ], [])

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const q = quizzes[index]

  const submit = () => {
    if (selected === null) return
    const correct = selected === q.answerIndex
    setScore((s) => s + (correct ? 1 : 0))
    toast({ title: correct ? '✅ Correct!' : '❌ Not quite', description: correct ? 'Great job!' : 'You can try the next one!' })
    setSelected(null)
    const nextIndex = (index + 1) % quizzes.length
    setIndex(nextIndex)
    // If we completed a full round and all were correct, dispatch celebration
    if (nextIndex === 0 && score + (correct ? 1 : 0) >= quizzes.length) {
      window.dispatchEvent(new CustomEvent('quiz-perfect', { detail: { score: score + 1 } }))
    }
  }

  return (
    <Card className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-2 border-emerald-200/50">
      <CardHeader className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-600" />
        <CardTitle className="text-emerald-700 dark:text-emerald-300">Quick Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">Score: {score}</Badge>
          <Badge variant="outline" className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {index + 1}/{quizzes.length}</Badge>
        </div>
        <div className="font-medium">{q.question}</div>
        <div className="grid grid-cols-1 gap-2">
          {q.options.map((opt, i) => (
            <Button
              key={i}
              variant={selected === i ? 'default' : 'outline'}
              className={selected === i ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              onClick={() => setSelected(i)}
            >
              {opt}
            </Button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={selected === null} className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit</Button>
        </div>
      </CardContent>
    </Card>
  )
}


