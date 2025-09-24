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
  step: 'auth' | 'profile' | 'complete' | 'failed'
}

export function useCompleteSignupHandler() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signup = async (data: SignupData): Promise<SignupResult> => {
    setLoading(true)
    setError(null)

    console.log('🚀 Starting signup process for:', data.email)

    try {
      // Step 1: Create Supabase Auth user
      console.log('📝 Step 1: Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      // Log auth result
      console.log('📝 Auth signup result:', {
        user: authData.user ? { id: authData.user.id, email: authData.user.email } : null,
        error: authError ? { code: authError.code, message: authError.message } : null
      })

      if (authError) {
        console.error('❌ Auth signup failed:', authError)
        throw authError
      }

      if (!authData.user) {
        const errorMsg = 'Failed to create user account - no user returned from Supabase'
        console.error('❌', errorMsg)
        throw new Error(errorMsg)
      }

      console.log('✅ Step 1 completed: Auth user created successfully')
      console.log('👤 User ID:', authData.user.id)
      console.log('📧 User Email:', authData.user.email)

      // Step 2: Create user profile
      console.log('📝 Step 2: Creating user profile...')
      const profileData = {
        id: authData.user.id, // Use auth user's UID as primary key
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim()
      }

      console.log('📝 Profile data to insert:', profileData)

      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()

      // Log profile result
      console.log('📝 Profile creation result:', {
        data: profileResult,
        error: profileError ? { code: profileError.code, message: profileError.message } : null
      })

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError)
        
        // Handle specific profile errors
        if (profileError.code === '23505') {
          throw new Error('Profile already exists for this user')
        } else if (profileError.code === '23503') {
          throw new Error('Invalid user reference - auth user may not exist')
        } else if (profileError.code === '42501') {
          throw new Error('Permission denied - check RLS policies')
        } else if (profileError.code === 'PGRST116') {
          throw new Error('user_profiles table does not exist - please create it first')
        } else {
          throw new Error(`Profile creation failed: ${profileError.message}`)
        }
      }

      console.log('✅ Step 2 completed: User profile created successfully')
      console.log('📊 Profile data:', profileResult)

      // Success!
      console.log('🎉 Complete signup process successful!')
      console.log('📋 Final result:', {
        authUser: { id: authData.user.id, email: authData.user.email },
        profile: profileResult?.[0]
      })

      return {
        success: true,
        error: null,
        user: authData.user,
        step: 'complete'
      }

    } catch (error: any) {
      console.error('💥 Complete signup process failed:', error)
      
      let errorMessage = 'An unexpected error occurred during signup'
      let step: 'auth' | 'profile' | 'failed' = 'failed'
      
      // Determine which step failed and handle errors
      if (error.message) {
        errorMessage = error.message
      } else if (error.error_description) {
        errorMessage = error.error_description
      }

      // Handle specific Supabase auth errors
      if (error.code === '23505') {
        errorMessage = 'An account with this email already exists'
        step = 'auth'
      } else if (error.code === 'invalid_email') {
        errorMessage = 'Please enter a valid email address'
        step = 'auth'
      } else if (error.code === 'weak_password') {
        errorMessage = 'Password is too weak. Please choose a stronger password (minimum 6 characters)'
        step = 'auth'
      } else if (error.code === 'email_not_confirmed') {
        errorMessage = 'Please check your email and confirm your account before proceeding'
        step = 'auth'
      } else if (error.code === 'user_already_registered') {
        errorMessage = 'An account with this email already exists'
        step = 'auth'
      } else if (error.code === 'signup_disabled') {
        errorMessage = 'New user registration is currently disabled'
        step = 'auth'
      } else if (error.code === 'email_address_invalid') {
        errorMessage = 'The email address format is invalid'
        step = 'auth'
      } else if (error.code === 'password_too_short') {
        errorMessage = 'Password must be at least 6 characters long'
        step = 'auth'
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = 'An account with this email already exists'
        step = 'auth'
      } else if (error.message?.includes('Profile already exists')) {
        errorMessage = 'Account created but profile setup failed. Please contact support.'
        step = 'profile'
      } else if (error.message?.includes('Invalid user reference')) {
        errorMessage = 'Account creation failed due to system error. Please try again.'
        step = 'profile'
      } else if (error.message?.includes('Permission denied')) {
        errorMessage = 'Account created but profile access denied. Please contact support.'
        step = 'profile'
      } else if (error.message?.includes('user_profiles table does not exist')) {
        errorMessage = 'Database setup incomplete. Please contact support.'
        step = 'profile'
      }

      console.error('🔍 Error details:', {
        code: error.code,
        message: error.message,
        step: step,
        finalErrorMessage: errorMessage
      })

      setError(errorMessage)

      return {
        success: false,
        error: errorMessage,
        user: null,
        step: step
      }
    } finally {
      setLoading(false)
      console.log('🏁 Signup process completed')
    }
  }

  return { signup, loading, error }
}

// Complete React Component with the handler
export default function CompleteSignupForm() {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    phone: ''
  })

  const { signup, loading, error } = useCompleteSignupHandler()
  const [result, setResult] = useState<SignupResult | null>(null)

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
    
    console.log('📋 Form submitted with data:', formData)
    
    const validationError = validateForm()
    if (validationError) {
      console.error('❌ Form validation failed:', validationError)
      return
    }

    const signupResult = await signup(formData)
    setResult(signupResult)
    
    if (signupResult.success) {
      console.log('🎉 Signup successful, resetting form')
      // Reset form on success
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: ''
      })
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Signup</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password (min 6 characters)"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minLength={6}
          />
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Creating your account...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result?.success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
            <strong>Success!</strong> Account created successfully! Check your email to verify your account.
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Debug Info (only show in development) */}
      {process.env.NODE_ENV === 'development' && result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
