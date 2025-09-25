'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { MobileControls } from '@/components/mobile-controls'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createUser, authenticateUser, getUserByPhone, generateVerificationCode, storeVerificationCode, verifyCode, updateUserPassword } from '@/lib/database/users'
import { supabase } from '@/lib/supabase/client'
import { loginDirect } from '@/lib/auth/users-login'
import { signUpDirect } from '@/lib/auth/users-signup'
import AuthBackgroundAnimation from '@/components/auth-background-animation'

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationType, setAnimationType] = useState<'signup' | 'signin' | null>(null)
  
  // Dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [canResendConfirm, setCanResendConfirm] = useState(false)
  
  // Form validation states
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
  })

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Check if user is already logged in (only on client side)
  useEffect(() => {
    if (typeof window === 'undefined') return // Prevent SSR issues
    
    setIsClient(true)
    
    // Check authentication only once
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          // Parse to make sure it's valid JSON
          JSON.parse(userData)
          setIsRedirecting(true)
          // Redirect after a shorter delay since dashboard is fixed
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 300)
        }
      } catch (error) {
        // If localStorage data is corrupted, clear it
        localStorage.removeItem('user')
      }
    }
    
    // Run check after component is mounted
    const timer = setTimeout(checkAuth, 200)
    
    return () => clearTimeout(timer)
  }, []) // Empty dependency array to run only once

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.terms) {
      errors.terms = 'You must agree to the terms and conditions'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLoginChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateAccount = async () => {
    if (!validateForm()) return

    // Trigger signup animation
    setAnimationType('signup')
    setIsAnimating(true)

    setIsLoading(true)
    setErrorMessage('')

    try {
      // Direct insert into public.users; DB trigger hashes password
      const user = await signUpDirect({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      // Immediately persist session and redirect (no verification gate)
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        avatar_url: null,
      }))
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Signup error:', err)
      setErrorMessage(err.message || 'Failed to create account. Please try again.')
      setShowErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setErrorMessage('Please enter both email and password')
      setShowErrorDialog(true)
      return
    }

    if (isRedirecting) return // Prevent login during redirect

    // Trigger signin animation
    setAnimationType('signin')
    setIsAnimating(true)

    setIsLoading(true)
    setErrorMessage('')

    try {
      // Direct login via users table RPC (no Supabase Auth)
      const user = await loginDirect(loginData.email, loginData.password)

      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        avatar_url: null,
      }))

      setIsRedirecting(true)
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 300)
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Provide more specific error messages
      let msg = err?.message || err?.error_description || 'Login failed. Please try again.'
      setErrorMessage(msg)
      
      setShowErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    try {
      setIsLoading(true)
      const email = loginData.email.trim() || formData.email.trim()
      if (!email) return
      // Resend confirmation email
      // @ts-ignore - resend is available in supabase-js v2
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      setErrorMessage('Confirmation email sent. Please check your inbox.')
      setCanResendConfirm(false)
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to resend confirmation email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Animation */}
      <AuthBackgroundAnimation isAnimating={isAnimating} animationType={animationType} />
      
      {/* Show loading screen until client-side hydration is complete */}
      {!isClient ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : isRedirecting ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-accent text-xl sm:text-2xl">🔍</span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">SmartFind</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Lost & Found Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="text-muted-foreground hover:text-foreground border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                Go to Home
              </Button>
              <div className="hidden sm:block">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Section */}
      <section className="py-16 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome to SmartFind</h2>
              <p className="text-muted-foreground">
                Join our community and start finding lost items today
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Sign In to Your Account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your SmartFind account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">📧</span>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) => handleLoginChange('email', e.target.value)}
                          className="pl-10 bg-background border-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">🔒</span>
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => handleLoginChange('password', e.target.value)}
                          className="pl-10 pr-10 bg-background border-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <span className="h-4 w-4 text-muted-foreground text-sm">👁️</span>
                          ) : (
                            <span className="h-4 w-4 text-muted-foreground text-sm">👁️</span>
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                          Signing In...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Button variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
                          Sign up here
                        </Button>
                      </p>
                      
                      {/* Development Help */}
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Need help getting started?</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>1. Click "Sign Up" to create a new account</p>
                          <p>2. Fill out the form with your details</p>
                          <p>3. Click "Create Account"</p>
                          <p>4. Sign in with the same credentials</p>
                        </div>
                        
                        {/* Quick Test Button */}
                        <div className="mt-3 pt-3 border-t border-border">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => {
                              setLoginData({
                                email: 'test@example.com',
                                password: 'password123'
                              })
                            }}
                          >
                            Fill Test Credentials
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1 text-center">
                            (You still need to create this account first)
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Create Your Account</CardTitle>
                    <CardDescription>
                      Join SmartFind and start helping others find their lost items
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">👤</span>
                          <Input
                            id="first-name"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className={`pl-10 bg-background border-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 ${formErrors.firstName ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {formErrors.firstName && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <span className="h-3 w-3 text-red-500">⚠️</span>
                            {formErrors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">👤</span>
                          <Input
                            id="last-name"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className={`pl-10 bg-background border-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 ${formErrors.lastName ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {formErrors.lastName && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <span className="h-3 w-3 text-red-500">⚠️</span>
                            {formErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">📧</span>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`pl-10 bg-background border-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 ${formErrors.email ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="h-3 w-3 text-red-500">⚠️</span>
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">📱</span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="1234567890"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`pl-10 bg-background border-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 ${formErrors.phone ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="h-3 w-3 text-red-500">⚠️</span>
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">🔒</span>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`pl-10 pr-10 bg-background border-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 ${formErrors.password ? 'border-red-500' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <span className="h-4 w-4 text-muted-foreground text-sm">👁️</span>
                          ) : (
                            <span className="h-4 w-4 text-muted-foreground text-sm">👁️</span>
                          )}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="h-3 w-3 text-red-500">⚠️</span>
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">🔒</span>
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`pl-10 pr-10 bg-background border-border hover:border-accent/50 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <span className="h-4 w-4 text-muted-foreground text-sm">👁️</span>
                          ) : (
                            <span className="h-4 w-4 text-muted-foreground text-sm">👁️</span>
                          )}
                        </Button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <span className="h-3 w-3 text-red-500">⚠️</span>
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.terms}
                        onChange={(e) => handleInputChange('terms', e.target.checked)}
                        className="rounded border-border"
                        aria-label="Agree to terms and conditions"
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{' '}
                        <a href="#" className="text-accent hover:underline">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-accent hover:underline">
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                    {formErrors.terms && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="h-3 w-3 text-red-500">⚠️</span>
                        {formErrors.terms}
                      </p>
                    )}

                    <Button 
                      onClick={handleCreateAccount}
                      disabled={isLoading}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Button variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
                          Sign in here
                        </Button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <span className="h-6 w-6 text-green-600 dark:text-green-400 text-xl">✅</span>
            </div>
            <DialogTitle className="text-xl font-semibold text-green-600 dark:text-green-400">
              Account Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your account has been created successfully! You can now sign in with your credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false)
                window.location.href = '/auth'
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Go to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <span className="h-6 w-6 text-red-600 dark:text-red-400 text-xl">❌</span>
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-red-600 dark:text-red-400">
              {errorMessage.includes('already exists') ? 'Account Already Exists' : 
               errorMessage.includes('Invalid email or password') ? 'Login Failed' : 'Error'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2">
            {errorMessage.includes('already exists') && (
              <AlertDialogAction 
                onClick={() => {
                  setShowErrorDialog(false)
                  // Switch to login tab
                  const loginTab = document.querySelector('[value="login"]') as HTMLElement
                  if (loginTab) loginTab.click()
                }}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Go to Login Page
              </AlertDialogAction>
            )}
            {errorMessage.includes('Invalid email or password') && (
              <AlertDialogAction 
                onClick={() => {
                  setShowErrorDialog(false)
                  // Switch to signup tab
                  const signupTab = document.querySelector('[value="signup"]') as HTMLElement
                  if (signupTab) signupTab.click()
                }}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Create New Account
              </AlertDialogAction>
            )}
            {canResendConfirm && (
              <AlertDialogAction 
                onClick={() => {
                  setShowErrorDialog(false)
                  handleResendConfirmation()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Resend Confirmation Email
              </AlertDialogAction>
            )}
            <Button 
              variant="outline" 
              onClick={() => setShowErrorDialog(false)}
              className="w-full"
            >
              Try Again
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}

      {/* Mobile Controls */}
      <MobileControls />
    </div>
  )
}