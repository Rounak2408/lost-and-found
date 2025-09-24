'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import VerificationPanel from '@/components/verification-panel'

export default function VerificationPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      try {
        const userData = localStorage.getItem('user')
        
        if (!userData) {
          router.push('/auth')
          return
        }

        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (err) {
        console.error('Error parsing user data:', err)
        localStorage.removeItem('user')
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Exit Button */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">🔐 Identity Verification</h1>
            <p className="text-lg text-foreground">
              Verify your identity to unlock secure messaging and safe meetup coordination
            </p>
          </div>
          
          <VerificationPanel userId={user.id} />
        </div>
      </div>
    </div>
  )
}
