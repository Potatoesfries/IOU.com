import SignInOAuthButton from "@/button/SignInOAuthButton"
import { useAuth } from "@clerk/clerk-react"

const Login = () => {
  const { isLoaded } = useAuth()

  // Show loading while Clerk is determining auth state
  if (!isLoaded) {
    return (
      <div className="text-center h-full flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="text-center h-full flex items-center justify-center gap-3">
      <SignInOAuthButton />
    </div>
  )
}

export default Login