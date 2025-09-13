import { Card, CardContent } from "@/components/ui/card"
import { Loader } from "lucide-react"
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react"

const SsoCallbackPage = () => {
  return (
    <div className="h-screen w-full bg-white flex items-center justify-center">
      <Card className="w-[90%] max-w-md bg-white border border-gray-200 shadow-md">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
            <Loader className="size-6 text-blue-600 animate-spin" />
          </div>

          <h3 className="text-gray-900 text-lg font-semibold">
            Connecting your account...
          </h3>
          <p className="text-gray-500 text-sm text-center">
            Please wait while we finish signing you in.
          </p>
        </CardContent>
      </Card>

      {/* Clerk still processes the OAuth handshake here */}
      <AuthenticateWithRedirectCallback />
    </div>
  )
}

export default SsoCallbackPage
