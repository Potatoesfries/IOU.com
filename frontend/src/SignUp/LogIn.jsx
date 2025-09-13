import { useSignIn } from "@clerk/clerk-react"
import vectorImage from "@/img/vector.png"
import iouLogo from "@/img/iouLogo.png"

const Signup = () => {
  const { signIn, isLoaded } = useSignIn()

  // Google sign-in
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/auth-callback",
      })
    } catch (err) {
      console.error("Google sign-in error", err)
    }
  }

  // Facebook sign-in
  const handleFacebookSignIn = async () => {
    if (!isLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_facebook",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/auth-callback",
      })
    } catch (err) {
      console.error("Facebook sign-in error", err)
    }
  }

  // Discord sign-in
  const handleDiscordSignIn = async () => {
    if (!isLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_discord",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/auth-callback",
      })
    } catch (err) {
      console.error("Discord sign-in error", err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <header className="w-full flex justify-center items-center px-4 lg:px-20 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between w-full max-w-6xl">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <a href="/">
              <img
                src={iouLogo}
                alt="IOU Logo"
                className="h-10 w-auto object-contain"
              />
            </a>
            <span className="font-semibold text-gray-800 text-lg">IOU</span>
          </div>

          {/* Learn More link */}
          <a
            href="/learn-more"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Learn more
          </a>
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 py-12">
        {/* Left Section */}
        <div className="flex flex-col items-start justify-center space-y-6 max-w-xl text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Welcome to <span>IOU.com</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Keep track of debts and promises with ease.
            Manage who owes you and what you owe — all in one place.
          </p>

          {/* Three separate sign-in buttons */}
          <div className="w-full max-w-sm flex flex-col space-y-4">
            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center space-x-2 border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
              <span className="font-medium text-gray-700">Continue with Google</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookSignIn}
              className="flex items-center justify-center space-x-2 border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
              <span className="font-medium text-gray-700">Continue with Facebook</span>
            </button>

            {/* Discord */}
            <button
              onClick={handleDiscordSignIn}
              className="flex items-center justify-center space-x-2 border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-50"
            >
              <img src="https://www.svgrepo.com/show/353655/discord-icon.svg" alt="Discord" className="w-5 h-5" />
              <span className="font-medium text-gray-700">Continue with Discord</span>
            </button>
          </div>

          <p className="text-sm text-gray-500">
            By continuing, you agree to our{" "}
            <a href="/Terms" className="text-blue-600 hover:underline">Terms</a> and{" "}
            <a href="/Privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>

        {/* Right Section - PNG Image */}
        <div className="flex items-center justify-center mt-10 lg:mt-0">
          <img
            src={vectorImage}
            alt="IOU Illustration"
            className="w-full max-w-xl object-contain"
          />
        </div>
      </main>
    </div>
  )
}

export default Signup
