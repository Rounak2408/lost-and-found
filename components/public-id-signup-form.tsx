'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function PublicIdSignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [publicId, setPublicId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!email.trim() || !password.trim() || !publicId.trim()) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    try {
      // 1) Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      })

      if (authError) throw authError
      if (!authData?.user) throw new Error('Signup succeeded but no user returned')

      // 2) Insert into public.users with id, email, public_id
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email.trim(),
          public_id: publicId.trim(),
        })

      if (insertError) throw insertError

      setMessage('Account created! Please check your email to confirm and then sign in.')
      setEmail('')
      setPassword('')
      setPublicId('')
    } catch (err: any) {
      const code = err?.code || ''
      if (code === '23505' || /duplicate/i.test(err?.message || '')) {
        setError('Public ID or email already exists')
      } else if (/confirm/i.test(err?.message || '')) {
        setError('Please confirm your email before signing in')
      } else {
        setError(err?.message || 'Signup failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto border-border">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Enter email, password, and a unique public ID</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicId">Public ID (username)</Label>
            <Input
              id="publicId"
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              placeholder="your-handle"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
          {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}


