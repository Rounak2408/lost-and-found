'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Mail,
  Phone,
  FileText,
  Star
} from 'lucide-react'
import SecureMessaging from '@/components/secure-messaging'
import { 
  getUserVerificationStatus, 
  getVerificationBadge, 
  canSendMessages,
  verifyEmail,
  verifyPhone,
  completeVerification
} from '@/lib/database/verification'
import { 
  sendMessage, 
  getUserConversations, 
  getUnreadMessageCount,
  createMeetupRequest,
  getSafeMeetupSuggestions
} from '@/lib/database/secure-messaging'

export default function SecureMessagingTest() {
  const [userId, setUserId] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = () => {
    try {
      const status = getUserVerificationStatus(userId)
      setVerificationStatus(status)
      
      const userConversations = getUserConversations(userId)
      setConversations(userConversations)
      
      const count = getUnreadMessageCount(userId)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleQuickVerify = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Quick email verification
      const emailResult = await verifyEmail(userId, 'test@example.com')
      if (emailResult.success) {
        await completeVerification('1', '123456') // Mock verification
      }
      
      // Quick phone verification
      const phoneResult = await verifyPhone(userId, '+1234567890')
      if (phoneResult.success) {
        await completeVerification('2', '123456') // Mock verification
      }
      
      setMessage('✅ Quick verification completed!')
      loadData()
    } catch (error) {
      setMessage('❌ Failed to complete verification')
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestMessage = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const result = await sendMessage(
        userId,
        2, // Other user
        'Hello! I found your item. Let\'s coordinate a safe meetup.',
        1, // Item ID
        'find',
        'Test Item'
      )
      
      if (result.success) {
        setMessage('✅ Test message sent!')
        loadData()
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to send test message')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTestMeetup = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const result = await createMeetupRequest(
        '1', // Conversation ID
        userId,
        2, // Other user
        'Police Station Lobby',
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        'Safe public location with security cameras'
      )
      
      if (result.success) {
        setMessage('✅ Test meetup request created!')
        loadData()
      } else {
        setMessage(`❌ ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to create meetup request')
    } finally {
      setLoading(false)
    }
  }

  const badge = verificationStatus ? getVerificationBadge(userId) : null
  const canMessage = verificationStatus ? canSendMessages(userId) : false
  const safeLocations = getSafeMeetupSuggestions()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🔐 Secure Messaging Test</h1>
          <p className="text-lg text-muted-foreground">
            Test the secure messaging and verification system
          </p>
        </div>

        {message && (
          <Alert className={message.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationStatus && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">User ID: {userId}</span>
                    <Badge className={badge?.color}>
                      {badge?.text}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                      {verificationStatus.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Phone</span>
                      {verificationStatus.phoneVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">ID Document</span>
                      {verificationStatus.idDocumentVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Can Send Messages:</span>
                    {canMessage ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleQuickVerify}
                    disabled={loading || canMessage}
                    className="w-full"
                  >
                    {loading ? 'Verifying...' : 'Quick Verify (Demo)'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Messaging Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messaging Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{conversations.length}</div>
                  <div className="text-sm text-muted-foreground">Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{unreadCount}</div>
                  <div className="text-sm text-muted-foreground">Unread Messages</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleSendTestMessage}
                  disabled={loading || !canMessage}
                  className="w-full"
                >
                  Send Test Message
                </Button>
                <Button 
                  onClick={handleCreateTestMeetup}
                  disabled={loading || !canMessage}
                  variant="outline"
                  className="w-full"
                >
                  Create Test Meetup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safe Meetup Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Safe Meetup Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeLocations.map((location, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="font-medium">{location.location}</div>
                  <div className="text-sm text-muted-foreground">{location.description}</div>
                  <Badge 
                    variant={location.safetyLevel === 'high' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {location.safetyLevel} safety
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Secure Messaging Component */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Secure Messaging Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecureMessaging 
              userId={userId}
              itemId={1}
              itemType="find"
              itemName="Test Item"
              otherUserId={2}
            />
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🔐 Verification Process</h3>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Click "Quick Verify" to simulate verification</li>
                  <li>2. Check verification status updates</li>
                  <li>3. Verify messaging capability unlocks</li>
                  <li>4. Test different verification levels</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2">💬 Messaging Features</h3>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Send test messages between users</li>
                  <li>2. Create meetup requests</li>
                  <li>3. Test safety reporting</li>
                  <li>4. Verify secure communication</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">🚀 Key Features</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Identity verification with multiple methods</li>
                <li>• Secure in-app messaging for verified users only</li>
                <li>• Safe meetup coordination with suggested locations</li>
                <li>• Safety reporting and user blocking</li>
                <li>• Real-time message notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
