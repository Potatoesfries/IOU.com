import { Button } from "@/components/ui/button"
import { SignInButton, useSignIn } from "@clerk/clerk-react"

const SignInOAuthButton = () => {
  const {isLoaded} = useSignIn()
  if(!isLoaded) return null

  return (
    <SignInButton
      mode="modal"
      signUpFallbackRedirectUrl="/auth-callback"
    >
      <Button>Sign In</Button>
    </SignInButton>
  )
}

export default SignInOAuthButton