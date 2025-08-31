import { Card, CardContent } from "@/components/ui/card"
import { axiosInstance } from "@/lib/axios"
import { useUser } from "@clerk/clerk-react"
import { Loader } from "lucide-react"
import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

const AuthCallBackPage = () => {
   const{isLoaded, user} = useUser()
   const navigate = useNavigate()
   const syncAttempted = useRef(false)

   useEffect(() => {
    const syncUser = async () => {
      if(!isLoaded || !user) return
      
      try {
         await axiosInstance.post("auth/callback",{
          id:user.id,
          firstName : user.firstName,
          lastName : user.lastName,
          imageUrl: user.imageUrl,
          emailAddresses: user.emailAddresses,
          userName: user.username,
        }) 
        
        // Only navigate on success
        navigate('/debt-notes')
        
      } catch (error) {
        console.log("error in auth callback", error)
        // Navigate to home page on error
        navigate('/')
      }
   }
    
    if(isLoaded && user && !syncAttempted.current) {
      syncAttempted.current = true
      syncUser()
    }
   },[isLoaded, user, navigate])
   
   // Reset sync attempted when user changes (for logout/login cycles)
   useEffect(() => {
     if(!user) {
       syncAttempted.current = false
     }
   }, [user])

  return (
    <div className='h-screen w-full bg-black flex items-center justify-center'>
      <Card className='w-[90%] max-w-md bg-zinc-900 border-zinc-800'>
        <CardContent className='flex flex-col items-center gap-4 pt-6'>
        <Loader className='size-6 bg-zinc-600 animate-spin' />
        <h3 className='text-zinc-400 text-xl font-bold'>logging you in</h3>
        <p className='text-zinc-400 text-sm'>Redirecting....</p>
        </CardContent>
      </Card> 
    </div>
  )
}

export default AuthCallBackPage