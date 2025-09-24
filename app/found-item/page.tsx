'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload, MapPin, Calendar, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { createFind, uploadFindImage } from '@/lib/database/finds-losses'

export default function AnonymousFindForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    item_name: '',
    item_description: '',
    category: '',
    location_found: '',
    date_found: new Date().toISOString().split('T')[0],
    contact_info: ''
  })

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.item_name.trim()) {
      errors.item_name = 'Item name is required'
    }
    
    if (!formData.item_description.trim()) {
      errors.item_description = 'Item description is required'
    }
    
    if (!formData.category) {
      errors.category = 'Please select a category'
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
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the find record first (anonymous submission)
      const { data: findData, error: findError } = await createFind({
        item_name: formData.item_name,
        item_description: formData.item_description,
        category: formData.category,
        location_found: formData.location_found,
        date_found: formData.date_found,
        contact_info: formData.contact_info
      })

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

      setShowSuccessDialog(true)
      
      // Reset form
      setFormData({
        item_name: '',
        item_description: '',
        category: '',
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

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Accessories' },
    { value: 'documents', label: 'Documents & IDs' },
    { value: 'jewelry', label: 'Jewelry & Watches' },
    { value: 'bags', label: 'Bags & Wallets' },
    { value: 'books', label: 'Books & Stationery' },
    { value: 'keys', label: 'Keys & Keychains' },
    { value: 'sports', label: 'Sports Equipment' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'other', label: 'Other' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Found Item Report</h1>
                <p className="text-sm text-gray-600">Help reunite lost items with their owners</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              ← Back to Home
            </Button>
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
                Found Item Details
              </CardTitle>
              <CardDescription>
                Provide detailed information about the item you found to help reunite it with its owner.
                <strong className="text-green-600"> No account required!</strong>
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

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select item category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="item_description">Detailed Description *</Label>
                <Textarea
                  id="item_description"
                  placeholder="Describe the item in detail - color, brand, size, any distinctive features, condition, etc."
                  value={formData.item_description}
                  onChange={(e) => handleInputChange('item_description', e.target.value)}
                  className={formErrors.item_description ? 'border-red-500' : ''}
                  rows={4}
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
                  placeholder="e.g., College Library, Bus Stop, Canteen"
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

              {/* Contact Info */}
              <div className="space-y-2">
                <Label htmlFor="contact_info">Contact Information (Optional)</Label>
                <Textarea
                  id="contact_info"
                  placeholder="How can the owner reach you? Phone number, email, or preferred contact method"
                  value={formData.contact_info}
                  onChange={(e) => handleInputChange('contact_info', e.target.value)}
                  rows={2}
                />
                <p className="text-sm text-muted-foreground">
                  This helps the owner contact you to claim their item
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Submit Found Item Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Success Dialog */}
          {showSuccessDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Report Submitted Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for helping reunite this item with its owner. 
                      We'll notify the community about your found item.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => setShowSuccessDialog(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Submit Another
                      </Button>
                      <Button 
                        onClick={() => router.push('/')}
                        className="flex-1"
                      >
                        Back to Home
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
