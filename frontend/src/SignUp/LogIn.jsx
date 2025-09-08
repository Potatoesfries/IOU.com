import SignInOAuthButton from "@/button/SignInOAuthButton"
import { useAuth } from "@clerk/clerk-react"
import { User, Lock, Sparkles } from "lucide-react"

const Login = () => {
  const { isLoaded } = useAuth()

  // Show loading while Clerk is determining auth state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
            <Sparkles className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading your experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-6">
          {/* Icon Container */}
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
            <div className="relative bg-white rounded-full p-6 shadow-lg border border-blue-100">
              <User className="w-12 h-12 text-blue-500 mx-auto" />
            </div>
            <Lock className="w-6 h-6 text-blue-400 absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Sign in to continue your journey
            </p>
          </div>
        </div>

        {/* Login Section */}
        <div className="space-y-8">
          {/* Clean Button Container */}
          <div className="flex justify-center">
            <div className="group relative cursor-pointer">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-blue-600/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              {/* Main button container */}
              <div className="relative bg-white/90 backdrop-blur-md border border-blue-200/50 group-hover:border-blue-300 rounded-xl shadow-2xl group-hover:shadow-blue-100/50 transition-all duration-300 transform group-hover:scale-[1.02] group-hover:-translate-y-2">
                
                {/* Header content */}
                <div className="flex items-center space-x-4 px-8 py-5 border-b border-gray-100/80">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-12">
                    <Sparkles className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                      Begin Your Journey
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-300">
                      Access your account securely
                    </div>
                  </div>
                </div>

                {/* Clean button placement */}
                <div className="px-8 py-6">
                  <div className="w-full [&>*]:cursor-pointer [&>*]:w-full [&>*]:justify-center [&>*]:transition-all [&>*]:duration-300 [&>*:hover]:shadow-lg [&>*:hover]:scale-[1.02]">
                    <SignInOAuthButton />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-px bg-gray-200 flex-1"></div>
              <Sparkles className="w-4 h-4 text-blue-400" />
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
            <p className="text-sm text-gray-500">
              Secure Authentication Powered by Modern Technology
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-10 left-10 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl -z-10"></div>
        <div className="fixed bottom-10 right-10 w-40 h-40 bg-blue-50/40 rounded-full blur-3xl -z-10"></div>
      </div>
    </div>
  )
}

export default Login