'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function SimpleSignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      console.log('Starting signup...')
      
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        console.error('Auth error:', authError)
        setError(`Auth error: ${authError.message}`)
        return
      }

      if (!authData.user) {
        setError('No user created')
        return
      }

      console.log('Auth user created:', authData.user.id)

      // Step 2: Create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        setError(`Profile error: ${profileError.message}`)
        return
      }

      console.log('Profile created successfully')
      setMessage('Account created successfully! Check your email.')
      
      // Reset form
      setFormData({ email: '', password: '', name: '', phone: '' })

    } catch (err: any) {
      console.error('Error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Simple Signup</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            disabled={loading}
            className="w-full p-3 border rounded-md"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            disabled={loading}
            className="w-full p-3 border rounded-md"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
            disabled={loading}
            className="w-full p-3 border rounded-md"
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            disabled={loading}
            className="w-full p-3 border rounded-md"
            placeholder="Password (min 6 chars)"
            minLength={6}
          />
        </div>

        {loading && (
          <div className="p-3 bg-blue-50 text-blue-800 rounded-md">
            Creating account...
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-50 text-green-800 rounded-md">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
