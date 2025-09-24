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
import { ArrowLeft, Search, User, MapPin, Calendar, Package, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { createLoss } from '@/lib/database/finds-losses'
import ConfettiBurst from '@/components/confetti-burst'
import { useToast } from '@/components/ui/use-toast'
import { sendCommunityNotification } from '@/lib/database/notifications'
import { supabase } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    phone?: string
  }
}

export default function LossForm() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const { toast } = useToast?.() || { toast: (args: any) => console.log('toast', args) }
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category: '',
    location_lost: '',
    date_lost: '',
    reward_amount: 0,
    contact_info: ''
  })

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    // Check if user is logged in via localStorage (consistent with dashboard)
    const checkUser = () => {
      try {
        const userData = localStorage.getItem('user')
        
        if (!userData) {
          router.push('/auth')
          return
        }

        const parsedUser = JSON.parse(userData)
        setUser({
          id: parsedUser.id.toString(),
          email: parsedUser.email || '',
          user_metadata: {
            first_name: parsedUser.first_name,
            last_name: parsedUser.last_name,
            phone: parsedUser.phone
          }
        })
        
        // Set today's date as default
        setFormData(prev => ({ ...prev, date_lost: new Date().toISOString().split('T')[0] }))
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

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.item_name.trim()) {
      errors.item_name = 'Item name is required'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    
    if (!formData.location_lost.trim()) {
      errors.location_lost = 'Location lost is required'
    }
    
    if (!formData.date_lost) {
      errors.date_lost = 'Date lost is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async () => {
    if (!user || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the loss record with correct schema
      const { data, error } = await createLoss({
        user_id: Number(user.id),
        item_name: formData.item_name,
        item_description: formData.description,
        location_lost: formData.location_lost,
        date_lost: formData.date_lost,
        owner_name: `${user.first_name} ${user.last_name}`,
        contact_info: formData.contact_info
      })

      if (error) {
        throw error
      }

      // Send notification to all users
      const notificationResult = await sendCommunityNotification({
        type: 'loss',
        title: `📱 Item Lost: ${formData.item_name}`,
        message: `Someone lost "${formData.item_name}" in ${formData.location_lost}. Help them find it! Keep an eye out and help reunite them with their belongings.`,
        item_name: formData.item_name,
        location: formData.location_lost,
        date_occurred: formData.date_lost,
        contact_info: formData.contact_info,
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
      try { toast({ title: 'Lost report submitted!', description: 'We\'ll start matching immediately.' }) } catch {}
      
      // Reset form
      setFormData({
        item_name: '',
        description: '',
        category: '',
        location_lost: '',
        date_lost: new Date().toISOString().split('T')[0],
        reward_amount: 0,
        contact_info: ''
      })
      
    } catch (err: any) {
      console.error('Submit error:', err)
      const msg = err?.message || err?.error?.message || 'Failed to submit loss report. Please try again.'
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
                <Search className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-foreground">Report Lost Item</h1>
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
                <Package className="h-5 w-5 text-blue-600" />
                Lost Item Details
              </CardTitle>
              <CardDescription>
                Provide detailed information about the lost item to help others identify and return it
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
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

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the item in detail: color, brand, condition, any distinctive features, contents if applicable..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`min-h-[100px] ${formErrors.description ? 'border-red-500' : ''}`}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  placeholder="e.g., Electronics, Clothing, Accessories"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </div>

              {/* Location Lost */}
              <div className="space-y-2">
                <Label htmlFor="location_lost" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location Lost *
                </Label>
                <Input
                  id="location_lost"
                  placeholder="e.g., Central Park, New York or Starbucks Downtown"
                  value={formData.location_lost}
                  onChange={(e) => handleInputChange('location_lost', e.target.value)}
                  className={formErrors.location_lost ? 'border-red-500' : ''}
                />
                {formErrors.location_lost && (
                  <p className="text-sm text-red-500">{formErrors.location_lost}</p>
                )}
              </div>

              {/* Date Lost */}
              <div className="space-y-2">
                <Label htmlFor="date_lost" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Lost *
                </Label>
                <Input
                  id="date_lost"
                  type="date"
                  value={formData.date_lost}
                  onChange={(e) => handleInputChange('date_lost', e.target.value)}
                  className={formErrors.date_lost ? 'border-red-500' : ''}
                />
                {formErrors.date_lost && (
                  <p className="text-sm text-red-500">{formErrors.date_lost}</p>
                )}
              </div>

              {/* Reward Amount */}
              <div className="space-y-2">
                <Label htmlFor="reward_amount">Reward Amount (Optional)</Label>
                <Input
                  id="reward_amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.reward_amount}
                  onChange={(e) => handleInputChange('reward_amount', parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground">
                  Optional reward amount for finding this item
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="contact_info">Contact Information (Optional)</Label>
                <Input
                  id="contact_info"
                  placeholder="e.g., Call: 555-0123 or Email: owner@example.com"
                  value={formData.contact_info}
                  onChange={(e) => handleInputChange('contact_info', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  How should people contact you if they find this item?
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting Report...
                    </div>
                  ) : (
                    'Submit Lost Item Report'
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
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              Report Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your lost item report has been submitted. People who find items matching your description will be able to see your report and contact you if they have found your item.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => {
                setShowSuccessDialog(false)
                router.push('/dashboard')
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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