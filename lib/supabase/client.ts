'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Export a flag so other modules can enforce configuration
export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey)

if (!SUPABASE_CONFIGURED) {
  // eslint-disable-next-line no-console
  console.error(
    'Supabase configuration missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')


