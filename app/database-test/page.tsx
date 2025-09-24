'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createFind, createLoss } from '@/lib/database/finds-losses'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Database, TestTube } from 'lucide-react'

export default function DatabaseTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testDatabaseConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Test 1: Check if Supabase is configured
      const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!isConfigured) {
        setResult({
          status: '⚠️ Supabase not configured',
          message: 'Using mock database (localStorage)',
          instruction: 'Set up .env.local file with Supabase credentials to use real database'
        })
        return
      }

      // Test 2: Check if we can connect to Supabase
      console.log('Testing Supabase connection...')
      
      // Test 3: Check if users table exists
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (usersError) {
        if (usersError.code === 'PGRST116') {
          throw new Error('users table does not exist. Please run the SQL script in Supabase.')
        } else {
          throw new Error(`Database error: ${usersError.message}`)
        }
      }

      // Test 4: Check if finds table exists
      const { data: findsData, error: findsError } = await supabase
        .from('finds')
        .select('*')
        .limit(1)

      if (findsError) {
        if (findsError.code === 'PGRST116') {
          throw new Error('finds table does not exist. Please run the SQL script in Supabase.')
        }
      }

      // Test 5: Check if losses table exists
      const { data: lossesData, error: lossesError } = await supabase
        .from('losses')
        .select('*')
        .limit(1)

      if (lossesError) {
        if (lossesError.code === 'PGRST116') {
          throw new Error('losses table does not exist. Please run the SQL script in Supabase.')
        }
      }

      setResult({
        status: '✅ Database Connected Successfully!',
        connection: '✅ Connected to Supabase',
        usersTable: '✅ users table exists',
        findsTable: '✅ finds table exists',
        lossesTable: '✅ losses table exists',
        message: 'All database tables are ready. Forms will now submit to real database!'
      })

    } catch (err: any) {
      console.error('Database test error:', err)
      setError(err.message || 'Database connection failed')
    } finally {
      setLoading(false)
    }
  }

  const testFormSubmission = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Test form submission with mock data
      const testFindData = {
        user_id: 1, // Assuming user ID 1 exists
        item_name: 'Test Item',
        item_description: 'This is a test submission',
        location_found: 'Test Location',
        date_found: new Date().toISOString().split('T')[0],
        contact_info: 'test@example.com'
      }

      console.log('Testing find form submission...')
      
      const { data: findData, error: findError } = await createFind(testFindData)

      if (findError) {
        throw new Error(`Find submission failed: ${findError.message}`)
      }

      const testLossData = {
        user_id: 1,
        item_name: 'Test Lost Item',
        item_description: 'This is a test lost item',
        location_lost: 'Test Location',
        date_lost: new Date().toISOString().split('T')[0],
        owner_name: 'Test User',
        contact_info: 'test@example.com'
      }

      console.log('Testing loss form submission...')
      
      const { data: lossData, error: lossError } = await createLoss(testLossData)

      if (lossError) {
        throw new Error(`Loss submission failed: ${lossError.message}`)
      }

      setResult({
        status: '✅ Form Submission Test Successful!',
        findSubmission: '✅ Find form submission works',
        lossSubmission: '✅ Loss form submission works',
        message: 'Both forms are working correctly! Check your database tables to see the test data.'
      })

    } catch (err: any) {
      console.error('Form test error:', err)
      setError(err.message || 'Form submission test failed')
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
              <Database className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Database Connection Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test your database connection and form submissions
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testDatabaseConnection} disabled={loading}>
                {loading ? 'Testing...' : 'Test Database Connection'}
              </Button>
              
              <Button onClick={testFormSubmission} disabled={loading} variant="outline">
                {loading ? 'Testing...' : 'Test Form Submission'}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    {Object.entries(result).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Setup Instructions:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a></li>
                <li>Get your project URL and anon key from Project Settings → API</li>
                <li>Create <code>.env.local</code> file with your Supabase credentials</li>
                <li>Run the SQL scripts from <code>database/</code> folder in Supabase SQL Editor</li>
                <li>Restart your development server</li>
                <li>Come back and test the connection</li>
              </ol>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">Current Status:</h3>
              <p className="text-sm text-blue-700">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? 
                  '✅ Supabase URL configured' : 
                  '❌ Supabase URL not configured'
                }
              </p>
              <p className="text-sm text-blue-700">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                  '✅ Supabase Key configured' : 
                  '❌ Supabase Key not configured'
                }
              </p>
              <p className="text-sm text-blue-700 mt-2">
                <strong>Forms are currently using:</strong> {
                  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                  'Real Database' : 
                  'Mock Database (localStorage)'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
