'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { sendCommunityNotification } from '@/lib/database/finds-losses'
import { RefreshCw, CheckCircle, User, Bell } from 'lucide-react'

export default function CrossUserNotificationTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testBabluKumarNotification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const notificationData = {
        type: 'loss' as const,
        title: '📱 Item Lost: Bablu Kumar\'s Wallet',
        message: 'Bablu Kumar lost his wallet in the cafeteria. Help him find it! Keep an eye out and help reunite him with his belongings.',
        item_name: 'Bablu Kumar\'s Wallet',
        location: 'University Cafeteria',
        date_occurred: new Date().toISOString().split('T')[0],
        contact_info: 'Call: 9876543210',
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
        user_name: 'Bablu Kumar',
        user_email: 'bablu.kumar@example.com'
      }

      const result = await sendCommunityNotification(notificationData)
      
      if (result.success) {
        setResult('✅ Bablu Kumar\'s notification sent successfully! All users will now see this notification in their dashboard.')
      } else {
        setResult(`❌ Failed to send notification: ${result.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testAnotherUserNotification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const notificationData = {
        type: 'find' as const,
        title: '🔍 Item Found: Priya Sharma\'s Phone',
        message: 'Priya Sharma found a smartphone in the library. Check if this might be yours! Help reunite this item with its owner.',
        item_name: 'Priya Sharma\'s Phone',
        location: 'Central Library',
        date_occurred: new Date().toISOString().split('T')[0],
        contact_info: 'Email: priya.sharma@example.com',
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
        user_name: 'Priya Sharma',
        user_email: 'priya.sharma@example.com'
      }

      const result = await sendCommunityNotification(notificationData)
      
      if (result.success) {
        setResult('✅ Priya Sharma\'s notification sent successfully! All users will now see this notification in their dashboard.')
      } else {
        setResult(`❌ Failed to send notification: ${result.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cross-User Notification Test</h1>
        <p className="text-muted-foreground">
          Test how notifications work across different users. When one user submits a lost/found item, 
          all other users should see the notification in their dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Test Bablu Kumar's Lost Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Simulate Bablu Kumar reporting a lost wallet. This notification should appear 
              in all users' dashboards.
            </p>
            <Button 
              onClick={testBabluKumarNotification} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending Notification...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Bablu Kumar's Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Test Another User's Found Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Simulate Priya Sharma reporting a found phone. This notification should also 
              appear in all users' dashboards.
            </p>
            <Button 
              onClick={testAnotherUserNotification} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending Notification...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Priya Sharma's Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Alert className="mt-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{result}</AlertDescription>
        </Alert>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Test Cross-User Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Step 1: Send Test Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Click the buttons above to send test notifications from different users.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 2: Check Dashboard</h4>
            <p className="text-sm text-muted-foreground">
              Go to <code className="bg-muted px-1 rounded">/dashboard</code> and check the notification bell. 
              You should see the notifications from Bablu Kumar and Priya Sharma.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 3: Test Real Forms</h4>
            <p className="text-sm text-muted-foreground">
              Go to <code className="bg-muted px-1 rounded">/dashboard/find</code> or <code className="bg-muted px-1 rounded">/dashboard/loss</code> 
              and submit a real form. The notification should appear for all users.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Step 4: Multiple Browser Test</h4>
            <p className="text-sm text-muted-foreground">
              Open the app in different browsers or incognito windows to simulate different users. 
              Notifications should appear across all instances.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





