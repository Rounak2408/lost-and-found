'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, CheckCircle, Trash2 } from 'lucide-react'
import { createSampleNotifications } from '@/lib/database/shared-notifications'

export default function NotificationReset() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const resetNotifications = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Clear existing notifications
      localStorage.removeItem('mockNotifications')
      
      // Create new sample notifications with images
      createSampleNotifications()
      
      setResult('✅ Notifications reset successfully! Sample notifications with images have been created.')
    } catch (error) {
      setResult('❌ Error resetting notifications')
    } finally {
      setLoading(false)
    }
  }

  const clearAllNotifications = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Clear all notifications
      localStorage.removeItem('mockNotifications')
      
      setResult('✅ All notifications cleared! The notification bell will show "No notifications yet".')
    } catch (error) {
      setResult('❌ Error clearing notifications')
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
              <RefreshCw className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Notification Reset</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Reset or clear notification data for testing
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={resetNotifications} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset with Sample Images'}
              </Button>
              
              <Button onClick={clearAllNotifications} disabled={loading} variant="outline">
                {loading ? 'Clearing...' : 'Clear All Notifications'}
              </Button>
            </div>

            {result && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{result}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">What This Does:</h3>
              <div className="text-sm space-y-2">
                <p><strong>Reset with Sample Images:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Clears all existing notifications</li>
                  <li>Creates 3 sample notifications with images</li>
                  <li>Includes iPhone, Backpack, and Wallet examples</li>
                  <li>Perfect for testing image display functionality</li>
                </ul>
                
                <p className="mt-3"><strong>Clear All Notifications:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Removes all notifications from localStorage</li>
                  <li>Notification bell will show empty state</li>
                  <li>Useful for testing from a clean state</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">Testing Image Display:</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>After resetting notifications:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to the dashboard</li>
                  <li>Click the notification bell</li>
                  <li>Look for "View Image" buttons</li>
                  <li>Click to see images in a modal dialog</li>
                  <li>Images should load from Unsplash</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
