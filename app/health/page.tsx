'use client'

import { useEffect, useState } from 'react'
import { supabase, SUPABASE_CONFIGURED } from '@/lib/supabase/client'

type CheckResult = {
  name: string
  ok: boolean
  message: string
}

export default function HealthPage() {
  const [checks, setChecks] = useState<CheckResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runChecks = async () => {
      const results: CheckResult[] = []

      // Env check
      results.push({
        name: 'Environment variables',
        ok: SUPABASE_CONFIGURED,
        message: SUPABASE_CONFIGURED
          ? 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set'
          : 'Missing Supabase env vars. Add them to .env.local and restart the dev server.'
      })

      if (!SUPABASE_CONFIGURED) {
        setChecks(results)
        setLoading(false)
        return
      }

      // Connectivity check: simple select from finds
      try {
        const { error } = await supabase.from('finds').select('id').limit(1)
        results.push({
          name: 'Query: finds table',
          ok: !error,
          message: !error ? 'OK' : `Error: ${error.message}`
        })
      } catch (e: any) {
        results.push({ name: 'Query: finds table', ok: false, message: e?.message || 'Unknown error' })
      }

      // Connectivity check: simple select from losses
      try {
        const { error } = await supabase.from('losses').select('id').limit(1)
        results.push({
          name: 'Query: losses table',
          ok: !error,
          message: !error ? 'OK' : `Error: ${error.message}`
        })
      } catch (e: any) {
        results.push({ name: 'Query: losses table', ok: false, message: e?.message || 'Unknown error' })
      }

      setChecks(results)
      setLoading(false)
    }

    runChecks()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Supabase Health Check</h1>
        {loading ? (
          <p className="text-muted-foreground">Running checks...</p>
        ) : (
          <div className="space-y-3">
            {checks.map((c) => (
              <div
                key={c.name}
                className={`flex items-start justify-between rounded-md border p-3 ${
                  c.ok ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.message}</div>
                </div>
                <div className={`text-sm font-semibold ${c.ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {c.ok ? 'OK' : 'FAILED'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}







