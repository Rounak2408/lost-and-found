'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Export a flag so other modules can enforce configuration
export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey)

// Provide a safe fallback during builds when env vars are missing
function createMockClient() {
  const notConfigured = async (..._args: any[]) => ({ data: null, error: { message: 'Supabase not configured' } })
  return {
    auth: {
      signUp: notConfigured,
      signInWithPassword: notConfigured,
      getUser: notConfigured,
    },
    from: () => ({
      select: notConfigured,
      insert: notConfigured,
      update: notConfigured,
      delete: notConfigured,
      upsert: notConfigured,
      eq: () => ({ select: notConfigured }),
    }),
  } as any
}

if (!SUPABASE_CONFIGURED) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase configuration missing. Using mock client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in project env (e.g., Vercel) to enable real database.'
  )
}

export const supabase = SUPABASE_CONFIGURED
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()


