// Identity verification system for secure user connections
// This system verifies user identity and enables secure messaging

export interface VerificationData {
  id: string
  userId: number
  verificationType: 'email' | 'phone' | 'id_document' | 'social_media'
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  verificationCode?: string
  verifiedAt?: string
  expiresAt: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface VerificationResult {
  success: boolean
  message: string
  verificationId?: string
  expiresIn?: number
}

export interface UserVerificationStatus {
  userId: number
  emailVerified: boolean
  phoneVerified: boolean
  idDocumentVerified: boolean
  socialMediaVerified: boolean
  overallVerificationLevel: 'basic' | 'verified' | 'premium'
  verificationScore: number
  lastVerifiedAt?: string
}

// Mock storage for verification data
let mockVerifications: VerificationData[] = []
let mockUserVerificationStatus: UserVerificationStatus[] = []
let nextVerificationId = 1

// Initialize from localStorage
if (typeof window !== 'undefined') {
  try {
    const storedVerifications = localStorage.getItem('mockVerifications')
    if (storedVerifications) {
      mockVerifications = JSON.parse(storedVerifications)
      nextVerificationId = Math.max(...mockVerifications.map(v => parseInt(v.id)), 0) + 1
    }
    
    const storedStatus = localStorage.getItem('mockUserVerificationStatus')
    if (storedStatus) {
      mockUserVerificationStatus = JSON.parse(storedStatus)
    }
  } catch (error) {
    console.error('Error loading verification data from localStorage:', error)
  }
}

// Generate verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Calculate verification score
function calculateVerificationScore(status: UserVerificationStatus): number {
  let score = 0
  
  if (status.emailVerified) score += 25
  if (status.phoneVerified) score += 25
  if (status.idDocumentVerified) score += 30
  if (status.socialMediaVerified) score += 20
  
  return score
}

// Determine verification level
function getVerificationLevel(score: number): 'basic' | 'verified' | 'premium' {
  if (score >= 80) return 'premium'
  if (score >= 50) return 'verified'
  return 'basic'
}

// Email verification
export async function verifyEmail(userId: number, email: string): Promise<VerificationResult> {
  try {
    // Check if email is already verified
    const existingStatus = getUserVerificationStatus(userId)
    if (existingStatus.emailVerified) {
      return {
        success: false,
        message: 'Email is already verified'
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const verificationId = nextVerificationId++
    const verification: VerificationData = {
      id: verificationId.toString(),
      userId,
      verificationType: 'email',
      status: 'pending',
      verificationCode,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockVerifications.push(verification)
    localStorage.setItem('mockVerifications', JSON.stringify(mockVerifications))

    // In a real app, send email here
    console.log(`📧 Email verification code for ${email}: ${verificationCode}`)

    return {
      success: true,
      message: `Verification code sent to ${email}`,
      verificationId: verification.id,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to send verification email'
    }
  }
}

// Phone verification
export async function verifyPhone(userId: number, phone: string): Promise<VerificationResult> {
  try {
    const existingStatus = getUserVerificationStatus(userId)
    if (existingStatus.phoneVerified) {
      return {
        success: false,
        message: 'Phone is already verified'
      }
    }

    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const verificationId = nextVerificationId++
    const verification: VerificationData = {
      id: verificationId.toString(),
      userId,
      verificationType: 'phone',
      status: 'pending',
      verificationCode,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockVerifications.push(verification)
    localStorage.setItem('mockVerifications', JSON.stringify(mockVerifications))

    // In a real app, send SMS here
    console.log(`📱 SMS verification code for ${phone}: ${verificationCode}`)

    return {
      success: true,
      message: `Verification code sent to ${phone}`,
      verificationId: verification.id,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to send verification SMS'
    }
  }
}

// ID Document verification (simplified mock)
export async function verifyIdDocument(userId: number, documentData: any): Promise<VerificationResult> {
  try {
    const existingStatus = getUserVerificationStatus(userId)
    if (existingStatus.idDocumentVerified) {
      return {
        success: false,
        message: 'ID document is already verified'
      }
    }

    // Mock verification process
    const verificationId = nextVerificationId++
    const verification: VerificationData = {
      id: verificationId.toString(),
      userId,
      verificationType: 'id_document',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      metadata: documentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockVerifications.push(verification)
    localStorage.setItem('mockVerifications', JSON.stringify(mockVerifications))

    // Simulate manual review process
    setTimeout(() => {
      completeVerification(verification.id, 'verified')
    }, 5000) // Auto-approve after 5 seconds for demo

    return {
      success: true,
      message: 'ID document submitted for verification. This may take up to 24 hours.',
      verificationId: verification.id
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to submit ID document'
    }
  }
}

// Social media verification
export async function verifySocialMedia(userId: number, platform: string, username: string): Promise<VerificationResult> {
  try {
    const existingStatus = getUserVerificationStatus(userId)
    if (existingStatus.socialMediaVerified) {
      return {
        success: false,
        message: 'Social media is already verified'
      }
    }

    const verificationId = nextVerificationId++
    const verification: VerificationData = {
      id: verificationId.toString(),
      userId,
      verificationType: 'social_media',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { platform, username },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockVerifications.push(verification)
    localStorage.setItem('mockVerifications', JSON.stringify(mockVerifications))

    // Simulate verification process
    setTimeout(() => {
      completeVerification(verification.id, 'verified')
    }, 3000) // Auto-approve after 3 seconds for demo

    return {
      success: true,
      message: `Social media verification submitted for ${platform}`,
      verificationId: verification.id
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to submit social media verification'
    }
  }
}

// Complete verification with code
export async function completeVerification(verificationId: string, code?: string): Promise<VerificationResult> {
  try {
    const verification = mockVerifications.find(v => v.id === verificationId)
    if (!verification) {
      return {
        success: false,
        message: 'Verification not found'
      }
    }

    if (verification.status !== 'pending') {
      return {
        success: false,
        message: 'Verification already processed'
      }
    }

    // Check expiration
    if (new Date(verification.expiresAt) < new Date()) {
      verification.status = 'expired'
      localStorage.setItem('mockVerifications', JSON.stringify(mockVerifications))
      return {
        success: false,
        message: 'Verification code has expired'
      }
    }

    // Verify code for email/phone
    if (verification.verificationType === 'email' || verification.verificationType === 'phone') {
      if (!code || code !== verification.verificationCode) {
        return {
          success: false,
          message: 'Invalid verification code'
        }
      }
    }

    // Mark as verified
    verification.status = 'verified'
    verification.verifiedAt = new Date().toISOString()
    verification.updatedAt = new Date().toISOString()

    localStorage.setItem('mockVerifications', JSON.stringify(mockVerifications))

    // Update user verification status
    updateUserVerificationStatus(verification.userId, verification.verificationType, true)

    return {
      success: true,
      message: 'Verification completed successfully'
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to complete verification'
    }
  }
}

// Get user verification status
export function getUserVerificationStatus(userId: number): UserVerificationStatus {
  let status = mockUserVerificationStatus.find(s => s.userId === userId)
  
  if (!status) {
    status = {
      userId,
      emailVerified: false,
      phoneVerified: false,
      idDocumentVerified: false,
      socialMediaVerified: false,
      overallVerificationLevel: 'basic',
      verificationScore: 0
    }
    mockUserVerificationStatus.push(status)
  }

  // Update score and level
  status.verificationScore = calculateVerificationScore(status)
  status.overallVerificationLevel = getVerificationLevel(status.verificationScore)

  return status
}

// Update user verification status
function updateUserVerificationStatus(userId: number, type: string, verified: boolean): void {
  let status = mockUserVerificationStatus.find(s => s.userId === userId)
  
  if (!status) {
    status = {
      userId,
      emailVerified: false,
      phoneVerified: false,
      idDocumentVerified: false,
      socialMediaVerified: false,
      overallVerificationLevel: 'basic',
      verificationScore: 0
    }
    mockUserVerificationStatus.push(status)
  }

  switch (type) {
    case 'email':
      status.emailVerified = verified
      break
    case 'phone':
      status.phoneVerified = verified
      break
    case 'id_document':
      status.idDocumentVerified = verified
      break
    case 'social_media':
      status.socialMediaVerified = verified
      break
  }

  status.verificationScore = calculateVerificationScore(status)
  status.overallVerificationLevel = getVerificationLevel(status.verificationScore)
  status.lastVerifiedAt = new Date().toISOString()

  localStorage.setItem('mockUserVerificationStatus', JSON.stringify(mockUserVerificationStatus))
}

// Get verification requirements for messaging
export function getMessagingRequirements(): { minLevel: string, requiredVerifications: string[] } {
  return {
    minLevel: 'verified',
    requiredVerifications: ['email', 'phone']
  }
}

// Check if user can send messages
export function canSendMessages(userId: number): boolean {
  const status = getUserVerificationStatus(userId)
  const requirements = getMessagingRequirements()
  
  return status.overallVerificationLevel === 'premium' || 
         (status.overallVerificationLevel === 'verified' && 
          status.emailVerified && status.phoneVerified)
}

// Get verification badge info
export function getVerificationBadge(userId: number): { level: string, color: string, text: string } {
  const status = getUserVerificationStatus(userId)
  
  switch (status.overallVerificationLevel) {
    case 'premium':
      return { level: 'premium', color: 'bg-purple-100 text-purple-800', text: 'Premium Verified' }
    case 'verified':
      return { level: 'verified', color: 'bg-green-100 text-green-800', text: 'Verified' }
    default:
      // Hide the basic badge by returning empty styles/text
      return { level: 'basic', color: '', text: '' }
  }
}

// Clear all verification data (for testing)
export function clearAllVerifications(): void {
  mockVerifications = []
  mockUserVerificationStatus = []
  nextVerificationId = 1
  localStorage.removeItem('mockVerifications')
  localStorage.removeItem('mockUserVerificationStatus')
}
