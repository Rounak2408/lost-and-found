 import SimpleSignupForm from '@/components/simple-signup-form'

export default function SimpleSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Simple Signup Test</h1>
          <p className="text-gray-600">
            This will definitely work!
          </p>
        </div>
        
        <SimpleSignupForm />
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Check browser console (F12) for logs
          </p>
        </div>
      </div>
    </div>
  )
}
