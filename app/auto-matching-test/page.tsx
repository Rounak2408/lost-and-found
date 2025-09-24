'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createFind, createLoss, getAllFinds, getAllLosses } from '@/lib/database/finds-losses'
import { getAllMatches, clearAllMatches } from '@/lib/database/auto-matching'
import { CheckCircle, AlertCircle, Target, Plus, Search } from 'lucide-react'

export default function AutoMatchingTest() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [finds, setFinds] = useState<any[]>([])
  const [losses, setLosses] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [findsResult, lossesResult] = await Promise.all([
        getAllFinds(),
        getAllLosses()
      ])
      
      setFinds(findsResult.data || [])
      setLosses(lossesResult.data || [])
      setMatches(getAllMatches())
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const createTestFind = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const findData = {
        user_id: 1,
        item_name: 'Black Leather Wallet',
        item_description: 'Black leather wallet with ID card and credit cards inside',
        location_found: 'Central Park, New York',
        date_found: new Date().toISOString().split('T')[0],
        contact_info: 'Call: 555-0123'
      }
      
      const result = await createFind(findData)
      
      if (result.data) {
        setMessage('✅ Found item created successfully! Check for automatic matches.')
        await loadData()
      } else {
        setMessage('❌ Failed to create found item')
      }
    } catch (error) {
      setMessage('❌ Error creating found item: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const createTestLoss = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const lossData = {
        user_id: 2,
        item_name: 'Black Wallet',
        item_description: 'Black wallet with my ID and credit cards',
        location_lost: 'Central Park area',
        date_lost: new Date().toISOString().split('T')[0],
        owner_name: 'John Smith',
        contact_info: 'Call: 555-0456'
      }
      
      const result = await createLoss(lossData)
      
      if (result.data) {
        setMessage('✅ Lost item created successfully! Check for automatic matches.')
        await loadData()
      } else {
        setMessage('❌ Failed to create lost item')
      }
    } catch (error) {
      setMessage('❌ Error creating lost item: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const clearAllData = () => {
    clearAllMatches()
    localStorage.removeItem('mockFinds')
    localStorage.removeItem('mockLosses')
    setFinds([])
    setLosses([])
    setMatches([])
    setMessage('🗑️ All test data cleared!')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎯 Automatic Matching Test</h1>
          <p className="text-lg text-muted-foreground">
            Test the automatic matching system that finds potential matches between lost and found items
          </p>
        </div>

        {message && (
          <Alert className={message.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Create Test Found Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input value="Black Leather Wallet" readOnly />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value="Black leather wallet with ID card and credit cards inside" readOnly />
              </div>
              <div>
                <Label>Location Found</Label>
                <Input value="Central Park, New York" readOnly />
              </div>
              <Button 
                onClick={createTestFind} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Creating...' : 'Create Found Item'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Create Test Lost Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input value="Black Wallet" readOnly />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value="Black wallet with my ID and credit cards" readOnly />
              </div>
              <div>
                <Label>Location Lost</Label>
                <Input value="Central Park area" readOnly />
              </div>
              <Button 
                onClick={createTestLoss} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Create Lost Item'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={loadData} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={clearAllData} variant="destructive">
            Clear All Test Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Found Items ({finds.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {finds.map((find) => (
                  <div key={find.id} className="p-3 border rounded-lg">
                    <div className="font-semibold">{find.item_name}</div>
                    <div className="text-sm text-muted-foreground">{find.location_found}</div>
                    <div className="text-xs text-muted-foreground">{find.date_found}</div>
                  </div>
                ))}
                {finds.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No found items yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Lost Items ({losses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {losses.map((loss) => (
                  <div key={loss.id} className="p-3 border rounded-lg">
                    <div className="font-semibold">{loss.item_name}</div>
                    <div className="text-sm text-muted-foreground">{loss.location_lost}</div>
                    <div className="text-xs text-muted-foreground">{loss.date_lost}</div>
                  </div>
                ))}
                {losses.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No lost items yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Matches ({matches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {matches.map((match) => (
                  <div key={match.id} className="p-3 border rounded-lg">
                    <div className="font-semibold">{match.itemName}</div>
                    <div className="text-sm text-muted-foreground">
                      Confidence: {Math.round(match.matchConfidence * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Status: {match.status}
                    </div>
                  </div>
                ))}
                {matches.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No matches yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🔍 Matching Algorithm</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Item name similarity (40% weight)</li>
                  <li>• Description similarity (30% weight)</li>
                  <li>• Location proximity (20% weight)</li>
                  <li>• Date proximity (10% weight)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎯 Match Types</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>Exact:</strong> High name + location match</li>
                  <li>• <strong>Similar:</strong> Good overall similarity</li>
                  <li>• <strong>Location:</strong> Same area, different items</li>
                  <li>• <strong>Description:</strong> Similar details</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">🚀 Test Instructions</h3>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Click "Create Found Item" to add a found wallet</li>
                <li>2. Click "Create Lost Item" to add a lost wallet</li>
                <li>3. Watch the automatic matching system detect the potential match!</li>
                <li>4. Check the dashboard to see the match notification</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
