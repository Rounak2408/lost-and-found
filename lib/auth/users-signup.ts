'use client'

import { supabase } from '@/lib/supabase/client'

type SignUpInput = {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string // plain; send as password_hash so DB trigger hashes it
}

type AppUser = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  account_status?: string
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function mapPgError(error: any): string {
  const code = (error as any)?.code || ''
  const msg = (error as any)?.message || ''
  if (code === '23505' || /duplicate key value/i.test(msg)) {
    if (/users_email_key/i.test(msg) || /\bemail\b/i.test(msg)) return 'Email already in use'
    if (/users_phone_key/i.test(msg) || /\bphone\b/i.test(msg)) return 'Phone already in use'
    return 'Duplicate record'
  }
  return msg || 'Signup failed'
}

export async function signUpDirect(input: SignUpInput) {
  const payload = {
    first_name: normalizeSpace(input.first_name),
    last_name: normalizeSpace(input.last_name),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    // Map plain password to password_hash so DB trigger can hash it
    password_hash: input.password,
  }

  if (!payload.email || !input.password) throw new Error('Email and password required')
  if (input.password.length < 6) throw new Error('Password must be at least 6 characters')

  const { data, error } = await supabase
    .from('users')
    .insert([payload])
    .select('id, first_name, last_name, email, phone, created_at')
    .single()

  if (error) throw new Error(mapPgError(error))

  const session = data as AppUser
  try {
    localStorage.setItem('app_user', JSON.stringify(session))
  } catch {}

  return session
}


