'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface SignupData {
  email: string
  password: string
  name: string
  phone: string
}

interface SignupResult {
  success: boolean
  error: string | null
  user: any | null
}

export function useSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signup = async (data: SignupData): Promise<SignupResult> => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Step 2: Immediately insert profile data using the new user's UID as the id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id, // Use the auth user's UID as the primary key
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim()
        })

      if (profileError) {
        console.error('Profile creation failed:', profileError)
        
        // Handle specific profile creation errors
        if (profileError.code === '23505') {
          throw new Error('Profile already exists for this user')
        } else if (profileError.code === '23503') {
          throw new Error('Invalid user reference')
        } else {
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }
      }

      return {
        success: true,
        error: null,
        user: authData.user
      }

    } catch (err: any) {
      console.error('Signup error:', err)
      
      let errorMessage = 'An error occurred during signup'
      
      if (err.message) {
        errorMessage = err.message
      } else if (err.error_description) {
        errorMessage = err.error_description
      }

      // Handle specific Supabase auth errors
      if (err.code === '23505') {
        errorMessage = 'An account with this email already exists'
      } else if (err.code === 'invalid_email') {
        errorMessage = 'Please enter a valid email address'
      } else if (err.code === 'weak_password') {
        errorMessage = 'Password is too weak. Please choose a stronger password'
      } else if (err.code === 'email_not_confirmed') {
        errorMessage = 'Please check your email and confirm your account'
      } else if (err.code === 'user_already_registered') {
        errorMessage = 'An account with this email already exists'
      } else if (err.message?.includes('duplicate key')) {
        errorMessage = 'An account with this email already exists'
      } else if (err.message?.includes('Profile already exists')) {
        errorMessage = 'Account created but profile setup failed. Please contact support.'
      }

      setError(errorMessage)
      
      return {
        success: false,
        error: errorMessage,
        user: null
      }
    } finally {
      setLoading(false)
    }
  }

  return { signup, loading, error }
}
