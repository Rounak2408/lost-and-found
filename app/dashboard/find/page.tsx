'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Upload, Camera, MapPin, Calendar, Package, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { createFind, uploadFindImage } from '@/lib/database/finds-losses'
import ConfettiBurst from '@/components/confetti-burst'
import { useToast } from '@/components/ui/use-toast'
import { sendCommunityNotification } from '@/lib/database/notifications'

interface UserProfile {
  id: string | number
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function FindForm() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const { toast } = useToast?.() || { toast: (args: any) => console.log('toast', args) }

  const [formData, setFormData] = useState({
    item_name: '',
    item_description: '',
    location_found: '',
    date_found: '',
    contact_info: ''
  })

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser as UserProfile)
        // Set today's date as default
        setFormData(prev => ({ ...prev, date_found: new Date().toISOString().split('T')[0] }))
      } catch (err) {
        console.error('Error parsing user data:', err)
        setError('Invalid user data')
        localStorage.removeItem('user')
        router.push('/auth')
      }
    } else {
      router.push('/auth')
    }
    
    setLoading(false)
  }, [router])

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.item_name.trim()) {
      errors.item_name = 'Item name is required'
    }
    
    if (!formData.item_description.trim()) {
      errors.item_description = 'Item description is required'
    }
    
    if (!formData.location_found.trim()) {
      errors.location_found = 'Location found is required'
    }
    
    if (!formData.date_found) {
      errors.date_found = 'Date found is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    if (!user || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the find record first
      const numericId = typeof user.id === 'number' ? user.id : undefined
      const stringId = typeof user.id === 'string' ? user.id : undefined

      const { data: findData, error: findError } = await createFind({
        // Send both to be compatible with either schema (user_id or finder_id)
        ...(numericId !== undefined ? { user_id: numericId, finder_id: numericId } : {}),
        ...(stringId !== undefined ? { user_id: stringId as any, finder_id: stringId as any } : {}),
        item_name: formData.item_name,
        item_description: formData.item_description,
        location_found: formData.location_found,
        date_found: formData.date_found,
        contact_info: formData.contact_info
      } as any)

      if (findError) {
        throw findError
      }

      // If there's an image, upload it
      let imageUrl = null
      if (selectedFile && findData) {
        const { data: uploadedImageUrl, error: uploadError } = await uploadFindImage(selectedFile, findData.id)
        if (uploadError) {
          console.error('Image upload failed:', uploadError)
          // Don't fail the whole operation if image upload fails
        } else {
          imageUrl = uploadedImageUrl
        }
      }

      // Send notification to all users
      const notificationResult = await sendCommunityNotification({
        type: 'find',
        title: `🔍 Item Found: ${formData.item_name}`,
        message: `Someone found "${formData.item_name}" in ${formData.location_found}. Check if this might be yours! Help reunite this item with its owner.`,
        item_name: formData.item_name,
        location: formData.location_found,
        date_occurred: formData.date_found,
        contact_info: formData.contact_info,
        image_url: imageUrl,
        user_name: `${user.first_name} ${user.last_name}`,
        user_email: user.email
      })

      if (!notificationResult.success) {
        console.error('Failed to send notification:', notificationResult.error)
        // Don't fail the whole operation if notification fails
      }

      setShowSuccessDialog(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1500)
      try { toast({ title: 'Found report submitted!', description: 'Thanks for helping the community.' }) } catch {}
      
      // Reset form
      setFormData({
        item_name: '',
        item_description: '',
        location_found: '',
        date_found: new Date().toISOString().split('T')[0],
        contact_info: ''
      })
      setSelectedFile(null)
      setPreviewUrl(null)
      
    } catch (err: any) {
      console.error('Submit error:', err)
      const msg = err?.message || err?.error?.message || 'Failed to submit find report. Please try again.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-foreground">Report Found Item</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-green-600" />
                Found Item Details
              </CardTitle>
              <CardDescription>
                Provide detailed information about the item you found to help reunite it with its owner
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="item-image">Item Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      id="item-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      title="Upload item photo"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('item-image')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Photo
                    </Button>
                  </div>
                  {previewUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a clear photo of the item to help with identification
                </p>
              </div>

              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  placeholder="e.g., iPhone 13, Red Wallet, Black Backpack"
                  value={formData.item_name}
                  onChange={(e) => handleInputChange('item_name', e.target.value)}
                  className={formErrors.item_name ? 'border-red-500' : ''}
                />
                {formErrors.item_name && (
                  <p className="text-sm text-red-500">{formErrors.item_name}</p>
                )}
              </div>

              {/* Item Description */}
              <div className="space-y-2">
                <Label htmlFor="item_description">Detailed Description *</Label>
                <Textarea
                  id="item_description"
                  placeholder="Describe the item in detail: color, brand, condition, any distinctive features, contents if applicable..."
                  value={formData.item_description}
                  onChange={(e) => handleInputChange('item_description', e.target.value)}
                  className={`min-h-[100px] ${formErrors.item_description ? 'border-red-500' : ''}`}
                />
                {formErrors.item_description && (
                  <p className="text-sm text-red-500">{formErrors.item_description}</p>
                )}
              </div>

              {/* Location Found */}
              <div className="space-y-2">
                <Label htmlFor="location_found" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Found *
                </Label>
                <Input
                  id="location_found"
                  placeholder="e.g., Central Park, New York or Starbucks Downtown"
                  value={formData.location_found}
                  onChange={(e) => handleInputChange('location_found', e.target.value)}
                  className={formErrors.location_found ? 'border-red-500' : ''}
                />
                {formErrors.location_found && (
                  <p className="text-sm text-red-500">{formErrors.location_found}</p>
                )}
              </div>

              {/* Date Found */}
              <div className="space-y-2">
                <Label htmlFor="date_found" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Found *
                </Label>
                <Input
                  id="date_found"
                  type="date"
                  value={formData.date_found}
                  onChange={(e) => handleInputChange('date_found', e.target.value)}
                  className={formErrors.date_found ? 'border-red-500' : ''}
                />
                {formErrors.date_found && (
                  <p className="text-sm text-red-500">{formErrors.date_found}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="contact_info">Contact Information (Optional)</Label>
                <Input
                  id="contact_info"
                  placeholder="e.g., Call: 555-0123 or Email: finder@example.com"
                  value={formData.contact_info}
                  onChange={(e) => handleInputChange('contact_info', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  How should people contact you if they think this is their item?
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting Report...
                    </div>
                  ) : (
                    'Submit Found Item Report'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-600 dark:text-green-400">
              Report Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your found item report has been submitted. People looking for this item will be able to see your report and contact you if it matches their lost item.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false)
                router.push('/dashboard')
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Back to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfettiBurst active={showConfetti} onDone={() => setShowConfetti(false)} />
    </div>
  )
}
