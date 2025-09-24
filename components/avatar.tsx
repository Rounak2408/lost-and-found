'use client'

import { useState, useRef } from 'react'
import { User, Camera, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AvatarProps {
  user: {
    id: string
    email: string
    user_metadata?: {
      first_name?: string
      last_name?: string
      phone?: string
    }
    avatar_url?: string
  } | null
  size?: 'sm' | 'md' | 'lg'
  showEditButton?: boolean
  onAvatarUpdate?: (newAvatarUrl: string) => void
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-24 h-24 text-2xl'
}

export function Avatar({ user, size = 'md', showEditButton = false, onAvatarUpdate }: AvatarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [hasFile, setHasFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        setHasFile(false)
        setSelectedFile(null)
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        setHasFile(false)
        setSelectedFile(null)
        return
      }

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setHasFile(true)
      setSelectedFile(file)
      console.log('File validated and preview created')
    } else {
      setHasFile(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!hasFile || !selectedFile) {
      alert('Please select a file first')
      return
    }
    
    if (!onAvatarUpdate) {
      console.log('Upload blocked: no onAvatarUpdate callback')
      return
    }

    setIsUploading(true)
    try {
      const file = selectedFile
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      // For now, we'll use a mock upload that creates a data URL
      // In a real app, this would upload to a storage service like Supabase Storage
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        console.log('File read successfully, data URL length:', dataUrl.length)
        onAvatarUpdate(dataUrl)
        setPreviewUrl(null)
        setHasFile(false)
        setSelectedFile(null)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        console.log('Avatar updated successfully')
      }
      
      reader.onerror = (e) => {
        console.error('FileReader error:', e)
        alert('Failed to read the file. Please try again.')
        setIsUploading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    if (onAvatarUpdate) {
      onAvatarUpdate('')
      setPreviewUrl(null)
    }
  }

  if (!user) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center`}>
        <User className="w-4 h-4" />
      </div>
    )
  }

  const firstName = user.user_metadata?.first_name || ''
  const lastName = user.user_metadata?.last_name || ''
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase()

  const avatarContent = (
    <div className={`${sizeClasses[size]} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold relative group`}>
      {user.avatar_url ? (
        <img 
          src={user.avatar_url} 
          alt={`${firstName} ${lastName}`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
      
      {showEditButton && (
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  )

  if (!showEditButton) {
    return avatarContent
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer">
          {avatarContent}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-2xl">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={`${firstName} ${lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="avatar-upload">Choose a new profile picture</Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {hasFile && selectedFile && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Selected: {selectedFile.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {user.avatar_url && (
              <Button
                variant="outline"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className={hasFile ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}