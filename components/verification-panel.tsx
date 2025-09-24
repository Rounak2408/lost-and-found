'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  Shield, 
  User, 
  AlertCircle,
  Upload,
  Camera,
  FileText,
  Star,
  X
} from 'lucide-react'
import { 
  verifyEmail, 
  verifyPhone, 
  verifyIdDocument, 
  verifySocialMedia,
  completeVerification,
  getUserVerificationStatus,
  getVerificationBadge,
  canSendMessages
} from '@/lib/database/verification'

interface VerificationProps {
  userId: number
}

export default function VerificationPanel({ userId }: VerificationProps) {
  const router = useRouter()
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'email' | 'phone' | 'document' | 'social'>('email')
  
  // Form states
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [documentData, setDocumentData] = useState({
    documentType: 'drivers_license',
    documentNumber: '',
    fullName: '',
    dateOfBirth: ''
  })
  const [socialData, setSocialData] = useState({
    platform: 'facebook',
    username: ''
  })

  useEffect(() => {
    loadVerificationStatus()
  }, [userId])

  const loadVerificationStatus = () => {
    try {
      const status = getUserVerificationStatus(userId)
      setVerificationStatus(status)
    } catch (error) {
      console.error('Error loading verification status:', error)
    }
  }

  const handleEmailVerification = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const result = await verifyEmail(userId, email)
      if (result.success) {
        setMessage(`✅ Verification code sent to ${email}`)
        setActiveTab('email')
      } else {
        setMessage(`❌ ${result.message}`)
      }
    } catch (error) {
      setMessage('❌ Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneVerification = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const result = await verifyPhone(userId, phone)
      if (result.success) {
        setMessage(`✅ Verification code sent to ${phone}`)
        setActiveTab('phone')
      } else {
        setMessage(`❌ ${result.message}`)
      }
    } catch (error) {
      setMessage('❌ Failed to send verification SMS')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeVerification = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Find the verification ID (in real app, this would be passed from the verification request)
      const result = await completeVerification('1', verificationCode) // Mock verification ID
      if (result.success) {
        setMessage('✅ Verification completed successfully!')
        loadVerificationStatus()
        setVerificationCode('')
      } else {
        setMessage(`❌ ${result.message}`)
      }
    } catch (error) {
      setMessage('❌ Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentVerification = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const result = await verifyIdDocument(userId, documentData)
      if (result.success) {
        setMessage('✅ ID document submitted for verification')
        loadVerificationStatus()
      } else {
        setMessage(`❌ ${result.message}`)
      }
    } catch (error) {
      setMessage('❌ Failed to submit document')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialVerification = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const result = await verifySocialMedia(userId, socialData.platform, socialData.username)
      if (result.success) {
        setMessage('✅ Social media verification submitted')
        loadVerificationStatus()
      } else {
        setMessage(`❌ ${result.message}`)
      }
    } catch (error) {
      setMessage('❌ Failed to submit social verification')
    } finally {
      setLoading(false)
    }
  }

  if (!verificationStatus) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading verification status...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const badge = getVerificationBadge(userId)
  const canMessage = canSendMessages(userId)

  return (
    <div className="w-full bg-black rounded-2xl shadow-2xl border-4 border-purple-500 overflow-hidden mx-2 sm:mx-0">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-4 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white flex items-center gap-2 sm:gap-4">
              <Shield className="h-6 w-6 sm:h-10 sm:w-10 text-yellow-300" />
              Identity Verification
            </h1>
            <p className="text-purple-100 mt-2 sm:mt-3 text-sm sm:text-xl">Verify your identity to unlock secure features</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-white hover:text-yellow-300 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </div>
      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-black">
        {/* Verification Status */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 sm:p-8 rounded-2xl border-2 border-purple-400 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-xl sm:text-3xl font-bold text-white">Your Verification Level</h3>
              <p className="text-sm sm:text-xl text-purple-200 mt-1 sm:mt-2">
                Score: <span className="font-bold text-yellow-400">{verificationStatus.verificationScore}/100</span> points
              </p>
            </div>
            <div className="bg-black px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border-2 border-purple-400">
              <Badge className={`${badge.color} text-sm sm:text-xl px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white`}>
                {badge.text}
              </Badge>
            </div>
          </div>
          
          <div className="bg-black p-4 sm:p-6 rounded-xl border-2 border-purple-400">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-sm sm:text-xl font-bold text-white">Progress</span>
              <span className="text-sm sm:text-xl font-bold text-yellow-400">{verificationStatus.verificationScore}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 sm:h-6 border-2 border-purple-400">
              <div 
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-4 sm:h-6 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${verificationStatus.verificationScore}%` }}
              ></div>
            </div>
          </div>
          
          {canMessage && (
            <div className="mt-4 sm:mt-6 bg-gradient-to-r from-green-900 to-emerald-900 border-2 border-green-400 p-4 sm:p-6 rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                <span className="text-sm sm:text-xl font-bold text-white">
                  ✅ You can now send secure messages to other verified users!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Methods */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center">Verification Methods</h3>
          
          {/* Email Verification */}
          <div className={`bg-gradient-to-r ${verificationStatus.emailVerified ? 'from-green-900 to-green-800' : 'from-blue-900 to-blue-800'} p-4 sm:p-6 rounded-xl border-2 ${verificationStatus.emailVerified ? 'border-green-400' : 'border-blue-400'} shadow-lg`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 sm:p-3 rounded-full ${verificationStatus.emailVerified ? 'bg-green-200' : 'bg-blue-200'}`}>
                  <Mail className={`h-4 w-4 sm:h-6 sm:w-6 ${verificationStatus.emailVerified ? 'text-green-700' : 'text-blue-700'}`} />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">Email Verification</h4>
                  <p className="text-sm sm:text-base text-blue-200">Verify your email address</p>
                </div>
                {verificationStatus.emailVerified ? (
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                )}
              </div>
              <div className="bg-black px-3 sm:px-4 py-2 rounded-full shadow-md border border-purple-400">
                <Badge className={`${verificationStatus.emailVerified ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2`}>
                  {verificationStatus.emailVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
            
            {!verificationStatus.emailVerified && (
              <div className="bg-black p-4 rounded-lg border-2 border-purple-400 space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-lg font-semibold text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="mt-2 bg-gray-800 text-white border-2 border-purple-400 focus:border-blue-500 text-sm sm:text-lg p-3"
                  />
                </div>
                <Button 
                  onClick={handleEmailVerification}
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-lg rounded-lg shadow-lg"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </div>
            )}
          </div>

          {/* Phone Verification */}
          <div className={`bg-gradient-to-r ${verificationStatus.phoneVerified ? 'from-green-900 to-green-800' : 'from-orange-900 to-orange-800'} p-4 sm:p-6 rounded-xl border-2 ${verificationStatus.phoneVerified ? 'border-green-400' : 'border-orange-400'} shadow-lg`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 sm:p-3 rounded-full ${verificationStatus.phoneVerified ? 'bg-green-200' : 'bg-orange-200'}`}>
                  <Phone className={`h-4 w-4 sm:h-6 sm:w-6 ${verificationStatus.phoneVerified ? 'text-green-700' : 'text-orange-700'}`} />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">Phone Verification</h4>
                  <p className="text-sm sm:text-base text-orange-200">Verify your phone number</p>
                </div>
                {verificationStatus.phoneVerified ? (
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                )}
              </div>
              <div className="bg-black px-3 sm:px-4 py-2 rounded-full shadow-md border border-purple-400">
                <Badge className={`${verificationStatus.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2`}>
                  {verificationStatus.phoneVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
            
            {!verificationStatus.phoneVerified && (
              <div className="bg-black p-4 rounded-lg border-2 border-purple-400 space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-lg font-semibold text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-2 bg-gray-800 text-white border-2 border-purple-400 focus:border-orange-500 text-sm sm:text-lg p-3"
                  />
                </div>
                <Button 
                  onClick={handlePhoneVerification}
                  disabled={loading || !phone}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-lg rounded-lg shadow-lg"
                >
                  {loading ? 'Sending...' : 'Send SMS Code'}
                </Button>
              </div>
            )}
          </div>

          {/* ID Document Verification */}
          <div className={`bg-gradient-to-r ${verificationStatus.idDocumentVerified ? 'from-green-900 to-green-800' : 'from-purple-900 to-purple-800'} p-4 sm:p-6 rounded-xl border-2 ${verificationStatus.idDocumentVerified ? 'border-green-400' : 'border-purple-400'} shadow-lg`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 sm:p-3 rounded-full ${verificationStatus.idDocumentVerified ? 'bg-green-200' : 'bg-purple-200'}`}>
                  <FileText className={`h-4 w-4 sm:h-6 sm:w-6 ${verificationStatus.idDocumentVerified ? 'text-green-700' : 'text-purple-700'}`} />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">ID Document Verification</h4>
                  <p className="text-sm sm:text-base text-purple-200">Verify your identity document</p>
                </div>
                {verificationStatus.idDocumentVerified ? (
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                )}
              </div>
              <div className="bg-black px-3 sm:px-4 py-2 rounded-full shadow-md border border-purple-400">
                <Badge className={`${verificationStatus.idDocumentVerified ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2`}>
                  {verificationStatus.idDocumentVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
            
            {!verificationStatus.idDocumentVerified && (
              <div className="bg-black p-4 rounded-lg border-2 border-purple-400 space-y-4">
                <div>
                  <Label htmlFor="documentType" className="text-sm sm:text-lg font-semibold text-white">Document Type</Label>
                  <select
                    id="documentType"
                    value={documentData.documentType}
                    onChange={(e) => setDocumentData({...documentData, documentType: e.target.value})}
                    className="mt-2 w-full p-3 border-2 border-purple-400 rounded-lg bg-gray-800 text-white focus:border-purple-500 focus:outline-none text-sm sm:text-lg"
                    title="Select document type"
                  >
                    <option value="drivers_license">Driver's License</option>
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="documentNumber" className="text-sm sm:text-lg font-semibold text-white">Document Number</Label>
                  <Input
                    id="documentNumber"
                    value={documentData.documentNumber}
                    onChange={(e) => setDocumentData({...documentData, documentNumber: e.target.value})}
                    placeholder="Enter document number"
                    className="mt-2 bg-gray-800 text-white border-2 border-purple-400 focus:border-purple-500 text-sm sm:text-lg p-3"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName" className="text-sm sm:text-lg font-semibold text-white">Full Name</Label>
                  <Input
                    id="fullName"
                    value={documentData.fullName}
                    onChange={(e) => setDocumentData({...documentData, fullName: e.target.value})}
                    placeholder="Enter full name as on document"
                    className="mt-2 bg-gray-800 text-white border-2 border-purple-400 focus:border-purple-500 text-sm sm:text-lg p-3"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm sm:text-lg font-semibold text-white">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={documentData.dateOfBirth}
                    onChange={(e) => setDocumentData({...documentData, dateOfBirth: e.target.value})}
                    className="mt-2 bg-gray-800 text-white border-2 border-purple-400 focus:border-purple-500 text-sm sm:text-lg p-3"
                  />
                </div>
                <Button 
                  onClick={handleDocumentVerification}
                  disabled={loading || !documentData.documentNumber || !documentData.fullName}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-lg rounded-lg shadow-lg"
                >
                  {loading ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            )}
          </div>

          {/* Social Media Verification */}
          <div className={`bg-gradient-to-r ${verificationStatus.socialMediaVerified ? 'from-green-900 to-green-800' : 'from-pink-900 to-pink-800'} p-4 sm:p-6 rounded-xl border-2 ${verificationStatus.socialMediaVerified ? 'border-green-400' : 'border-pink-400'} shadow-lg`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 sm:p-3 rounded-full ${verificationStatus.socialMediaVerified ? 'bg-green-200' : 'bg-pink-200'}`}>
                  <User className={`h-4 w-4 sm:h-6 sm:w-6 ${verificationStatus.socialMediaVerified ? 'text-green-700' : 'text-pink-700'}`} />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">Social Media Verification</h4>
                  <p className="text-sm sm:text-base text-pink-200">Verify your social media account</p>
                </div>
                {verificationStatus.socialMediaVerified ? (
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                )}
              </div>
              <div className="bg-black px-3 sm:px-4 py-2 rounded-full shadow-md border border-purple-400">
                <Badge className={`${verificationStatus.socialMediaVerified ? 'bg-green-100 text-green-800' : 'bg-pink-100 text-pink-800'} text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2`}>
                  {verificationStatus.socialMediaVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
            
            {!verificationStatus.socialMediaVerified && (
              <div className="bg-black p-4 rounded-lg border-2 border-purple-400 space-y-4">
                <div>
                  <Label htmlFor="platform" className="text-sm sm:text-lg font-semibold text-white">Social Platform</Label>
                  <select
                    id="platform"
                    value={socialData.platform}
                    onChange={(e) => setSocialData({...socialData, platform: e.target.value})}
                    className="mt-2 w-full p-3 border-2 border-purple-400 rounded-lg bg-gray-800 text-white focus:border-pink-500 focus:outline-none text-sm sm:text-lg"
                    title="Select social media platform"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="username" className="text-sm sm:text-lg font-semibold text-white">Username</Label>
                  <Input
                    id="username"
                    value={socialData.username}
                    onChange={(e) => setSocialData({...socialData, username: e.target.value})}
                    placeholder="Enter your username"
                    className="mt-2 bg-gray-800 text-white border-2 border-purple-400 focus:border-pink-500 text-sm sm:text-lg p-3"
                  />
                </div>
                <Button 
                  onClick={handleSocialVerification}
                  disabled={loading || !socialData.username}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-lg rounded-lg shadow-lg"
                >
                  {loading ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Verification Code Input */}
        {(activeTab === 'email' || activeTab === 'phone') && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 sm:p-6 rounded-xl border-2 border-blue-400 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white text-center">Enter Verification Code</h3>
            <div className="bg-black p-4 sm:p-6 rounded-lg border-2 border-purple-400 space-y-4">
              <div>
                <Label htmlFor="verificationCode" className="text-sm sm:text-lg font-semibold text-white">Verification Code</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="mt-2 bg-gray-800 text-white border-2 border-purple-400 focus:border-blue-500 text-center text-lg sm:text-xl font-mono p-4"
                />
              </div>
              <Button 
                onClick={handleCodeVerification}
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-lg rounded-lg shadow-lg"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-xl border-2 shadow-lg ${message.includes('✅') ? 'bg-green-900 border-green-400' : 'bg-red-900 border-red-400'}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm sm:text-lg font-semibold ${message.includes('✅') ? 'text-green-200' : 'text-red-200'}`}>
                {message}
              </span>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 sm:p-6 rounded-xl border-2 border-purple-400">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 sm:gap-3 text-white">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            Verification Benefits
          </h3>
          <div className="bg-black p-4 rounded-lg border-2 border-purple-400">
            <ul className="text-sm sm:text-lg space-y-2 sm:space-y-3 text-white">
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span>
                Send secure messages to other verified users
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span>
                Coordinate safe meetups for item returns
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span>
                Build trust in the community
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span>
                Access premium features
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 font-bold">✓</span>
                Priority support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
