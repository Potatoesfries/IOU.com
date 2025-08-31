import { axiosInstance } from "@/lib/axios"
import { useAuth } from "@clerk/clerk-react"
import { Loader } from "lucide-react"
import { useEffect, useState } from "react"

const updateApiToken = (token) => {
    if(token){
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    else{
        delete axiosInstance.defaults.headers.common['Authorization']
    }
}

const AuthProvider = ({children}) => {
    const {getToken} = useAuth()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await getToken()
                updateApiToken(token)

            } catch (error) {
                updateApiToken(null)
                console.log("error in authProvider")
            }
            finally {
                setLoading(false)
            }
        }
        initAuth()
    },[getToken])

    if(loading){
        return(
            <div className='h-screen w-full flex items-center justify-center'>
            <Loader className='size-8 text-zinc-500 animate-spin'/>
        </div>
        )
    }

    return (
        <div>
            {children}
        </div>
    )
}

export default AuthProvider