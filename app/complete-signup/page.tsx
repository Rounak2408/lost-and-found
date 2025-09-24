import CompleteSignupForm from '@/components/complete-signup-form'

export default function CompleteSignupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join SmartFind</h1>
          <p className="text-muted-foreground">
            Create your account with complete error handling
          </p>
        </div>
        
        <CompleteSignupForm />
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <a href="/auth" className="text-primary hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
