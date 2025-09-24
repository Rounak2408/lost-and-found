'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface SignupFormData {
  email: string
  password: string
  phone: string
}

interface SignupState {
  loading: boolean
  success: boolean
  error: string | null
}

export default function SupabaseSignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    phone: ''
  })
  
  const [state, setState] = useState<SignupState>({
    loading: false,
    success: false,
    error: null
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setState({ loading: true, success: false, error: null })

    try {
      // Validate form
      if (!formData.email || !formData.password || !formData.phone) {
        throw new Error('All fields are required')
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Phone number validation (basic)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        throw new Error('Please enter a valid phone number')
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            phone: formData.phone,
            // Additional metadata can be added here
            full_name: '', // You can add a name field if needed
            avatar_url: ''
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setState({ loading: false, success: true, error: null })
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          phone: ''
        })

        // Optional: Show success message for a few seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, success: false }))
        }, 5000)
      }

    } catch (error: any) {
      console.error('Signup error:', error)
      setState({
        loading: false,
        success: false,
        error: error.message || 'An error occurred during signup'
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up to access your lost & found dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={state.loading}
              className="w-full"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={state.loading}
              className="w-full"
              minLength={6}
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={state.loading}
              className="w-full"
            />
          </div>

          {/* Error Alert */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {state.success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Account created successfully! Check your email to verify your account.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={state.loading}
          >
            {state.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Alternative: Custom hook for signup logic
export function useSupabaseSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async (email: string, password: string, phone: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            phone,
            // Additional user metadata
            full_name: '',
            avatar_url: ''
          }
        }
      })

      if (error) throw error
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { signUp, loading, error }
}
