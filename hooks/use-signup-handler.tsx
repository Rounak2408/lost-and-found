'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface SignupData {
  email: string
  password: string
  name: string
  phone: string
}

interface SignupState {
  loading: boolean
  success: boolean
  error: string | null
  step: 'idle' | 'creating_auth' | 'creating_profile' | 'complete'
}

export function useSignupHandler() {
  const [state, setState] = useState<SignupState>({
    loading: false,
    success: false,
    error: null,
    step: 'idle'
  })

  const signup = async (data: SignupData): Promise<{ success: boolean; error: string | null; user: any }> => {
    setState({
      loading: true,
      success: false,
      error: null,
      step: 'creating_auth'
    })

    try {
      // Step 1: Create Supabase Auth user
      console.log('Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account - no user returned')
      }

      console.log('Auth user created successfully:', authData.user.id)

      // Step 2: Create user profile
      setState(prev => ({ ...prev, step: 'creating_profile' }))
      
      console.log('Creating user profile...')
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id, // Use auth user's UID as primary key
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim()
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        
        // Handle specific profile errors
        if (profileError.code === '23505') {
          throw new Error('Profile already exists for this user')
        } else if (profileError.code === '23503') {
          throw new Error('Invalid user reference - auth user may not exist')
        } else if (profileError.code === '42501') {
          throw new Error('Permission denied - check RLS policies')
        } else {
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }
      }

      console.log('User profile created successfully')

      // Success!
      setState({
        loading: false,
        success: true,
        error: null,
        step: 'complete'
      })

      return {
        success: true,
        error: null,
        user: authData.user
      }

    } catch (error: any) {
      console.error('Complete signup error:', error)
      
      let errorMessage = 'An unexpected error occurred during signup'
      
      // Handle different types of errors
      if (error.message) {
        errorMessage = error.message
      } else if (error.error_description) {
        errorMessage = error.error_description
      }

      // Handle specific Supabase auth errors
      if (error.code === '23505') {
        errorMessage = 'An account with this email already exists'
      } else if (error.code === 'invalid_email') {
        errorMessage = 'Please enter a valid email address'
      } else if (error.code === 'weak_password') {
        errorMessage = 'Password is too weak. Please choose a stronger password (minimum 6 characters)'
      } else if (error.code === 'email_not_confirmed') {
        errorMessage = 'Please check your email and confirm your account before proceeding'
      } else if (error.code === 'user_already_registered') {
        errorMessage = 'An account with this email already exists'
      } else if (error.code === 'signup_disabled') {
        errorMessage = 'New user registration is currently disabled'
      } else if (error.code === 'email_address_invalid') {
        errorMessage = 'The email address format is invalid'
      } else if (error.code === 'password_too_short') {
        errorMessage = 'Password must be at least 6 characters long'
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = 'An account with this email already exists'
      } else if (error.message?.includes('Profile already exists')) {
        errorMessage = 'Account created but profile setup failed. Please contact support.'
      } else if (error.message?.includes('Invalid user reference')) {
        errorMessage = 'Account creation failed due to system error. Please try again.'
      } else if (error.message?.includes('Permission denied')) {
        errorMessage = 'Account created but profile access denied. Please contact support.'
      }

      setState({
        loading: false,
        success: false,
        error: errorMessage,
        step: 'idle'
      })

      return {
        success: false,
        error: errorMessage,
        user: null
      }
    }
  }

  return { signup, ...state }
}

// Complete React Component Example
export default function SignupForm() {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    phone: ''
  })

  const { signup, loading, success, error, step } = useSignupHandler()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      return 'All fields are required'
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters'
    }

    if (formData.name.trim().length < 2) {
      return 'Name must be at least 2 characters'
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      return
    }

    const result = await signup(formData)
    
    if (result.success) {
      // Reset form on success
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: ''
      })
    }
  }

  const getStatusMessage = () => {
    if (loading) {
      switch (step) {
        case 'creating_auth':
          return 'Creating your account...'
        case 'creating_profile':
          return 'Setting up your profile...'
        default:
          return 'Processing...'
      }
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form Fields */}
      <div className="space-y-2">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Create a password (min 6 characters)"
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={loading}
          className="w-full p-2 border rounded"
          minLength={6}
        />
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            {getStatusMessage()}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800">
          ✅ Account created successfully! Check your email to verify your account.
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  )
}