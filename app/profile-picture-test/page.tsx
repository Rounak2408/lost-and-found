'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar } from '@/components/avatar'
import { CheckCircle, Camera, User } from 'lucide-react'

export default function ProfilePictureTest() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setLoading(false)
  }, [])

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    if (user) {
      const updatedUser = { ...user, avatar_url: newAvatarUrl }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Not Signed In</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please sign in to test profile picture functionality
            </p>
            <Button asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Picture Upload Test</h1>
          <p className="text-muted-foreground">
            Test the profile picture upload functionality. Click on the avatar to upload a new picture.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar 
                  user={{
                    id: user.id.toString(),
                    email: user.email,
                    user_metadata: {
                      first_name: user.first_name,
                      last_name: user.last_name,
                      phone: user.phone
                    },
                    avatar_url: user.avatar_url
                  }} 
                  size="lg" 
                  showEditButton={true}
                  onAvatarUpdate={handleAvatarUpdate}
                />
                <div>
                  <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.avatar_url ? 'Profile picture uploaded' : 'No profile picture'}
                  </p>
                </div>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Click on the avatar above to upload a new profile picture. 
                  The image will be stored as a data URL and displayed immediately.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Different Avatar Sizes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Avatar Sizes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar 
                  user={{
                    id: user.id.toString(),
                    email: user.email,
                    user_metadata: {
                      first_name: user.first_name,
                      last_name: user.last_name,
                      phone: user.phone
                    },
                    avatar_url: user.avatar_url
                  }} 
                  size="sm" 
                  showEditButton={false}
                />
                <span className="text-sm">Small (sm)</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Avatar 
                  user={{
                    id: user.id.toString(),
                    email: user.email,
                    user_metadata: {
                      first_name: user.first_name,
                      last_name: user.last_name,
                      phone: user.phone
                    },
                    avatar_url: user.avatar_url
                  }} 
                  size="md" 
                  showEditButton={false}
                />
                <span className="text-sm">Medium (md)</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Avatar 
                  user={{
                    id: user.id.toString(),
                    email: user.email,
                    user_metadata: {
                      first_name: user.first_name,
                      last_name: user.last_name,
                      phone: user.phone
                    },
                    avatar_url: user.avatar_url
                  }} 
                  size="lg" 
                  showEditButton={false}
                />
                <span className="text-sm">Large (lg)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Test Profile Picture Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Step 1: Upload a Picture</h4>
              <p className="text-sm text-muted-foreground">
                Click on the large avatar in the "Your Profile" card above. This will open a dialog where you can select and upload a new profile picture.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Step 2: Preview and Upload</h4>
              <p className="text-sm text-muted-foreground">
                Select an image file (JPG, PNG, GIF) and click "Upload". The image will be converted to a data URL and stored locally.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Step 3: See Changes</h4>
              <p className="text-sm text-muted-foreground">
                After uploading, you'll see your new profile picture in all avatar sizes. The image is stored in localStorage and will persist across browser sessions.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Step 4: Test in Profile Page</h4>
              <p className="text-sm text-muted-foreground">
                Go to <code className="bg-muted px-1 rounded">/profile</code> to see your profile picture in the actual profile page. You can also upload from there.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
