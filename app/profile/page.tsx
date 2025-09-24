'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User, LogOut, AlertCircle, Loader2, Edit, Save, X, ArrowLeft } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { updateUser } from '@/lib/database/users'

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function UserProfile() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Check if user is logged in via localStorage
    const userData = localStorage.getItem('user')
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setEditData({
          first_name: parsedUser.first_name,
          last_name: parsedUser.last_name,
          email: parsedUser.email,
          phone: parsedUser.phone
        })
      } catch (err) {
        console.error('Error parsing user data:', err)
        setError('Invalid user data')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (user) {
      setEditData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!user) return

    setIsUpdating(true)
    
    try {
      // Include avatar_url in the update to preserve it
      const updateData = {
        ...editData,
        avatar_url: user.avatar_url // Preserve the current avatar
      }
      
      console.log('Saving profile with data:', updateData)
      console.log('Current avatar_url:', user.avatar_url)
      
      const { data, error } = await updateUser(user.id, updateData)
      
      if (error) {
        throw error
      }

      if (data) {
        console.log('Profile saved successfully:', data)
        console.log('Saved avatar_url:', data.avatar_url)
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Update error:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAvatarUpdate = async (newAvatarUrl: string) => {
    if (!user) return

    console.log('Profile page: Avatar update called with URL length:', newAvatarUrl.length)
    
    try {
      // Update the user's avatar URL in the database
      const { data, error } = await updateUser(user.id, { avatar_url: newAvatarUrl })
      
      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      if (data) {
        const updatedUser = { ...user, avatar_url: newAvatarUrl }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        console.log('Profile page: Avatar updated successfully in localStorage')
      }
    } catch (err) {
      console.error('Error updating avatar:', err)
      setError('Failed to update profile picture. Please try again.')
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('user')
    setUser(null)
    // Redirect to auth page
    window.location.href = '/auth'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading profile...</p>
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
              Please sign in to view your profile
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
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar 
                  key={user.avatar_url || 'no-avatar'} // Force re-render when avatar changes
                  user={user ? {
                    id: user.id.toString(),
                    email: user.email,
                    user_metadata: {
                      first_name: user.first_name,
                      last_name: user.last_name,
                      phone: user.phone
                    },
                    avatar_url: user.avatar_url
                  } : null} 
                  size="lg" 
                  showEditButton={true}
                  onAvatarUpdate={handleAvatarUpdate}
                />
                <div>
                  <CardTitle>User Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your account information from the users database table
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSave}
                      disabled={isUpdating}
                      size="sm"
                    >
                      {isUpdating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isUpdating}
                      size="sm"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleEdit}
                      size="sm"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={handleSignOut} size="sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {user.id}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </label>
                  <p className="text-sm font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="first_name" className="text-sm font-medium text-muted-foreground">
                    First Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="first_name"
                      value={editData.first_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium">{user.first_name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="last_name" className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="last_name"
                      value={editData.last_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium">{user.last_name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm">{user.email}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium text-primary">
                      {user.phone}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </label>
                  <p className="text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-sm">
                    {new Date(user.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No user data found. Please sign in to view your profile.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}