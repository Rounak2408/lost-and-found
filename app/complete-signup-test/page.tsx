import CompleteSignupForm from '@/components/complete-signup-handler'

export default function CompleteSignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Signup Test</h1>
          <p className="text-gray-600">
            Test the complete signup process with detailed logging
          </p>
        </div>
        
        <CompleteSignupForm />
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Check the browser console for detailed logs of the signup process
          </p>
        </div>
      </div>
    </div>
  )
}
