'use client'

import { supabase } from '@/lib/supabase/client'

type LoginResult = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
}

export async function loginDirect(email: string, password: string) {
  const { data, error } = await supabase
    .rpc('verify_user_login', { p_email: email.trim().toLowerCase(), p_password: password })

  if (error) throw new Error(error.message || 'Login failed')

  const user = (Array.isArray(data) ? data[0] : data) as LoginResult | null
  if (!user) throw new Error('Invalid email or password')

  try {
    localStorage.setItem('app_user', JSON.stringify(user))
  } catch {}

  return user
}


