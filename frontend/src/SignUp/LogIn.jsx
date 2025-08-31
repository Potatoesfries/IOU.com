import SignInOAuthButton from "@/button/SignInOAuthButton"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"

const HomePage = () => {
  return (
    <div className="text-center h-full flex items-center justify-center gap-3">
      <SignedIn>
        welcome
      </SignedIn>
      <SignedOut>
         <SignInOAuthButton />
      </SignedOut>
      <UserButton />
    </div>
  )
}

export default HomePage
