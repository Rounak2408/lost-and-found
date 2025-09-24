'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, TestTube, CheckCircle } from 'lucide-react'
import { sendCommunityNotification } from '@/lib/database/mock-notifications'

export default function NotificationTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testFindNotification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const notificationData = {
        type: 'find' as const,
        title: '🔍 Item Found: Test Smartphone',
        message: 'Someone found a smartphone in the test area. Check if this might be yours! Help reunite this item with its owner.',
        item_name: 'Test Smartphone',
        location: 'Test Location',
        date_occurred: new Date().toISOString().split('T')[0],
        contact_info: 'test@example.com',
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', // Sample phone image
        user_name: 'Test User',
        user_email: 'test@example.com'
      }

      const result = await sendCommunityNotification(notificationData)
      
      if (result.success) {
        setResult('✅ Find notification with image sent successfully! Check the notification bell in the dashboard.')
      } else {
        setResult('❌ Failed to send notification')
      }
    } catch (error) {
      setResult('❌ Error sending notification')
    } finally {
      setLoading(false)
    }
  }

  const testLossNotification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const notificationData = {
        type: 'loss' as const,
        title: '📱 Item Lost: Test Wallet',
        message: 'Someone lost a wallet in the test area. Help them find it! Keep an eye out and help reunite them with their belongings.',
        item_name: 'Test Wallet',
        location: 'Test Location',
        date_occurred: new Date().toISOString().split('T')[0],
        contact_info: 'test@example.com',
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', // Sample wallet image
        user_name: 'Test User',
        user_email: 'test@example.com'
      }

      const result = await sendCommunityNotification(notificationData)
      
      if (result.success) {
        setResult('✅ Loss notification with image sent successfully! Check the notification bell in the dashboard.')
      } else {
        setResult('❌ Failed to send notification')
      }
    } catch (error) {
      setResult('❌ Error sending notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Notification System Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test the community notification system
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testFindNotification} disabled={loading}>
                {loading ? 'Sending...' : 'Send Find Notification'}
              </Button>
              
              <Button onClick={testLossNotification} disabled={loading} variant="outline">
                {loading ? 'Sending...' : 'Send Loss Notification'}
              </Button>
            </div>

            {result && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{result}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                How to Test:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click one of the buttons above to send a test notification</li>
                <li>Go to the dashboard at <code>/dashboard</code></li>
                <li>Look for the notification bell icon in the header</li>
                <li>Click the bell to see the notification dropdown</li>
                <li>You should see the test notification appear!</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">Community Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                <li><strong>Real-time notifications</strong> - Updates every 5 seconds</li>
                <li><strong>Unread count badge</strong> - Shows number of unread notifications</li>
                <li><strong>Mark as read</strong> - Click notifications to mark them as read</li>
                <li><strong>Community-wide</strong> - All users see all notifications</li>
                <li><strong>Helpful messages</strong> - Encourages community to help each other</li>
                <li><strong>Image support</strong> - Uploaded images appear in notifications</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-800">How It Works:</h3>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>When someone submits a "Found Item":</strong></p>
                <p>• All users get notified to check if it might be theirs</p>
                <p>• Encourages community to help reunite items with owners</p>
                <p>• Includes contact information for easy communication</p>
                
                <p className="mt-3"><strong>When someone submits a "Lost Item":</strong></p>
                <p>• All users get notified to keep an eye out</p>
                <p>• Community can help locate the lost item</p>
                <p>• Creates a network of helpers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
