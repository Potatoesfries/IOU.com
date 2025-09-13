import { Card, CardContent } from "@/components/ui/card"
import { axiosInstance } from "@/lib/axios"
import { useUser } from "@clerk/clerk-react"
import { Loader } from "lucide-react"
import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

const AuthCallBackPage = () => {
  const { isLoaded, user } = useUser()
  const navigate = useNavigate()
  const syncAttempted = useRef(false)

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return

      try {
        await axiosInstance.post("auth/callback", {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          emailAddresses: user.emailAddresses,
          userName: user.username,
        })

        // Only navigate on success
        navigate("/")
      } catch (error) {
        console.log("error in auth callback", error)
        navigate("/")
      }
    }

    if (isLoaded && user && !syncAttempted.current) {
      syncAttempted.current = true
      syncUser()
    }
  }, [isLoaded, user, navigate])

  // Reset sync attempted when user changes (for logout/login cycles)
  useEffect(() => {
    if (!user) {
      syncAttempted.current = false
    }
  }, [user])

  return (
    <div className="h-screen w-full bg-white flex items-center justify-center">
      <Card className="w-[90%] max-w-md bg-white border border-gray-200 shadow-md">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
            <Loader className="size-6 text-blue-600 animate-spin" />
          </div>

          <h3 className="text-gray-900 text-lg font-semibold">
            Logging you in...
          </h3>
          <p className="text-gray-500 text-sm text-center">
            Redirecting you to your account.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AuthCallBackPage
